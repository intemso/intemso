import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from '../payments/payments.service';
import { RequestWithdrawalDto } from './dto/request-withdrawal.dto';
import { CreateTransferRecipientDto } from '../payments/dto/create-transfer-recipient.dto';
import * as crypto from 'crypto';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    private prisma: PrismaService,
    private paymentsService: PaymentsService,
  ) {}

  // ════════════════════════════════════════════════════════════
  // WALLET BALANCE
  // ════════════════════════════════════════════════════════════

  async getWallet(userId: string) {
    let wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      wallet = await this.prisma.wallet.create({
        data: { userId, balance: 0, pendingBalance: 0 },
      });
    }

    // Also fetch transfer recipients for this user
    const recipients = await this.prisma.transferRecipient.findMany({
      where: { userId, isActive: true },
      select: {
        id: true,
        type: true,
        accountName: true,
        accountNumber: true,
        bankCode: true,
        bankName: true,
        isDefault: true,
      },
    });

    return {
      id: wallet.id,
      balance: wallet.balance,
      pendingBalance: wallet.pendingBalance,
      currency: wallet.currency,
      transferRecipients: recipients,
    };
  }

  // ════════════════════════════════════════════════════════════
  // TRANSFER RECIPIENT MANAGEMENT
  // ════════════════════════════════════════════════════════════

  /** Register a new payout destination (bank account or mobile money) */
  async addTransferRecipient(userId: string, dto: CreateTransferRecipientDto) {
    // Step 1: Verify the account via Paystack resolve API (for bank accounts)
    if (dto.type === 'ghipss') {
      const resolved = await this.paymentsService.resolveAccountNumber(
        dto.accountNumber,
        dto.bankCode,
      );
      // Use the resolved name if different
      if (resolved.account_name) {
        dto.accountName = resolved.account_name;
      }
    }

    // Step 2: Create on Paystack
    const paystackRecipient = await this.paymentsService.createTransferRecipient({
      type: dto.type,
      name: dto.accountName,
      accountNumber: dto.accountNumber,
      bankCode: dto.bankCode,
    });

    // Step 3: Save in our database
    // If this is the first recipient, make it default
    const existingCount = await this.prisma.transferRecipient.count({
      where: { userId, isActive: true },
    });

    const recipient = await this.prisma.transferRecipient.create({
      data: {
        userId,
        type: dto.type,
        recipientCode: paystackRecipient.recipient_code,
        accountName: dto.accountName,
        accountNumber: dto.accountNumber,
        bankCode: dto.bankCode,
        bankName: dto.bankName || paystackRecipient.details?.bank_name,
        isDefault: existingCount === 0,
      },
    });

    this.logger.log(`Transfer recipient created: ${recipient.id} for user ${userId}`);

    return {
      id: recipient.id,
      type: recipient.type,
      accountName: recipient.accountName,
      accountNumber: recipient.accountNumber,
      bankCode: recipient.bankCode,
      bankName: recipient.bankName,
      isDefault: recipient.isDefault,
    };
  }

  /** Get all active transfer recipients for a user */
  async getTransferRecipients(userId: string) {
    return this.prisma.transferRecipient.findMany({
      where: { userId, isActive: true },
      orderBy: { isDefault: 'desc' },
      select: {
        id: true,
        type: true,
        accountName: true,
        accountNumber: true,
        bankCode: true,
        bankName: true,
        isDefault: true,
        createdAt: true,
      },
    });
  }

  /** Set a transfer recipient as the default */
  async setDefaultRecipient(userId: string, recipientId: string) {
    const recipient = await this.prisma.transferRecipient.findFirst({
      where: { id: recipientId, userId, isActive: true },
    });
    if (!recipient) throw new NotFoundException('Transfer recipient not found');

    await this.prisma.$transaction([
      // Unset all defaults for this user
      this.prisma.transferRecipient.updateMany({
        where: { userId },
        data: { isDefault: false },
      }),
      // Set the new default
      this.prisma.transferRecipient.update({
        where: { id: recipientId },
        data: { isDefault: true },
      }),
    ]);

    return { message: 'Default recipient updated' };
  }

  /** Remove (deactivate) a transfer recipient */
  async removeTransferRecipient(userId: string, recipientId: string) {
    const recipient = await this.prisma.transferRecipient.findFirst({
      where: { id: recipientId, userId, isActive: true },
    });
    if (!recipient) throw new NotFoundException('Transfer recipient not found');

    await this.prisma.transferRecipient.update({
      where: { id: recipientId },
      data: { isActive: false },
    });

    return { message: 'Transfer recipient removed' };
  }

  // ════════════════════════════════════════════════════════════
  // WITHDRAWAL — VIA PAYSTACK TRANSFER
  // ════════════════════════════════════════════════════════════

  async requestWithdrawal(userId: string, dto: RequestWithdrawalDto) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new NotFoundException('Wallet not found');

    if (Number(wallet.balance) < dto.amount) {
      throw new BadRequestException('Insufficient balance');
    }

    if (dto.amount < 1) {
      throw new BadRequestException('Minimum withdrawal amount is GH₵1');
    }

    // Find the transfer recipient
    let recipient;
    if (dto.recipientId) {
      recipient = await this.prisma.transferRecipient.findFirst({
        where: { id: dto.recipientId, userId, isActive: true },
      });
    } else {
      // Use default recipient
      recipient = await this.prisma.transferRecipient.findFirst({
        where: { userId, isDefault: true, isActive: true },
      });
    }

    if (!recipient) {
      throw new BadRequestException(
        'No transfer recipient found. Please add a payout destination first.',
      );
    }

    // Generate unique reference for this withdrawal
    const withdrawalRef = `wtd_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;

    const balanceBefore = Number(wallet.balance);
    const balanceAfter = balanceBefore - dto.amount;

    return this.prisma.$transaction(async (tx) => {
      // Debit wallet immediately
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: dto.amount } },
      });

      // Create withdrawal record
      const withdrawal = await tx.withdrawal.create({
        data: {
          walletId: wallet.id,
          userId,
          amount: dto.amount,
          destination: {
            recipientId: recipient.id,
            recipientCode: recipient.recipientCode,
            type: recipient.type,
            accountNumber: recipient.accountNumber,
            bankCode: recipient.bankCode,
            accountName: recipient.accountName,
          },
          status: 'processing',
          externalTxnId: withdrawalRef,
        },
      });

      // Create wallet transaction
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'withdrawal',
          amount: dto.amount,
          balanceAfter,
          description: `Withdrawal to ${recipient.bankName || recipient.bankCode} — ${recipient.accountNumber}`,
        },
      });

      // Financial audit log
      await tx.financialAuditLog.create({
        data: {
          action: 'withdrawal_initiated',
          entityType: 'withdrawal',
          entityId: withdrawal.id,
          userId,
          amount: dto.amount,
          balanceBefore,
          balanceAfter,
          metadata: {
            recipientCode: recipient.recipientCode,
            accountNumber: recipient.accountNumber,
            reference: withdrawalRef,
          },
        },
      });

      // Initiate Paystack transfer (outside the DB transaction scope to avoid holding the lock)
      // The transfer result will be handled via webhook
      setImmediate(async () => {
        try {
          await this.paymentsService.initiateTransfer({
            amount: dto.amount,
            recipientCode: recipient.recipientCode,
            reason: `Intemso earnings withdrawal`,
            reference: withdrawalRef,
          });
          this.logger.log(`Transfer initiated: ${withdrawalRef} — GH₵${dto.amount}`);
        } catch (err) {
          this.logger.error(`Transfer initiation failed: ${withdrawalRef}`, err);
          // Re-credit the wallet on immediate failure
          await this.prisma.$transaction(async (tx2) => {
            await tx2.wallet.update({
              where: { id: wallet.id },
              data: { balance: { increment: dto.amount } },
            });
            await tx2.withdrawal.update({
              where: { id: withdrawal.id },
              data: { status: 'failed' },
            });
            await tx2.transaction.create({
              data: {
                walletId: wallet.id,
                type: 'refund',
                amount: dto.amount,
                balanceAfter: balanceAfter + dto.amount,
                description: `Withdrawal failed — funds returned (${withdrawalRef})`,
              },
            });
          });
        }
      });

      return {
        id: withdrawal.id,
        amount: withdrawal.amount,
        status: withdrawal.status,
        reference: withdrawalRef,
        destination: {
          type: recipient.type,
          accountNumber: recipient.accountNumber,
          accountName: recipient.accountName,
          bankName: recipient.bankName,
        },
      };
    });
  }

  // ── Transaction history ──

  async getTransactions(userId: string, params: { page?: number; limit?: number }) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      return { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } };
    }

    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          payment: {
            select: { type: true, milestoneId: true, contractId: true },
          },
        },
      }),
      this.prisma.transaction.count({ where: { walletId: wallet.id } }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ── Withdrawal history ──

  async getWithdrawals(userId: string, params: { page?: number; limit?: number }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      return { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } };
    }

    const [data, total] = await Promise.all([
      this.prisma.withdrawal.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.withdrawal.count({ where: { walletId: wallet.id } }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
