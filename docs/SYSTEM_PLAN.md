# Intemso — Comprehensive System Plan

> A digital marketplace connecting university students with short-term, flexible work opportunities on campus and nearby.

---

## Table of Contents

1. [Product Vision & Goals](#1-product-vision--goals)
2. [User Personas & Roles](#2-user-personas--roles)
3. [Core Feature Modules](#3-core-feature-modules)
4. [System Architecture](#4-system-architecture)
5. [Tech Stack](#5-tech-stack)
6. [Database Schema](#6-database-schema)
7. [API Design](#7-api-design)
8. [Authentication & Authorization](#8-authentication--authorization)
9. [Payment System](#9-payment-system)
10. [Matching & Search Algorithm](#10-matching--search-algorithm)
11. [Notifications System](#11-notifications-system)
12. [Rating & Review System](#12-rating--review-system)
13. [Admin Panel](#13-admin-panel)
14. [Non-Functional Requirements](#14-non-functional-requirements)
15. [Deployment & Infrastructure](#15-deployment--infrastructure)
16. [Development Phases & Roadmap](#16-development-phases--roadmap)
17. [Risk Analysis & Mitigations](#17-risk-analysis--mitigations)

---

## 1. Product Vision & Goals

### Vision
Empower university students to earn while they learn by providing a trusted, streamlined marketplace for short-term gigs — and give businesses a reliable on-demand talent pool.

### Goals
- **For Students**: Discover flexible work that fits academic schedules, build a portable skills profile, get paid securely and quickly.
- **For Employers**: Post tasks, find vetted student talent fast, manage multiple projects from one dashboard.
- **For the Platform**: Build a sustainable, scalable marketplace with strong network effects on university campuses.

### Key Differentiators
- **Campus-centric**: Geo-scoped to university campuses and surrounding areas.
- **Student-first UX**: Schedule-aware availability, academic calendar integration.
- **Upwork-inspired structure**: Proposals with milestones, connects system, sliding fees, talent levels, service catalog — proven marketplace mechanics adapted for the campus context.
- **Speed**: Streamlined propose → hire → milestone → pay cycle (target: <24h for simple tasks).
- **Trust layer**: University-verified profiles, Job Success Score, talent badges, and milestone-based escrow payments.

---

## 2. User Personas & Roles

### 2.1 Student (Freelancer)
- University-enrolled student seeking flexible income.
- Creates a profile (or multiple specialized profiles) with skills, availability, university, and portfolio.
- Uses **connects** to submit **proposals** on gigs, including proposed milestones and rates.
- Can also list pre-packaged **services** in the Project Catalog for employers to buy directly.
- Earns a **Job Success Score** and **talent badges** based on performance.

### 2.2 Employer (Client)
- Local business owner, entrepreneur, campus organization, faculty, or individual.
- Posts gig/task listings with requirements, budget, and timeline.
- Reviews **proposals**, hires, funds **milestones**, approves deliverables.
- Can also **browse talent** directly and invite students or create direct contracts.

### 2.3 Platform Admin
- Manages users, resolves disputes, moderates content.
- Views analytics dashboards, configures platform settings.
- Handles payouts, compliance, and support escalations.

### 2.4 University Admin (Future Phase)
- Verifies student enrollment status.
- Views aggregate campus employment data.
- Manages university-specific settings and featured employers.

---

## 3. Core Feature Modules

### 3.1 Authentication & Onboarding
| Feature | Description |
|---|---|
| Email/Password Signup | Standard registration with email verification |
| University Email Verification | `.edu` / institutional email verification to confirm student status |
| OAuth Social Login | Google, Apple sign-in for convenience |
| Role Selection | Student vs. Employer onboarding flow |
| Profile Setup Wizard | Guided multi-step profile creation |
| KYC (Employer) | Business verification for employers posting gigs |

### 3.2 Student Profile
| Feature | Description |
|---|---|
| Bio & Photo | Personal introduction and avatar |
| Professional Title | Headline like "UI/UX Design Student" or "Python Developer" |
| Skills & Tags | Searchable skill tags (e.g., "Python", "Graphic Design", "Data Entry") |
| Hourly Rate | Student's base hourly rate (employers see this when browsing talent) |
| Availability Calendar | Weekly schedule showing free hours; sync with academic calendar |
| Portfolio | Upload work samples, links to past projects |
| University & Major | Verified academic info |
| Certifications | Any relevant certs or courses |
| Specialized Profiles | Multiple sub-profiles for different skill areas (e.g., "Writing" and "Tutoring") |
| Connects Balance | Available connects for submitting proposals |
| Job Success Score (JSS) | Algorithmic score (0-100%) based on client feedback, contract outcomes, responsiveness |
| Talent Badge | Rising Talent → Top Rated → Top Rated Plus (based on JSS + earnings + history) |
| Earnings Dashboard | Total earned, pending payments, payment history, earnings by client |
| Rating & Reviews | Aggregate score + individual reviews from employers |
| Service Listings | Pre-packaged services the student offers (Project Catalog) |

### 3.3 Employer Profile
| Feature | Description |
|---|---|
| Business/Org Info | Name, description, logo, website |
| Verification Badge | Verified business status |
| Payment Verified | Has a verified payment method on file |
| Location | Campus proximity / operating area |
| Active Listings | Current open gigs |
| Hiring History | Past hires, completed projects, total money spent |
| Hire Rate | Percentage of posted gigs that resulted in a hire |
| Rating & Reviews | Aggregate score from students |
| Talent Search | Browse and search student profiles, invite to apply or hire directly |
| Project Management Dashboard | Track all postings, proposals, active contracts, milestones, payments |

### 3.4 Gig/Job Postings
| Feature | Description |
|---|---|
| Create Listing | Title, description, category, required skills, budget, timeline, location type (remote/on-site/hybrid) |
| Categories | Typing/Data Entry, Tutoring, Event Assistance, Creative/Design, Tech/Dev, Delivery/Errands, Research, Other |
| Budget Types | **Fixed price** (with milestones) or **Hourly** (with weekly billing) |
| Experience Level | Entry, Intermediate, Expert — helps students self-select |
| Project Scope | Small (<1 week), Medium (1-4 weeks), Large (1-3 months) |
| Application Deadline | Auto-close after date or max proposals |
| Urgency Tag | "ASAP", "This Week", "Flexible" |
| Visibility | Public (all students) or Invite-Only (only invited students can propose) |
| Preferred Qualifications | Min JSS, talent badge, min completed gigs |
| Attachments | Reference files, briefs, requirements docs |
| Questions (Optional) | Screening questions students must answer in their proposal |
| Status Lifecycle | Draft → Open → Reviewing Proposals → Hired → In Progress → Completed → Closed / Disputed |

### 3.5 Search & Discovery
| Feature | Description |
|---|---|
| **Gig Search** | Full-text search by keyword, skill, category |
| Filters | Category, budget range, location, urgency, project scope, experience level, remote/on-site, contract type (fixed/hourly) |
| Sort | Relevance, newest, highest budget, closest deadline, fewest proposals |
| Recommended Gigs | ML-based recommendations from student profile, JSS, & history |
| Saved Searches | Alert students when matching gigs are posted |
| Map View | Gigs plotted on campus/local map |
| **Talent Search** (Employer) | Browse and search student profiles by skill, university, JSS, hourly rate, availability, badge |
| **Service Catalog Search** | Browse pre-packaged student services by category, price, rating, delivery time |

### 3.6 Proposals & Hiring (Upwork Model)
| Feature | Description |
|---|---|
| Submit Proposal | Student spends **connects** to submit a proposal with cover letter, proposed rate, estimated timeline, and optional milestone breakdown |
| Connects Cost | Standard gigs cost 2-4 connects per proposal; featured/boosted gigs cost 6 |
| Boosted Proposals | Student can spend extra connects to boost their proposal to the top of the employer's queue |
| Screening Question Answers | If the gig has screening questions, student answers them in the proposal |
| Proposal Status | Submitted → Viewed → Shortlisted → Interview → Hired / Declined / Withdrawn |
| Employer Review Queue | Side-by-side proposal comparison with skill match %, JSS, rating, portfolio preview |
| Interview (Chat) | Employer can start a conversation with shortlisted students before hiring |
| Direct Hire / Invite | Employer can invite a student to submit a proposal, or send a direct offer without a public gig posting |
| Offer & Negotiate | Employer sends formal offer (rate, milestones, terms); student can accept, decline, or counter |
| Hire | Accepted offer creates a **contract** with milestones and escrow funding |

### 3.7 Connects System
| Feature | Description |
|---|---|
| Free Monthly Connects | Every student receives **10 free connects** per month (resets monthly) |
| Purchase Connects | Students can buy additional packs: 10 for GH₵500, 20 for GH₵900, 40 for GH₵1,600 |
| Connects Refund | If a gig is cancelled or the proposal is declined within 24h, connects are refunded |
| Connects as Spam Prevention | Requiring connects to propose prevents mass low-effort applications |
| Rollover | Unused free connects roll over (max 80 accumulated) |
| Boosted Proposals | Spend 1-4 extra connects to boost proposal visibility |

### 3.8 Student Service Catalog (Project Catalog)
| Feature | Description |
|---|---|
| Service Listing | Student creates a pre-packaged "product" listing: title, description, deliverables, fixed price, delivery time |
| Tiers (Basic/Standard/Premium) | Up to 3 pricing tiers with different scope and deliverables |
| Categories | Same categories as gigs; listed in a browsable catalog |
| Order Flow | Employer browses catalog → selects tier → pays upfront → student delivers |
| No Connects Needed | Employers come to the student — no proposal cost |
| Service Reviews | Separate reviews on each service listing |
| Featured Services | Admin-curated or algorithmically promoted top services |

### 3.9 Talent Levels & Job Success Score
| Feature | Description |
|---|---|
| Job Success Score (JSS) | Algorithmic score (0-100%) calculated from: client feedback, contract outcomes, long-term relationships, responsiveness |
| Rising Talent | New students with strong early performance: ≥1 completed gig, 100% JSS, complete profile |
| Top Rated | ≥90% JSS, ≥10 completed gigs, ≥12 weeks active, ≥GH₵50,000 lifetime earnings |
| Top Rated Plus | By invitation: exceptional JSS, outstanding client feedback, sustained track record |
| Badge Display | Talent badges shown on profile, in proposals, and in search results |
| JSS Recalculation | Recalculated every 2 weeks based on rolling window of recent contracts |
| Private Feedback Weight | Employer's private feedback (not visible to student) weighs heavily in JSS |
| Penalty for Contract Issues | Cancelled contracts, disputes lost, and poor ratings reduce JSS |

### 3.10 Messaging
| Feature | Description |
|---|---|
| In-App Chat | Real-time messaging between student and employer (post-proposal/shortlist) |
| File Sharing | Share documents, images within chat |
| Chat Notifications | Push + in-app notifications for new messages |
| Message Templates | Quick replies for common responses |
| Chat moderation | Flag/report inappropriate messages |

### 3.11 Contracts & Milestones (Upwork Model)
| Feature | Description |
|---|---|
| **Fixed-Price Contracts** | Broken into milestones; employer funds each milestone into escrow before work begins |
| Milestone Definition | Each milestone has: name, description, due date, amount, deliverables |
| Milestone Lifecycle | Funded (escrow) → In Progress → Submitted → Revision Requested → Approved → Paid |
| Milestone Submission | Student submits deliverables per milestone; employer reviews and approves |
| Revision Requests | Employer can request changes (max 2 rounds per milestone) |
| Auto-Approval Timer | If employer doesn't review within 14 days, milestone auto-approves |
| Add Milestones | Either party can propose adding new milestones mid-contract |
| **Hourly Contracts** | Student logs hours worked; employer is billed weekly based on agreed hourly rate |
| Weekly Activity Log | Student reports: hours worked, tasks completed, any notes (simplified work diary) |
| Weekly Limit | Employer sets a max hours/week cap; student cannot exceed without approval |
| Weekly Billing Cycle | Automatic weekly invoice every Monday for the prior week's hours |
| Manual Time Entries | Student logs time entries with description of work done |
| Contract Pause/End | Either party can pause or end the contract at any time; pending milestones can be released or refunded |
| Dispute Flow | Either party can open a dispute on any milestone → Admin mediation |

### 3.12 Payments
| Feature | Description |
|---|---|
| Milestone Escrow | For fixed-price: employer funds each milestone into escrow before student starts work |
| Weekly Billing | For hourly: automatic weekly charge based on logged hours × hourly rate |
| Payment Release | Released to student upon milestone approval or weekly billing cycle |
| Payment Methods (Employer) | Card, bank transfer, USSD, mobile money (via Paystack) |
| Payout Methods (Student) | Bank transfer, mobile money (via Paystack Transfers) |
| Sliding Platform Fee | **20%** on first GH₵100,000 with a client → **10%** on GH₵100,001-GH₵500,000 → **5%** above GH₵500,000 (lifetime billings per client relationship) |
| Invoices & Receipts | Auto-generated for both parties per milestone/week |
| Earnings Wallet | Student wallet with withdrawal options |
| Refund Policy | Unfunded milestones: cancel freely. Funded milestones: per dispute resolution |
| Bonus Payments | Employer can send additional bonus payments outside of contract milestones |

### 3.13 Ratings & Reviews
| Feature | Description |
|---|---|
| Two-Way Reviews | Student rates employer; employer rates student |
| Star Rating (1-5) | Overall quality score |
| Written Review | Text feedback, visible on profile |
| Review Window | 7 days after gig completion to leave review |
| Moderation | Flag inappropriate reviews; admin can remove |
| Aggregate Score | Weighted average displayed on profile |

### 3.14 Notifications
| Feature | Description |
|---|---|
| Push Notifications | Mobile push for key events |
| In-App Notifications | Bell icon with notification feed |
| Email Notifications | Digest emails, critical alerts |
| SMS (Optional) | For payment confirmations, urgent items |
| Notification Preferences | User controls what they receive and via which channel |

### 3.15 Talent Search & Discovery
| Feature | Description |
|---|---|
| Browse Talent | Employers can browse student profiles without posting a gig |
| Search Talent | Search by skills, university, JSS, hourly rate, availability, talent badge |
| Filters | Category expertise, experience level, earnings range, response time, location |
| Sort | Best match, highest rated, most recent, lowest rate |
| Invite to Gig | Invite a browsed student to submit a proposal on an existing gig |
| Direct Offer | Send a direct contract offer to a student without a public gig posting |
| Save Talent | Bookmark student profiles for future reference |

### 3.16 Analytics & Dashboards
| Feature | Description |
|---|---|
| Student Dashboard | Earnings chart, active contracts, proposal pipeline, milestone deadlines, JSS trend, connects balance |
| Employer Dashboard | Active postings, proposal pipeline, active contracts, milestone tracker, spend summary, hire rate |
| Admin Dashboard | Platform KPIs, user growth, revenue, disputes, moderation queue |

### 3.17 Admin Panel
| Feature | Description |
|---|---|
| User Management | View, suspend, ban, verify users |
| Content Moderation | Review flagged listings, messages, reviews |
| Dispute Resolution | View dispute details, communicate with parties, make rulings |
| Financial Overview | Revenue, payouts, escrow balances, refunds |
| Platform Config | Fee percentages, categories, email templates |
| Reports & Export | CSV/PDF export of key data |

---

## 4. System Architecture

### 4.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │  Mobile App   │  │   Web App    │  │   Admin Dashboard     │  │
│  │ (React Native)│  │  (Next.js)   │  │     (Next.js)         │  │
│  └──────┬───────┘  └──────┬───────┘  └───────────┬───────────┘  │
│         │                 │                       │              │
└─────────┼─────────────────┼───────────────────────┼──────────────┘
          │                 │                       │
          ▼                 ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY / LOAD BALANCER                │
│                        (Nginx / AWS ALB)                        │
└──────────────────────────────┬──────────────────────────────────┘
                               │
          ┌────────────────────┼─────────────────────┐
          ▼                    ▼                      ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────────┐
│   Auth Service   │ │   Core API       │ │   Real-time Service  │
│  (JWT + OAuth)   │ │  (Node/Express   │ │   (WebSocket /       │
│                  │ │   or NestJS)     │ │    Socket.io)        │
└────────┬─────────┘ └────────┬─────────┘ └──────────┬───────────┘
         │                    │                      │
         ▼                    ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SERVICE LAYER                             │
│  ┌────────────┐ ┌────────────┐ ┌───────────┐ ┌──────────────┐  │
│  │  User Svc  │ │  Gig Svc   │ │ Payment   │ │ Notification │  │
│  │            │ │            │ │  Svc      │ │    Svc       │  │
│  └────────────┘ └────────────┘ └───────────┘ └──────────────┘  │
│  ┌────────────┐ ┌────────────┐ ┌───────────┐ ┌──────────────┐  │
│  │  Search    │ │  Review    │ │ Messaging │ │  Analytics   │  │
│  │  Svc       │ │  Svc       │ │  Svc      │ │    Svc       │  │
│  └────────────┘ └────────────┘ └───────────┘ └──────────────┘  │
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────┼──────────────────────────────────┐
│                        DATA LAYER                               │
│  ┌────────────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │   PostgreSQL   │  │    Redis     │  │   Object Storage    │  │
│  │  (Primary DB)  │  │  (Cache +    │  │  (S3 / Cloudinary)  │  │
│  │                │  │   Sessions)  │  │  Files & Media      │  │
│  └────────────────┘  └──────────────┘  └─────────────────────┘  │
│  ┌────────────────┐  ┌──────────────┐                           │
│  │  Elasticsearch │  │  Message     │                           │
│  │  (Search)      │  │  Queue       │                           │
│  │                │  │  (Bull/Redis)│                           │
│  └────────────────┘  └──────────────┘                           │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Architecture Principles
- **Modular Monolith first** → Microservices later. Start with a well-structured monolith (NestJS modules) to move fast, split into services when scale demands it.
- **API-first**: All clients consume the same REST + WebSocket API.
- **Event-driven**: Key actions (gig posted, application accepted, payment released) emit events consumed by notification, analytics, and search indexing services.
- **Stateless API servers**: Horizontal scaling via load balancer; session state in Redis.

---

## 5. Tech Stack

### 5.1 Recommended Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Mobile App** | React Native (Expo) | Cross-platform iOS + Android from one codebase; large ecosystem |
| **Web App** | Next.js 14+ (App Router) | SSR/SSG for SEO, React ecosystem, API routes |
| **Admin Panel** | Next.js + Shadcn/UI | Shared stack with web app, rapid development |
| **Backend API** | NestJS (TypeScript) | Modular architecture, built-in DI, guards, interceptors; scales to microservices |
| **Database** | PostgreSQL 16 | Relational integrity for financial data, JSONB for flexible fields |
| **ORM** | Prisma | Type-safe queries, migrations, studio for DB exploration |
| **Cache** | Redis | Session store, caching, rate limiting, job queues |
| **Search** | PostgreSQL full-text (v1) → Elasticsearch (v2) | Start simple, upgrade when needed |
| **Real-time** | Socket.io (via NestJS Gateway) | Chat, live notifications |
| **Job Queue** | BullMQ (Redis-backed) | Background jobs: emails, payment processing, reminders |
| **File Storage** | AWS S3 / Cloudinary | Profile photos, portfolio files, deliverables |
| **Payments** | Paystack | Escrow via Paystack subaccounts, split payments, strong API, excellent African market support |
| **Email** | Resend or SendGrid | Transactional emails |
| **Push Notifications** | Firebase Cloud Messaging (FCM) | Cross-platform push |
| **Auth** | Passport.js (via NestJS) + JWT | Access/refresh token pair, OAuth strategies |
| **Monitoring** | Sentry (errors) + PostHog (analytics) | Error tracking + product analytics |
| **CI/CD** | GitHub Actions | Automated testing, linting, deployment |
| **Hosting** | Railway / Render (v1) → AWS ECS (v2) | Start affordable, scale later |
| **Container** | Docker + Docker Compose | Consistent dev/prod environments |

### 5.2 Monorepo Structure (Turborepo)

```
intemso/
├── apps/
│   ├── web/                  # Next.js web application
│   ├── mobile/               # React Native (Expo) app
│   ├── admin/                # Admin dashboard (Next.js)
│   └── api/                  # NestJS backend
├── packages/
│   ├── shared/               # Shared types, constants, utilities
│   ├── ui/                   # Shared UI component library
│   ├── config/               # Shared ESLint, TS, Prettier configs
│   └── database/             # Prisma schema, migrations, seed
├── docs/                     # System documentation
├── docker-compose.yml
├── turbo.json
├── package.json
└── README.md
```

---

## 6. Database Schema

### 6.1 Entity Relationship Overview

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐
│   User   │────<│ StudentProfile│     │EmployerProfile│
│          │     └──────────────┘     └──────┬───────┘
│          │────<┐                           │
└────┬─────┘     │                           │
     │     ┌─────┴─────┐              ┌──────┴───────┐
     │     │ Application│>────────────│     Gig      │
     │     └─────┬─────┘              └──────┬───────┘
     │           │                           │
     │     ┌─────┴──────┐             ┌──────┴───────┐
     │     │  Contract   │             │  GigCategory │
     │     └─────┬──────┘             └──────────────┘
     │           │
     │     ┌─────┴──────┐    ┌──────────────┐
     │     │  Payment    │    │   Review     │
     │     └────────────┘    └──────────────┘
     │
     │     ┌────────────┐    ┌──────────────┐
     ├────<│  Message    │    │ Notification │
     │     └────────────┘    └──────────────┘
     │
     │     ┌────────────┐
     └────<│   Wallet   │
           └────────────┘
```

### 6.2 Core Tables

```sql
-- ============================================================
-- USERS & PROFILES
-- ============================================================

CREATE TABLE users (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email             VARCHAR(255) UNIQUE NOT NULL,
    password_hash     VARCHAR(255),              -- null for OAuth-only users
    role              VARCHAR(20) NOT NULL CHECK (role IN ('student', 'employer', 'admin')),
    email_verified    BOOLEAN DEFAULT FALSE,
    avatar_url        TEXT,
    is_active         BOOLEAN DEFAULT TRUE,
    is_suspended      BOOLEAN DEFAULT FALSE,
    last_login_at     TIMESTAMPTZ,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE student_profiles (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name        VARCHAR(100) NOT NULL,
    last_name         VARCHAR(100) NOT NULL,
    professional_title VARCHAR(200),             -- e.g., "UI/UX Design Student"
    phone             VARCHAR(20),
    bio               TEXT,
    university        VARCHAR(255) NOT NULL,
    major             VARCHAR(255),
    graduation_year   INTEGER,
    student_id_number VARCHAR(50),
    is_verified       BOOLEAN DEFAULT FALSE,     -- university email verified
    skills            TEXT[] DEFAULT '{}',        -- array of skill tags
    hourly_rate       DECIMAL(10, 2),             -- student's base hourly rate
    portfolio_urls    TEXT[] DEFAULT '{}',
    availability      JSONB DEFAULT '{}',         -- weekly schedule
    location_lat      DECIMAL(10, 8),
    location_lng      DECIMAL(11, 8),
    rating_avg        DECIMAL(3, 2) DEFAULT 0.00,
    rating_count      INTEGER DEFAULT 0,
    job_success_score INTEGER DEFAULT 0,          -- 0-100 JSS
    talent_badge      VARCHAR(20) DEFAULT 'none' CHECK (talent_badge IN (
                        'none', 'rising_talent', 'top_rated', 'top_rated_plus'
                      )),
    total_earned      DECIMAL(12, 2) DEFAULT 0.00,
    gigs_completed    INTEGER DEFAULT 0,
    response_time_hrs DECIMAL(5, 1),              -- avg response time to messages
    on_time_rate      DECIMAL(5, 2) DEFAULT 100.00, -- % of milestones delivered on time
    rehire_rate       DECIMAL(5, 2) DEFAULT 0.00,   -- % of clients who rehire
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE employer_profiles (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_name     VARCHAR(255) NOT NULL,
    business_type     VARCHAR(50),               -- individual, company, campus_org
    description       TEXT,
    website           VARCHAR(500),
    logo_url          TEXT,
    phone             VARCHAR(20),
    contact_person    VARCHAR(200),
    is_verified       BOOLEAN DEFAULT FALSE,
    payment_verified  BOOLEAN DEFAULT FALSE,     -- has verified payment method
    location_address  TEXT,
    location_lat      DECIMAL(10, 8),
    location_lng      DECIMAL(11, 8),
    rating_avg        DECIMAL(3, 2) DEFAULT 0.00,
    rating_count      INTEGER DEFAULT 0,
    total_spent       DECIMAL(12, 2) DEFAULT 0.00,
    gigs_posted       INTEGER DEFAULT 0,
    hire_rate         DECIMAL(5, 2) DEFAULT 0.00,  -- % of gigs that resulted in a hire
    avg_hourly_rate   DECIMAL(10, 2),              -- avg rate paid to students
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- GIGS & CATEGORIES
-- ============================================================

CREATE TABLE categories (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name              VARCHAR(100) UNIQUE NOT NULL,
    slug              VARCHAR(100) UNIQUE NOT NULL,
    icon              VARCHAR(50),
    description       TEXT,
    is_active         BOOLEAN DEFAULT TRUE,
    sort_order        INTEGER DEFAULT 0
);

CREATE TABLE gigs (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id       UUID NOT NULL REFERENCES employer_profiles(id),
    title             VARCHAR(255) NOT NULL,
    description       TEXT NOT NULL,
    category_id       UUID REFERENCES categories(id),
    required_skills   TEXT[] DEFAULT '{}',
    budget_type       VARCHAR(20) NOT NULL CHECK (budget_type IN ('fixed', 'hourly')),
    budget_min        DECIMAL(10, 2),
    budget_max        DECIMAL(10, 2),
    currency          VARCHAR(3) DEFAULT 'GHS',
    location_type     VARCHAR(20) NOT NULL CHECK (location_type IN ('remote', 'on_site', 'hybrid')),
    location_address  TEXT,
    location_lat      DECIMAL(10, 8),
    location_lng      DECIMAL(11, 8),
    experience_level  VARCHAR(20) DEFAULT 'entry' CHECK (experience_level IN ('entry', 'intermediate', 'expert')),
    project_scope     VARCHAR(20) DEFAULT 'small' CHECK (project_scope IN ('small', 'medium', 'large')),
    urgency           VARCHAR(20) DEFAULT 'flexible' CHECK (urgency IN ('asap', 'this_week', 'flexible')),
    duration_hours    INTEGER,                    -- estimated hours to complete
    deadline          TIMESTAMPTZ,
    max_proposals     INTEGER DEFAULT 50,
    visibility        VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'invite_only')),
    screening_questions JSONB DEFAULT '[]',       -- [{question, required}]
    preferred_quals   JSONB DEFAULT '{}',         -- {min_jss, min_badge, min_gigs_completed}
    connects_required INTEGER DEFAULT 2,          -- connects cost to submit proposal
    status            VARCHAR(20) DEFAULT 'draft' CHECK (status IN (
                        'draft', 'open', 'reviewing', 'hired',
                        'in_progress', 'completed', 'closed', 'cancelled'
                      )),
    attachments       JSONB DEFAULT '[]',         -- [{url, name, type}]
    views_count       INTEGER DEFAULT 0,
    proposals_count   INTEGER DEFAULT 0,
    published_at      TIMESTAMPTZ,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gigs_status ON gigs(status);
CREATE INDEX idx_gigs_category ON gigs(category_id);
CREATE INDEX idx_gigs_employer ON gigs(employer_id);
CREATE INDEX idx_gigs_published ON gigs(published_at DESC) WHERE status = 'open';
CREATE INDEX idx_gigs_skills ON gigs USING GIN(required_skills);

-- ============================================================
-- PROPOSALS (replaces Applications — Upwork model)
-- ============================================================

CREATE TABLE proposals (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gig_id            UUID NOT NULL REFERENCES gigs(id),
    student_id        UUID NOT NULL REFERENCES student_profiles(id),
    cover_letter      TEXT NOT NULL,              -- student's pitch
    proposed_rate     DECIMAL(10, 2) NOT NULL,    -- fixed total or hourly rate
    estimated_duration VARCHAR(100),              -- e.g., "3 days", "2 weeks"
    proposed_milestones JSONB DEFAULT '[]',       -- [{title, description, amount, due_date}]
    screening_answers JSONB DEFAULT '[]',         -- [{question, answer}]
    connects_spent    INTEGER NOT NULL DEFAULT 2, -- connects used for this proposal
    is_boosted        BOOLEAN DEFAULT FALSE,      -- boosted with extra connects
    boost_connects    INTEGER DEFAULT 0,          -- extra connects spent on boost
    status            VARCHAR(20) DEFAULT 'submitted' CHECK (status IN (
                        'submitted', 'viewed', 'shortlisted', 'interview',
                        'offer_sent', 'hired', 'declined', 'withdrawn', 'archived'
                      )),
    employer_notes    TEXT,                        -- private notes for employer
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(gig_id, student_id)                   -- one proposal per student per gig
);

CREATE INDEX idx_proposals_gig ON proposals(gig_id, status);
CREATE INDEX idx_proposals_student ON proposals(student_id, status);

-- ============================================================
-- CONTRACTS & MILESTONES (Upwork model)
-- ============================================================

CREATE TABLE contracts (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gig_id            UUID REFERENCES gigs(id),                -- null for direct contracts
    proposal_id       UUID REFERENCES proposals(id),           -- null for direct contracts
    student_id        UUID NOT NULL REFERENCES student_profiles(id),
    employer_id       UUID NOT NULL REFERENCES employer_profiles(id),
    contract_type     VARCHAR(20) NOT NULL CHECK (contract_type IN ('fixed', 'hourly')),
    title             VARCHAR(255) NOT NULL,
    description       TEXT,
    agreed_rate       DECIMAL(10, 2) NOT NULL,    -- total (fixed) or per-hour (hourly)
    currency          VARCHAR(3) DEFAULT 'GHS',
    weekly_limit      INTEGER,                    -- max hours/week for hourly contracts
    fee_tier_snapshot JSONB DEFAULT '{}',         -- {tier, percentage} at contract creation
    status            VARCHAR(20) DEFAULT 'active' CHECK (status IN (
                        'active', 'paused', 'completed', 'disputed', 'cancelled'
                      )),
    is_direct         BOOLEAN DEFAULT FALSE,      -- true if created without a gig posting
    started_at        TIMESTAMPTZ DEFAULT NOW(),
    paused_at         TIMESTAMPTZ,
    completed_at      TIMESTAMPTZ,
    ended_by          UUID REFERENCES users(id),  -- who ended the contract
    end_reason        TEXT,
    lifetime_billings DECIMAL(12, 2) DEFAULT 0.00, -- total billed on this contract
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contracts_student ON contracts(student_id, status);
CREATE INDEX idx_contracts_employer ON contracts(employer_id, status);

CREATE TABLE milestones (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id       UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    title             VARCHAR(255) NOT NULL,
    description       TEXT,
    amount            DECIMAL(10, 2) NOT NULL,
    due_date          TIMESTAMPTZ,
    sort_order        INTEGER DEFAULT 0,
    status            VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
                        'pending',                -- not yet funded
                        'funded',                 -- escrow funded by employer
                        'in_progress',            -- student working on it
                        'submitted',              -- student submitted deliverables
                        'revision_requested',     -- employer requested changes
                        'approved',               -- employer approved
                        'paid',                   -- payment released to student
                        'cancelled',              -- cancelled before completion
                        'disputed'                -- under dispute
                      )),
    deliverables      JSONB DEFAULT '[]',         -- [{url, name, submitted_at}]
    revision_count    INTEGER DEFAULT 0,
    max_revisions     INTEGER DEFAULT 2,
    submitted_at      TIMESTAMPTZ,
    approved_at       TIMESTAMPTZ,
    paid_at           TIMESTAMPTZ,
    auto_approve_at   TIMESTAMPTZ,               -- 14 days after submission
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_milestones_contract ON milestones(contract_id, sort_order);

-- ============================================================
-- HOURLY TIME TRACKING
-- ============================================================

CREATE TABLE time_entries (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id       UUID NOT NULL REFERENCES contracts(id),
    student_id        UUID NOT NULL REFERENCES student_profiles(id),
    description       TEXT NOT NULL,              -- what was worked on
    hours             DECIMAL(5, 2) NOT NULL,
    date_worked       DATE NOT NULL,
    billing_week      DATE NOT NULL,              -- Monday of the billing week
    is_billed         BOOLEAN DEFAULT FALSE,      -- included in weekly invoice
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_time_entries_contract ON time_entries(contract_id, billing_week);

CREATE TABLE weekly_invoices (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id       UUID NOT NULL REFERENCES contracts(id),
    billing_week      DATE NOT NULL,              -- Monday of the billing week
    total_hours       DECIMAL(5, 2) NOT NULL,
    hourly_rate       DECIMAL(10, 2) NOT NULL,
    subtotal          DECIMAL(10, 2) NOT NULL,    -- hours × rate
    platform_fee      DECIMAL(10, 2) NOT NULL,
    status            VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
                        'pending', 'paid', 'failed', 'disputed'
                      )),
    paid_at           TIMESTAMPTZ,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(contract_id, billing_week)
);

-- ============================================================
-- CONNECTS SYSTEM
-- ============================================================

CREATE TABLE connect_balances (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id        UUID UNIQUE NOT NULL REFERENCES student_profiles(id),
    free_connects     INTEGER DEFAULT 10,         -- monthly free allocation
    purchased_connects INTEGER DEFAULT 0,         -- bought connects
    rollover_connects INTEGER DEFAULT 0,          -- unused free connects rolled over (max 80)
    last_refresh_at   TIMESTAMPTZ DEFAULT NOW(),  -- when free connects were last refreshed
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE connect_transactions (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id        UUID NOT NULL REFERENCES student_profiles(id),
    type              VARCHAR(20) NOT NULL CHECK (type IN (
                        'monthly_grant', 'purchase', 'proposal_spent',
                        'proposal_refund', 'boost_spent', 'rollover'
                      )),
    amount            INTEGER NOT NULL,            -- positive = credit, negative = debit
    balance_after     INTEGER NOT NULL,
    reference_id      UUID,                        -- proposal_id or purchase_id
    description       TEXT,
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE connect_purchases (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id        UUID NOT NULL REFERENCES student_profiles(id),
    pack_size         INTEGER NOT NULL,            -- 10, 20, 40
    price             DECIMAL(10, 2) NOT NULL,     -- in GHS
    payment_reference VARCHAR(255),                -- paystack reference
    status            VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
                        'pending', 'completed', 'failed'
                      )),
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STUDENT SERVICE CATALOG (Project Catalog)
-- ============================================================

CREATE TABLE service_listings (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id        UUID NOT NULL REFERENCES student_profiles(id),
    title             VARCHAR(255) NOT NULL,
    description       TEXT NOT NULL,
    category_id       UUID REFERENCES categories(id),
    tags              TEXT[] DEFAULT '{}',
    delivery_days     INTEGER NOT NULL,           -- base delivery time in days
    tiers             JSONB NOT NULL DEFAULT '[]', -- [{name, price, description, deliverables, delivery_days}]
    images            JSONB DEFAULT '[]',          -- [{url, alt}]
    faq               JSONB DEFAULT '[]',          -- [{question, answer}]
    status            VARCHAR(20) DEFAULT 'draft' CHECK (status IN (
                        'draft', 'active', 'paused', 'removed'
                      )),
    is_featured       BOOLEAN DEFAULT FALSE,
    orders_count      INTEGER DEFAULT 0,
    rating_avg        DECIMAL(3, 2) DEFAULT 0.00,
    rating_count      INTEGER DEFAULT 0,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_service_listings_student ON service_listings(student_id);
CREATE INDEX idx_service_listings_category ON service_listings(category_id) WHERE status = 'active';

CREATE TABLE service_orders (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_listing_id UUID NOT NULL REFERENCES service_listings(id),
    employer_id       UUID NOT NULL REFERENCES employer_profiles(id),
    student_id        UUID NOT NULL REFERENCES student_profiles(id),
    tier_selected     VARCHAR(50) NOT NULL,        -- 'basic', 'standard', 'premium'
    amount            DECIMAL(10, 2) NOT NULL,
    requirements      TEXT,                         -- employer's specific requirements
    status            VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
                        'pending', 'active', 'delivered', 'revision_requested',
                        'completed', 'cancelled', 'disputed'
                      )),
    delivery_deadline TIMESTAMPTZ,
    deliverables      JSONB DEFAULT '[]',
    revision_count    INTEGER DEFAULT 0,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SPECIALIZED PROFILES
-- ============================================================

CREATE TABLE specialized_profiles (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id        UUID NOT NULL REFERENCES student_profiles(id),
    title             VARCHAR(200) NOT NULL,       -- e.g., "Academic Tutor", "Frontend Developer"
    overview          TEXT,
    skills            TEXT[] DEFAULT '{}',
    hourly_rate       DECIMAL(10, 2),
    portfolio_urls    TEXT[] DEFAULT '{}',
    is_active         BOOLEAN DEFAULT TRUE,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_specialized_profiles_student ON specialized_profiles(student_id);

-- ============================================================
-- CLIENT RELATIONSHIP TRACKING (for sliding fee)
-- ============================================================

CREATE TABLE client_relationships (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id        UUID NOT NULL REFERENCES student_profiles(id),
    employer_id       UUID NOT NULL REFERENCES employer_profiles(id),
    lifetime_billings DECIMAL(12, 2) DEFAULT 0.00,
    current_fee_tier  VARCHAR(20) DEFAULT 'tier_1' CHECK (current_fee_tier IN (
                        'tier_1', 'tier_2', 'tier_3'
                      )),  -- tier_1: 20%, tier_2: 10%, tier_3: 5%
    contracts_count   INTEGER DEFAULT 0,
    first_contract_at TIMESTAMPTZ,
    last_contract_at  TIMESTAMPTZ,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, employer_id)
);

-- ============================================================
-- PAYMENTS & WALLET
-- ============================================================

CREATE TABLE wallets (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID UNIQUE NOT NULL REFERENCES users(id),
    balance           DECIMAL(12, 2) DEFAULT 0.00,
    pending_balance   DECIMAL(12, 2) DEFAULT 0.00, -- in escrow, not yet released
    currency          VARCHAR(3) DEFAULT 'GHS',
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payments (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id       UUID REFERENCES contracts(id),
    milestone_id      UUID REFERENCES milestones(id),           -- null for hourly payments
    weekly_invoice_id UUID REFERENCES weekly_invoices(id),      -- null for milestone payments
    service_order_id  UUID REFERENCES service_orders(id),       -- null for contract payments
    payer_id          UUID NOT NULL REFERENCES users(id),       -- employer
    payee_id          UUID NOT NULL REFERENCES users(id),       -- student
    amount            DECIMAL(10, 2) NOT NULL,
    platform_fee      DECIMAL(10, 2) NOT NULL,
    fee_percentage    DECIMAL(5, 2) NOT NULL,                   -- actual % charged (sliding fee)
    net_amount        DECIMAL(10, 2) NOT NULL,                  -- amount - platform_fee
    currency          VARCHAR(3) DEFAULT 'GHS',
    type              VARCHAR(20) NOT NULL CHECK (type IN (
                        'milestone_escrow', 'milestone_release',
                        'hourly_weekly', 'service_order', 'bonus', 'refund'
                      )),
    status            VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
                        'pending', 'escrow', 'released', 'refunded',
                        'partially_refunded', 'failed'
                      )),
    payment_method    VARCHAR(50),                              -- paystack, bank_transfer, etc.
    external_txn_id   VARCHAR(255),                             -- paystack reference
    escrow_at         TIMESTAMPTZ,
    released_at       TIMESTAMPTZ,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE transactions (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id         UUID NOT NULL REFERENCES wallets(id),
    payment_id        UUID REFERENCES payments(id),
    type              VARCHAR(20) NOT NULL CHECK (type IN (
                        'credit', 'debit', 'withdrawal', 'refund',
                        'fee', 'connects_purchase', 'bonus'
                      )),
    amount            DECIMAL(10, 2) NOT NULL,
    balance_after     DECIMAL(12, 2) NOT NULL,
    description       TEXT,
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE withdrawals (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id         UUID NOT NULL REFERENCES wallets(id),
    user_id           UUID NOT NULL REFERENCES users(id),
    amount            DECIMAL(10, 2) NOT NULL,
    destination       JSONB NOT NULL,             -- {method, bank_code, account_number, account_name}
    status            VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
                        'pending', 'processing', 'completed', 'failed'
                      )),
    external_txn_id   VARCHAR(255),               -- paystack transfer reference
    processed_at      TIMESTAMPTZ,
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MESSAGING
-- ============================================================

CREATE TABLE conversations (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gig_id            UUID REFERENCES gigs(id),
    participant_ids   UUID[] NOT NULL,            -- [user_id_1, user_id_2]
    last_message_at   TIMESTAMPTZ,
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id   UUID NOT NULL REFERENCES conversations(id),
    sender_id         UUID NOT NULL REFERENCES users(id),
    content           TEXT NOT NULL,
    attachments       JSONB DEFAULT '[]',
    is_read           BOOLEAN DEFAULT FALSE,
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);

-- ============================================================
-- REVIEWS
-- ============================================================

CREATE TABLE reviews (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id       UUID NOT NULL REFERENCES contracts(id),
    reviewer_id       UUID NOT NULL REFERENCES users(id),
    reviewee_id       UUID NOT NULL REFERENCES users(id),
    rating            INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment           TEXT,
    is_flagged        BOOLEAN DEFAULT FALSE,
    is_visible        BOOLEAN DEFAULT TRUE,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(contract_id, reviewer_id)              -- one review per user per contract
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES users(id),
    type              VARCHAR(50) NOT NULL,        -- 'new_application', 'gig_accepted', etc.
    title             VARCHAR(255) NOT NULL,
    body              TEXT,
    data              JSONB DEFAULT '{}',          -- action URL, entity IDs, etc.
    is_read           BOOLEAN DEFAULT FALSE,
    channel           VARCHAR(20) DEFAULT 'in_app', -- in_app, push, email
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

-- ============================================================
-- DISPUTES
-- ============================================================

CREATE TABLE disputes (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id       UUID NOT NULL REFERENCES contracts(id),
    raised_by         UUID NOT NULL REFERENCES users(id),
    reason            TEXT NOT NULL,
    evidence          JSONB DEFAULT '[]',          -- [{url, description}]
    status            VARCHAR(20) DEFAULT 'open' CHECK (status IN (
                        'open', 'under_review', 'resolved_student',
                        'resolved_employer', 'resolved_split', 'closed'
                      )),
    admin_notes       TEXT,
    resolved_by       UUID REFERENCES users(id),
    resolved_at       TIMESTAMPTZ,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SAVED / BOOKMARKED GIGS
-- ============================================================

CREATE TABLE saved_gigs (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id        UUID NOT NULL REFERENCES student_profiles(id),
    gig_id            UUID NOT NULL REFERENCES gigs(id),
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, gig_id)
);

CREATE TABLE saved_talent (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id       UUID NOT NULL REFERENCES employer_profiles(id),
    student_id        UUID NOT NULL REFERENCES student_profiles(id),
    notes             TEXT,                        -- private employer notes on this student
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employer_id, student_id)
);

-- ============================================================
-- REPORTS (Content Moderation)
-- ============================================================

CREATE TABLE reports (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id       UUID NOT NULL REFERENCES users(id),
    reported_entity   VARCHAR(50) NOT NULL,        -- 'user', 'gig', 'message', 'review'
    reported_id       UUID NOT NULL,
    reason            TEXT NOT NULL,
    status            VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
                        'pending', 'reviewed', 'action_taken', 'dismissed'
                      )),
    admin_notes       TEXT,
    created_at        TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 7. API Design

### 7.1 API Conventions
- **Base URL**: `https://api.intemso.com/v1`
- **Format**: JSON request/response
- **Auth**: Bearer token (JWT) in Authorization header
- **Pagination**: Cursor-based (`?cursor=xxx&limit=20`)
- **Errors**: Consistent error envelope `{ error: { code, message, details } }`
- **Rate Limiting**: 100 req/min (standard), 20 req/min (auth endpoints)

### 7.2 Endpoint Map

#### Auth
```
POST   /auth/register              # Register new user
POST   /auth/login                 # Login → access + refresh tokens
POST   /auth/refresh               # Refresh access token
POST   /auth/logout                # Invalidate refresh token
POST   /auth/forgot-password       # Send reset email
POST   /auth/reset-password        # Reset with token
POST   /auth/verify-email          # Verify email with code/token
POST   /auth/oauth/google          # Google OAuth callback
POST   /auth/oauth/apple           # Apple OAuth callback
```

#### Users & Profiles
```
GET    /users/me                   # Get current user
PATCH  /users/me                   # Update current user
DELETE /users/me                   # Deactivate account

GET    /students/:id               # Get student profile (public)
PUT    /students/me                # Update student profile
PATCH  /students/me/availability   # Update availability
POST   /students/me/portfolio      # Upload portfolio item

GET    /employers/:id              # Get employer profile (public)
PUT    /employers/me               # Update employer profile
```

#### Gigs
```
POST   /gigs                       # Create new gig (employer)
GET    /gigs                       # List/search gigs (filterable)
GET    /gigs/:id                   # Get gig details
PATCH  /gigs/:id                   # Update gig (employer, owner)
DELETE /gigs/:id                   # Delete draft gig
POST   /gigs/:id/publish           # Publish gig (draft → open)
POST   /gigs/:id/close             # Close gig (employer)
POST   /gigs/:id/invite/:studentId # Invite student to propose on this gig

GET    /gigs/recommended           # ML-recommended gigs for student
GET    /gigs/categories            # List all categories
```

#### Proposals (replaces Applications)
```
POST   /gigs/:gigId/proposals             # Submit proposal (costs connects)
GET    /gigs/:gigId/proposals             # List proposals (employer, owner)
GET    /proposals/me                       # My proposals (student)
GET    /proposals/:id                      # Get proposal detail
PATCH  /proposals/:id/status              # Update status (employer: shortlist/interview/decline)
DELETE /proposals/:id                      # Withdraw proposal (student, refunds connects if < 24h)
POST   /proposals/:id/offer               # Send offer to student (employer)
POST   /proposals/:id/accept-offer        # Accept offer → creates contract (student)
POST   /proposals/:id/counter-offer       # Counter the offer terms (student)
```

#### Contracts & Milestones
```
POST   /contracts                          # Create contract (from accepted offer or direct hire)
GET    /contracts                          # List my contracts
GET    /contracts/:id                      # Get contract details
PATCH  /contracts/:id/pause                # Pause contract
PATCH  /contracts/:id/resume               # Resume paused contract
POST   /contracts/:id/end                  # End contract (either party)

# Milestones (fixed-price contracts)
POST   /contracts/:id/milestones           # Add milestone
PATCH  /milestones/:id                     # Update milestone details
POST   /milestones/:id/fund               # Fund milestone escrow (employer)
POST   /milestones/:id/submit             # Submit deliverables (student)
POST   /milestones/:id/approve            # Approve milestone → release payment (employer)
POST   /milestones/:id/request-revision   # Request revision (employer)
POST   /milestones/:id/dispute            # Open dispute on milestone

# Hourly time tracking
POST   /contracts/:id/time-entries         # Log time entry (student)
GET    /contracts/:id/time-entries         # List time entries
PATCH  /time-entries/:id                   # Update time entry
DELETE /time-entries/:id                   # Delete time entry (before billed)
GET    /contracts/:id/invoices             # List weekly invoices
```

#### Connects
```
GET    /connects/balance                   # Get current connects balance
POST   /connects/purchase                  # Buy connects pack
GET    /connects/transactions              # Connects transaction history
```

#### Student Service Catalog
```
POST   /services                           # Create service listing (student)
GET    /services                           # Browse service catalog (public)
GET    /services/:id                       # Get service details
PATCH  /services/:id                       # Update service listing (student, owner)
DELETE /services/:id                       # Remove service listing

POST   /services/:id/order                 # Place order (employer)
GET    /service-orders/me                  # My service orders
GET    /service-orders/:id                 # Get order details
POST   /service-orders/:id/deliver         # Submit delivery (student)
POST   /service-orders/:id/approve         # Approve delivery (employer)
POST   /service-orders/:id/request-revision # Request revision (employer)
```

#### Talent Search (Employer browses students)
```
GET    /talent                             # Search/browse student profiles
GET    /talent/:studentId                  # View student public profile
POST   /talent/:studentId/invite           # Invite student to gig or direct offer
POST   /talent/:studentId/direct-offer     # Send direct contract offer (no gig posting)
POST   /talent/:studentId/save             # Bookmark student profile
GET    /talent/saved                       # List saved/bookmarked students
```

#### Payments
```
POST   /payments/fund-milestone            # Fund milestone escrow (employer)
GET    /payments/:id                       # Get payment details
GET    /payments/history                   # Payment history
POST   /payments/bonus                     # Send bonus payment (employer)

GET    /wallet                             # Get wallet balance (incl. pending)
POST   /wallet/withdraw                    # Request withdrawal
GET    /wallet/transactions                # Transaction history
GET    /wallet/earnings-by-client          # Earnings breakdown per client (shows fee tier)
```

#### Messaging
```
GET    /conversations                      # List my conversations
GET    /conversations/:id/messages         # Get messages (paginated)
POST   /conversations/:id/messages         # Send message
POST   /conversations                      # Start conversation (gig context)
```

#### Reviews
```
POST   /reviews                            # Leave review
GET    /users/:id/reviews                  # Get reviews for a user
```

#### Notifications
```
GET    /notifications                      # Get my notifications
PATCH  /notifications/:id/read             # Mark as read
POST   /notifications/read-all             # Mark all as read
PUT    /notifications/preferences          # Update notification preferences
```

#### Admin
```
GET    /admin/users                        # List all users (filterable)
PATCH  /admin/users/:id                    # Suspend/ban/verify user
GET    /admin/disputes                     # List disputes
PATCH  /admin/disputes/:id                 # Resolve dispute
GET    /admin/reports                      # List reports
PATCH  /admin/reports/:id                  # Review report
GET    /admin/analytics                    # Platform analytics
GET    /admin/financial/overview           # Financial dashboard data
```

#### File Upload
```
POST   /uploads/image                      # Upload image (avatar, portfolio)
POST   /uploads/file                       # Upload file (deliverable, attachment)
DELETE /uploads/:id                        # Delete uploaded file
```

---

## 8. Authentication & Authorization

### 8.1 Auth Flow
```
Registration → Email Verification → Login → JWT (Access + Refresh)

Access Token:  Short-lived (15 min), stored in memory (mobile) / httpOnly cookie (web)
Refresh Token: Long-lived (7 days), stored in httpOnly cookie, rotated on use
```

### 8.2 Authorization Model (RBAC)
```
Role: student
  - Manage own profile + specialized profiles
  - Browse/search gigs
  - Submit proposals (costs connects)
  - Manage own proposals (withdraw, counter-offer)
  - Manage milestones on own contracts (submit deliverables)
  - Log time entries on own hourly contracts
  - Send messages in own conversations
  - Leave reviews on own contracts
  - Manage own wallet/withdrawals
  - Create and manage service listings
  - Manage connects (view, purchase)

Role: employer
  - Manage own profile
  - CRUD own gigs
  - Review proposals on own gigs
  - Shortlist/interview/decline/send offers to proposers
  - Browse and search talent profiles
  - Send direct offers and invitations
  - Fund milestones on own contracts
  - Approve milestones / request revisions
  - Set weekly hour limits on hourly contracts
  - Order from student service catalog
  - Send bonus payments
  - Send messages in own conversations
  - Leave reviews on own contracts

Role: admin
  - All student + employer permissions
  - Manage all users (suspend, ban, verify)
  - Moderate content (gigs, messages, reviews)
  - Resolve disputes
  - View analytics & financial data
  - Configure platform settings
```

### 8.3 Security Measures
- Password hashing: **bcrypt** (cost factor 12)
- Rate limiting on auth endpoints (brute-force protection)
- Account lockout after 5 failed login attempts (15 min cooldown)
- CSRF protection (double-submit cookie for web)
- Input sanitization and validation (class-validator in NestJS)
- SQL injection prevention (Prisma parameterized queries)
- XSS prevention (React auto-escaping + CSP headers)
- CORS whitelist for known origins
- Helmet.js for HTTP security headers
- File upload validation (type, size, malware scan)

---

## 9. Payment System

### 9.1 Payment Flow

#### Fixed-Price Contracts (Milestone-Based)
```
1. Employer posts gig → sets budget
2. Student submits proposal with proposed milestones and rate (spends connects)
3. Employer reviews proposals → sends offer (possibly with adjusted milestones)
4. Student accepts offer → Contract created with milestones
5. For each milestone:
   a. Employer funds milestone escrow → Paystack charge → hold funds
   b. Student works on milestone → submits deliverables
   c. Employer reviews:
      - Approve → payment released (amount - sliding platform fee → student wallet)
      - Request revision → student resubmits (max 2 rounds)
      - No action in 14 days → auto-approve
6. All milestones complete → contract marked as completed
7. Student withdraws from wallet → bank / mobile money
```

#### Hourly Contracts (Weekly Billing)
```
1. Student logs time entries daily with work descriptions
2. Every Monday, system generates weekly invoice:
   invoice = hours_logged × agreed_hourly_rate
3. Employer is auto-charged via Paystack for the weekly invoice
4. Payment split: student receives (amount - sliding fee) → wallet
5. Employer can review time logs and dispute within 7 days
6. Contract continues until either party ends it
```

#### Service Catalog Orders
```
1. Employer browses student service catalog → selects tier
2. Employer pays full amount upfront → Paystack charge → escrow
3. Student delivers within stated delivery time
4. Employer approves → payment released (minus platform fee)
```

### 9.2 Sliding Fee Structure (Upwork Model)
| Lifetime Billings with Client | Platform Fee | Example |
|---|---|---|
| First GH₵100,000 | **20%** | Student earns GH₵80,000 on GH₵100,000 billed |
| GH₵100,001 - GH₵500,000 | **10%** | Student earns GH₵90,000 on next GH₵100,000 billed |
| Above GH₵500,000 | **5%** | Student earns GH₵95,000 on next GH₵100,000 billed |

- Fee is tracked **per student-employer pair** (lifetime billings relationship).
- Encourages long-term relationships and higher-value work.
- The `client_relationships` table tracks billings and current fee tier.
- Fee snapshot is stored on each contract for audit trail.

| Other Fees | Amount |
|---|---|
| Payment processing (Paystack) | ~1.5% + GH₵100 (absorbed by platform on v1) |
| Withdrawal fee | Free for bank transfer |
| Refund (unfunded milestone) | Cancel freely |
| Refund (funded milestone, dispute) | Per admin ruling (full, partial, or split) |
| Connects pack (10) | GH₵500 |
| Connects pack (20) | GH₵900 |
| Connects pack (40) | GH₵1,600 |

### 9.3 Escrow Implementation
- **Paystack Subaccounts + Split Payments**:
  - Employer pays → funds held in platform's Paystack account (escrow)
  - On milestone approval → Transfer to student via Paystack Transfers API
  - Sliding fee calculated per client relationship and deducted at transfer time
- **Paystack Features Used**:
  - **Charge API**: Card, bank transfer, USSD, mobile money (milestone funding, hourly billing, service orders)
  - **Transfers API**: Automated payouts to student bank accounts
  - **Subaccounts**: Each student linked as a subaccount for split payments
  - **Recurring Charges**: For hourly contract weekly billing
  - **Webhooks**: Real-time payment status updates (charge.success, transfer.success, etc.)
  - **Refunds API**: Programmatic refunds for disputes
  - **Transaction Splits**: Auto-split platform fee at charge time

---

## 10. Matching & Search Algorithm

### 10.1 Search (v1 — PostgreSQL Full-Text)
```sql
-- Gig search with full-text + filters
SELECT g.*, ts_rank(to_tsvector('english', g.title || ' ' || g.description), query) AS rank
FROM gigs g, plainto_tsquery('english', :search_term) query
WHERE g.status = 'open'
  AND to_tsvector('english', g.title || ' ' || g.description) @@ query
  AND (:category IS NULL OR g.category_id = :category)
  AND (:min_budget IS NULL OR g.budget_max >= :min_budget)
  AND (:location_type IS NULL OR g.location_type = :location_type)
ORDER BY rank DESC, g.published_at DESC
LIMIT :limit OFFSET :offset;
```

### 10.2 Recommendation Engine (v2)
- **Collaborative filtering**: Students who applied to X also applied to Y
- **Content-based**: Match student skills to gig required_skills (Jaccard similarity)
- **Recency + urgency boost**: Weight recently posted and urgent gigs higher
- **Proximity scoring**: Gigs closer to student's campus ranked higher
- **Personalization signals**: Past categories, accepted gig types, saved gigs

### 10.3 Employer-Side Candidate Ranking
- Skill match score (% overlap between required and student skills)
- Job Success Score (JSS)
- Talent badge level (Top Rated Plus > Top Rated > Rising Talent)
- Gigs completed count
- Response time (how fast they typically respond)
- Hourly rate vs. gig budget alignment
- University verification status
- Rehire rate and long-term relationship signals

---

## 11. Notifications System

### 11.1 Event → Notification Mapping

| Event | Recipient | Channels |
|---|---|---|
| New gig matches your skills | Student | Push, In-App |
| Invitation to propose on gig | Student | Push, In-App, Email |
| Direct offer received | Student | Push, In-App, Email |
| New proposal received | Employer | Push, In-App, Email |
| Proposal viewed by employer | Student | In-App |
| Proposal shortlisted | Student | Push, In-App |
| Offer sent | Student | Push, In-App, Email |
| Offer accepted → contract started | Employer | Push, In-App, Email |
| Proposal declined | Student | In-App |
| Milestone funded (escrow) | Student | Push, In-App |
| Milestone submitted | Employer | Push, In-App, Email |
| Milestone approved + paid | Student | Push, In-App, Email |
| Revision requested on milestone | Student | Push, In-App |
| New message | Both | Push, In-App |
| Weekly timesheet submitted | Employer | In-App, Email |
| Weekly invoice charged | Both | In-App, Email |
| Payment released to wallet | Student | Push, In-App, Email |
| New review | Both | In-App |
| JSS updated | Student | In-App |
| Talent badge earned | Student | Push, In-App, Email |
| Connects running low (<3) | Student | In-App |
| Monthly connects refreshed | Student | In-App |
| Service order received | Student | Push, In-App, Email |
| Dispute opened | Both + Admin | Email, In-App |
| Dispute resolved | Both | Push, In-App, Email |
| Milestone auto-approve warning (48h) | Employer | Push, In-App, Email |
| Milestone deadline approaching | Student | Push, In-App |

### 11.2 Implementation
- **Event bus**: NestJS EventEmitter (v1) → RabbitMQ (v2)
- **Notification service** subscribes to events, creates notification records, dispatches to channels
- **Push**: FCM for mobile, Web Push API for browser
- **Email**: Queued via BullMQ → Resend/SendGrid
- **In-App**: Stored in `notifications` table, delivered via WebSocket for real-time

---

## 12. Rating & Review System

### 12.1 Rules
- Reviews are **two-way**: both student and employer review each other after contract completion.
- **Window**: 14 days after contract marked as completed.
- Reviews are **blind**: neither party sees the other's review until both submit (or window closes).
- **Minimum content**: Rating (1-5 stars) required; written comment optional but encouraged.
- **Private Feedback**: Employer also provides private feedback (not visible to student) — this feeds into JSS.
- **Aggregate**: Weighted average (recent reviews weighted more).
- **Moderation**: Users can flag reviews → admin reviews and may hide/remove.

### 12.2 Job Success Score (JSS)
Algorithmic score (0-100%) calculated biweekly from:
- **Client feedback** (public rating + private feedback) — heaviest weight
- **Contract outcomes**: completed vs. cancelled/disputed ratio
- **Rehire rate**: % of clients who contract you again
- **Long-term relationships**: sustained work with same client is positive signal
- **Responsiveness**: response time to messages and proposals
- **On-time delivery**: % of milestones delivered by due date
- **Penalties**: Each dispute lost or contract cancelled by student reduces score

### 12.3 Talent Badges
| Badge | Criteria |
|---|---|
| **Rising Talent** | ≥1 completed gig, 100% JSS, complete profile, university verified |
| **Top Rated** | ≥90% JSS, ≥10 completed gigs, ≥12 weeks active, ≥GH₵50,000 lifetime earnings |
| **Top Rated Plus** | By invitation: exceptional JSS, outstanding private feedback, ≥GH₵200,000 lifetime earnings |

### 12.4 Trust Score (Future)
Composite score combining:
- Average rating
- Number of completed gigs
- Response rate
- On-time delivery rate
- University verification
- Account age

---

## 13. Admin Panel

### 13.1 Dashboard Sections

**Overview**
- Total users (students, employers), new signups (7d/30d)
- Active gigs, total completed, total revenue
- Disputes (open, resolved this month)
- Quick action buttons

**User Management**
- Searchable user table with filters (role, status, verified)
- User detail view: profile, gig history, reviews, financials
- Actions: verify, suspend, ban, reset password, impersonate (view-as)

**Gig Management**
- All gigs with status filters
- Flagged/reported gigs queue
- Ability to close or remove gigs

**Financial**
- Revenue chart (daily/weekly/monthly)
- Payout queue
- Escrow balance
- Refund requests

**Disputes**
- List with status filter
- Detail view: contract, messages, evidence
- Resolution tools: full refund, partial refund, split, dismiss

**Content Moderation**
- Reports queue (users, gigs, messages, reviews)
- Review and take action

---

## 14. Non-Functional Requirements

### 14.1 Performance
| Metric | Target |
|---|---|
| API response time (p95) | < 200ms |
| Page load time | < 2s (web), < 1.5s (mobile) |
| Search results | < 500ms |
| WebSocket message delivery | < 100ms |
| Concurrent users (v1) | 5,000 |
| Database queries | Optimized with indexes, no N+1 |

### 14.2 Scalability
- Horizontal scaling of API servers behind load balancer
- Database read replicas for read-heavy queries
- Redis cluster for caching and sessions
- CDN for static assets and media
- Queue-based processing for heavy operations

### 14.3 Reliability
- 99.9% uptime SLA target
- Database backups: daily full + continuous WAL archiving
- Health checks and auto-restart
- Graceful degradation (if search down, fall back to basic SQL)

### 14.4 Security
- SOC 2 awareness (even if not certified yet)
- Ghana Data Protection Act 2012 (Act 843) compliant: data export, deletion, consent management
- PCI DSS compliance via Paystack (no raw card data stored)
- Penetration testing before launch
- Dependency vulnerability scanning (Snyk / npm audit)

### 14.5 Observability
- **Logging**: Structured JSON logs → aggregated (e.g., Axiom, Datadog)
- **Metrics**: Request rate, error rate, latency (Prometheus + Grafana or cloud equivalent)
- **Tracing**: Distributed tracing for request lifecycle
- **Alerting**: PagerDuty / Slack alerts for errors > threshold, downtime
- **Error tracking**: Sentry with source maps

---

## 15. Deployment & Infrastructure

### 15.1 Environments
| Environment | Purpose | URL |
|---|---|---|
| Local | Developer machines | localhost:3000 / 3001 |
| Staging | QA, pre-release testing | staging.intemso.com |
| Production | Live users | app.intemso.com / api.intemso.com |

### 15.2 CI/CD Pipeline
```
Push to main branch
  └── GitHub Actions
       ├── Lint (ESLint + Prettier)
       ├── Type Check (tsc --noEmit)
       ├── Unit Tests (Jest/Vitest)
       ├── Integration Tests
       ├── Build (all apps)
       ├── Docker Image Build + Push
       └── Deploy to Staging
            └── Manual approval → Deploy to Production
```

### 15.3 Infrastructure (Phase 1 — Cost-Effective)
```
┌────────────────────────────────────────────────────┐
│  Cloudflare (DNS + CDN + DDoS Protection)          │
├────────────────────────────────────────────────────┤
│  Vercel (Next.js Web + Admin)                      │
├────────────────────────────────────────────────────┤
│  Railway / Render (NestJS API + Workers)           │
├────────────────────────────────────────────────────┤
│  Neon / Supabase (Managed PostgreSQL)              │
├────────────────────────────────────────────────────┤
│  Upstash (Managed Redis)                           │
├────────────────────────────────────────────────────┤
│  Cloudinary / S3 (File Storage)                    │
├────────────────────────────────────────────────────┤
│  Expo EAS (Mobile Builds & OTA Updates)            │
└────────────────────────────────────────────────────┘
```

### 15.4 Infrastructure (Phase 2 — Scaled)
- AWS ECS (Fargate) for containerized API
- AWS RDS for PostgreSQL
- AWS ElastiCache for Redis
- AWS S3 + CloudFront for files
- Elasticsearch Service for search
- Terraform for IaC

---

## 16. Development Phases & Roadmap

### Phase 1 — MVP (Weeks 1-10)
**Goal**: Core Upwork-style marketplace loop — post gig, propose, hire, milestones, pay.

| Week | Focus |
|---|---|
| 1-2 | Project setup (monorepo, CI/CD, Docker), DB schema, Auth module |
| 3-4 | Student + Employer profiles, Gig CRUD, Categories |
| 5-6 | Proposals (with connects), Contracts, Milestones, Basic search |
| 7-8 | Milestone escrow payments (Paystack), Wallet, Sliding fee engine |
| 9 | Messaging, Reviews (with private feedback), In-app notifications |
| 10 | Hourly contracts + time tracking + weekly billing, Testing, Bug fixes |

**MVP Deliverables**:
- [x] User registration + email verification
- [x] Student & Employer profile creation
- [x] Gig posting + browsing + search
- [x] Proposal flow with connects (submit, shortlist, offer, hire)
- [x] Fixed-price contracts with milestone escrow
- [x] Hourly contracts with time tracking + weekly billing
- [x] Sliding fee structure per client relationship
- [x] Wallet + withdrawal via Paystack Transfers
- [x] Basic messaging
- [x] Star ratings + reviews + private feedback
- [x] In-app notifications
- [x] Responsive web app

### Phase 2 — Enhanced (Weeks 11-16)
**Goal**: Mobile app, service catalog, talent search, admin tools.

| Week | Focus |
|---|---|
| 11-12 | React Native mobile app (core flows) |
| 13 | Student Service Catalog (Project Catalog) with tier pricing |
| 14 | Talent search + browse + direct offers/invites |
| 15 | Admin panel, Dispute resolution, Content moderation |
| 16 | Push notifications (FCM), Email notifications, Polish |

### Phase 3 — Growth (Weeks 17-22)
**Goal**: JSS, talent badges, smart features, campus expansion.

| Week | Focus |
|---|---|
| 17-18 | Job Success Score algorithm + Talent badges (Rising Talent, Top Rated) |
| 19 | Specialized profiles, Boosted proposals |
| 20 | Recommendation engine, Auto-match, Saved searches |
| 21 | University admin portal, Enrollment verification API |
| 22 | Analytics dashboards (PostHog), Performance optimization, Load testing |

### Phase 4 — Expansion (Weeks 23+)
- Multi-campus rollout tools
- Employer subscription plans (premium listings, analytics, reduced fees)
- Top Rated Plus program (invitation-based)
- Agency accounts (groups of students working together)
- API for university career services integration
- Mobile app v2 (offline support, biometric auth)
- Internationalization (i18n)
- Connects gifting / referral connects
- Employer-side talent pools (save and organize favorite students)

---

## 17. Risk Analysis & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Low initial user adoption | High | Medium | Launch on one campus, seed with campus partnerships, offer launch incentives |
| Payment fraud | High | Low | Escrow model, KYC for employers, transaction monitoring |
| Student safety concerns | High | Low | Verified profiles, in-app messaging only, reporting system, no personal contact info exposure |
| Employer posts spam/scam gigs | Medium | Medium | Gig review queue (manual initially), ML-based fraud detection later |
| Payment processor issues | High | Low | Paystack as primary processor, manual bank transfer fallback |
| Connects system friction | Medium | Medium | Generous free monthly connects (10), low cost per proposal (2-4), refunds on cancelled gigs, clear value communication |
| Dispute overload | Medium | Medium | Clear ToS, 14-day auto-approve timer, milestone-based disputes (granular), structured dispute process |
| Competition from general platforms (Fiverr, Upwork) | Medium | High | Campus-specific features (proximity, .edu verification, schedule integration) + lower fees for students at entry level + connects system tailored to campus economy |
| Data breach | Critical | Low | Encryption at rest + in transit, security audits, minimal PII storage, Paystack handles card data |
| Regulatory / labor law compliance | High | Medium | Legal review of contractor classification, clear terms that students are independent contractors |

---

## Appendix A: Gig Categories (Seed Data)

| Category | Slug | Icon |
|---|---|---|
| Typing & Data Entry | typing-data-entry | ⌨️ |
| Tutoring & Academic Help | tutoring | 📚 |
| Event Assistance | events | 🎪 |
| Creative & Design | creative-design | 🎨 |
| Tech & Development | tech-dev | 💻 |
| Writing & Content | writing-content | ✍️ |
| Delivery & Errands | delivery-errands | 🚴 |
| Research & Surveys | research | 🔬 |
| Photography & Video | photo-video | 📸 |
| Social Media & Marketing | social-marketing | 📱 |
| Administrative & Office | admin-office | 📋 |
| Translation & Languages | translation | 🌍 |
| Music & Performance | music-performance | 🎵 |
| Cleaning & Organizing | cleaning | 🧹 |
| Other | other | ➕ |

---

## Appendix B: Environment Variables

```env
# App
NODE_ENV=development
PORT=3001
API_URL=http://localhost:3001
WEB_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000,http://localhost:8081

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/intemso

# Redis
REDIS_URL=redis://localhost:6379

# Auth
JWT_ACCESS_SECRET=<random-64-char>
JWT_REFRESH_SECRET=<random-64-char>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
APPLE_CLIENT_ID=
APPLE_TEAM_ID=
APPLE_KEY_ID=

# Payments
PAYSTACK_SECRET_KEY=
PAYSTACK_PUBLIC_KEY=
PAYSTACK_WEBHOOK_SECRET=

# File Storage
AWS_S3_BUCKET=
AWS_S3_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
# or
CLOUDINARY_URL=

# Email
RESEND_API_KEY=
EMAIL_FROM=noreply@intemso.com

# Push Notifications
FCM_PROJECT_ID=
FCM_PRIVATE_KEY=

# Monitoring
SENTRY_DSN=
POSTHOG_API_KEY=
```

---

*This document serves as the comprehensive system blueprint for Intemso. It should be treated as a living document — updated as decisions are made and requirements evolve.*
