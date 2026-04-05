import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { BCRYPT_ROUNDS, isBlockedStudentEmail, normalizeGhanaCard, UserRole } from '@intemso/shared';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { ConnectsService } from '../connects/connects.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterGhanaCardDto } from './dto/register-ghana-card.dto';
import { LoginGhanaCardDto } from './dto/login-ghana-card.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly emailService: EmailService,
    private readonly connectsService: ConnectsService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async register(dto: RegisterDto) {
    // Block public email providers for student registration
    if (dto.role === UserRole.STUDENT && isBlockedStudentEmail(dto.email)) {
      throw new BadRequestException(
        'Students must register with their university email address, not a personal email like Gmail or Outlook.',
      );
    }

    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      role: dto.role,
    });

    const tokens = await this.generateTokens(user.id, user.email ?? user.ghanaCardNumber ?? user.id, user.role);

    return {
      user: { id: user.id, email: user.email, role: user.role },
      ...tokens,
    };
  }

  async registerWithGhanaCard(dto: RegisterGhanaCardDto) {
    const cardNumber = normalizeGhanaCard(dto.ghanaCardNumber);

    const existingUser = await this.usersService.findByGhanaCard(cardNumber);
    if (existingUser) {
      throw new ConflictException('An account with this Ghana Card number already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = await this.usersService.create({
      ghanaCardNumber: cardNumber,
      passwordHash,
      role: dto.role,
    });

    const tokens = await this.generateTokens(user.id, cardNumber, user.role);

    return {
      user: { id: user.id, email: user.email, ghanaCardNumber: user.ghanaCardNumber, role: user.role },
      ...tokens,
    };
  }

  async loginWithGhanaCard(dto: LoginGhanaCardDto) {
    const cardNumber = normalizeGhanaCard(dto.ghanaCardNumber);

    const user = await this.usersService.findByGhanaCard(cardNumber);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid Ghana Card number or password');
    }

    if (user.isSuspended) {
      throw new UnauthorizedException('Your account has been suspended');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid Ghana Card number or password');
    }

    await this.usersService.updateLastLogin(user.id);
    this.connectsService.rewardDailyLogin(user.id).catch(() => {});

    const tokens = await this.generateTokens(user.id, user.email ?? cardNumber, user.role);

    return {
      user: { id: user.id, email: user.email, ghanaCardNumber: user.ghanaCardNumber, role: user.role },
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.isSuspended) {
      throw new UnauthorizedException('Your account has been suspended');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.usersService.updateLastLogin(user.id);

    // Award daily login connect (fire-and-forget)
    this.connectsService.rewardDailyLogin(user.id).catch(() => {});

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: { id: user.id, email: user.email, role: user.role },
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });

      // Check if token has been blacklisted (rotated out)
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      const isBlacklisted = await this.cache.get(`bl:rt:${tokenHash}`);
      if (isBlacklisted) {
        // Potential token reuse attack — blacklist ALL tokens for this user
        await this.blacklistAllUserTokens(payload.sub);
        throw new UnauthorizedException('Token reuse detected');
      }

      const user = await this.usersService.findById(payload.sub);
      if (!user || !user.isActive || user.isSuspended) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Blacklist the old refresh token for the remainder of its TTL
      const ttl = payload.exp ? (payload.exp * 1000 - Date.now()) : 0;
      if (ttl > 0) {
        await this.cache.set(`bl:rt:${tokenHash}`, '1', ttl);
      }

      return this.generateTokens(user.id, user.email, user.role);
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /** Logout: blacklist the current refresh token */
  async logout(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      const ttl = payload.exp ? (payload.exp * 1000 - Date.now()) : 0;
      if (ttl > 0) {
        await this.cache.set(`bl:rt:${tokenHash}`, '1', ttl);
      }
    } catch {
      // Token already expired or invalid — no-op
    }
    return { message: 'Logged out successfully' };
  }

  /** Blacklist all tokens for a user (emergency: token reuse detected) */
  private async blacklistAllUserTokens(userId: string) {
    // Set a flag that invalidates all tokens issued before now
    const refreshExpiry = this.config.get('JWT_REFRESH_EXPIRY', '7d');
    const ttlMs = this.parseExpiryToMs(refreshExpiry);
    await this.cache.set(`bl:user:${userId}`, Date.now().toString(), ttlMs);
  }

  private parseExpiryToMs(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000; // default 7d
    const val = parseInt(match[1]);
    switch (match[2]) {
      case 's': return val * 1000;
      case 'm': return val * 60 * 1000;
      case 'h': return val * 60 * 60 * 1000;
      case 'd': return val * 24 * 60 * 60 * 1000;
      default: return 7 * 24 * 60 * 60 * 1000;
    }
  }

  async validateUser(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.isActive || user.isSuspended) {
      throw new UnauthorizedException();
    }
    return user;
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    // Always return success to prevent email enumeration
    if (!user) return { message: 'If the email exists, a reset link has been sent.' };

    const resetToken = await this.jwtService.signAsync(
      { sub: user.id, purpose: 'password_reset' },
      {
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
        expiresIn: '1h',
      },
    );

    await this.emailService.sendPasswordReset(email, resetToken);

    return { message: 'If the email exists, a reset link has been sent.' };
  }

  /**
   * Verify the reset token and update the password.
   */
  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
      });

      if (payload.purpose !== 'password_reset') {
        throw new BadRequestException('Invalid reset token');
      }

      const user = await this.usersService.findById(payload.sub);
      if (!user) throw new BadRequestException('Invalid reset token');

      // Prevent token reuse: if password was changed after token was issued, reject
      if (payload.iat && user.updatedAt) {
        const tokenIssuedAt = new Date(payload.iat * 1000);
        if (user.updatedAt > tokenIssuedAt) {
          throw new BadRequestException('This reset link has already been used');
        }
      }

      const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
      await this.usersService.updatePassword(user.id, passwordHash);

      return { message: 'Password reset successfully. You can now log in.' };
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException('Invalid or expired reset token');
    }
  }

  private async generateTokens(userId: string, email: string | null, role: string) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRY', '7d'),
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
