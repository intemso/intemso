# Intemso — Implementation Plan

> Last updated: March 24, 2026  
> Status: Phase 1 complete ✅ — Ready for Phase 2

---

## Current State Summary

| Layer | Built | Connected |
|-------|-------|-----------|
| Database Schema | 32 models, 19 enums | ✅ Pushed to Postgres |
| Shared Package | Enums, constants, types, 23 categories | ✅ Built |
| API | 18 endpoints (auth, users, gigs, categories, health) | ✅ Running |
| Frontend | 37 pages, 5 UI components | ✅ Auth, profiles, gigs, categories wired |
| Payments | — | ❌ No Paystack integration |
| Real-time | — | ❌ No WebSocket/messaging |
| File Storage | — | ❌ No upload handling |
| Email | — | ❌ No transactional email |

---

## Phase 1 — Wire Up What Exists

**Goal:** Connect the frontend to the 12 API endpoints that already work.  
**Outcome:** Users can register, log in, manage profiles, browse/post gigs, and see real categories.

### 1.1 API Client & Auth State

- [x] Create shared API client (`apps/web/src/lib/api.ts`) with base URL, token handling, and refresh logic
- [x] Create auth context/provider (`apps/web/src/context/auth.tsx`) — store user + tokens, expose login/logout/register
- [x] Add auth middleware — redirect unauthenticated users from `/dashboard/*` to `/auth/login`
- [x] Update `Navbar.tsx` — replace hardcoded `isLoggedIn = false` with real auth state
- [x] Update `dashboard/layout.tsx` — replace hardcoded `role = 'student'` with real user role

### 1.2 Auth Pages

- [x] Wire `auth/login/page.tsx` → `POST /api/v1/auth/login`
- [x] Wire `auth/register/page.tsx` → `POST /api/v1/auth/register`
- [x] Handle token storage (localStorage + automatic refresh on 401)
- [x] Add error handling (duplicate email, wrong password, suspended account)
- [x] Wire `auth/forgot-password/page.tsx` — placeholder until email system (Phase 5)

### 1.3 Profile Pages

- [x] Wire `dashboard/profile/page.tsx` → `GET /api/v1/users/me` (display real profile)
- [x] Wire `dashboard/profile/edit/page.tsx` → `PATCH /api/v1/users/me/student-profile` or `employer-profile`
- [x] Add proper DTO validation on API: create `UpdateStudentProfileDto` and `UpdateEmployerProfileDto`
- [x] Show correct dashboard view based on user role (student vs employer)

### 1.4 Gigs & Categories

- [x] Wire `gigs/page.tsx` → `GET /api/v1/gigs` with pagination, search, category filter
- [x] Wire `gigs/[id]/page.tsx` → `GET /api/v1/gigs/:id` for dynamic gig detail
- [x] Wire `post-gig/page.tsx` → fetch categories from `GET /api/v1/categories` + submit via `POST /api/v1/gigs`
- [x] Wire category filter in Navbar → `GET /api/v1/categories`
- [x] Add `CreateGigDto` with proper validation on API
- [x] Add `PATCH /api/v1/gigs/:id` and `DELETE /api/v1/gigs/:id` endpoints (employer only, with ownership checks)
- [x] Wire `dashboard/gigs/page.tsx` → show employer's own gigs via `GET /api/v1/gigs/mine`

---

## Phase 2 — Proposals & Hiring Flow

**Goal:** Students can apply to gigs, employers can review and hire.  
**Outcome:** The core marketplace transaction begins.

### 2.1 Proposals API (`apps/api/src/proposals/`)

- [x] `POST /api/v1/gigs/:gigId/proposals` — student submits proposal (cover letter, rate, milestones)
- [x] `GET /api/v1/gigs/:gigId/proposals` — employer views proposals for their gig
- [x] `GET /api/v1/proposals/me` — student views their own proposals
- [x] `GET /api/v1/proposals/:id` — single proposal detail
- [x] `PATCH /api/v1/proposals/:id/status` — employer shortlists/declines/hires
- [x] `PATCH /api/v1/proposals/:id/withdraw` — student withdraws
- [x] Validation: prevent duplicate proposals, check gig is OPEN, enforce max proposals
- [x] Auto-increment `gig.proposalsCount` on submission

### 2.2 Proposals Frontend

- [x] Wire `gigs/[id]/page.tsx` proposal form → `POST /gigs/:gigId/proposals`
- [x] Wire `dashboard/proposals/page.tsx` → `GET /proposals/me` (student view)
- [x] Build employer proposal review UI → `GET /gigs/:gigId/proposals`
- [x] Add proposal status badges and actions (shortlist, decline, hire)

### 2.3 Contracts API (`apps/api/src/contracts/`)

- [x] `POST /api/v1/contracts` — created when employer hires (from proposal or direct)
- [x] `GET /api/v1/contracts/me` — user's contracts (student or employer)
- [x] `GET /api/v1/contracts/:id` — contract detail with milestones
- [x] `PATCH /api/v1/contracts/:id/status` — pause, resume, complete, cancel
- [x] Auto-create contract from hired proposal with agreed terms
- [x] Update gig status to `HIRED` / `IN_PROGRESS`

### 2.4 Milestones API

- [x] `POST /api/v1/contracts/:contractId/milestones` — add milestone
- [x] `PATCH /api/v1/milestones/:id/submit` — student submits deliverable
- [x] `PATCH /api/v1/milestones/:id/approve` — employer approves
- [x] `PATCH /api/v1/milestones/:id/request-revision` — employer requests revision
- [x] Auto-approve timer (14 days from submission)
- [x] Revision count tracking (max 2)

### 2.5 Contracts Frontend

- [x] Wire `dashboard/contracts/page.tsx` → `GET /contracts/me`
- [x] Wire `dashboard/contracts/[id]/page.tsx` → `GET /contracts/:id`
- [x] Build milestone submission/approval UI
- [x] Build contract status management (pause, complete, cancel)

---

## Phase 3 — Payments & Wallet

**Goal:** Money flows through the platform — escrow, payouts, connects purchasing.  
**Outcome:** Platform generates revenue; students get paid.

### 3.1 Paystack Integration

- [x] Set up Paystack account and API keys
- [x] Create payment service (`apps/api/src/payments/`)
- [x] `POST /api/v1/payments/initialize` — initialize Paystack transaction
- [x] `POST /api/v1/payments/webhook` — handle Paystack webhook (verify signature)
- [x] Implement escrow: fund milestone → hold in platform → release on approval

### 3.2 Wallet & Payouts

- [x] `GET /api/v1/wallet` — student/employer wallet balance
- [x] `POST /api/v1/wallet/withdraw` — request withdrawal (bank transfer / mobile money)
- [x] Process completed milestones → credit student wallet (minus platform fee)
- [x] Implement sliding fee tiers: 20% → 10% → 5% based on `ClientRelationship.lifetimeBillings`
- [x] Transaction history: `GET /api/v1/wallet/transactions`

### 3.3 Connects System

- [x] `GET /api/v1/connects/balance` — student's connect balance
- [x] `POST /api/v1/connects/purchase` — buy connect packs (10/₵5, 20/₵9, 40/₵16 via Paystack)
- [x] Deduct connects on proposal submission (2 default, more for boosted)
- [x] Refund connects on declined proposals
- [x] Monthly free grant (10 connects) + rollover logic (max 80)
- [x] `GET /api/v1/connects/transactions` — connect history

### 3.4 Payments Frontend

- [x] Wire `dashboard/earnings/page.tsx` → wallet balance + transaction history
- [x] Build withdrawal request UI with bank/mobile money form
- [x] Wire `pricing/page.tsx` "Buy Now" → Paystack checkout for connect packs
- [x] Add payment status indicators on milestones (funded / released / pending)
- [ ] Build invoice views for hourly contracts

---

## Phase 4 — Messaging & Notifications

**Goal:** Users can communicate in real-time and receive alerts.  
**Outcome:** Smooth hiring conversations; users stay informed.

### 4.1 Messaging API (`apps/api/src/messaging/`)

- [x] `POST /api/v1/conversations` — start conversation (linked to gig)
- [x] `GET /api/v1/conversations` — user's conversations
- [x] `GET /api/v1/conversations/:id/messages` — message history (paginated)
- [x] `POST /api/v1/conversations/:id/messages` — send message
- [x] WebSocket gateway for real-time message delivery (NestJS `@WebSocketGateway`)
- [x] Mark messages as read
- [ ] File attachment support (link to upload system)

### 4.2 Notifications API (`apps/api/src/notifications/`)

- [x] `GET /api/v1/notifications` — user's notifications (paginated)
- [x] `PATCH /api/v1/notifications/:id/read` — mark as read
- [x] `PATCH /api/v1/notifications/read-all` — mark all read
- [x] Trigger notifications on key events:
  - New proposal received (employer)
  - Proposal status changed (student)
  - New message (both)
  - Milestone submitted/approved/paid
  - Contract started/completed
  - Connect balance low

### 4.3 Messaging Frontend

- [x] Wire `dashboard/messages/page.tsx` → real conversations + WebSocket
- [x] Implement real-time message updates (no page refresh)
- [x] Show unread count in Navbar badge
- [x] Message input with send button + typing indicator

### 4.4 Notifications Frontend

- [x] Wire notification bell in Navbar → `GET /notifications`
- [x] Notification dropdown/panel with real data
- [ ] Click notification → navigate to relevant page
- [x] Mark as read on view

---

## Phase 5 — Reviews, Email & Trust

**Goal:** Build trust through reviews, enable password reset, and send transactional emails.  
**Outcome:** Platform feels professional and trustworthy.

### 5.1 Reviews API (`apps/api/src/reviews/`)

- [x] `POST /api/v1/contracts/:contractId/reviews` — leave review (1-5 stars + comment)
- [x] `GET /api/v1/users/:id/reviews` — public reviews for a user
- [x] Enforce: only after contract completed, within 14-day window, one per side
- [x] Auto-update `ratingAvg` and `ratingCount` on student/employer profiles
- [x] Flag/moderate inappropriate reviews

### 5.2 Email System

- [ ] Set up email provider (e.g., Resend, SendGrid, or AWS SES) — deferred to deployment
- [ ] Create email templates — deferred to deployment
- [x] Wire `auth/forgot-password` → send reset email → verify token → reset password (console.log placeholder for email)
- [x] Build reset-password page (`/auth/reset-password?token=`)
- [ ] Add email verification flow on registration — deferred to deployment

### 5.3 Reports & Disputes

- [x] `POST /api/v1/reports` — report user/content
- [x] `POST /api/v1/contracts/:contractId/disputes` — raise dispute
- [x] `GET /api/v1/disputes/:id` — dispute detail
- [x] `GET /api/v1/disputes` — list user's disputes
- [x] Admin resolution flow (reserve for Phase 7)

### 5.4 Frontend

- [x] Build review submission UI (star picker + comment form) on contract detail page
- [x] Display reviews on profile page (Work History section replaced with live reviews)
- [x] Existing review display with flag option on contract detail page
- [x] Complete forgot-password flow (API + frontend wired)
- [x] Reset-password page with token validation
- [x] Report modal on gig detail page
- [x] Raise Dispute button on contract detail page (active/paused contracts)
- [x] Dispute status banner on disputed contracts
- [ ] Report button on public user profiles (requires Phase 6 public profiles)

---

## Phase 6 — Search, Talent & Discovery

**Goal:** Employers can find students; smart search and filtering works.  
**Outcome:** Two-sided marketplace is fully discoverable.

### 6.1 Talent Search API

- [x] `GET /api/v1/students` — browse student profiles (public, paginated)
- [x] `GET /api/v1/students/:id` — single student public profile
- [x] Filter by: skills, university, rating, hourly rate, availability, talent badge
- [x] Full-text search on name, bio, skills
- [x] Sort by: rating, gigs completed, hourly rate, response time

### 6.2 Saved Items API

- [x] `POST /api/v1/saved-gigs/:gigId` — student saves a gig
- [x] `DELETE /api/v1/saved-gigs/:gigId` — unsave
- [x] `GET /api/v1/saved-gigs` — student's saved gigs
- [x] `POST /api/v1/saved-talent/:studentId` — employer saves student
- [x] `DELETE /api/v1/saved-talent/:studentId` — unsave
- [x] `GET /api/v1/saved-talent` — employer's saved talent

### 6.3 Service Catalog API

- [x] `POST /api/v1/services` — student creates service listing
- [x] `GET /api/v1/services` — browse services (public)
- [x] `GET /api/v1/services/:id` — service detail
- [x] `POST /api/v1/services/:id/order` — employer orders service
- [x] Service order workflow (active → delivered → completed)

### 6.4 Frontend

- [x] Wire `talent/page.tsx` → `GET /students` with real filters
- [x] Wire `dashboard/talent/page.tsx` → employer's saved talent
- [x] Build student public profile page
- [x] Wire save/unsave buttons with real API
- [x] Build service catalog browse and order pages

---

## Phase 7 — Admin Panel & Analytics

**Goal:** Platform operators can manage users, resolve disputes, and monitor KPIs.  
**Outcome:** Platform is operationally sustainable.

### 7.1 Admin API

- [x] Admin authentication (role = `ADMIN`)
- [x] `GET /api/v1/admin/users` — list/search/filter users
- [x] `PATCH /api/v1/admin/users/:id` — suspend, unsuspend, change role
- [x] `GET /api/v1/admin/disputes` — list open disputes
- [x] `PATCH /api/v1/admin/disputes/:id/resolve` — resolve with split/student/employer
- [x] `GET /api/v1/admin/reports` — list reports
- [x] `PATCH /api/v1/admin/reports/:id` — review, take action, dismiss
- [x] `GET /api/v1/admin/stats` — platform KPIs (users, gigs, revenue, etc.)
- [x] Category management: `POST/PATCH/DELETE /api/v1/admin/categories`

### 7.2 Admin Frontend (`apps/admin/` or `apps/web/src/app/admin/`)

- [x] Admin login page
- [x] User management table (search, filter, suspend, view details)
- [x] Dispute resolution interface
- [x] Report review queue
- [x] Platform analytics dashboard (charts: signups, gigs posted, revenue)
- [x] Category management UI
- [x] Financial overview (total escrow, payouts, fees collected)

---

## Phase 8 — Polish & Launch Prep

**Goal:** Platform is production-ready with proper error handling, security, and performance.  
**Outcome:** Ready for real users.

### 8.1 File Uploads

- [x] File upload module with local disk storage (configurable UPLOAD_DIR)
- [x] `POST /api/v1/uploads` — avatar, portfolio, deliverable, attachment endpoints
- [x] File type validation and size limits (2MB avatar, 10MB other)
- [x] Wire avatar upload in profile edit (with preview)
- [x] Wire deliverable uploads in milestone submission (multi-file)
- [x] Path traversal prevention in file serving

### 8.2 Security Hardening

- [x] Rate limiting per-endpoint (global 100/60s, tighter on auth)
- [x] Input sanitization on all text fields (global SanitizeInterceptor with sanitize-html)
- [x] SQL injection review — Prisma ORM handles all queries (no raw queries)
- [x] CSRF — not needed (SPA uses JWT Bearer auth, not cookies)
- [x] Content Security Policy headers (full CSP in Helmet config)
- [x] Audit logging for admin actions (AuditLog model + 6 admin operations logged)

### 8.3 Performance

- [x] Redis caching module (cache-manager-ioredis-yet, global CacheModule)
- [x] Categories endpoint cached (5 min TTL)
- [x] Admin stats cached (2 min TTL)
- [x] Database indexing review — added 12 new indexes (payments, transactions, withdrawals, disputes, reports, connect_transactions)
- [x] Pagination enforced everywhere (max 100 per page)

### 8.4 Deployment

- [x] Dockerfiles for API (multi-stage, non-root user) and Web (standalone Next.js)
- [x] docker-compose.prod.yml with health checks and migration service
- [x] CI/CD pipeline (GitHub Actions: lint, typecheck, build, docker)
- [x] Environment configuration (.env.example with all variables)
- [x] Database migrations strategy (prisma migrate deploy in docker-compose)
- [x] .dockerignore and .gitignore configured

### 8.5 Legal & Compliance

- [x] Terms of Service — reviewed with Ghana governing law (Act 772, Act 843)
- [x] Privacy Policy — references Ghana DPA 2012 (Act 843) throughout
- [x] Cookie consent banner — functional with accept/decline (localStorage)
- [x] Cookie Policy — Ghana governing law clause
- [x] Invoice views for hourly contracts (GET /contracts/:id/invoices + frontend page)
- [x] Payment compliance — Paystack handles PCI DSS

---

## Phase Summary

| Phase | Focus | Estimated Endpoints | Dependencies |
|-------|-------|:---:|---|
| **1** | Wire existing API to frontend | 0 new (use existing 12) | None |
| **2** | Proposals, contracts, milestones | ~15 new | Phase 1 |
| **3** | Payments, wallet, connects | ~12 new | Phase 2 + Paystack account |
| **4** | Messaging, notifications | ~10 new | Phase 1 |
| **5** | Reviews, email, disputes | ~8 new | Phase 2 + email provider |
| **6** | Search, talent, services | ~15 new | Phase 1 |
| **7** | Admin panel | ~10 new | Phases 2-5 |
| **8** | Polish, security, deployment | Infra work | All phases |

**Total new endpoints needed: ~70**  
**Current endpoints: 12**  
**Launch target: ~82 endpoints**

---

## Notes

- Each phase should be completed and tested before moving to the next
- Phase 1 is the foundation — nothing else works without it
- Phases 4, 5, and 6 can run in parallel after Phase 2
- Phase 3 (payments) blocks full contract completion but contracts can be built without it
- Mobile app (React Native Expo) is planned but deferred until web platform is stable
