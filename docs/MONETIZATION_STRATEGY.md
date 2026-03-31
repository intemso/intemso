# Intemso — Monetization Strategy

> How Intemso makes money — current revenue streams, future opportunities, and financial projections for the Ghanaian student gig marketplace.

---

## Table of Contents

1. [Revenue Philosophy](#1-revenue-philosophy)
2. [Active Revenue Streams](#2-active-revenue-streams)
3. [Future Revenue Streams](#3-future-revenue-streams)
4. [Revenue Projections](#4-revenue-projections)
5. [Pricing Psychology](#5-pricing-psychology)
6. [Implementation Status](#6-implementation-status)

---

## 1. Revenue Philosophy

Intemso's monetization follows three core principles:

1. **Employers pay nothing.** Posting gigs, browsing talent, hiring, using escrow — all free. In a two-sided marketplace, the demand side (employers) must be frictionless. If it costs money to post a gig, employers go back to WhatsApp.

2. **Students pay from earnings, not from pocket.** The primary fee is deducted from what students earn — they never need to pay upfront to work. Connects are the one exception, but 10 free connects/month cover casual users.

3. **Fees decrease with loyalty.** The sliding fee scale rewards long-term relationships. The more a student earns with the same client, the lower the cut. This keeps power users on the platform instead of taking relationships offline.

---

## 2. Active Revenue Streams

### 2.1 Service Fees (Primary Revenue)

A percentage fee is charged on every completed payment from employer to student. The fee uses a **sliding scale per client relationship** — meaning the rate drops as a student earns more with the same employer.

| Cumulative Earnings with Same Client | Platform Fee |
|---|---|
| First GH₵500 | **20%** |
| GH₵501 – GH₵2,000 | **10%** |
| Above GH₵2,000 | **5%** |

**How it works in practice:**

A student earns GH₵3,000 total with one employer:

| Earnings Bracket | Amount | Fee Rate | Fee Collected |
|---|---|---|---|
| First GH₵500 | GH₵500 | 20% | GH₵100 |
| Next GH₵1,500 | GH₵1,500 | 10% | GH₵150 |
| Remaining GH₵1,000 | GH₵1,000 | 5% | GH₵50 |
| **Total** | **GH₵3,000** | **10% effective** | **GH₵300** |

**Key details:**
- Fee is calculated at milestone approval time (not at funding time)
- The `clientRelationship` table tracks lifetime billings per student–employer pair
- Fee percentage is locked into the `EscrowTransaction` record at calculation time
- The platform's share stays in the Paystack balance; the student's share goes to their wallet

**Revenue potential:** If the average gig value is GH₵150 and most are first-time relationships (20% fee), Intemso earns **GH₵30 per completed gig** on average.

---

### 2.2 Connects (Application Credits)

Students use connects to apply for gigs. Each proposal costs 2–6 connects depending on gig complexity. Every student gets **10 free connects per month**, which covers 2–5 applications. Students who want to apply more buy connect packs.

| Pack | Price | Per Connect | Savings |
|---|---|---|---|
| 10 connects | GH₵5 | GH₵0.50 | — |
| 20 connects | GH₵9 | GH₵0.45 | 10% off |
| 40 connects | GH₵16 | GH₵0.40 | 20% off |

**Purchase flow:**
1. Student selects pack on the pricing page
2. Backend calls Paystack Initialize with `purpose: 'connects_purchase'`
3. Student pays via card or mobile money on Paystack checkout
4. Webhook confirms payment → connects credited to balance

**Why connects work:**
- **Anti-spam:** Students only apply to gigs they're serious about, improving proposal quality for employers
- **Recurring revenue:** Active students buy connects every month
- **Low price point:** GH₵5–16 is affordable for Ghanaian students but adds up across thousands of users
- **Psychological buy-in:** Having "spent" connects to apply makes students more invested in each proposal

**Revenue potential:** If 30% of active students buy at least 1 pack/month at an average of GH₵9, that's steady recurring micro-revenue.

---

## 3. Future Revenue Streams

### 3.1 Proposal Boosts (Near-Term)

Students can spend extra connects to **boost a proposal** — moving it to the top of the employer's applicant list with a "Boosted" badge.

| Boost Type | Cost | Effect |
|---|---|---|
| Standard Boost | +5 connects | Proposal highlighted, shown first for 24 hours |
| Premium Boost | +10 connects | Highlighted + "Top Applicant" badge + employer notification |

**Why it works:** On popular gigs with 20+ applicants, standing out matters. Boosting is voluntary and doesn't guarantee hiring — it just increases visibility. This creates urgency to purchase more connects.

**Revenue potential:** If 10% of proposals are boosted at an average of 7 extra connects (GH₵3.15 value), this could increase connect revenue by 30–40%.

---

### 3.2 Featured Gig Listings (Near-Term — Employer Revenue)

Employers can pay to **feature their gig** at the top of search results and the homepage carousel.

| Feature Type | Price | Duration | Visibility |
|---|---|---|---|
| Homepage Feature | GH₵25 | 7 days | Pinned to top of homepage "Featured Gigs" section |
| Category Feature | GH₵15 | 7 days | Pinned to top of relevant category page |
| Urgent Badge | GH₵10 | Until filled | "Urgent" badge + priority in search results |

**Why it works:** Employers who need someone fast will pay for visibility. This is the first entry point for employer-side revenue and it doesn't change the "free to post" promise — basic listings remain free.

---

### 3.3 Premium Student Subscription — "Intemso Pro" (Medium-Term)

A monthly subscription for serious student freelancers who want maximum earning potential.

| Feature | Free | Pro (GH₵29/month) |
|---|---|---|
| Monthly free connects | 10 | 50 |
| Service fee | 20% / 10% / 5% | **15% / 8% / 3%** |
| Profile badge | None | ⭐ Pro badge |
| Proposal visibility | Standard | Priority placement |
| Earnings analytics | Basic | Advanced (weekly trends, client insights) |
| Withdrawal speed | Standard (1–2 days) | Priority (same-day) |
| Profile in "Top Talent" | No | Yes |

**Why it works:** Students who earn GH₵500+/month save more on reduced fees than the subscription costs. A student earning GH₵1,000/month at 20% fee pays GH₵200 in fees. At Pro's 15%, they'd pay GH₵150 — saving GH₵50 while paying GH₵29 for Pro. Net saving: GH₵21/month. The math sells itself.

**Revenue potential:** If 5% of active students subscribe at GH₵29/month, this becomes a predictable recurring revenue stream.

---

### 3.4 Employer Business Tools (Medium-Term)

Premium tools for businesses and organizations that hire frequently.

| Feature | Price | Value |
|---|---|---|
| **Team Account** | GH₵49/month | Multiple team members, shared gigs, unified billing |
| **Bulk Hiring** | GH₵30/event | Post one gig, hire multiple students (e.g., 10 ushers for an event) |
| **Talent Pool** | GH₵39/month | Save and organize favorite students, private talent lists |
| **Priority Support** | Included in Team | Dedicated support channel, faster dispute resolution |
| **Branded Profile** | GH₵20/month | Company logo, verified business badge, custom profile page |

**Why it works:** Businesses that hire 5+ students per month gain huge efficiency from team tools and talent pools. The ROI is obvious compared to managing hiring via WhatsApp.

---

### 3.5 Intemso Verified (Medium-Term)

An optional identity verification service for students who want to stand out with a stronger trust signal.

| Tier | Cost | Verification |
|---|---|---|
| Email Verified | Free (default) | University email confirmation |
| ID Verified | GH₵15 (one-time) | Ghana Card / Student ID upload + selfie match |
| Background Checked | GH₵35 (one-time) | ID verification + academic standing confirmation |

**Why it works:** Employers hiring for in-person roles (delivery, events, driving) want extra assurance. Students with verification badges get hired faster and can charge higher rates.

---

### 3.6 Skills Certification & Badges (Long-Term)

Partner with training providers to offer short courses and certifications. Students earn verified skill badges that appear on their profiles.

| Course Type | Price | Example |
|---|---|---|
| Platform Course | GH₵20–50 | "Professional Event Management," "Social Media Marketing Basics" |
| Partner Course | Revenue share (30%) | Coursera, Alison, or local training providers |
| Skill Assessment | GH₵10 | Timed test to verify a skill (e.g., Canva, Excel, Python) |

**Why it works:** Students want to upskill. Employers want proof of skills. Intemso becomes the bridge. Revenue share with training partners keeps costs low.

---

### 3.7 Intemso API & White-Label (Long-Term)

Allow institutions to embed Intemso's gig marketplace into their own platforms.

| Product | Price | Customer |
|---|---|---|
| University Portal | GH₵500/month | Universities embed a branded job board for their students |
| Corporate API | Custom pricing | Companies integrate with Intemso to source student talent at scale |
| Event Staffing API | Per-transaction fee | Event companies pull verified ushers, photographers, etc. |

---

## 4. Revenue Projections

### Assumptions
- Target: 5 universities in Year 1, 20 in Year 2
- Average 2,000 active students per campus
- 15% of active students complete at least 1 gig/month
- Average gig value: GH₵150
- 30% of active students buy connects

### Year 1 (5 Campuses — 10,000 Students)

| Revenue Stream | Calculation | Monthly Revenue |
|---|---|---|
| Service Fees | 1,500 gigs × GH₵150 × 18% avg fee | **GH₵40,500** |
| Connect Sales | 3,000 students × GH₵9 avg | **GH₵27,000** |
| **Total Monthly** | | **GH₵67,500** |
| **Total Annual** | | **GH₵810,000** |

### Year 2 (20 Campuses — 40,000 Students + Premium Features)

| Revenue Stream | Calculation | Monthly Revenue |
|---|---|---|
| Service Fees | 6,000 gigs × GH₵150 × 16% avg fee | **GH₵144,000** |
| Connect Sales | 12,000 students × GH₵10 avg | **GH₵120,000** |
| Proposal Boosts | 1,200 boosts × GH₵3.15 avg | **GH₵3,780** |
| Featured Listings | 200 listings × GH₵18 avg | **GH₵3,600** |
| Pro Subscriptions | 2,000 students × GH₵29 | **GH₵58,000** |
| Employer Tools | 100 businesses × GH₵45 avg | **GH₵4,500** |
| **Total Monthly** | | **GH₵333,880** |
| **Total Annual** | | **GH₵4,006,560** |

*Note: These are illustrative projections. Actual numbers depend on activation rates, market conditions, and execution speed.*

---

## 5. Pricing Psychology

### Why the Fee Structure Works

**Sliding scale creates loyalty.** If the fee was flat 15%, students would take clients off-platform after the first gig. With the sliding scale, the fee drops the longer they stay — creating an incentive to keep relationships on Intemso.

**Connects prevent spam, not access.** 10 free connects/month means casual users never pay. Only active job-seekers who apply to 5+ gigs/month need to buy. This keeps the platform accessible while monetizing power users.

**Employers pay nothing — on purpose.** In marketplace economics, you subsidize the harder side to grow. Employers are the scarce resource (they bring the money and the work). Making it free for them accelerates supply of gigs, which attracts more students, which attracts more employers. The flywheel.

**Premium is about ROI, not exclusivity.** Pro subscription saves students more in reduced fees than it costs. This makes it rational, not aspirational — "you're already earning enough that Pro pays for itself."

---

## 6. Implementation Status

| Revenue Stream | Backend | Frontend | Paystack | Status |
|---|---|---|---|---|
| Service Fees (sliding scale) | ✅ | ✅ | ✅ | **Live** |
| Milestone Escrow | ✅ | ✅ | ✅ | **Live** |
| Connect Purchase | ✅ | ✅ | ✅ | **Live** |
| Connect Deduction (proposals) | ✅ | ✅ | — | **Live** |
| Monthly Free Connects Reset | ❌ | — | — | **Not built** |
| Earned Connects (gig completion) | ❌ | — | — | **Not built** |
| Proposal Boosts | ❌ | ❌ | — | **Planned** |
| Featured Gig Listings | ❌ | ❌ | ❌ | **Planned** |
| Pro Subscription | ❌ | ❌ | ❌ | **Planned** |
| Employer Tools | ❌ | ❌ | ❌ | **Future** |
| Intemso Verified | ❌ | ❌ | — | **Future** |
| Skills Certification | ❌ | ❌ | — | **Future** |
| API / White-Label | ❌ | ❌ | — | **Future** |

---

## Summary

Intemso has **two live revenue streams** — service fees and connects — that generate income from day one without charging employers. The sliding fee structure rewards loyalty, the connect system prevents spam while creating recurring micro-revenue, and the escrow system makes the platform strictly safer than offline alternatives.

Future revenue streams (boosts, featured listings, Pro subscriptions, employer tools) layer on top without disrupting the core model. Each one targets a different willingness-to-pay: students who want visibility, students who want lower fees, employers who want efficiency, and institutions who want infrastructure.

**The bottom line:** Intemso makes money every time a student gets paid and every time a student applies for work. As the platform grows, both of these happen more frequently, creating compounding revenue growth tied directly to user success.
