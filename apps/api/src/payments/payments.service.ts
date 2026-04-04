import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { InitializePaymentDto, PaymentPurpose } from './dto/initialize-payment.dto';
import * as crypto from 'crypto';

const CONNECT_PACKS: Record<number, number> = {
  10: 5,   // 10 connects = GH₵5
  20: 9,   // 20 connects = GH₵9
  40: 16,  // 40 connects = GH₵16
};

const FEE_TIERS = [
  { threshold: 500, rate: 0.15 },   // tier_1: first 500 → 15%
  { threshold: 2000, rate: 0.10 },  // tier_2: 500–2000 → 10%
  { threshold: Infinity, rate: 0.05 }, // tier_3: above 2000 → 5%
];

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly paystackSecretKey: string;
  private readonly paystackBaseUrl = 'https://api.paystack.co';
  private readonly paystackTimeoutMs = 30_000; // 30s timeout for Paystack API calls

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.paystackSecretKey = this.config.get<string>('PAYSTACK_SECRET_KEY', 'sk_test_placeholder');
  }

  // ════════════════════════════════════════════════════════════
  // INITIALIZE PAYSTACK TRANSACTION
  // ════════════════════════════════════════════════════════════

  async initialize(userId: string, dto: InitializePaymentDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    let amountPesewas: number;
    let metadata: Record<string, string>;

    if (dto.purpose === PaymentPurpose.MILESTONE_ESCROW) {
      if (!dto.milestoneId) throw new BadRequestException('milestoneId required for escrow');

      const milestone = await this.prisma.milestone.findUnique({
        where: { id: dto.milestoneId },
        include: { contract: true },
      });
      if (!milestone) throw new NotFoundException('Milestone not found');
      if (milestone.contract.employerId !== (await this.getProfileId(userId, 'employer'))) {
        throw new BadRequestException('Only the employer can fund this milestone');
      }
      if (milestone.status !== 'pending') {
        throw new BadRequestException('Milestone is not in pending status');
      }

      amountPesewas = Math.round(Number(milestone.amount) * 100);
      metadata = {
        purpose: 'milestone_escrow',
        milestoneId: milestone.id,
        contractId: milestone.contractId,
        userId,
      };
    } else if (dto.purpose === PaymentPurpose.CONNECTS_PURCHASE) {
      if (!dto.packSize || !CONNECT_PACKS[dto.packSize]) {
        throw new BadRequestException('Invalid pack size. Options: 10, 20, 40');
      }
      amountPesewas = CONNECT_PACKS[dto.packSize] * 100;
      metadata = {
        purpose: 'connects_purchase',
        packSize: String(dto.packSize),
        userId,
      };
    } else if (dto.purpose === PaymentPurpose.SERVICE_ORDER_ESCROW) {
      if (!dto.serviceOrderId) throw new BadRequestException('serviceOrderId required for service order escrow');

      const order = await this.prisma.serviceOrder.findUnique({
        where: { id: dto.serviceOrderId },
      });
      if (!order) throw new NotFoundException('Service order not found');
      if (order.employerId !== (await this.getProfileId(userId, 'employer'))) {
        throw new BadRequestException('Only the employer can pay for this order');
      }
      if (order.status !== 'pending') {
        throw new BadRequestException('Order is not in pending status');
      }

      amountPesewas = Math.round(Number(order.amount) * 100);
      metadata = {
        purpose: 'service_order_escrow',
        serviceOrderId: order.id,
        userId,
      };
    } else if (dto.purpose === PaymentPurpose.BONUS_PAYMENT) {
      if (!dto.contractId) throw new BadRequestException('contractId required for bonus');
      if (!dto.amount || dto.amount < 1) throw new BadRequestException('amount required (min GH₵1)');

      const contract = await this.prisma.contract.findUnique({
        where: { id: dto.contractId },
        include: { student: true },
      });
      if (!contract) throw new NotFoundException('Contract not found');
      if (contract.employerId !== (await this.getProfileId(userId, 'employer'))) {
        throw new BadRequestException('Only the employer can send a bonus');
      }
      if (contract.status !== 'active') {
        throw new BadRequestException('Contract must be active');
      }

      amountPesewas = Math.round(dto.amount * 100);
      metadata = {
        purpose: 'bonus_payment',
        contractId: contract.id,
        studentId: contract.studentId,
        userId,
      };
    } else {
      throw new BadRequestException('Invalid payment purpose');
    }

    // Call Paystack initialize
    const response = await this.paystackFetch(`${this.paystackBaseUrl}/transaction/initialize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        amount: amountPesewas,
        currency: 'GHS',
        callback_url: dto.callbackUrl || undefined,
        metadata,
      }),
    });

    const body: any = await response.json();
    if (!body.status) {
      throw new BadRequestException(body.message || 'Payment initialization failed');
    }

    return {
      authorizationUrl: body.data.authorization_url,
      accessCode: body.data.access_code,
      reference: body.data.reference,
    };
  }

  // ════════════════════════════════════════════════════════════
  // WEBHOOK HANDLER — IDEMPOTENT
  // ════════════════════════════════════════════════════════════

  async handleWebhook(signature: string, rawBody: Buffer) {
    // Timing-safe signature verification
    const hash = crypto
      .createHmac('sha512', this.paystackSecretKey)
      .update(rawBody)
      .digest('hex');

    const sigBuffer = Buffer.from(signature, 'utf8');
    const hashBuffer = Buffer.from(hash, 'utf8');

    if (sigBuffer.length !== hashBuffer.length || !crypto.timingSafeEqual(sigBuffer, hashBuffer)) {
      throw new BadRequestException('Invalid webhook signature');
    }

    const event = JSON.parse(rawBody.toString());
    const reference = event.data?.reference;

    if (!reference) {
      this.logger.warn('Webhook received without reference', event.event);
      return;
    }

    // ── Idempotency check ──
    const existing = await this.prisma.webhookEvent.findUnique({
      where: { paystackReference: reference },
    });

    if (existing?.processedAt) {
      // Already processed — acknowledge silently
      this.logger.debug(`Webhook already processed: ${reference}`);
      return;
    }

    // Record the webhook event (or no-op if already recorded but not processed)
    await this.prisma.webhookEvent.upsert({
      where: { paystackReference: reference },
      create: {
        paystackReference: reference,
        eventType: event.event,
        payload: event.data,
        receivedAt: new Date(),
      },
      update: {},
    });

    // ── Route event to handler ──
    try {
      switch (event.event) {
        case 'charge.success':
          await this.processChargeSuccess(event.data, reference);
          break;
        case 'charge.failed':
          await this.processChargeFailed(event.data, reference);
          break;
        case 'transfer.success':
          await this.processTransferSuccess(event.data, reference);
          break;
        case 'transfer.failed':
          await this.processTransferFailed(event.data, reference);
          break;
        case 'transfer.reversed':
          await this.processTransferReversed(event.data, reference);
          break;
        case 'refund.processed':
          await this.processRefundProcessed(event.data, reference);
          break;
        case 'refund.failed':
          this.logger.error(`Refund failed: ${reference}`, event.data);
          await this.logFinancialEvent({
            action: 'refund_failed',
            entityType: 'payment',
            amount: Number(event.data?.amount || 0) / 100,
            paystackRef: reference,
            metadata: { reason: event.data?.gateway_response || 'Refund failed' },
          });
          break;
        default:
          this.logger.debug(`Unhandled webhook event: ${event.event}`);
      }

      // Mark as processed
      await this.prisma.webhookEvent.update({
        where: { paystackReference: reference },
        data: { processedAt: new Date() },
      });
    } catch (err) {
      this.logger.error(`Failed processing webhook ${event.event}: ${reference}`, err);
      throw err;
    }
  }

  // ════════════════════════════════════════════════════════════
  // CHARGE SUCCESS — funds escrow or fulfills connect purchase
  // ════════════════════════════════════════════════════════════

  private async processChargeSuccess(data: any, reference: string) {
    const { metadata, amount, authorization } = data;

    // Double-verify with Paystack API
    const verified = await this.verifyTransaction(reference);
    if (!verified?.data?.status || verified.data.status !== 'success') {
      this.logger.error(`Verification failed for charge ${reference}`);
      return;
    }

    if (metadata.purpose === 'milestone_escrow') {
      await this.fundMilestoneEscrow(
        metadata.milestoneId,
        metadata.contractId,
        metadata.userId,
        reference,
        amount / 100,
      );
    } else if (metadata.purpose === 'connects_purchase') {
      await this.fulfillConnectsPurchase(
        metadata.userId,
        parseInt(metadata.packSize),
        reference,
        amount / 100,
      );
    } else if (metadata.purpose === 'hourly_weekly_billing') {
      await this.fulfillHourlyBilling(
        metadata.contract_id,
        metadata.billing_week,
        reference,
        amount / 100,
      );
    } else if (metadata.purpose === 'service_order_escrow') {
      await this.fundServiceOrderEscrow(
        metadata.serviceOrderId,
        metadata.userId,
        reference,
        amount / 100,
      );
    } else if (metadata.purpose === 'bonus_payment') {
      await this.fulfillBonusPayment(
        metadata.contractId,
        metadata.userId,
        metadata.studentId,
        reference,
        amount / 100,
      );
    }

    // Save authorization for future recurring charges (hourly contracts)
    if (authorization?.authorization_code && metadata.userId) {
      await this.savePaymentAuthorization(metadata.userId, authorization, data.customer?.email);
    }
  }

  // ════════════════════════════════════════════════════════════
  // CHARGE FAILED
  // ════════════════════════════════════════════════════════════

  private async processChargeFailed(data: any, reference: string) {
    const { metadata } = data;

    if (metadata?.purpose === 'milestone_escrow' && metadata?.milestoneId) {
      // Update escrow transaction if one was created
      await this.prisma.escrowTransaction.updateMany({
        where: {
          paystackReference: reference,
          status: 'pending',
        },
        data: {
          status: 'failed',
          failedAt: new Date(),
          failureReason: data.gateway_response || 'Payment failed',
        },
      });

      // Log the failure
      await this.logFinancialEvent({
        action: 'charge_failed',
        entityType: 'escrow_transaction',
        entityId: metadata.milestoneId,
        userId: metadata.userId,
        amount: data.amount ? data.amount / 100 : undefined,
        paystackRef: reference,
        metadata: { reason: data.gateway_response },
      });
    }
  }

  // ════════════════════════════════════════════════════════════
  // TRANSFER SUCCESS — student payout confirmed
  // ════════════════════════════════════════════════════════════

  private async processTransferSuccess(data: any, reference: string) {
    // Mark withdrawal as completed
    const withdrawal = await this.prisma.withdrawal.findFirst({
      where: { externalTxnId: reference },
    });

    if (withdrawal) {
      await this.prisma.withdrawal.update({
        where: { id: withdrawal.id },
        data: {
          status: 'completed',
          processedAt: new Date(),
        },
      });

      await this.logFinancialEvent({
        action: 'transfer_success',
        entityType: 'withdrawal',
        entityId: withdrawal.id,
        userId: withdrawal.userId,
        amount: Number(withdrawal.amount),
        paystackRef: reference,
      });

      this.logger.log(`Transfer completed: ${reference} — GH₵${withdrawal.amount}`);
    }
  }

  // ════════════════════════════════════════════════════════════
  // TRANSFER FAILED — re-credit student wallet
  // ════════════════════════════════════════════════════════════

  private async processTransferFailed(data: any, reference: string) {
    const withdrawal = await this.prisma.withdrawal.findFirst({
      where: { externalTxnId: reference, status: 'processing' },
    });

    if (!withdrawal) return;

    await this.prisma.$transaction(async (tx) => {
      // Mark withdrawal as failed
      await tx.withdrawal.update({
        where: { id: withdrawal.id },
        data: { status: 'failed' },
      });

      // Re-credit the student's wallet
      const wallet = await tx.wallet.findUnique({
        where: { id: withdrawal.walletId },
      });
      if (!wallet) return;

      const newBalance = Number(wallet.balance) + Number(withdrawal.amount);

      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: Number(withdrawal.amount) } },
      });

      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'refund',
          amount: Number(withdrawal.amount),
          balanceAfter: newBalance,
          description: `Withdrawal reversed — transfer failed (${reference})`,
        },
      });
    });

    await this.logFinancialEvent({
      action: 'transfer_failed',
      entityType: 'withdrawal',
      entityId: withdrawal.id,
      userId: withdrawal.userId,
      amount: Number(withdrawal.amount),
      paystackRef: reference,
      metadata: { reason: data.gateway_response || 'Transfer failed' },
    });

    this.logger.error(`Transfer failed: ${reference}. Wallet re-credited.`);
  }

  // ════════════════════════════════════════════════════════════
  // TRANSFER REVERSED — re-credit student wallet
  // ════════════════════════════════════════════════════════════

  private async processTransferReversed(data: any, reference: string) {
    // Same logic as transfer failed
    await this.processTransferFailed(data, reference);
    this.logger.warn(`Transfer reversed: ${reference}`);
  }

  // ════════════════════════════════════════════════════════════
  // REFUND PROCESSED
  // ════════════════════════════════════════════════════════════

  private async processRefundProcessed(data: any, reference: string) {
    // Find the escrow transaction that was refunded
    const escrow = await this.prisma.escrowTransaction.findFirst({
      where: { paystackReference: reference },
    });

    if (escrow) {
      await this.prisma.escrowTransaction.update({
        where: { id: escrow.id },
        data: {
          status: 'refunded',
          refundedAt: new Date(),
        },
      });
    }

    await this.logFinancialEvent({
      action: 'refund_processed',
      entityType: 'escrow_transaction',
      entityId: escrow?.id,
      amount: data.amount ? data.amount / 100 : undefined,
      paystackRef: reference,
    });

    this.logger.log(`Refund processed: ${reference}`);
  }

  // ════════════════════════════════════════════════════════════
  // ESCROW: FUND MILESTONE
  // ════════════════════════════════════════════════════════════

  private async fundMilestoneEscrow(
    milestoneId: string,
    contractId: string,
    userId: string,
    reference: string,
    amount: number,
  ) {
    await this.prisma.$transaction(async (tx) => {
      const contract = await tx.contract.findUnique({ where: { id: contractId } });
      if (!contract) return;

      // Verify milestone is still in a fundable state
      const milestone = await tx.milestone.findUnique({ where: { id: milestoneId } });
      if (!milestone || !['pending', 'funded'].includes(milestone.status)) {
        this.logger.warn(`Milestone ${milestoneId} not in fundable state: ${milestone?.status}`);
        return;
      }

      // Update milestone status to funded
      await tx.milestone.update({
        where: { id: milestoneId },
        data: { status: 'funded' },
      });

      // Create EscrowTransaction record
      await tx.escrowTransaction.create({
        data: {
          milestoneId,
          contractId,
          payerId: contract.employerId,
          payeeId: contract.studentId,
          amount,
          status: 'funded',
          paystackReference: reference,
          fundedAt: new Date(),
        },
      });

      // Create Payment record for escrow
      await tx.payment.create({
        data: {
          contractId,
          milestoneId,
          payerId: contract.employerId,
          payeeId: contract.studentId,
          amount,
          platformFee: 0,      // Calculated on release
          feePercentage: 0,
          netAmount: amount,
          type: 'milestone_escrow',
          status: 'escrow',
          externalTxnId: reference,
          escrowAt: new Date(),
        },
      });

      // Increment student wallet pending_balance
      await this.getOrCreateWallet(tx, contract.studentId);
      await tx.wallet.updateMany({
        where: {
          OR: [
            { userId: contract.studentId },
            { user: { studentProfile: { id: contract.studentId } } },
          ],
        },
        data: { pendingBalance: { increment: amount } },
      });

      // Financial audit log
      await tx.financialAuditLog.create({
        data: {
          action: 'escrow_funded',
          entityType: 'milestone',
          entityId: milestoneId,
          userId,
          amount,
          paystackRef: reference,
          metadata: { contractId, milestoneId },
        },
      });
    });

    this.logger.log(`Escrow funded: milestone=${milestoneId}, amount=GH₵${amount}, ref=${reference}`);
  }

  // ════════════════════════════════════════════════════════════
  // ESCROW: RELEASE PAYMENT ON MILESTONE APPROVAL
  // ════════════════════════════════════════════════════════════

  async releaseMilestonePayment(milestoneId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { milestoneId, type: 'milestone_escrow', status: 'escrow' },
      include: { contract: true },
    });
    if (!payment || !payment.contract) {
      this.logger.warn(`No escrow payment found for milestone ${milestoneId}`);
      return;
    }

    const amount = Number(payment.amount);
    const { feePercentage, platformFee, netAmount } = await this.calculateFees(
      payment.contract.studentId,
      payment.contract.employerId,
      amount,
    );

    await this.prisma.$transaction(async (tx) => {
      // Update payment to released
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'released',
          platformFee,
          feePercentage: feePercentage * 100,
          netAmount,
          releasedAt: new Date(),
        },
      });

      // Update EscrowTransaction
      await tx.escrowTransaction.updateMany({
        where: { milestoneId, status: { in: ['funded', 'in_progress', 'submitted'] } },
        data: {
          status: 'released',
          platformFee,
          feePercentage: feePercentage * 100,
          netAmount,
          releasedAt: new Date(),
        },
      });

      // Credit student wallet (available balance) and decrement pending
      const wallet = await this.getOrCreateWallet(tx, payment.payeeId);
      const walletBalanceBefore = Number(wallet.balance);
      const newBalance = walletBalanceBefore + netAmount;

      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: { increment: netAmount },
          pendingBalance: { decrement: amount },
        },
      });

      // Create wallet transaction
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          paymentId: payment.id,
          type: 'credit',
          amount: netAmount,
          balanceAfter: newBalance,
          description: `Milestone payment — GH₵${amount} (${(feePercentage * 100).toFixed(0)}% fee: GH₵${platformFee.toFixed(2)})`,
        },
      });

      // Update milestone paid timestamp
      await tx.milestone.update({
        where: { id: milestoneId },
        data: { paidAt: new Date(), status: 'paid' },
      });

      // Update client relationship lifetime billings
      await this.updateClientRelationship(
        tx,
        payment.contract!.studentId,
        payment.contract!.employerId,
        amount,
      );

      // Update contract lifetime billings
      await tx.contract.update({
        where: { id: payment.contract!.id },
        data: { lifetimeBillings: { increment: amount } },
      });

      // Financial audit log
      await tx.financialAuditLog.create({
        data: {
          action: 'escrow_released',
          entityType: 'milestone',
          entityId: milestoneId,
          amount: netAmount,
          balanceBefore: walletBalanceBefore,
          balanceAfter: newBalance,
          paystackRef: payment.externalTxnId,
          metadata: {
            grossAmount: amount,
            platformFee,
            feePercentage: feePercentage * 100,
            contractId: payment.contractId,
          },
        },
      });
    });

    this.logger.log(
      `Escrow released: milestone=${milestoneId}, gross=GH₵${amount}, fee=GH₵${platformFee.toFixed(2)}, net=GH₵${netAmount.toFixed(2)}`,
    );
  }

  // ── Connects purchase fulfillment ──

  private async fulfillConnectsPurchase(userId: string, packSize: number, reference: string, price: number) {
    const student = await this.prisma.studentProfile.findFirst({
      where: { user: { id: userId } },
    });
    if (!student) return;

    await this.prisma.$transaction(async (tx) => {
      // Record the purchase
      await tx.connectPurchase.create({
        data: {
          studentId: student.id,
          packSize,
          price,
          paymentReference: reference,
          status: 'completed',
        },
      });

      // Credit connects
      await tx.connectBalance.upsert({
        where: { studentId: student.id },
        update: { purchasedConnects: { increment: packSize } },
        create: {
          studentId: student.id,
          freeConnects: 10,
          purchasedConnects: packSize,
        },
      });

      // Record connect transaction
      const balance = await tx.connectBalance.findUnique({ where: { studentId: student.id } });
      const totalAfter = (balance?.freeConnects ?? 10) + (balance?.purchasedConnects ?? 0) + (balance?.rolloverConnects ?? 0);

      await tx.connectTransaction.create({
        data: {
          studentId: student.id,
          type: 'purchase',
          amount: packSize,
          balanceAfter: totalAfter,
          description: `Purchased ${packSize} connects for GH₵${price}`,
        },
      });
    });
  }

  // ════════════════════════════════════════════════════════════
  // HOURLY BILLING FULFILLMENT (called from charge.success webhook)
  // ════════════════════════════════════════════════════════════

  private async fulfillHourlyBilling(contractId: string, billingWeek: string, reference: string, amount: number) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        student: { select: { id: true, userId: true } },
        employer: { select: { id: true, userId: true } },
      },
    });
    if (!contract) {
      this.logger.warn(`Hourly billing: contract ${contractId} not found`);
      return;
    }

    const { feePercentage, platformFee, netAmount } = await this.calculateFees(
      contract.studentId,
      contract.employerId,
      amount,
    );

    await this.prisma.$transaction(async (tx) => {
      // Update the weekly invoice to paid
      await tx.weeklyInvoice.updateMany({
        where: {
          contractId,
          billingWeek: new Date(billingWeek),
          status: 'pending',
        },
        data: {
          status: 'paid',
          platformFee,
          paidAt: new Date(),
        },
      });

      // Find the invoice
      const invoice = await tx.weeklyInvoice.findFirst({
        where: { contractId, billingWeek: new Date(billingWeek) },
      });

      // Create payment record
      await tx.payment.create({
        data: {
          contractId,
          weeklyInvoiceId: invoice?.id,
          payerId: contract.employer.userId,
          payeeId: contract.student.userId,
          amount,
          platformFee,
          feePercentage: feePercentage * 100,
          netAmount,
          type: 'hourly_weekly',
          status: 'released', // hourly goes directly to wallet
          externalTxnId: reference,
          releasedAt: new Date(),
        },
      });

      // Credit student wallet directly (no escrow for hourly)
      const wallet = await this.getOrCreateWallet(tx, contract.student.userId);
      const balanceBefore = Number(wallet.balance);
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: netAmount } },
      });

      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'credit',
          amount: netAmount,
          balanceAfter: balanceBefore + netAmount,
          description: `Weekly billing — ${billingWeek} — GH₵${amount} (${(feePercentage * 100).toFixed(0)}% fee)`,
        },
      });

      // Mark time entries as billed
      await tx.timeEntry.updateMany({
        where: { contractId, billingWeek: new Date(billingWeek), isBilled: false },
        data: { isBilled: true },
      });

      // Update client relationship
      await this.updateClientRelationship(tx, contract.studentId, contract.employerId, amount);

      await tx.financialAuditLog.create({
        data: {
          action: 'hourly_billing_paid',
          entityType: 'weekly_invoice',
          entityId: invoice?.id,
          amount: netAmount,
          balanceBefore,
          balanceAfter: balanceBefore + netAmount,
          paystackRef: reference,
          metadata: { contractId, billingWeek, grossAmount: amount, platformFee },
        },
      });
    });

    this.logger.log(`Hourly billing fulfilled: contract=${contractId}, week=${billingWeek}, GH₵${amount}`);
  }

  // ════════════════════════════════════════════════════════════
  // SERVICE ORDER ESCROW (upfront payment for service catalog)
  // ════════════════════════════════════════════════════════════

  private async fundServiceOrderEscrow(serviceOrderId: string, userId: string, reference: string, amount: number) {
    const order = await this.prisma.serviceOrder.findUnique({
      where: { id: serviceOrderId },
      include: {
        student: { select: { id: true, userId: true } },
        employer: { select: { id: true, userId: true } },
      },
    });
    if (!order) {
      this.logger.warn(`Service order ${serviceOrderId} not found`);
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      // Create payment record in escrow
      await tx.payment.create({
        data: {
          serviceOrderId,
          payerId: order.employer.userId,
          payeeId: order.student.userId,
          amount,
          platformFee: 0,
          feePercentage: 0,
          netAmount: 0,
          type: 'service_order',
          status: 'escrow',
          externalTxnId: reference,
          escrowAt: new Date(),
        },
      });

      // Create escrow transaction record
      await tx.escrowTransaction.create({
        data: {
          serviceOrderId,
          contractId: serviceOrderId, // use serviceOrderId as reference
          payerId: order.employer.userId,
          payeeId: order.student.userId,
          amount,
          status: 'funded',
          paystackReference: reference,
          fundedAt: new Date(),
        },
      });

      // Update service order status
      await tx.serviceOrder.update({
        where: { id: serviceOrderId },
        data: { status: 'active' },
      });

      // Track pending balance
      const wallet = await this.getOrCreateWallet(tx, order.student.userId);
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { pendingBalance: { increment: amount } },
      });

      await tx.financialAuditLog.create({
        data: {
          action: 'service_order_escrow_funded',
          entityType: 'service_order',
          entityId: serviceOrderId,
          userId,
          amount,
          paystackRef: reference,
          metadata: { employerId: order.employerId, studentId: order.studentId },
        },
      });
    });

    this.logger.log(`Service order escrow funded: order=${serviceOrderId}, GH₵${amount}`);
  }

  /**
   * Release service order escrow when completed (called from services.service on employer approval).
   */
  async releaseServiceOrderPayment(serviceOrderId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { serviceOrderId, type: 'service_order', status: 'escrow' },
      include: {
        serviceOrder: {
          include: {
            student: { select: { id: true, userId: true } },
            employer: { select: { id: true, userId: true } },
          },
        },
      },
    });
    if (!payment || !payment.serviceOrder) {
      this.logger.warn(`No escrow payment for service order ${serviceOrderId}`);
      return;
    }

    const order = payment.serviceOrder;
    const amount = Number(payment.amount);
    const { feePercentage, platformFee, netAmount } = await this.calculateFees(
      order.studentId,
      order.employerId,
      amount,
    );

    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'released',
          platformFee,
          feePercentage: feePercentage * 100,
          netAmount,
          releasedAt: new Date(),
        },
      });

      await tx.escrowTransaction.updateMany({
        where: { serviceOrderId, status: { in: ['funded', 'in_progress', 'submitted'] } },
        data: { status: 'released', platformFee, netAmount, releasedAt: new Date() },
      });

      const wallet = await this.getOrCreateWallet(tx, order.student.userId);
      const balanceBefore = Number(wallet.balance);
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: { increment: netAmount },
          pendingBalance: { decrement: amount },
        },
      });

      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          paymentId: payment.id,
          type: 'credit',
          amount: netAmount,
          balanceAfter: balanceBefore + netAmount,
          description: `Service order payment — GH₵${amount} (${(feePercentage * 100).toFixed(0)}% fee)`,
        },
      });

      await this.updateClientRelationship(tx, order.studentId, order.employerId, amount);

      await tx.financialAuditLog.create({
        data: {
          action: 'service_order_released',
          entityType: 'service_order',
          entityId: serviceOrderId,
          amount: netAmount,
          balanceBefore,
          balanceAfter: balanceBefore + netAmount,
          paystackRef: payment.externalTxnId,
          metadata: { grossAmount: amount, platformFee, feePercentage: feePercentage * 100 },
        },
      });
    });

    this.logger.log(`Service order released: ${serviceOrderId}, net=GH₵${netAmount.toFixed(2)}`);
  }

  // ════════════════════════════════════════════════════════════
  // BONUS PAYMENT (employer sends bonus to student)
  // ════════════════════════════════════════════════════════════

  private async fulfillBonusPayment(
    contractId: string,
    employerUserId: string,
    studentId: string,
    reference: string,
    amount: number,
  ) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        student: { select: { id: true, userId: true } },
        employer: { select: { id: true, userId: true } },
      },
    });
    if (!contract) {
      this.logger.warn(`Bonus: contract ${contractId} not found`);
      return;
    }

    const { feePercentage, platformFee, netAmount } = await this.calculateFees(
      contract.studentId,
      contract.employerId,
      amount,
    );

    await this.prisma.$transaction(async (tx) => {
      await tx.payment.create({
        data: {
          contractId,
          payerId: contract.employer.userId,
          payeeId: contract.student.userId,
          amount,
          platformFee,
          feePercentage: feePercentage * 100,
          netAmount,
          type: 'bonus',
          status: 'released',
          externalTxnId: reference,
          releasedAt: new Date(),
        },
      });

      const wallet = await this.getOrCreateWallet(tx, contract.student.userId);
      const balanceBefore = Number(wallet.balance);
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: netAmount } },
      });

      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'bonus',
          amount: netAmount,
          balanceAfter: balanceBefore + netAmount,
          description: `Bonus from employer — GH₵${amount} (${(feePercentage * 100).toFixed(0)}% fee)`,
        },
      });

      await this.updateClientRelationship(tx, contract.studentId, contract.employerId, amount);

      await tx.financialAuditLog.create({
        data: {
          action: 'bonus_payment',
          entityType: 'contract',
          entityId: contractId,
          amount: netAmount,
          balanceBefore,
          balanceAfter: balanceBefore + netAmount,
          paystackRef: reference,
          metadata: { grossAmount: amount, platformFee },
        },
      });
    });

    this.logger.log(`Bonus fulfilled: contract=${contractId}, GH₵${amount}`);
  }

  // ════════════════════════════════════════════════════════════
  // WEEKLY HOURLY BILLING CRON (Every Monday 00:00 GMT)
  // ════════════════════════════════════════════════════════════

  @Cron('0 0 * * 1') // Every Monday at midnight
  async processWeeklyHourlyBilling() {
    this.logger.log('Starting weekly hourly billing...');

    // Get the billing week (previous Monday)
    const now = new Date();
    const billingWeek = new Date(now);
    billingWeek.setDate(now.getDate() - 7);
    billingWeek.setHours(0, 0, 0, 0);
    // Align to Monday
    const dayOfWeek = billingWeek.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    billingWeek.setDate(billingWeek.getDate() + diff);

    // Find all active hourly contracts with unbilled time entries for this week
    const contracts = await this.prisma.contract.findMany({
      where: {
        contractType: 'hourly',
        status: 'active',
        timeEntries: {
          some: {
            billingWeek: billingWeek,
            isBilled: false,
          },
        },
      },
      include: {
        student: { select: { id: true, userId: true } },
        employer: { select: { id: true, userId: true } },
        timeEntries: {
          where: { billingWeek: billingWeek, isBilled: false },
        },
      },
    });

    for (const contract of contracts) {
      try {
        const totalHours = contract.timeEntries.reduce(
          (sum, entry) => sum + Number(entry.hours),
          0,
        );
        if (totalHours <= 0) continue;

        const hourlyRate = Number(contract.agreedRate);
        const subtotal = Math.round(totalHours * hourlyRate * 100) / 100;

        // Create weekly invoice
        const invoice = await this.prisma.weeklyInvoice.create({
          data: {
            contractId: contract.id,
            billingWeek: billingWeek,
            totalHours,
            hourlyRate,
            subtotal,
            platformFee: 0, // calculated on payment success
            status: 'pending',
          },
        });

        // Find employer's saved payment authorization
        const auth = await this.getDefaultAuthorization(contract.employer.userId);
        if (!auth) {
          this.logger.warn(
            `No payment authorization for employer ${contract.employerId}, skipping billing for contract ${contract.id}`,
          );
          await this.prisma.weeklyInvoice.update({
            where: { id: invoice.id },
            data: { status: 'failed' },
          });
          continue;
        }

        // Charge the employer
        const result = await this.chargeAuthorization({
          authorizationCode: auth.authorizationCode,
          email: auth.paystackEmail || '',
          amount: subtotal,
          metadata: {
            purpose: 'hourly_weekly_billing',
            contract_id: contract.id,
            billing_week: billingWeek.toISOString().split('T')[0],
            hours: String(totalHours),
            rate: String(hourlyRate),
          },
        });

        if (!result.success) {
          this.logger.error(
            `Hourly billing charge failed for contract ${contract.id}: ${result.error}`,
          );
          await this.prisma.weeklyInvoice.update({
            where: { id: invoice.id },
            data: { status: 'failed' },
          });
        }
        // On success, the webhook handler (charge.success) will call fulfillHourlyBilling
      } catch (err) {
        this.logger.error(`Failed to process hourly billing for contract ${contract.id}`, err);
      }
    }

    this.logger.log('Weekly hourly billing complete');
  }

  // ════════════════════════════════════════════════════════════
  // STALE ESCROW HANDLER (30-day no-activity auto-refund)
  // ════════════════════════════════════════════════════════════

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleStaleEscrows() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Find funded milestones with no activity for 30 days
    const staleMilestones = await this.prisma.milestone.findMany({
      where: {
        status: 'funded',
        updatedAt: { lte: thirtyDaysAgo },
        submittedAt: null, // never submitted
      },
      include: {
        contract: {
          include: {
            student: { select: { userId: true } },
            employer: { select: { userId: true } },
          },
        },
        payments: {
          where: { status: 'escrow', type: 'milestone_escrow' },
        },
      },
    });

    for (const milestone of staleMilestones) {
      try {
        const payment = milestone.payments[0];
        if (!payment) continue;

        const amount = Number(payment.amount);

        await this.prisma.$transaction(async (tx) => {
          // Refund the payment
          await tx.payment.update({
            where: { id: payment.id },
            data: { status: 'refunded', platformFee: 0, netAmount: 0 },
          });

          // Update escrow record
          await tx.escrowTransaction.updateMany({
            where: { milestoneId: milestone.id, status: { in: ['funded', 'pending'] } },
            data: { status: 'expired', refundedAt: new Date(), failureReason: '30-day inactivity auto-refund' },
          });

          // Update milestone
          await tx.milestone.update({
            where: { id: milestone.id },
            data: { status: 'cancelled' },
          });

          // Remove from student pending balance
          const wallet = await tx.wallet.findFirst({
            where: { userId: milestone.contract.student.userId },
          });
          if (wallet) {
            await tx.wallet.update({
              where: { id: wallet.id },
              data: { pendingBalance: { decrement: amount } },
            });
          }

          await tx.financialAuditLog.create({
            data: {
              action: 'stale_escrow_refund',
              entityType: 'milestone',
              entityId: milestone.id,
              amount,
              metadata: {
                contractId: milestone.contractId,
                paymentId: payment.id,
                reason: '30-day inactivity',
              },
            },
          });
        });

        // Initiate Paystack refund
        if (payment.externalTxnId) {
          this.initiateRefund({
            transactionReference: payment.externalTxnId,
          }).catch((err) => {
            this.logger.error(`Stale escrow refund failed for milestone ${milestone.id}`, err);
          });
        }

        this.logger.log(`Stale escrow auto-refunded: milestone=${milestone.id}, GH₵${amount}`);
      } catch (err) {
        this.logger.error(`Failed to process stale escrow for milestone ${milestone.id}`, err);
      }
    }
  }

  // ════════════════════════════════════════════════════════════
  // TRANSFER FAILURE RETRY (max 3 retries)
  // ════════════════════════════════════════════════════════════

  @Cron(CronExpression.EVERY_30_MINUTES)
  async retryFailedTransfers() {
    const MAX_RETRIES = 3;

    const failedWithdrawals = await this.prisma.withdrawal.findMany({
      where: {
        status: 'failed',
        retryCount: { lt: MAX_RETRIES },
      },
      include: {
        wallet: { include: { user: true } },
      },
      take: 20, // process in batches
    });

    for (const withdrawal of failedWithdrawals) {
      try {
        const destination = withdrawal.destination as any;
        if (!destination?.recipientCode) {
          this.logger.warn(`No recipient code for withdrawal ${withdrawal.id}, skipping retry`);
          continue;
        }

        // Use the same reference to prevent double-credit
        const reference = withdrawal.reference || `wtd_retry_${withdrawal.id}`;

        const transferResult = await this.initiateTransfer({
          recipientCode: destination.recipientCode,
          amount: Number(withdrawal.amount),
          reason: `Withdrawal retry #${withdrawal.retryCount + 1}`,
          reference,
        });

        await this.prisma.withdrawal.update({
          where: { id: withdrawal.id },
          data: {
            status: 'processing',
            retryCount: { increment: 1 },
            lastRetryAt: new Date(),
            externalTxnId: transferResult.data?.transfer_code || null,
          },
        });

        this.logger.log(`Transfer retry #${withdrawal.retryCount + 1} initiated for withdrawal ${withdrawal.id}`);
      } catch (err) {
        this.logger.error(`Transfer retry failed for withdrawal ${withdrawal.id}`, err);

        await this.prisma.withdrawal.update({
          where: { id: withdrawal.id },
          data: {
            retryCount: { increment: 1 },
            lastRetryAt: new Date(),
            failureReason: err instanceof Error ? err.message : 'Retry failed',
          },
        });
      }
    }
  }

  // ════════════════════════════════════════════════════════════
  // FEE CALCULATION ENGINE (sliding tiers with boundary crossing)
  // ════════════════════════════════════════════════════════════

  /**
   * Calculate fees for a payment, handling tier boundary crossing.
   * Tiers: 20% for first GH₵500, 10% for GH₵501–2000, 5% above GH₵2000
   * Fee is based on where this payment lands in the student-employer lifetime.
   */
  async calculateFees(
    studentId: string,
    employerId: string,
    amount: number,
  ): Promise<{ feePercentage: number; platformFee: number; netAmount: number }> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const relationship = await this.prisma.clientRelationship.findUnique({
      where: { studentId_employerId: { studentId, employerId } },
    });

    const lifetimeBefore = relationship ? Number(relationship.lifetimeBillings) : 0;
    const lifetimeAfter = lifetimeBefore + amount;

    // Calculate blended fee when payment crosses tier boundaries
    let totalFee = 0;
    let remaining = amount;
    let current = lifetimeBefore;

    for (const tier of FEE_TIERS) {
      if (remaining <= 0) break;

      const tierCeiling = tier.threshold;
      const spaceInTier = Math.max(0, tierCeiling - current);

      if (spaceInTier <= 0) {
        current = Math.max(current, tierCeiling);
        continue;
      }

      const amountInThisTier = Math.min(remaining, spaceInTier);
      totalFee += amountInThisTier * tier.rate;
      remaining -= amountInThisTier;
      current += amountInThisTier;
    }

    const platformFee = Math.round(totalFee * 100) / 100;
    const netAmount = Math.round((amount - platformFee) * 100) / 100;
    const effectiveRate = amount > 0 ? platformFee / amount : 0;

    return { feePercentage: effectiveRate, platformFee, netAmount };
  }

  /** Simple fee percentage lookup (for display purposes, not actual billing) */
  async calculateFeePercentage(studentId: string, employerId: string): Promise<number> {
    const relationship = await this.prisma.clientRelationship.findUnique({
      where: { studentId_employerId: { studentId, employerId } },
    });

    const lifetime = relationship ? Number(relationship.lifetimeBillings) : 0;

    if (lifetime >= 2000) return 0.05;
    if (lifetime >= 500) return 0.10;
    return 0.20;
  }

  private async updateClientRelationship(tx: any, studentId: string, employerId: string, amount: number) {
    const updated = await tx.clientRelationship.upsert({
      where: { studentId_employerId: { studentId, employerId } },
      update: {
        lifetimeBillings: { increment: amount },
        lastContractAt: new Date(),
      },
      create: {
        studentId,
        employerId,
        lifetimeBillings: amount,
        contractsCount: 1,
        firstContractAt: new Date(),
        lastContractAt: new Date(),
      },
    });

    // Update fee tier
    const lifetime = Number(updated.lifetimeBillings);
    let tier: string;
    if (lifetime >= 2000) tier = 'tier_3';
    else if (lifetime >= 500) tier = 'tier_2';
    else tier = 'tier_1';

    await tx.clientRelationship.update({
      where: { id: updated.id },
      data: { currentFeeTier: tier },
    });
  }

  // ════════════════════════════════════════════════════════════
  // PAYSTACK API — TRANSFERS
  // ════════════════════════════════════════════════════════════

  /** Create a transfer recipient on Paystack (bank or mobile money) */
  async createTransferRecipient(params: {
    type: 'mobile_money' | 'ghipss';
    name: string;
    accountNumber: string;
    bankCode: string;
    currency?: string;
  }) {
    const response = await this.paystackFetch(`${this.paystackBaseUrl}/transferrecipient`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: params.type,
        name: params.name,
        account_number: params.accountNumber,
        bank_code: params.bankCode,
        currency: params.currency || 'GHS',
      }),
    });

    const body: any = await response.json();
    if (!body.status) {
      throw new BadRequestException(body.message || 'Failed to create transfer recipient');
    }

    return body.data;
  }

  /** Initiate a Paystack transfer (payout to student) */
  async initiateTransfer(params: {
    amount: number;
    recipientCode: string;
    reason: string;
    reference: string;
  }) {
    const response = await this.paystackFetch(`${this.paystackBaseUrl}/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'balance',
        amount: Math.round(params.amount * 100), // Convert to pesewas
        recipient: params.recipientCode,
        reason: params.reason,
        reference: params.reference,
      }),
    });

    const body: any = await response.json();
    if (!body.status) {
      throw new BadRequestException(body.message || 'Transfer initiation failed');
    }

    return body.data;
  }

  /** Verify a transfer status */
  async verifyTransfer(reference: string) {
    const response = await this.paystackFetch(
      `${this.paystackBaseUrl}/transfer/verify/${encodeURIComponent(reference)}`,
    );
    if (!response.ok) {
      throw new BadRequestException(`Failed to verify transfer: HTTP ${response.status}`);
    }
    const body: any = await response.json();
    if (!body.status) {
      throw new BadRequestException(body.message || 'Transfer verification failed');
    }
    return body;
  }

  // ════════════════════════════════════════════════════════════
  // PAYSTACK API — REFUNDS
  // ════════════════════════════════════════════════════════════

  /** Initiate a refund via Paystack */
  async initiateRefund(params: {
    transactionReference: string;
    amount?: number; // optional partial refund in pesewas
  }) {
    const body: Record<string, any> = {
      transaction: params.transactionReference,
    };
    if (params.amount) {
      body.amount = Math.round(params.amount * 100);
    }

    const response = await this.paystackFetch(`${this.paystackBaseUrl}/refund`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const result: any = await response.json();
    if (!result.status) {
      throw new BadRequestException(result.message || 'Refund initiation failed');
    }

    return result.data;
  }

  // ════════════════════════════════════════════════════════════
  // PAYSTACK API — BANKS & RESOLVE
  // ════════════════════════════════════════════════════════════

  /** List Ghanaian banks (for UI dropdown) */
  async listBanks(type?: 'mobile_money') {
    const url = type
      ? `${this.paystackBaseUrl}/bank?currency=GHS&type=${type}`
      : `${this.paystackBaseUrl}/bank?currency=GHS`;

    const response = await this.paystackFetch(url);
    if (!response.ok) {
      throw new BadRequestException(`Failed to fetch banks: HTTP ${response.status}`);
    }
    const body: any = await response.json();
    return body.data || [];
  }

  /** Resolve/verify a bank account number */
  async resolveAccountNumber(accountNumber: string, bankCode: string) {
    const response = await this.paystackFetch(
      `${this.paystackBaseUrl}/bank/resolve?account_number=${encodeURIComponent(accountNumber)}&bank_code=${encodeURIComponent(bankCode)}`,
    );
    const body: any = await response.json();
    if (!body.status) {
      throw new BadRequestException(body.message || 'Could not resolve account');
    }
    return body.data;
  }

  // ════════════════════════════════════════════════════════════
  // VERIFY TRANSACTION
  // ════════════════════════════════════════════════════════════

  async verifyTransaction(reference: string) {
    const response = await this.paystackFetch(
      `${this.paystackBaseUrl}/transaction/verify/${encodeURIComponent(reference)}`,
    );
    if (!response.ok) {
      throw new BadRequestException(`Failed to verify transaction: HTTP ${response.status}`);
    }
    const body: any = await response.json();
    if (!body.status) {
      throw new BadRequestException(body.message || 'Transaction verification failed');
    }
    return body;
  }

  // ════════════════════════════════════════════════════════════
  // HELPERS
  // ════════════════════════════════════════════════════════════

  private async getProfileId(userId: string, role: 'student' | 'employer'): Promise<string> {
    if (role === 'employer') {
      const profile = await this.prisma.employerProfile.findFirst({ where: { userId } });
      return profile?.id ?? '';
    }
    const profile = await this.prisma.studentProfile.findFirst({ where: { userId } });
    return profile?.id ?? '';
  }

  /** Wrapper around fetch with timeout for Paystack API calls */
  private async paystackFetch(url: string, options: RequestInit = {}): Promise<Response> {
    return fetch(url, {
      ...options,
      signal: AbortSignal.timeout(this.paystackTimeoutMs),
      headers: {
        Authorization: `Bearer ${this.paystackSecretKey}`,
        ...options.headers,
      },
    });
  }

  private async getOrCreateWallet(tx: any, profileOrUserId: string) {
    let wallet = await tx.wallet.findFirst({
      where: {
        OR: [
          { userId: profileOrUserId },
          { user: { studentProfile: { id: profileOrUserId } } },
          { user: { employerProfile: { id: profileOrUserId } } },
        ],
      },
    });

    if (!wallet) {
      // Resolve user ID from profile ID
      let resolvedUserId = profileOrUserId;
      const student = await tx.studentProfile.findUnique({ where: { id: profileOrUserId } });
      if (student) {
        resolvedUserId = student.userId;
      } else {
        const employer = await tx.employerProfile.findUnique({ where: { id: profileOrUserId } });
        if (employer) resolvedUserId = employer.userId;
      }

      wallet = await tx.wallet.create({
        data: { userId: resolvedUserId, balance: 0, pendingBalance: 0 },
      });
    }

    return wallet;
  }

  // ════════════════════════════════════════════════════════════
  // PAYMENT AUTHORIZATION (Saved Cards for Recurring Charges)
  // ════════════════════════════════════════════════════════════

  /**
   * Save a Paystack authorization for future recurring charges.
   * Called after a successful charge to store the card/MoMo auth.
   */
  private async savePaymentAuthorization(userId: string, authorization: any, email?: string) {
    try {
      const existing = await this.prisma.paymentAuthorization.findFirst({
        where: {
          userId,
          authorizationCode: authorization.authorization_code,
          isActive: true,
        },
      });
      if (existing) return; // already saved

      // Deactivate old defaults if this is the first auth
      const hasAny = await this.prisma.paymentAuthorization.count({
        where: { userId, isActive: true },
      });

      await this.prisma.paymentAuthorization.create({
        data: {
          userId,
          authorizationCode: authorization.authorization_code,
          cardType: authorization.card_type || authorization.channel,
          last4: authorization.last4,
          expMonth: authorization.exp_month,
          expYear: authorization.exp_year,
          bank: authorization.bank,
          channel: authorization.channel,
          isDefault: hasAny === 0, // first one is default
          paystackEmail: email,
        },
      });

      this.logger.log(`Payment authorization saved for user ${userId}`);
    } catch (err) {
      this.logger.error(`Failed to save payment authorization for user ${userId}`, err);
    }
  }

  /**
   * Charge a saved authorization (for hourly weekly billing).
   */
  async chargeAuthorization(params: {
    authorizationCode: string;
    email: string;
    amount: number; // in GHS (not pesewas)
    metadata: Record<string, string>;
  }): Promise<{ success: boolean; reference?: string; error?: string }> {
    try {
      const response = await this.paystackFetch(`${this.paystackBaseUrl}/transaction/charge_authorization`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorization_code: params.authorizationCode,
          email: params.email,
          amount: Math.round(params.amount * 100), // pesewas
          currency: 'GHS',
          metadata: params.metadata,
        }),
      });

      const body: any = await response.json();
      if (!body.status) {
        return { success: false, error: body.message || 'Charge failed' };
      }

      return {
        success: true,
        reference: body.data.reference,
      };
    } catch (err) {
      this.logger.error('charge_authorization failed', err);
      return { success: false, error: 'Network error' };
    }
  }

  /**
   * Get the default payment authorization for a user.
   */
  async getDefaultAuthorization(userId: string) {
    return this.prisma.paymentAuthorization.findFirst({
      where: { userId, isActive: true, isDefault: true },
    });
  }

  /** Log a financial event to the immutable audit trail */
  async logFinancialEvent(params: {
    action: string;
    entityType: string;
    entityId?: string;
    userId?: string;
    amount?: number;
    balanceBefore?: number;
    balanceAfter?: number;
    paystackRef?: string;
    metadata?: Record<string, any>;
  }) {
    await this.prisma.financialAuditLog.create({
      data: {
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        userId: params.userId,
        amount: params.amount,
        balanceBefore: params.balanceBefore,
        balanceAfter: params.balanceAfter,
        paystackRef: params.paystackRef,
        metadata: params.metadata ?? {},
      },
    });
  }

  // ════════════════════════════════════════════════════════════
  // PAYSTACK BALANCE API
  // ════════════════════════════════════════════════════════════

  async getPaystackBalance(): Promise<{ currency: string; balance: number }[]> {
    const response = await this.paystackFetch(`${this.paystackBaseUrl}/balance`);
    const body: any = await response.json();
    if (!body.status) {
      this.logger.error('Failed to fetch Paystack balance');
      return [];
    }
    return body.data.map((b: any) => ({
      currency: b.currency,
      balance: b.balance / 100, // Paystack returns in pesewas
    }));
  }

  // ════════════════════════════════════════════════════════════
  // DAILY RECONCILIATION (Runs 3:00 AM GMT — after stale escrow at 2AM)
  // ════════════════════════════════════════════════════════════

  @Cron('0 3 * * *')
  async runDailyReconciliation() {
    this.logger.log('Starting daily reconciliation...');

    try {
      // 1. ESCROW BALANCE — sum of all funded escrows
      const escrowResult = await this.prisma.escrowTransaction.aggregate({
        where: { status: { in: ['funded', 'in_progress', 'submitted'] } },
        _sum: { amount: true },
      });
      const totalEscrowHeld = Number(escrowResult._sum.amount ?? 0);

      // 2. WALLET BALANCE — sum of all student wallet balances
      const walletResult = await this.prisma.wallet.aggregate({
        _sum: { balance: true },
      });
      const totalStudentWallets = Number(walletResult._sum.balance ?? 0);

      // 3. PENDING WITHDRAWALS — processing withdrawals not yet completed
      const withdrawalResult = await this.prisma.withdrawal.aggregate({
        where: { status: 'processing' },
        _sum: { amount: true },
      });
      const totalPendingWithdrawals = Number(withdrawalResult._sum.amount ?? 0);

      // 4. PLATFORM REVENUE — today's collected fees
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const revenueResult = await this.prisma.payment.aggregate({
        where: {
          status: 'released',
          releasedAt: { gte: today },
        },
        _sum: { platformFee: true },
      });
      const totalPlatformRevenue = Number(revenueResult._sum.platformFee ?? 0);

      // 5. CALCULATE expected Paystack balance
      const calculatedPaystackBalance =
        totalEscrowHeld + totalStudentWallets + totalPendingWithdrawals;

      // 6. FETCH actual Paystack balance
      let actualPaystackBalance: number | null = null;
      let discrepancy: number | null = null;
      let discrepancyPercentage: number | null = null;
      let isBalanced = true;

      try {
        const balances = await this.getPaystackBalance();
        const ghsBalance = balances.find((b) => b.currency === 'GHS');
        if (ghsBalance) {
          actualPaystackBalance = ghsBalance.balance;
          discrepancy = actualPaystackBalance - calculatedPaystackBalance;
          discrepancyPercentage =
            calculatedPaystackBalance > 0
              ? (Math.abs(discrepancy) / calculatedPaystackBalance) * 100
              : 0;
          isBalanced = discrepancyPercentage < 1; // < 1% is acceptable
        }
      } catch (err) {
        this.logger.warn('Could not fetch Paystack balance for reconciliation', err);
      }

      // 7. ORPHANED TRANSACTIONS — charge.success received > 1hr ago with no escrow
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const orphanedCount = await this.prisma.webhookEvent.count({
        where: {
          eventType: 'charge.success',
          processedAt: null,
          receivedAt: { lte: oneHourAgo },
        },
      });

      // 8. STUCK TRANSFERS — processing withdrawals for > 2 hours
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const stuckCount = await this.prisma.withdrawal.count({
        where: {
          status: 'processing',
          createdAt: { lte: twoHoursAgo },
        },
      });

      // 9. RECORD the reconciliation run
      const run = await this.prisma.reconciliationRun.create({
        data: {
          runDate: new Date(),
          runType: 'daily',
          totalEscrowHeld,
          totalStudentWallets,
          totalPendingWithdrawals,
          totalPlatformRevenue,
          calculatedPaystackBalance,
          actualPaystackBalance,
          discrepancy,
          discrepancyPercentage,
          isBalanced,
          orphanedTransactions: orphanedCount,
          stuckTransfers: stuckCount,
        },
      });

      // 10. LOG alerts
      if (!isBalanced && discrepancyPercentage !== null) {
        this.logger.error(
          `RECONCILIATION ALERT: ${discrepancyPercentage.toFixed(2)}% discrepancy. ` +
            `Expected: GH₵${calculatedPaystackBalance.toFixed(2)}, ` +
            `Actual: GH₵${actualPaystackBalance?.toFixed(2)}`,
        );

        await this.logFinancialEvent({
          action: 'reconciliation_discrepancy',
          entityType: 'reconciliation_run',
          entityId: run.id,
          amount: discrepancy ?? 0,
          metadata: {
            calculatedPaystackBalance,
            actualPaystackBalance,
            discrepancyPercentage,
            orphanedCount,
            stuckCount,
          },
        });
      }

      if (orphanedCount > 0) {
        this.logger.warn(`Reconciliation: ${orphanedCount} orphaned transactions found`);
      }

      if (stuckCount > 0) {
        this.logger.warn(`Reconciliation: ${stuckCount} stuck transfers found`);
      }

      this.logger.log(
        `Daily reconciliation complete: balanced=${isBalanced}, ` +
          `escrow=GH₵${totalEscrowHeld.toFixed(2)}, wallets=GH₵${totalStudentWallets.toFixed(2)}, ` +
          `pending=GH₵${totalPendingWithdrawals.toFixed(2)}`,
      );

      return run;
    } catch (err) {
      this.logger.error('Daily reconciliation failed', err);
      throw err;
    }
  }

  // ════════════════════════════════════════════════════════════
  // STUCK TRANSFER RESOLVER (verify with Paystack)
  // ════════════════════════════════════════════════════════════

  @Cron(CronExpression.EVERY_HOUR)
  async resolveStuckTransfers() {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const stuckWithdrawals = await this.prisma.withdrawal.findMany({
      where: {
        status: 'processing',
        createdAt: { lte: twoHoursAgo },
      },
      include: { wallet: true },
      take: 20,
    });

    for (const withdrawal of stuckWithdrawals) {
      try {
        if (!withdrawal.externalTxnId) continue;

        // Verify with Paystack
        const verifyUrl = `${this.paystackBaseUrl}/transfer/verify/${encodeURIComponent(withdrawal.externalTxnId)}`;
        const response = await this.paystackFetch(verifyUrl);
        const body: any = await response.json();

        if (!body.status) continue;

        const transferStatus = body.data?.status;

        if (transferStatus === 'success') {
          await this.prisma.withdrawal.update({
            where: { id: withdrawal.id },
            data: { status: 'completed', processedAt: new Date() },
          });
          this.logger.log(`Stuck transfer resolved (success): ${withdrawal.id}`);
        } else if (transferStatus === 'failed' || transferStatus === 'reversed') {
          // Re-credit the wallet
          await this.prisma.$transaction(async (tx) => {
            await tx.wallet.update({
              where: { id: withdrawal.walletId },
              data: { balance: { increment: Number(withdrawal.amount) } },
            });
            await tx.withdrawal.update({
              where: { id: withdrawal.id },
              data: {
                status: 'failed',
                failureReason: body.data?.reason || `Transfer ${transferStatus}`,
              },
            });
            await tx.transaction.create({
              data: {
                walletId: withdrawal.walletId,
                type: 'refund',
                amount: Number(withdrawal.amount),
                balanceAfter:
                  Number(withdrawal.wallet.balance) + Number(withdrawal.amount),
                description: `Transfer ${transferStatus} — funds returned`,
              },
            });
          });
          this.logger.log(`Stuck transfer resolved (${transferStatus}): ${withdrawal.id}`);
        }
        // If still 'pending' or 'processing' in Paystack, leave it
      } catch (err) {
        this.logger.error(`Failed to resolve stuck transfer ${withdrawal.id}`, err);
      }
    }
  }

  // ════════════════════════════════════════════════════════════
  // AUTO-WITHDRAW (runs every hour, processes students with auto-withdraw)
  // ════════════════════════════════════════════════════════════

  @Cron('0 */2 * * *') // Every 2 hours
  async processAutoWithdrawals() {
    const walletsToProcess = await this.prisma.wallet.findMany({
      where: {
        autoWithdrawEnabled: true,
        autoWithdrawThreshold: { not: null },
        balance: { gt: 0 },
      },
      include: { user: true },
    });

    for (const wallet of walletsToProcess) {
      try {
        const threshold = Number(wallet.autoWithdrawThreshold);
        const balance = Number(wallet.balance);
        if (balance < threshold) continue;

        // Find the default transfer recipient
        const recipient = await this.prisma.transferRecipient.findFirst({
          where: { userId: wallet.userId, isDefault: true, isActive: true },
        });
        if (!recipient) {
          this.logger.debug(
            `Auto-withdraw skipped for user ${wallet.userId}: no default recipient`,
          );
          continue;
        }

        // Check daily withdrawal limit
        const resetNeeded = this.isDailyLimitResetNeeded(wallet.dailyWithdrawalResetAt);
        let dailyWithdrawnToday = resetNeeded ? 0 : Number(wallet.dailyWithdrawnToday);
        const dailyLimit = Number(wallet.dailyWithdrawalLimit);

        if (dailyWithdrawnToday >= dailyLimit) continue;

        const maxAllowed = dailyLimit - dailyWithdrawnToday;
        const withdrawAmount = Math.min(balance, maxAllowed);
        if (withdrawAmount < 1) continue; // Minimum GH₵1

        const withdrawalRef = `auto_${crypto.randomUUID().replace(/-/g, '').slice(0, 18)}`;
        const balanceBefore = balance;
        const balanceAfter = balanceBefore - withdrawAmount;

        await this.prisma.$transaction(async (tx) => {
          await tx.wallet.update({
            where: { id: wallet.id },
            data: {
              balance: { decrement: withdrawAmount },
              dailyWithdrawnToday: resetNeeded ? withdrawAmount : { increment: withdrawAmount },
              dailyWithdrawalResetAt: resetNeeded ? new Date() : wallet.dailyWithdrawalResetAt,
            },
          });

          await tx.withdrawal.create({
            data: {
              walletId: wallet.id,
              userId: wallet.userId,
              amount: withdrawAmount,
              destination: {
                recipientId: recipient.id,
                recipientCode: recipient.recipientCode,
                type: recipient.type,
                accountNumber: recipient.accountNumber,
                bankCode: recipient.bankCode,
                accountName: recipient.accountName,
              },
              reference: withdrawalRef,
              status: 'processing',
              externalTxnId: withdrawalRef,
            },
          });

          await tx.transaction.create({
            data: {
              walletId: wallet.id,
              type: 'withdrawal',
              amount: withdrawAmount,
              balanceAfter,
              description: `Auto-withdrawal to ${recipient.bankName || recipient.bankCode} — ${recipient.accountNumber}`,
            },
          });

          await tx.financialAuditLog.create({
            data: {
              action: 'auto_withdrawal_initiated',
              entityType: 'withdrawal',
              userId: wallet.userId,
              amount: withdrawAmount,
              balanceBefore,
              balanceAfter,
              metadata: {
                threshold,
                recipientCode: recipient.recipientCode,
                reference: withdrawalRef,
              },
            },
          });
        });

        // Initiate the Paystack transfer
        setImmediate(async () => {
          try {
            await this.initiateTransfer({
              amount: withdrawAmount,
              recipientCode: recipient.recipientCode,
              reason: `Intemso auto-withdrawal`,
              reference: withdrawalRef,
            });
            this.logger.log(`Auto-withdrawal initiated: ${withdrawalRef} — GH₵${withdrawAmount}`);
          } catch (err) {
            this.logger.error(`Auto-withdrawal transfer failed: ${withdrawalRef}`, err);
            // Re-credit on immediate failure
            await this.prisma.$transaction(async (tx) => {
              await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { increment: withdrawAmount } },
              });
              await tx.withdrawal.updateMany({
                where: { reference: withdrawalRef },
                data: { status: 'failed', failureReason: 'Transfer initiation failed' },
              });
              await tx.transaction.create({
                data: {
                  walletId: wallet.id,
                  type: 'refund',
                  amount: withdrawAmount,
                  balanceAfter: balanceAfter + withdrawAmount,
                  description: `Auto-withdrawal failed — funds returned (${withdrawalRef})`,
                },
              });
            });
          }
        });
      } catch (err) {
        this.logger.error(`Auto-withdraw failed for wallet ${wallet.id}`, err);
      }
    }
  }

  /** Update auto-withdraw preferences for a user's wallet */
  async updateAutoWithdrawSettings(
    userId: string,
    settings: { enabled: boolean; threshold?: number },
  ) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new NotFoundException('Wallet not found');

    if (settings.enabled && (!settings.threshold || settings.threshold < 1)) {
      throw new BadRequestException('Threshold must be at least GH₵1');
    }

    // If enabling, ensure user has a default transfer recipient
    if (settings.enabled) {
      const recipient = await this.prisma.transferRecipient.findFirst({
        where: { userId, isDefault: true, isActive: true },
      });
      if (!recipient) {
        throw new BadRequestException(
          'Please add a transfer recipient before enabling auto-withdraw',
        );
      }
    }

    return this.prisma.wallet.update({
      where: { userId },
      data: {
        autoWithdrawEnabled: settings.enabled,
        autoWithdrawThreshold: settings.enabled ? settings.threshold : null,
      },
      select: {
        autoWithdrawEnabled: true,
        autoWithdrawThreshold: true,
      },
    });
  }

  private isDailyLimitResetNeeded(lastReset: Date): boolean {
    const now = new Date();
    return (
      now.getUTCFullYear() !== lastReset.getUTCFullYear() ||
      now.getUTCMonth() !== lastReset.getUTCMonth() ||
      now.getUTCDate() !== lastReset.getUTCDate()
    );
  }

  // ════════════════════════════════════════════════════════════
  // WITHDRAWAL RATE LIMITING
  // ════════════════════════════════════════════════════════════

  /**
   * Check if a withdrawal would exceed the daily limit.
   * Call this before processing any withdrawal.
   */
  async validateWithdrawalLimits(userId: string, amount: number) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new NotFoundException('Wallet not found');

    const resetNeeded = this.isDailyLimitResetNeeded(wallet.dailyWithdrawalResetAt);
    const dailyWithdrawn = resetNeeded ? 0 : Number(wallet.dailyWithdrawnToday);
    const dailyLimit = Number(wallet.dailyWithdrawalLimit);

    if (dailyWithdrawn + amount > dailyLimit) {
      const remaining = Math.max(0, dailyLimit - dailyWithdrawn);
      throw new BadRequestException(
        `Daily withdrawal limit exceeded. Limit: GH₵${dailyLimit}, withdrawn today: GH₵${dailyWithdrawn.toFixed(2)}, remaining: GH₵${remaining.toFixed(2)}`,
      );
    }

    // Suspicious pattern: >3 withdrawals in the last hour from same user
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = await this.prisma.withdrawal.count({
      where: {
        userId,
        createdAt: { gte: oneHourAgo },
      },
    });

    if (recentCount >= 3) {
      this.logger.warn(
        `Suspicious withdrawal pattern: user ${userId} has ${recentCount} withdrawals in the last hour`,
      );
      await this.logFinancialEvent({
        action: 'suspicious_withdrawal_pattern',
        entityType: 'wallet',
        userId,
        amount,
        metadata: { recentCount, withinMinutes: 60 },
      });
      throw new BadRequestException(
        'Too many withdrawal requests. Please try again later.',
      );
    }

    return { dailyWithdrawn, dailyLimit, remaining: dailyLimit - dailyWithdrawn };
  }

  /** Track daily withdrawal amount after a successful withdrawal. */
  async recordDailyWithdrawal(userId: string, amount: number) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) return;

    const resetNeeded = this.isDailyLimitResetNeeded(wallet.dailyWithdrawalResetAt);
    await this.prisma.wallet.update({
      where: { userId },
      data: {
        dailyWithdrawnToday: resetNeeded ? amount : { increment: amount },
        dailyWithdrawalResetAt: resetNeeded ? new Date() : wallet.dailyWithdrawalResetAt,
      },
    });
  }

  // ════════════════════════════════════════════════════════════
  // FAILED WEBHOOK RETRY (process unhandled webhooks)
  // ════════════════════════════════════════════════════════════

  @Cron(CronExpression.EVERY_10_MINUTES)
  async retryFailedWebhooks() {
    // Find webhook events received > 5 minutes ago that were never processed
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const unprocessed = await this.prisma.webhookEvent.findMany({
      where: {
        processedAt: null,
        receivedAt: { lte: fiveMinutesAgo },
      },
      take: 10,
      orderBy: { receivedAt: 'asc' },
    });

    for (const event of unprocessed) {
      try {
        const payload = event.payload as any;
        const eventType = event.eventType;
        const reference = event.paystackReference;

        this.logger.log(`Retrying unprocessed webhook: ${reference} (${eventType})`);

        if (eventType === 'charge.success') {
          await this.processChargeSuccess(payload, reference);
        } else if (eventType === 'transfer.success') {
          await this.processTransferSuccess(payload, reference);
        } else if (eventType === 'transfer.failed') {
          await this.processTransferFailed(payload, reference);
        } else if (eventType === 'transfer.reversed') {
          await this.processTransferReversed(payload, reference);
        }

        // Mark as processed
        await this.prisma.webhookEvent.update({
          where: { id: event.id },
          data: { processedAt: new Date() },
        });
      } catch (err) {
        this.logger.error(
          `Webhook retry failed for ${event.paystackReference}: ${err}`,
        );
      }
    }
  }

  // ════════════════════════════════════════════════════════════
  // ADMIN FINANCIAL DASHBOARD DATA
  // ════════════════════════════════════════════════════════════

  async getFinancialOverview() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      escrowAgg,
      walletAgg,
      pendingWithdrawalAgg,
      todayCharges,
      todayReleased,
      todayWithdrawals,
      todayRefunds,
      todayFees,
      pendingMilestones,
      autoApprovalsDue,
      processingWithdrawals,
      openDisputes,
      latestReconciliation,
    ] = await Promise.all([
      // Escrow held
      this.prisma.escrowTransaction.aggregate({
        where: { status: { in: ['funded', 'in_progress', 'submitted'] } },
        _sum: { amount: true },
      }),
      // Student wallet totals
      this.prisma.wallet.aggregate({
        _sum: { balance: true },
      }),
      // Pending withdrawals
      this.prisma.withdrawal.aggregate({
        where: { status: 'processing' },
        _sum: { amount: true },
      }),
      // Today's charges
      this.prisma.payment.aggregate({
        where: { createdAt: { gte: today }, status: { not: 'pending' } },
        _sum: { amount: true },
        _count: true,
      }),
      // Today's releases
      this.prisma.payment.aggregate({
        where: { releasedAt: { gte: today }, status: 'released' },
        _sum: { netAmount: true },
        _count: true,
      }),
      // Today's withdrawals
      this.prisma.withdrawal.aggregate({
        where: { createdAt: { gte: today } },
        _sum: { amount: true },
        _count: true,
      }),
      // Today's refunds
      this.prisma.payment.aggregate({
        where: { updatedAt: { gte: today }, status: 'refunded' },
        _sum: { amount: true },
        _count: true,
      }),
      // Today's platform fees
      this.prisma.payment.aggregate({
        where: { releasedAt: { gte: today }, status: 'released' },
        _sum: { platformFee: true },
      }),
      // Milestones awaiting review
      this.prisma.milestone.count({
        where: { status: 'submitted' },
      }),
      // Auto-approvals due in next 48h
      this.prisma.milestone.count({
        where: {
          status: 'submitted',
          submittedAt: { lte: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000) },
        },
      }),
      // Processing withdrawals
      this.prisma.withdrawal.count({
        where: { status: 'processing' },
      }),
      // Open disputes
      this.prisma.dispute.count({
        where: { status: { in: ['open', 'under_review'] } },
      }),
      // Latest reconciliation
      this.prisma.reconciliationRun.findFirst({
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const inEscrow = Number(escrowAgg._sum.amount ?? 0);
    const studentWallets = Number(walletAgg._sum.balance ?? 0);
    const pendingWd = Number(pendingWithdrawalAgg._sum.amount ?? 0);

    return {
      balances: {
        inEscrow,
        studentWallets,
        pendingWithdrawals: pendingWd,
        platformRevenue: Number(todayFees._sum.platformFee ?? 0),
      },
      todayActivity: {
        chargesReceived: {
          amount: Number(todayCharges._sum.amount ?? 0),
          count: todayCharges._count ?? 0,
        },
        paymentsReleased: {
          amount: Number(todayReleased._sum.netAmount ?? 0),
          count: todayReleased._count ?? 0,
        },
        withdrawalsSent: {
          amount: Number(todayWithdrawals._sum.amount ?? 0),
          count: todayWithdrawals._count ?? 0,
        },
        refundsProcessed: {
          amount: Number(todayRefunds._sum.amount ?? 0),
          count: todayRefunds._count ?? 0,
        },
        platformFees: Number(todayFees._sum.platformFee ?? 0),
      },
      pendingActions: {
        milestonesAwaitingReview: pendingMilestones,
        autoApprovalsDueIn48h: autoApprovalsDue,
        withdrawalsProcessing: processingWithdrawals,
        openDisputes,
      },
      lastReconciliation: latestReconciliation
        ? {
            runDate: latestReconciliation.runDate,
            isBalanced: latestReconciliation.isBalanced,
            discrepancy: latestReconciliation.discrepancy
              ? Number(latestReconciliation.discrepancy)
              : null,
            orphanedTransactions: latestReconciliation.orphanedTransactions,
            stuckTransfers: latestReconciliation.stuckTransfers,
          }
        : null,
    };
  }

  /** Get reconciliation run history */
  async getReconciliationHistory(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [runs, total] = await Promise.all([
      this.prisma.reconciliationRun.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.reconciliationRun.count(),
    ]);

    return {
      runs: runs.map((r) => ({
        id: r.id,
        runDate: r.runDate,
        runType: r.runType,
        totalEscrowHeld: Number(r.totalEscrowHeld),
        totalStudentWallets: Number(r.totalStudentWallets),
        totalPendingWithdrawals: Number(r.totalPendingWithdrawals),
        calculatedPaystackBalance: Number(r.calculatedPaystackBalance),
        actualPaystackBalance: r.actualPaystackBalance
          ? Number(r.actualPaystackBalance)
          : null,
        discrepancy: r.discrepancy ? Number(r.discrepancy) : null,
        discrepancyPercentage: r.discrepancyPercentage
          ? Number(r.discrepancyPercentage)
          : null,
        isBalanced: r.isBalanced,
        orphanedTransactions: r.orphanedTransactions,
        stuckTransfers: r.stuckTransfers,
        createdAt: r.createdAt,
      })),
      total,
      page,
      limit,
    };
  }

  /** Manually trigger a reconciliation run */
  async triggerManualReconciliation() {
    return this.runDailyReconciliation();
  }
}
