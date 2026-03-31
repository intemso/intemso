import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend | null;
  private readonly fromEmail: string;
  private readonly frontendUrl: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    if (apiKey) {
      this.resend = new Resend(apiKey);
    } else {
      this.resend = null;
      this.logger.warn('RESEND_API_KEY not set — email sending disabled');
    }
    this.fromEmail = this.config.get('EMAIL_FROM', 'Intemso <onboarding@resend.dev>');
    this.frontendUrl = this.config.get('FRONTEND_URL', 'http://localhost:3000');
  }

  async sendPasswordReset(email: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${this.frontendUrl}/auth/reset-password?token=${resetToken}`;

    if (!this.resend) {
      this.logger.warn(`Password reset requested for ${email} but email sending is disabled`);
      return false;
    }

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Reset your Intemso password',
        html: this.passwordResetTemplate(resetUrl),
      });
      this.logger.log(`Password reset email sent to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}`, error);
      return false;
    }
  }

  private passwordResetTemplate(resetUrl: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:480px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
    <div style="background:linear-gradient(135deg,#1e40af,#3b82f6);padding:32px;text-align:center;">
      <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;">Intemso</h1>
    </div>
    <div style="padding:32px;">
      <h2 style="color:#111827;font-size:20px;margin:0 0 8px;">Reset Your Password</h2>
      <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 24px;">
        We received a request to reset your password. Click the button below to choose a new password. This link expires in 1 hour.
      </p>
      <a href="${resetUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
        Reset Password
      </a>
      <p style="color:#9ca3af;font-size:12px;line-height:1.5;margin:24px 0 0;">
        If you didn't request this, you can safely ignore this email. Your password won't change.
      </p>
      <hr style="border:none;border-top:1px solid #f3f4f6;margin:24px 0;">
      <p style="color:#9ca3af;font-size:11px;margin:0;">
        If the button doesn't work, copy this link:<br>
        <a href="${resetUrl}" style="color:#2563eb;word-break:break-all;">${resetUrl}</a>
      </p>
    </div>
  </div>
</body>
</html>`;
  }
}
