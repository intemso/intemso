# Intemso — Escrow & Payment System: Comprehensive Technical Design

> A detailed blueprint for implementing a secure, Paystack-powered escrow payment system that protects both students and employers on the Intemso marketplace.

---

## Table of Contents

1. [Why Escrow Matters for Intemso](#1-why-escrow-matters-for-intemso)
2. [How Paystack Actually Works (The Reality)](#2-how-paystack-actually-works-the-reality)
3. [Our Escrow Architecture](#3-our-escrow-architecture)
4. [Complete Payment Flows](#4-complete-payment-flows)
5. [Paystack Integration Layer](#5-paystack-integration-layer)
6. [The Internal Wallet & Ledger System](#6-the-internal-wallet--ledger-system)
7. [Fee Calculation Engine](#7-fee-calculation-engine)
8. [Dispute Resolution & Refund System](#8-dispute-resolution--refund-system)
9. [Every Edge Case & What Could Go Wrong](#9-every-edge-case--what-could-go-wrong)
10. [Security Architecture](#10-security-architecture)
11. [Why Users Will Prefer Intemso Over Offline Transactions](#11-why-users-will-prefer-intemso-over-offline-transactions)
12. [Database Schema Additions](#12-database-schema-additions)
13. [Implementation Roadmap](#13-implementation-roadmap)
14. [Monitoring & Reconciliation](#14-monitoring--reconciliation)

---

## 1. Why Escrow Matters for Intemso

### The Core Problem

Without escrow, two bad things happen constantly:

1. **Student does the work → Employer disappears without paying.** The student wasted their time, energy, and academic hours for nothing.
2. **Employer pays upfront → Student takes the money and ghosts.** The employer lost their money and still has no deliverable.

Both scenarios destroy trust and kill the marketplace. If either side feels unsafe, they'll go back to WhatsApp and word-of-mouth — where at least they know the person they're dealing with (even if it's equally risky).

### What Escrow Solves

Escrow is the neutral third party. The money sits with Intemso (via Paystack) — visible to both sides — until the work is done and approved. Neither party can cheat:

- **Student sees the money is locked** → Works with confidence knowing payment is guaranteed
- **Employer knows money won't be released** → Until they approve the deliverables

**The critical insight:** If we implement escrow correctly, using Intemso becomes strictly safer than any offline alternative. That's our competitive moat.

---

## 2. How Paystack Actually Works (The Reality)

Paystack does **not** have a built-in "escrow" feature. There is no `POST /escrow/hold` endpoint. We need to understand what Paystack actually offers and build our escrow logic on top of it.

### 2.1 What Paystack Provides (Ghana)

| Feature | What It Does | Our Use |
|---|---|---|
| **Transaction Initialize API** | Charges a customer's card, mobile money, or bank transfer | Collecting milestone payments from employers |
| **Charge API** | Direct charge with mobile money (MTN, Vodafone, AirtelTigo) | Mobile money payments in Ghana |
| **Transfers API** | Send money to bank accounts & mobile money accounts | Paying out students |
| **Transfer Recipients** | Create reusable payout beneficiaries | Each student's bank/MoMo details |
| **Subaccounts** | Split transaction settlements between accounts | NOT used for escrow — see below |
| **Refunds API** | Refund a previous transaction fully or partially | Dispute resolution refunds |
| **Webhooks** | Real-time event notifications | Payment confirmations, transfer status |
| **Recurring Charges** | Charge saved card authorizations | Weekly billing for hourly contracts |
| **Dedicated Virtual Accounts** | Bank accounts per customer (Nigeria & Ghana) | Future: employer funding wallets |

### 2.2 Why We Do NOT Use Subaccounts for Escrow

The Paystack docs mention subaccounts and split payments. Many developers think: "Create a subaccount per student and split payments at charge time." **This is wrong for our use case.**

**Why it fails:**

1. **Immediate settlement.** When you split a payment with a subaccount, Paystack settles to that subaccount on the next settlement cycle (T+1 for cards, instant for mobile money in some cases). There's no "hold" — the money goes straight to the student's bank account. We need to hold the money until the employer approves.

2. **No conditional release.** Subaccount splits are automatic. We can't say "hold this portion and release it only when we tell you to." It's all or nothing at settlement time.

3. **Dynamic fee calculation.** Our sliding fee (20%/10%/5%) depends on the student-employer relationship's lifetime billings. We can't compute this at charge time for a subaccount split — we compute it at release time.

### 2.3 The Correct Pattern: Charge → Hold in Our Balance → Transfer on Approval

Here's how escrow actually works with Paystack:

```
1. Employer pays → Paystack charges their card/MoMo/bank
2. Money settles into INTEMSO's Paystack balance (our main account)
3. We track the escrow in our database (pending_balance on student wallet)
4. Employer approves milestone → We calculate fee → We initiate Paystack Transfer
5. Paystack sends money from our balance → Student's bank/MoMo account
```

**The money sits in Intemso's Paystack account as the escrow holding account.** Our database is the source of truth for who owns what portion of that balance. Paystack is just the payment rail.

### 2.4 Paystack Settlement in Ghana

| Payment Method | Settlement Time | Our Action |
|---|---|---|
| Card (Visa/Mastercard) | T+1 (next business day) | Money available in our Paystack balance next day |
| Mobile Money (MTN, Vodafone, AirtelTigo) | Instant to T+1 | Money available quickly |
| Bank Transfer | T+1 | Standard settlement |

**Important:** We should only mark a milestone as "funded" (escrow active) AFTER we receive the `charge.success` webhook from Paystack — never based on the API response alone. The webhook is the source of truth.

---

## 3. Our Escrow Architecture

### 3.1 High-Level Architecture

```
┌──────────────┐                    ┌──────────────────────┐
│   EMPLOYER   │───── Pays ──────>  │  PAYSTACK            │
│   (Client)   │                    │  (Payment Processor)  │
└──────────────┘                    └──────────┬───────────┘
                                               │
                                    charge.success webhook
                                               │
                                               ▼
┌──────────────────────────────────────────────────────────┐
│                    INTEMSO BACKEND                        │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │              ESCROW LEDGER (PostgreSQL)             │  │
│  │                                                    │  │
│  │  Escrow Accounts (per milestone)                   │  │
│  │  ┌─────────────┬──────────┬────────────────────┐   │  │
│  │  │ Milestone A │ GH₵500   │ status: funded     │   │  │
│  │  │ Milestone B │ GH₵1,200 │ status: held       │   │  │
│  │  │ Milestone C │ GH₵300   │ status: released   │   │  │
│  │  └─────────────┴──────────┴────────────────────┘   │  │
│  │                                                    │  │
│  │  Platform Revenue Account                          │  │
│  │  Student Wallet Balances                           │  │
│  │  Employer Spending History                         │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │            PAYMENT ORCHESTRATOR                     │  │
│  │                                                    │  │
│  │  • Processes webhooks                              │  │
│  │  • Manages escrow state machine                    │  │
│  │  • Calculates fees                                 │  │
│  │  • Initiates transfers                             │  │
│  │  • Handles disputes and refunds                    │  │
│  │  • Runs auto-approval cron                         │  │
│  │  • Reconciliation engine                           │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
└──────────────────────────────┬───────────────────────────┘
                               │
                    Paystack Transfer API
                               │
                               ▼
┌──────────────────────────────────────────────────────────┐
│                    STUDENT PAYOUT                         │
│                                                          │
│  Option A: Instant → Bank Account / Mobile Money         │
│  Option B: Hold in Intemso Wallet → Withdraw later       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 3.2 The Two Payout Models

We give students a choice. This is important for adoption:

#### Model A: Direct Payout (Recommended Default)

When a milestone is approved, the money goes directly to the student's registered bank account or mobile money via Paystack Transfer. Fastest, simplest.

**Pros:** Student gets money immediately (within minutes for MoMo). Less money sitting in our system.
**Cons:** Student must have registered payout details. Small Paystack transfer fee per payout (we absorb this in v1).

#### Model B: Wallet Accumulation

Money is credited to the student's Intemso wallet. The student can withdraw any time to bank or MoMo. They can accumulate earnings and withdraw in bulk.

**Pros:** Student can manage their cash flow. Fewer individual transfer fees. Student can see their earnings growing.
**Cons:** Money sits in our system longer (regulatory considerations). Student must manually initiate withdrawals.

**Our approach:** Default to Wallet (Model B), with an option to turn on "Auto-withdraw" for Model A. This gives us a dashboard-friendly approach where students see their earnings and can strategize withdrawals, while power users can auto-withdraw.

### 3.3 The Escrow State Machine

Every escrow (per milestone) follows this exact state machine:

```
                                    ┌──────────────┐
                                    │   CREATED    │
                                    │  (no money)  │
                                    └──────┬───────┘
                                           │
                              Employer initiates payment
                                           │
                                           ▼
                                    ┌──────────────┐
                                    │   PENDING    │
                                    │ (payment     │
                                    │  processing) │
                                    └──────┬───────┘
                                           │
                          ┌────────────────┼───────────────┐
                          │                │               │
                   charge.success    charge.failed    timeout/abandoned
                          │                │               │
                          ▼                ▼               ▼
                   ┌──────────┐     ┌──────────┐    ┌──────────┐
                   │  FUNDED  │     │  FAILED  │    │  EXPIRED │
                   │ (escrow  │     │ (retry)  │    │ (retry)  │
                   │  active) │     └──────────┘    └──────────┘
                   └────┬─────┘
                        │
           Student starts working
                        │
                        ▼
                 ┌──────────────┐
                 │ IN_PROGRESS  │
                 │ (work being  │
                 │   done)      │
                 └──────┬───────┘
                        │
              Student submits deliverables
                        │
                        ▼
                 ┌──────────────┐
                 │  SUBMITTED   │──────────────────────────┐
                 │ (awaiting    │                           │
                 │  review)     │                   14-day auto-approve
                 └──────┬───────┘                   timer starts
                        │
          ┌─────────────┼──────────────┐
          │             │              │
      Employer      Employer       No response
      approves      requests       in 14 days
          │         revision           │
          │             │              │
          ▼             ▼              ▼
   ┌──────────┐  ┌──────────────┐  ┌──────────────┐
   │ APPROVED │  │  REVISION    │  │AUTO_APPROVED │
   │          │  │ REQUESTED    │  │              │
   └────┬─────┘  └──────┬───────┘  └──────┬───────┘
        │               │                 │
        │        Student resubmits        │
        │         (max 2 rounds)          │
        │               │                 │
        │               ▼                 │
        │        ┌──────────────┐         │
        │        │  SUBMITTED   │         │
        │        │  (again)     │─────────│
        │        └──────────────┘         │
        │                                 │
        ├─────────────────────────────────┘
        │
   Calculate fees & release payment
        │
        ▼
 ┌──────────────┐
 │   RELEASED   │
 │ (money sent  │
 │  to student) │
 └──────┬───────┘
        │
   Transfer webhook confirmation
        │
        ▼
 ┌──────────────┐
 │  COMPLETED   │
 │ (transfer    │
 │  confirmed)  │
 └──────────────┘

 DISPUTE BRANCH (can happen from FUNDED, IN_PROGRESS, SUBMITTED, or REVISION_REQUESTED):

 ┌──────────────┐
 │  DISPUTED    │
 │ (admin       │
 │  reviewing)  │
 └──────┬───────┘
        │
   ┌────┼─────────────────┐
   │    │                 │
   ▼    ▼                 ▼
┌─────┐ ┌──────────┐ ┌────────────┐
│FULL │ │ PARTIAL  │ │RELEASED TO │
│REFUND│ │ REFUND + │ │ STUDENT    │
│TO   │ │ PARTIAL  │ │ (admin     │
│EMPLOYER│ RELEASE │ │  decides)  │
└─────┘ └──────────┘ └────────────┘
```

---

## 4. Complete Payment Flows

### 4.1 Fixed-Price Contract — Milestone Escrow (Primary Flow)

This is the most common flow on the platform:

```
STEP 1: CONTRACT CREATION
─────────────────────────
• Employer accepts student's proposal (or sends direct offer)
• Contract created with agreed milestones:
  - Milestone 1: "Logo Design Concepts" — GH₵200
  - Milestone 2: "Final Logo + Brand Kit" — GH₵300
  - Total contract value: GH₵500

STEP 2: EMPLOYER FUNDS MILESTONE 1
───────────────────────────────────
• Employer clicks "Fund Milestone" on Milestone 1
• Our backend calls Paystack Initialize Transaction:
  
  POST https://api.paystack.co/transaction/initialize
  {
    "email": "employer@email.com",
    "amount": 20000,              // GH₵200 in pesewas
    "currency": "GHS",
    "metadata": {
      "purpose": "milestone_escrow",
      "milestone_id": "ms_abc123",
      "contract_id": "ct_xyz789",
      "employer_id": "emp_456",
      "student_id": "stu_789"
    },
    "callback_url": "https://intemso.com/payment/callback"
  }

• Paystack returns authorization_url
• Employer is redirected to Paystack checkout
• Employer pays via card, mobile money, or bank transfer

STEP 3: PAYMENT CONFIRMATION
─────────────────────────────
• Paystack sends charge.success webhook to our server
• We verify the webhook signature (HMAC SHA-512)
• We verify the transaction via Paystack Verify API (double-check)
• We create an EscrowTransaction record:
  {
    milestoneId: "ms_abc123",
    amount: 200.00,
    paystackReference: "txn_ref_xxxxx",
    status: "funded",
    fundedAt: "2026-03-26T10:30:00Z"
  }
• We update the milestone status to "funded"
• We add GH₵200 to the student's wallet pending_balance
• We notify the student: "Milestone 1 has been funded! You can start working."

STEP 4: STUDENT WORKS & SUBMITS
────────────────────────────────
• Student sees funded milestone in their dashboard
• Student uploads deliverables (files, links, screenshots)
• Student clicks "Submit for Review"
• We update milestone status to "submitted"
• We start the 14-day auto-approval timer
• We notify the employer: "Deliverables submitted for 'Logo Design Concepts'"

STEP 5a: EMPLOYER APPROVES
──────────────────────────
• Employer reviews deliverables
• Employer clicks "Approve Milestone"
• We calculate the platform fee:
  - Check client_relationships table for this student-employer pair
  - Lifetime billings so far: GH₵0 (first job together)
  - Fee tier: tier_1 (20%)
  - Platform fee: GH₵200 × 20% = GH₵40
  - Student receives: GH₵200 - GH₵40 = GH₵160
• We update escrow status to "released"
• We credit student wallet: +GH₵160
• We record platform revenue: +GH₵40
• We update client_relationships: lifetime_billings += GH₵200
• We notify the student: "GH₵160 has been added to your wallet!"

STEP 5b: EMPLOYER REQUESTS REVISION (Alternative Path)
──────────────────────────────────────────────────────
• Employer isn't satisfied
• Employer clicks "Request Revision" with feedback
• We check: revision_count < max_revisions (2)
• We update milestone status to "revision_requested"
• We stop the auto-approval timer
• We notify the student with the revision feedback
• Student makes changes → resubmits (back to Step 4)
• New 14-day auto-approval timer starts

STEP 5c: AUTO-APPROVAL (No Employer Response)
────────────────────────────────────────────
• 14 days pass with no employer action
• Our cron job (runs every hour) detects overdue milestones
• Auto-approves the milestone
• Payment released same as Step 5a
• We notify both parties: "Milestone auto-approved after 14 days"

STEP 6: STUDENT WITHDRAWAL (If Using Wallet Model)
──────────────────────────────────────────────────
• Student has GH₵160 in their wallet
• Student clicks "Withdraw" → enters amount and destination
• We validate: amount ≤ wallet.balance
• We create a Paystack Transfer Recipient (if first time):
  
  POST https://api.paystack.co/transferrecipient
  {
    "type": "mobile_money",
    "name": "Kwame Asante",
    "account_number": "0551234987",
    "bank_code": "MTN",
    "currency": "GHS"
  }

• We initiate a Paystack Transfer:
  
  POST https://api.paystack.co/transfer
  {
    "source": "balance",
    "amount": 16000,              // GH₵160 in pesewas
    "recipient": "RCP_xxxxxxxx",
    "reason": "Intemso earnings withdrawal",
    "reference": "wtd_unique_ref_xxxxx"
  }

• We debit the student's wallet immediately (pending transfer)
• Paystack processes the transfer → sends transfer.success webhook
• We mark the withdrawal as completed
• Student receives money in their MTN Mobile Money!
```

### 4.2 Hourly Contract — Weekly Billing Flow

```
STEP 1: CONTRACT SETUP
──────────────────────
• Employer and student agree on hourly rate (e.g., GH₵25/hr)
• Employer sets weekly hour limit (e.g., max 20 hours/week)
• Contract requires employer to have a saved payment authorization

STEP 2: DURING THE WEEK
────────────────────────
• Student logs time entries daily:
  - Monday: 3 hours — "Designed homepage mock-up"
  - Tuesday: 4 hours — "Built responsive navbar"
  - Thursday: 5 hours — "Implemented contact form"
  - Total: 12 hours

STEP 3: WEEKLY BILLING (Every Monday at 00:00 GMT)
──────────────────────────────────────────────────
• Cron job generates weekly invoice:
  - Hours: 12 × GH₵25 = GH₵300
  - Platform fee (20% tier_1): GH₵60
  - Student receives: GH₵240
• We charge the employer using their saved authorization:
  
  POST https://api.paystack.co/transaction/charge_authorization
  {
    "authorization_code": "AUTH_xxxxxxxxxx",
    "email": "employer@email.com",
    "amount": 30000,    // GH₵300 in pesewas
    "currency": "GHS",
    "metadata": {
      "purpose": "hourly_weekly_billing",
      "contract_id": "ct_xyz789",
      "billing_week": "2026-03-23",
      "hours": 12,
      "rate": 25
    }
  }

• On charge.success: credit student wallet GH₵240, record platform fee GH₵60
• On charge.failed: notify employer to update payment method, pause billing

STEP 4: EMPLOYER REVIEW WINDOW
──────────────────────────────
• Employer has 7 days to review time entries
• If employer disputes hours within 7 days → dispute process initiated
• After 7 days → time entries become finalized
```

### 4.3 Service Catalog Order — Upfront Payment

```
STEP 1: EMPLOYER PLACES ORDER
─────────────────────────────
• Employer browses student's service listing
• Selects "Standard" tier: GH₵400, 5-day delivery
• Clicks "Order Now"
• We initialize Paystack payment for GH₵400
• Employer pays → money enters escrow

STEP 2: STUDENT DELIVERS
─────────────────────────
• Student has 5 days to deliver
• Student uploads deliverables
• Same review process as milestone:
  - Employer approves → payment released
  - Employer requests revision → student revises (max 2 rounds)
  - No response in 14 days → auto-release

STEP 3: LATE DELIVERY HANDLING
─────────────────────────────
• If student doesn't deliver within deadline + 3-day grace:
  - Employer can request cancellation → full refund
  - Or extend the deadline
  - Student's on-time delivery rate is affected (impacts JSS)
```

### 4.4 Bonus Payment Flow

```
• Employer sends a bonus outside the contract structure
• Full payment to student (no escrow needed — it's a gift)
• We still charge our platform fee on bonus payments
• Paystack charges employer → we credit student wallet (minus fee)
```

---

## 5. Paystack Integration Layer

### 5.1 API Endpoints We Use

| Paystack Endpoint | Our Usage | When |
|---|---|---|
| `POST /transaction/initialize` | Charge employer for milestone escrow, service orders, connect purchases | Employer funds a milestone |
| `POST /transaction/charge_authorization` | Charge saved card for hourly weekly billing | Every Monday for active hourly contracts |
| `GET /transaction/verify/:reference` | Double-verify payment status | After webhook, and manual verification |
| `POST /transferrecipient` | Register student's bank/MoMo as payout destination | First time student sets up withdrawal |
| `POST /transfer` | Send money to student | On milestone approval, wallet withdrawal |
| `GET /transfer/verify/:reference` | Verify transfer status | After webhook or on demand |
| `POST /refund` | Refund employer | Dispute resolution, cancellation |
| `GET /bank?currency=GHS` | List Ghanaian banks | UI: withdrawal setup |
| `GET /bank?currency=GHS&type=mobile_money` | List mobile money providers | UI: MoMo withdrawal setup |
| `POST /customer` | Create Paystack customer record | User registration |

### 5.2 Webhook Events We Handle

| Webhook Event | Our Action |
|---|---|
| `charge.success` | Fund escrow, credit connects, mark payment complete |
| `charge.failed` | Mark payment as failed, notify employer, allow retry |
| `transfer.success` | Mark withdrawal as completed, confirm student payout |
| `transfer.failed` | Re-credit student wallet, notify admin, queue retry |
| `transfer.reversed` | Re-credit student wallet, notify student and admin |
| `refund.pending` | Update refund status, notify employer "refund processing" |
| `refund.processed` | Mark refund complete, notify employer "money returned" |
| `refund.failed` | Notify admin, attempt alternative refund method |

### 5.3 Webhook Security

```typescript
// CRITICAL: Every webhook must be verified before processing
function verifyPaystackWebhook(signature: string, rawBody: Buffer, secretKey: string): boolean {
  const hash = crypto
    .createHmac('sha512', secretKey)
    .update(rawBody)
    .digest('hex');
  
  // Use timing-safe comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(hash, 'utf8'),
    Buffer.from(signature, 'utf8')
  );
}
```

### 5.4 Idempotency & Double-Processing Prevention

Every webhook can be delivered multiple times (Paystack retries on failure). We MUST handle this:

```typescript
async processWebhook(event: PaystackEvent) {
  // 1. Check if we've already processed this event
  const existing = await db.webhookEvent.findUnique({
    where: { paystackReference: event.data.reference }
  });
  
  if (existing && existing.processedAt) {
    // Already processed — return 200 to acknowledge but do nothing
    return;
  }
  
  // 2. Create/update webhook record with processing lock
  await db.webhookEvent.upsert({
    where: { paystackReference: event.data.reference },
    create: {
      paystackReference: event.data.reference,
      eventType: event.event,
      payload: event.data,
      receivedAt: new Date(),
    },
    update: {} // no-op if exists but not processed
  });
  
  // 3. Process in a transaction
  await db.$transaction(async (tx) => {
    // ... process the event ...
    
    // 4. Mark as processed (inside the same transaction)
    await tx.webhookEvent.update({
      where: { paystackReference: event.data.reference },
      data: { processedAt: new Date() }
    });
  });
}
```

### 5.5 Paystack Transfer Recipient Management

Each student needs a transfer recipient created in Paystack before they can receive payouts:

```
Student registers payout method:
├── Mobile Money (MTN, Vodafone, AirtelTigo)
│   POST /transferrecipient
│   { type: "mobile_money", bank_code: "MTN", account_number: "0551234987", currency: "GHS" }
│
└── Bank Account (GhIPSS)
    POST /transferrecipient
    { type: "ghipss", bank_code: "058", account_number: "0123456047", currency: "GHS" }
```

We store the `recipient_code` in our database, linked to the student profile. When initiating a transfer, we use this code.

**Account verification:** Before creating a recipient, we call the Resolve Account Number API to verify the account exists:
```
GET /bank/resolve?account_number=0123456047&bank_code=058
```
This returns the account holder's name, which we display to the student for confirmation. Prevents sending money to wrong accounts.

---

## 6. The Internal Wallet & Ledger System

### 6.1 Why We Need Our Own Ledger

Paystack sees one balance: Intemso's total balance. But we need to know:
- How much of that balance is in escrow for Milestone A?
- How much belongs to Student X's wallet?
- How much is platform revenue?
- How much is pending withdrawal?

**Our database is the accounting system. Paystack is just the payment rail.**

### 6.2 Double-Entry Bookkeeping

Every financial event creates two entries — a debit and a credit. This is accounting 101, and it's how we ensure our books always balance:

```
EVENT: Employer funds Milestone 1 (GH₵200)
├── DEBIT:  Employer's external payment → GH₵200 (money comes in from Paystack)
└── CREDIT: Escrow Hold Account (Milestone 1) → GH₵200 (money is held)

EVENT: Milestone 1 approved (GH₵200, 20% fee)
├── DEBIT:  Escrow Hold Account (Milestone 1) → GH₵200 (money leaves escrow)
├── CREDIT: Student Wallet → GH₵160 (student's share)
└── CREDIT: Platform Revenue → GH₵40 (our fee)

EVENT: Student withdraws GH₵160
├── DEBIT:  Student Wallet → GH₵160 (money leaves wallet)
└── CREDIT: Paystack Transfer (outgoing) → GH₵160 (money leaves our Paystack)
```

### 6.3 Account Types in Our Ledger

| Account | Purpose | Who Owns It |
|---|---|---|
| `ESCROW_HOLD` | Money held for a specific milestone | Per-milestone |
| `STUDENT_WALLET` | Available balance for student | Per-student |
| `STUDENT_PENDING` | Escrow-funded but not yet released | Per-student |
| `PLATFORM_REVENUE` | Our platform fees collected | Intemso |
| `PLATFORM_PAYSTACK` | Represents money in our Paystack account | Intemso |
| `WITHDRAWAL_PENDING` | Money being transferred out to student | Per-withdrawal |

### 6.4 Wallet Balance Rules

```
Student's Displayed Balances:
├── Available Balance: Money the student can withdraw right now
│   = Sum of all released, completed earnings minus withdrawals
│
├── Pending Balance: Money in escrow (funded milestones not yet approved)
│   = Sum of all escrow amounts for milestones in funded/in_progress/submitted status
│   Student can SEE this but CANNOT withdraw it
│
├── In Withdrawal: Money currently being transferred to bank/MoMo
│   = Sum of all pending/processing withdrawals
│
└── Total Earnings: Lifetime total earned on the platform
    = Sum of all released payments (before fees were deducted — show gross and net)
```

---

## 7. Fee Calculation Engine

### 7.1 Sliding Fee Tiers

Fees are calculated **per student-employer relationship**, not per transaction:

| Lifetime Billings (Student ↔ Employer) | Platform Fee |
|---|---|
| First GH₵500 | **20%** |
| GH₵501 – GH₵2,000 | **10%** |
| Above GH₵2,000 | **5%** |

### 7.2 Fee Calculation Logic (With Tier Splitting)

When a single payment crosses a tier boundary, we split it:

```typescript
function calculatePlatformFee(paymentAmount: number, lifetimeBillingsSoFar: number): {
  fee: number;
  breakdown: { tier: string; amount: number; rate: number; fee: number }[];
} {
  const TIERS = [
    { name: 'tier_1', threshold: 500,    rate: 0.20 },
    { name: 'tier_2', threshold: 2000,   rate: 0.10 },
    { name: 'tier_3', threshold: Infinity, rate: 0.05 },
  ];

  let remaining = paymentAmount;
  let currentBillings = lifetimeBillingsSoFar;
  let totalFee = 0;
  const breakdown = [];

  for (const tier of TIERS) {
    if (remaining <= 0) break;
    if (currentBillings >= tier.threshold) continue; // already past this tier

    const roomInTier = tier.threshold - currentBillings;
    const amountInTier = Math.min(remaining, roomInTier);
    const feeInTier = Math.round(amountInTier * tier.rate * 100) / 100;

    breakdown.push({
      tier: tier.name,
      amount: amountInTier,
      rate: tier.rate,
      fee: feeInTier,
    });

    totalFee += feeInTier;
    remaining -= amountInTier;
    currentBillings += amountInTier;
  }

  return { fee: totalFee, breakdown };
}

// Example: Student has earned GH₵450 with this employer.
// New payment: GH₵200
// 
// GH₵50 falls in tier_1 (20%): GH₵10
// GH₵150 falls in tier_2 (10%): GH₵15
// Total fee: GH₵25
// Student receives: GH₵175
```

### 7.3 When Fees Are Calculated

Fees are calculated **at release time**, not at funding time. This is important because:

1. The lifetime billings may have changed between funding and approval (if other milestones on other contracts between the same pair were released in between).
2. We always use the most up-to-date relationship data.

### 7.4 Paystack Processing Fees (Our Cost)

Paystack charges us fees on every transaction:

| Payment Method | Paystack Fee (Ghana) |
|---|---|
| Card (local) | 1.95% (capped at GH₵100) |
| Mobile Money | 1% to 2% |
| Bank Transfer | Varies |
| Paystack Transfer (payout) | Flat fee per transfer |

**Strategic decision for v1:** We absorb Paystack's processing fees entirely. The student sees only our platform fee. The employer pays exactly the milestone amount. This simplifies the user experience and makes our fee structure transparent.

**Future (v2):** We may pass through a small processing fee, or factor it into our platform fee calculation.

---

## 8. Dispute Resolution & Refund System

### 8.1 When Can Disputes Be Opened?

| Who | When | Conditions |
|---|---|---|
| Employer | After milestone has been submitted | Student submitted but work is unacceptable beyond revision scope |
| Employer | After both revision rounds used | Still not satisfied after 2 revision rounds |
| Student | After submitting deliverables | Employer is unresponsive or unreasonably rejecting work |
| Student | After revision request | Employer's revision requests are unreasonable or outside scope |
| Either | During active contract | Material breach of contract terms |
| Either | After contract cancellation | Disagreement on cancellation terms |

### 8.2 Dispute Process

```
STEP 1: INITIATION
───────────────────
• Either party clicks "Open Dispute" on a milestone or contract
• Must provide:
  - Reason (dropdown: quality issue, scope change, non-delivery, 
    unresponsive party, unreasonable revision, other)
  - Detailed description (min 50 characters)
  - Evidence (file uploads: screenshots, messages, deliverable comparisons)
• Disputant selects desired resolution:
  - Full refund to employer
  - Full release to student
  - Partial refund (suggest amount)
  - Cancel milestone and return to pending
• Dispute status: OPEN
• Both parties notified by email + push + in-app

STEP 2: RESPONSE WINDOW (72 hours)
──────────────────────────────────
• The other party has 72 hours to respond with:
  - Counter-evidence
  - Their side of the story
  - Their desired resolution
• If no response in 72 hours:
  - The dispute is decided in favor of the initiator (default)
  - Unless the amount is above GH₵500, then admin always reviews

STEP 3: ADMIN REVIEW
─────────────────────
• Admin sees the dispute with all evidence from both sides
• Admin can:
  - Request additional information from either party
  - Review the contract terms, milestones, messages, and deliverables
  - Consult the milestone history (all submissions, revisions, feedback)
• Admin timeline: resolve within 48 hours of having all information

STEP 4: RESOLUTION
───────────────────
• Admin decides one of:

  A. FULL RELEASE TO STUDENT
     - All escrowed amount released (minus platform fee)
     - Typically when: student delivered acceptable work within scope
     - We call: Paystack Transfer to student, or credit wallet

  B. FULL REFUND TO EMPLOYER
     - All escrowed amount returned to employer
     - We call: Paystack Refund API (refunds original charge)
     - If original charge can't be refunded (>90 days old): 
       manual refund via Paystack Transfer to employer

  C. PARTIAL SPLIT (most common resolution)
     - Admin decides: e.g., 60% to student, 40% refund to employer
     - Platform fee is charged only on the student's portion
     - Example: GH₵500 milestone
       - Student gets: GH₵300 × (1 - 20%) = GH₵240
       - Employer refunded: GH₵200
       - Platform keeps: GH₵60

  D. CANCEL MILESTONE
     - Full refund to employer
     - Milestone reverts to "cancelled" status
     - Contract continues with remaining milestones

• Both parties notified of the resolution with explanation
• Resolution is final (v1) — future: appeal process
```

### 8.3 Refund Technical Implementation

```typescript
async processRefund(
  disputeId: string,
  decision: 'full_refund' | 'partial_refund' | 'full_release' | 'partial_split',
  splitPercentage?: number  // e.g., 60 = 60% to student
) {
  const dispute = await getDisputeWithDetails(disputeId);
  const escrowPayment = await getEscrowPaymentForMilestone(dispute.milestoneId);
  
  const amount = Number(escrowPayment.amount);
  
  switch (decision) {
    case 'full_refund':
      // Refund via Paystack Refund API
      await paystackRefund(escrowPayment.externalTxnId, amount);
      // Update records
      await markEscrowRefunded(escrowPayment.id, amount, 0);
      break;
      
    case 'full_release':
      // Release to student as normal
      await releaseMilestonePayment(dispute.milestoneId);
      break;
      
    case 'partial_split':
      const studentAmount = amount * (splitPercentage / 100);
      const refundAmount = amount - studentAmount;
      const fee = calculatePlatformFee(studentAmount, ...);
      const studentNet = studentAmount - fee;
      
      // Refund employer's portion
      await paystackRefund(escrowPayment.externalTxnId, refundAmount);
      
      // Release student's portion
      await creditStudentWallet(studentId, studentNet);
      await recordPlatformRevenue(fee);
      break;
  }
}
```

### 8.4 Refund Limitations & Edge Cases

| Scenario | How We Handle It |
|---|---|
| Original payment was > 90 days ago | Paystack Refund API doesn't support this. We refund via Paystack Transfer to employer's account instead. |
| Employer's card is expired | Refund goes to the new card linked to the authorization, or we ask employer for bank/MoMo details for a Transfer refund. |
| Mobile Money payment refund | Mobile money refunds may not be supported by Paystack in Ghana. We refund via Transfer to the employer's MoMo/bank account. |
| Partial refund not supported on channel | We refund via Transfer instead of Refund API. |
| Paystack balance insufficient for refund | This should never happen if our reconciliation is correct. If it does, flag for admin, manual resolution. |

---

## 9. Every Edge Case & What Could Go Wrong

### 9.1 Payment Failures

| What Goes Wrong | Impact | Our Response |
|---|---|---|
| **Employer's card declines** | Milestone can't be funded | Show clear error, suggest alternative payment method (MoMo), allow retry. Keep milestone in "pending" status. |
| **Mobile money prompt expires** | Payment not completed | On payment timeout, mark the payment attempt as "expired". Notify employer: "Payment didn't go through. Try again." |
| **Duplicate webhooks from Paystack** | Could double-credit escrow | Idempotency check: if webhook reference already processed, return 200 but do nothing. |
| **Webhook delivery delayed (hours/days)** | Student sees "pending" for too long | Background job polls Paystack Verify API every 5 minutes for transactions in "pending" state for >10 minutes. |
| **Our server is down when webhook arrives** | Missed payment confirmation | Paystack retries webhooks. Also, employer can click "Verify Payment" which calls Paystack Verify API directly. Background reconciliation job catches any gaps. |
| **Paystack is down** | Can't process payments at all | Show maintenance message. Queue the payment request. Retry when Paystack is back. Monitor Paystack status page. |

### 9.2 Escrow & Release Issues

| What Goes Wrong | Impact | Our Response |
|---|---|---|
| **Student submits garbage deliverables** | Employer frustrated | Employer can request revision (2 rounds). If still bad → open dispute. |
| **Employer approves by accident** | Money released, can't undo | Once approved and transfer initiated, it cannot be reversed. We show a confirmation dialog: "Are you sure? This will release GH₵200 to the student. This cannot be undone." |
| **Employer disappears after funding** | Student waiting forever | 14-day auto-approval after submission. If student submits and employer is gone, money releases automatically. |
| **Student disappears after milestone funded** | Employer's money stuck in escrow | After 30 days of no activity on a funded milestone with no submission, employer can request cancellation → auto-refund. |
| **Student delivers late** | Contract tension | We track delivery deadlines. Late delivery → warning to student, impacts JSS. Employer can cancel if unacceptably late (beyond 3-day grace). |
| **Milestone amount changed mid-work** | Dispute risk | Milestones can only be modified by mutual agreement. Both parties must accept changes to funded milestones. Editing a funded milestone requires admin approval. |

### 9.3 Withdrawal Issues

| What Goes Wrong | Impact | Our Response |
|---|---|---|
| **Wrong bank account details** | Transfer fails or goes to wrong person | Verify account via Paystack Resolve API before creating recipient. Show account name for confirmation. |
| **Transfer fails** | Student doesn't get money | Re-credit student's wallet. Notify student. Queue for automatic retry with same reference (prevents double-credit). Max 3 retries, then admin flag. |
| **Transfer reversed** | Money returned to our Paystack | Re-credit student's wallet. Notify: "Your withdrawal was reversed by the bank. Please check your account details." |
| **Student claims they didn't receive money** | Support ticket | Verify via Paystack API (transfer status). Provide transfer reference and receipt. If Paystack confirms success but student says no: escalate to Paystack support. |
| **Multiple rapid withdrawal requests** | Potential exploit | Rate limit: max 1 withdrawal every 5 minutes. Max 5 per day. Lock wallet during active withdrawal. |
| **Withdrawal with amount greater than balance (race condition)** | Over-withdrawal | Use database-level locking: `SELECT ... FOR UPDATE` on wallet row in transaction. Compare balance atomically. |

### 9.4 Fee Calculation Edge Cases

| Scenario | How We Handle It |
|---|---|
| **Very small milestone (GH₵1)** | Fee = GH₵0.20. Student gets GH₵0.80. Allow it — don't set a minimum, but warn students about fee impact before accepting small gigs. |
| **Milestone amount crosses fee tiers** | Split calculation as shown in Section 7.2. Each portion is charged at its relevant tier rate. |
| **Dispute partial refund + fee** | Fee is only charged on the portion actually released to the student, not the refunded portion. |
| **Bonus payment fee** | Same sliding fee applies. Bonuses count toward lifetime billings (affects future fee tiers). |

### 9.5 Fraud & Abuse Scenarios

| Threat | Risk | Our Defence |
|---|---|---|
| **Fake employer creates gig, funds milestone, approves immediately to own student account** | Money laundering via our platform | Flag contracts where milestone is approved < 1 hour after funding. Flag accounts where the employer and student share the same IP, device fingerprint, or phone number. Require admin approval for first-time contract releases above GH₵1,000. |
| **Student submits plagiarized/AI work** | Employer gets cheated | Not a payment system issue — handle via content moderation and dispute process. Include in Terms of Service. |
| **Employer funds milestone with stolen card** | Chargebacks hit our Paystack account | Paystack handles fraud screening. We add: require card verification before first milestone funding. Flag suspiciously large first-time transactions. Hold first withdrawal for new accounts by 48 hours. |
| **Sybil attack: one person creates many student accounts** | Dilute marketplace, avoid fee tiers | University email verification (one account per .edu email). Phone number verification. Device fingerprinting. |
| **Employer and student collude to avoid platform fees** | They agree on GH₵50 on-platform, do the rest off-platform | Make platform so valuable (escrow protection, reviews, JSS scores, dispute resolution) that losing these benefits isn't worth saving on fees. Also: contracts below GH₵10 have a minimum fee of GH₵2. |
| **Student withdraws and claims they didn't receive, tries to get re-credited** | Double-dipping | Transfer receipts from Paystack are the source of truth. We do not re-credit without Paystack confirmation of failure/reversal. |

### 9.6 Race Conditions

| Race Condition | Scenario | Prevention |
|---|---|---|
| **Double funding** | Employer clicks "Fund" twice quickly, or webhooks arrive twice | Milestone status check: can only fund if status is "pending". Webhook idempotency on reference. |
| **Approve during dispute** | Employer approves milestone while dispute is being processed | Check: if milestone has active dispute, block approval. Dispute takes priority. |
| **Withdraw during release** | Student initiates withdrawal at the exact moment a milestone is being released | Database row-level locking on wallet. All balance modifications happen in serializable transactions. |
| **Simultaneous milestone approvals** | Two milestones on the same contract approved at the same time | Each approval is its own database transaction. Fee calculation reads lifetime_billings within the transaction with `FOR UPDATE` lock on client_relationships. |

---

## 10. Security Architecture

### 10.1 API Security

```
Paystack Secret Key:
├── Stored in: Environment variable (PAYSTACK_SECRET_KEY)
├── Never exposed to: Frontend, logs, error messages, API responses
├── Access: Only the PaymentsService reads it
└── Rotation: Rotate if compromised; Paystack provides key rotation in dashboard

Webhook Validation:
├── HMAC-SHA512 signature verification on EVERY webhook
├── Timing-safe comparison (prevents timing attacks)
├── Reject requests with missing or invalid signatures
├── Log ALL rejected webhooks for security monitoring
└── IP allowlisting: Only accept webhooks from Paystack IPs (if provided)

Transaction References:
├── Generated server-side only (UUID v4)
├── Never accepted from client-side input
├── Unique constraint in database
└── Used for idempotency checking
```

### 10.2 Application-Level Security

```
Wallet Operations:
├── All wallet mutations happen in PostgreSQL transactions
├── Optimistic locking via version field or SELECT FOR UPDATE
├── Balance can never go negative (database CHECK constraint)
├── Every balance change creates an audit trail (transactions table)
└── Reconciliation job verifies sum of all credit transactions - sum of all debit 
    transactions = current balance (daily)

Authorization:
├── Only the employer who owns a contract can fund/approve/request-revision
├── Only the student on a contract can submit deliverables
├── Only admins can resolve disputes
├── Role verification happens at controller level AND service level
└── No wallet operation is possible without authenticated user
```

### 10.3 Financial Audit Trail

Every financial action is logged immutably:

```
AUDIT LOG ENTRY:
{
  id: "uuid",
  timestamp: "2026-03-26T10:30:00Z",
  actor: { userId, role, ipAddress },
  action: "milestone.funded",
  entity: { type: "milestone", id: "ms_abc123" },
  details: {
    amount: 200.00,
    currency: "GHS",
    paystackReference: "txn_ref_xxxxx",
    previousStatus: "pending",
    newStatus: "funded"
  },
  fingerprint: { deviceId, userAgent, ip }
}
```

We never delete financial audit logs. They are append-only.

### 10.4 Sensitive Data Handling

| Data | Storage Rule |
|---|---|
| Student's bank account number | Stored encrypted (AES-256). Only last 4 digits shown in UI. |
| Mobile money number | Stored encrypted. Only last 4 digits shown in UI. |
| Paystack API keys | Environment variables only. Never in code, logs, or DB. |
| Transaction amounts | Stored as DECIMAL(12,2) in DB. Never as floating point. |
| Authorization codes (card tokens) | Stored encrypted. Used only for recurring charges. |

---

## 11. Why Users Will Prefer Intemso Over Offline Transactions

This is the critical business question. Here's why escrow makes Intemso strictly better than the alternative:

### 11.1 For Students

| Offline Problem | Intemso Advantage |
|---|---|
| "I did the work but they didn't pay me" | **Guaranteed payment.** The money is already held in escrow before you start working. If the employer tries to ghost you, the money auto-releases after 14 days. |
| "I don't know if they'll actually pay" | **Visible escrow.** You can see in your dashboard: "GH₵500 is held in escrow for this milestone." That's real money, locked for you. |
| "They paid less than agreed" | **Locked amounts.** The milestone amount is set before work begins. It can't be changed without your agreement. |
| "I had to chase them for weeks" | **48-hour resolution.** If there's a dispute, our team mediates. Maximum 48 hours. No more begging. |
| "I can't prove I did the work" | **Full delivery history.** Every uploaded file, every message, every revision — all logged with timestamps. |
| "I need more jobs but no one knows me" | **Portable reputation.** Your JSS score, reviews, and verified badge follow you to every new gig. Earning on Intemso builds a career profile. |

### 11.2 For Employers

| Offline Problem | Intemso Advantage |
|---|---|
| "I paid and they disappeared" | **Milestone-gated payments.** You fund one milestone at a time. If the student ghosts, you get a full refund on unfunded work. Funded milestones with no submission for 30 days → auto-refund. |
| "The work quality was terrible" | **Revision rounds.** You get 2 revision rounds per milestone. If still not right → dispute with full evidence trail. |
| "I don't know if this student is reliable" | **JSS + Reviews.** Every student has a success score and public reviews. Rising Talent, Top Rated, Top Rated Plus — badges you can trust. |
| "I can't find good students" | **Talent search.** Browse by skill, university, rating, hourly rate. Invite the best directly. |
| "Coordinating over WhatsApp is chaotic" | **Built-in project management.** Milestones, deliverables, chat, notifications — all in one place. |

### 11.3 Platform Features That Lock In Both Sides

| Feature | Why It Prevents Going Offline |
|---|---|
| **JSS Score** | Students' future earnings depend on their score. Going offline means the gig doesn't count toward their score. |
| **Fee reduction** | The more you work with someone, the lower the fee (20% → 10% → 5%). Going offline resets this relationship on the platform. |
| **Talent badges** | Top Rated status requires platform history. Can't earn it offline. |
| **Dispute protection** | No offline equivalent. If someone cheats on an offline deal, you have zero recourse. |
| **Payment convenience** | Mobile money, card, bank transfer — all in one click. No "please send to this number." |
| **Free connects** | Students get 10 free connects/month. Leaving the platform means losing access to the gig listings entirely. |
| **Portfolio & history** | Completed gigs build a verifiable work history. Future employers see it. |

---

## 12. Database Schema Additions

Beyond what's already in the SYSTEM_PLAN.md, we need these additional tables for the enhanced escrow system:

### 12.1 Escrow Transactions (Enhanced)

```sql
-- Tracks every escrow event for a milestone or service order  
CREATE TABLE escrow_transactions (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- What this escrow is for
    milestone_id      UUID REFERENCES milestones(id),
    service_order_id  UUID REFERENCES service_orders(id),
    contract_id       UUID NOT NULL REFERENCES contracts(id),
    
    -- Parties
    employer_id       UUID NOT NULL REFERENCES employer_profiles(id),  -- who paid
    student_id        UUID NOT NULL REFERENCES student_profiles(id),   -- who receives
    
    -- Money
    amount            DECIMAL(12, 2) NOT NULL,    -- gross escrow amount
    currency          VARCHAR(3) DEFAULT 'GHS',
    
    -- Paystack references  
    paystack_charge_reference   VARCHAR(255),     -- from initial charge
    paystack_transfer_reference VARCHAR(255),     -- for payout to student
    paystack_refund_reference   VARCHAR(255),     -- if refunded
    
    -- Status tracking
    status            VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN (
                        'pending',            -- payment initiated, awaiting confirmation
                        'funded',             -- charge.success received, money in our account
                        'in_progress',        -- student is working
                        'submitted',          -- student submitted deliverables
                        'approved',           -- employer approved
                        'released',           -- transfer initiated to student
                        'completed',          -- transfer confirmed (transfer.success)
                        'refunded',           -- full refund to employer
                        'partially_refunded', -- partial refund (dispute split)
                        'disputed',           -- under dispute
                        'cancelled',          -- cancelled before work started
                        'failed',             -- charge failed
                        'expired'             -- payment prompt expired
                      )),
    
    -- Fee calculation (populated on release)
    platform_fee      DECIMAL(10, 2),
    fee_percentage    DECIMAL(5, 2),
    fee_tier          VARCHAR(20),            -- tier_1, tier_2, tier_3, or 'split'
    fee_breakdown     JSONB,                  -- detailed tier breakdown
    net_amount        DECIMAL(10, 2),         -- amount - platform_fee (student gets this)
    
    -- Dispute resolution (populated if disputed)
    refund_amount     DECIMAL(10, 2),         -- how much refunded to employer
    student_amount    DECIMAL(10, 2),         -- how much released to student (after dispute)
    dispute_id        UUID REFERENCES disputes(id),
    
    -- Timestamps
    funded_at         TIMESTAMPTZ,
    submitted_at      TIMESTAMPTZ,
    approved_at       TIMESTAMPTZ,
    released_at       TIMESTAMPTZ,            -- when transfer was initiated
    completed_at      TIMESTAMPTZ,            -- when transfer.success confirmed
    refunded_at       TIMESTAMPTZ,
    auto_approve_at   TIMESTAMPTZ,            -- 14 days after submission
    cancelled_at      TIMESTAMPTZ,
    
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_escrow_milestone ON escrow_transactions(milestone_id);
CREATE INDEX idx_escrow_status ON escrow_transactions(status);
CREATE INDEX idx_escrow_auto_approve ON escrow_transactions(auto_approve_at) WHERE status = 'submitted';
```

### 12.2 Webhook Events (Idempotency)

```sql
CREATE TABLE webhook_events (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paystack_reference  VARCHAR(255) UNIQUE NOT NULL,
    event_type          VARCHAR(100) NOT NULL,     -- charge.success, transfer.success, etc.
    payload             JSONB NOT NULL,             -- full webhook payload
    received_at         TIMESTAMPTZ DEFAULT NOW(),
    processed_at        TIMESTAMPTZ,                -- null until processed
    processing_error    TEXT,                        -- error message if processing failed
    retry_count         INTEGER DEFAULT 0
);

CREATE INDEX idx_webhook_unprocessed ON webhook_events(received_at) WHERE processed_at IS NULL;
```

### 12.3 Transfer Recipients (Paystack)

```sql
CREATE TABLE transfer_recipients (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id               UUID NOT NULL REFERENCES users(id),
    paystack_recipient_code VARCHAR(100) NOT NULL,
    type                  VARCHAR(20) NOT NULL,     -- mobile_money, ghipss
    provider              VARCHAR(50) NOT NULL,      -- MTN, Vodafone, AirtelTigo, bank_name
    account_number_masked VARCHAR(20) NOT NULL,      -- ***4987
    account_name          VARCHAR(255) NOT NULL,
    bank_code             VARCHAR(20) NOT NULL,
    currency              VARCHAR(3) DEFAULT 'GHS',
    is_default            BOOLEAN DEFAULT FALSE,
    is_verified           BOOLEAN DEFAULT FALSE,
    created_at            TIMESTAMPTZ DEFAULT NOW(),
    updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Only store encrypted full account number  
-- The account_number_masked column stores only the last 4 digits for display
CREATE INDEX idx_transfer_recipients_user ON transfer_recipients(user_id);
```

### 12.4 Financial Audit Log

```sql
CREATE TABLE financial_audit_log (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id          UUID REFERENCES users(id),     -- who performed the action (null for system)
    action            VARCHAR(100) NOT NULL,           -- milestone.funded, wallet.credited, etc.
    entity_type       VARCHAR(50) NOT NULL,            -- milestone, wallet, withdrawal, dispute
    entity_id         UUID NOT NULL,
    amount            DECIMAL(12, 2),
    currency          VARCHAR(3) DEFAULT 'GHS',
    details           JSONB NOT NULL,                  -- full context of the action
    ip_address        INET,
    user_agent        TEXT,
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- This table is append-only. No UPDATEs or DELETEs allowed.
-- Enforce via PostgreSQL RLS or application-level controls.
CREATE INDEX idx_audit_entity ON financial_audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_actor ON financial_audit_log(actor_id, created_at DESC);
CREATE INDEX idx_audit_action ON financial_audit_log(action, created_at DESC);
```

### 12.5 Reconciliation Records

```sql
CREATE TABLE reconciliation_runs (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_date          DATE NOT NULL,
    run_type          VARCHAR(50) NOT NULL,       -- daily, weekly, manual
    
    -- Our ledger totals
    total_escrow_held           DECIMAL(14, 2),  -- sum of all funded escrows
    total_student_wallets       DECIMAL(14, 2),  -- sum of all student wallet balances
    total_pending_withdrawals   DECIMAL(14, 2),
    total_platform_revenue      DECIMAL(14, 2),
    calculated_paystack_balance DECIMAL(14, 2),  -- what we expect in Paystack
    
    -- Actual Paystack balance (fetched via API)
    actual_paystack_balance     DECIMAL(14, 2),
    
    -- Discrepancy
    discrepancy                 DECIMAL(14, 2),  -- actual - calculated
    discrepancy_percentage      DECIMAL(5, 4),
    
    is_balanced                 BOOLEAN NOT NULL,
    notes                       TEXT,
    resolved_at                 TIMESTAMPTZ,     -- if discrepancy was investigated and resolved
    
    created_at                  TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 13. Implementation Roadmap

### Phase 1: Core Escrow (MVP — Launch Requirement)

| Component | Description | Priority |
|---|---|---|
| Paystack Transaction Initialize | Charge employer for milestone funding | P0 |
| Webhook Handler | Process charge.success, charge.failed | P0 |
| Escrow State Machine | Track milestone through funded → approved → released | P0 |
| Fee Calculation | Sliding fee per client relationship | P0 |
| Student Wallet | Balance tracking, pending vs available | P0 |
| Transfer Recipients | Register student bank/MoMo for payout | P0 |
| Paystack Transfers | Release payments to students | P0 |
| Withdrawal Flow | Student requests withdrawal from wallet | P0 |
| 14-Day Auto-Approval | Cron job for unreviewed milestones | P0 |
| Webhook Idempotency | Prevent double-processing | P0 |
| Transaction Verification | Double-verify via Paystack API | P0 |
| Basic Dispute Resolution | Admin can refund or release | P1 |
| Financial Audit Log | Every money movement logged | P1 |

### Phase 2: Robustness & Edge Cases

| Component | Description | Priority |
|---|---|---|
| Hourly Contract Billing | Weekly billing via saved authorization | P1 |
| Service Catalog Escrow | Upfront payment for services | P1 |
| Bonus Payments | Ad-hoc payments from employer to student | P2 |
| Partial Refund (Dispute Split) | Admin can split escrowed amount | P1 |
| Stale Escrow Handler | 30-day no-activity auto-refund | P1 |
| Transfer Failure Retry | Automatic retry with same reference | P1 |
| Account Number Verification | Resolve API before saving payout details | P1 |
| Anti-Fraud Rules | Flag suspicious patterns | P2 |

### Phase 3: Scale & Optimization

| Component | Description | Priority |
|---|---|---|
| Daily Reconciliation | Automated balance check vs Paystack | P2 |
| Dedicated Virtual Accounts | Per-employer funding accounts (Ghana) | P3 |
| Bulk Transfers | Batch student payouts for efficiency | P3 |
| Auto-Withdraw Setting | Students can opt for instant payout on approval | P2 |
| Enhanced Fraud Detection | ML-based pattern detection | P3 |
| Multi-Currency Support | USD, NGN for future expansion | P3 |
| Paystack Processing Fee Pass-Through | Optionally pass Paystack fee to users | P3 |

---

## 14. Monitoring & Reconciliation

### 14.1 Daily Automated Checks

```
DAILY RECONCILIATION JOB (Runs 2:00 AM GMT):

1. ESCROW BALANCE CHECK
   ─────────────────────
   Sum of all escrow_transactions WHERE status IN ('funded', 'in_progress', 'submitted')
   = Expected money held in our Paystack account for escrow purposes
   
2. WALLET BALANCE CHECK
   ─────────────────────
   Sum of all student wallet.balance 
   + Sum of all pending withdrawals
   = Expected money held for student payouts
   
3. PLATFORM REVENUE CHECK
   ──────────────────────
   Sum of all platform fees collected today
   Should match: Sum of all escrow releases × their fee percentage
   
4. PAYSTACK BALANCE VERIFICATION
   ──────────────────────────────
   Call Paystack API to get our actual balance
   Compare: actual_balance ≥ escrow_held + wallet_balances + pending_withdrawals
   
   If discrepancy > 1%: ALERT admin immediately
   If discrepancy > 0.01%: Log warning, investigate within 24 hours
   
5. ORPHANED TRANSACTIONS
   ─────────────────────
   Find payments where:
   - charge.success webhook received > 1 hour ago
   - No corresponding escrow_transaction in 'funded' status
   → Reconcile manually
   
6. STUCK TRANSFERS
   ────────────────
   Find withdrawals where:
   - Status is 'processing' for > 2 hours
   → Poll Paystack Verify Transfer API
   → Update status accordingly
```

### 14.2 Real-Time Monitoring Alerts

| Alert | Condition | Action |
|---|---|---|
| **High-value escrow funded** | Amount > GH₵5,000 | Notify admin for awareness |
| **Transfer failure spike** | >3 transfers fail in 1 hour | Notify admin, check Paystack status |
| **Webhook processing delay** | Queue depth > 100 or processing time > 30s | Scale workers, investigate |
| **Auto-approval triggered** | Any milestone auto-approves | Log; check if employer account is active |
| **Dispute opened** | Any dispute | Notify admin team |
| **Balance discrepancy** | Reconciliation finds mismatch | Immediate admin alert |
| **Suspicious withdrawal pattern** | >3 withdrawals in 1 hour from same account | Block account, notify admin |
| **Chargeback received** | Paystack notifies of chargeback | Lock related escrow, investigate |

### 14.3 Admin Financial Dashboard

```
┌─────────────────────────────────────────────────────────┐
│                 FINANCIAL OVERVIEW                        │
│                                                          │
│  Paystack Balance:       GH₵ 45,230.50                  │
│  ├── In Escrow:          GH₵ 28,100.00                  │
│  ├── Student Wallets:    GH₵ 12,430.50                  │
│  ├── Platform Revenue:   GH₵  4,700.00                  │
│  └── Unallocated:        GH₵      0.00  ✅             │
│                                                          │
│  Today's Activity:                                       │
│  ├── Charges Received:   GH₵  8,500.00  (12 transactions)│
│  ├── Payments Released:  GH₵  3,200.00  (8 milestones)  │
│  ├── Withdrawals Sent:   GH₵  2,100.00  (15 transfers)  │
│  ├── Refunds Processed:  GH₵    500.00  (1 dispute)     │
│  └── Platform Fees:      GH₵    640.00                   │
│                                                          │
│  Pending Actions:                                        │
│  ├── Milestones awaiting review: 23                      │
│  ├── Auto-approvals due (next 48h): 5                    │
│  ├── Withdrawals processing: 3                           │
│  └── Open disputes: 2                                    │
│                                                          │
│  Alert: [!] 1 transfer stuck in 'pending' for 3 hours   │
└─────────────────────────────────────────────────────────┘
```

---

## Summary: How It All Fits Together

```
EMPLOYER                           INTEMSO                          STUDENT
───────                           ──────                           ───────

1. Posts gig ─────────>  Gig listed on marketplace
                                                    <───── Submits proposal (spends connects)
2. Reviews proposals,
   sends offer ────>     Contract created
                         with milestones
                                                    <───── Accepts offer

3. Clicks "Fund          Paystack Initialize
   Milestone" ─────>     Transaction ──────>        Paystack charges
                                                    employer's card/MoMo
                         
                         <────── charge.success      
                         webhook confirms
                         
                         Escrow record created:
                         Status = FUNDED
                         Student wallet:
                         pending_balance += amount
                                                    <───── Sees "GH₵200 in escrow"
                                                           Starts working

                                                    <───── Submits deliverables
                         14-day auto-approve
                         timer starts

4. Reviews work ──>      
   
   OPTION A: Approve ─>  Calculate fee (20%)
                         Credit student wallet
                         Record platform revenue    <───── "GH₵160 added to wallet!"
                         
   OPTION B: Revision ─> Notify student             <───── Makes changes, resubmits
   
   OPTION C: Nothing...  After 14 days:
                         Auto-approve ──────────>   <───── Gets paid automatically

                                                    <───── Clicks "Withdraw GH₵160"
                         Paystack Transfer ──────>  Money arrives in
                                                    student's MTN MoMo! 🎉

5. Contract complete     Both sides leave reviews
   <──── Review ────>    JSS score updated
                         Fee tier may improve
```

**The bottom line:** Money flows in one direction — from employer to Paystack to our holding account to the student — and at every step, both parties can see exactly where the money is and what conditions must be met for it to move forward. That's trust. That's escrow. That's why people will choose Intemso over WhatsApp and prayers.

---

*Document Version: 1.0*
*Last Updated: March 26, 2026*
*Author: Intemso Engineering*
