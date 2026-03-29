// ── Platform Constants ──

export const PLATFORM_NAME = 'Intemso';
export const DEFAULT_CURRENCY = 'GHS';

// ── Connects ──
export const FREE_MONTHLY_CONNECTS = 10;
export const MAX_ROLLOVER_CONNECTS = 80;
export const DEFAULT_CONNECTS_PER_PROPOSAL = 2;

export const CONNECT_PACKS = [
  { size: 10, price: 5 },
  { size: 20, price: 9 },
  { size: 40, price: 16 },
] as const;

// ── Fees (sliding scale per client relationship) ──
export const FEE_TIERS = {
  tier_1: { maxBillings: 500, percentage: 20 },
  tier_2: { maxBillings: 2_000, percentage: 10 },
  tier_3: { maxBillings: Infinity, percentage: 5 },
} as const;

// ── Milestones ──
export const MAX_REVISIONS_PER_MILESTONE = 2;
export const AUTO_APPROVE_DAYS = 14;

// ── Reviews ──
export const REVIEW_WINDOW_DAYS = 14;
export const MIN_RATING = 1;
export const MAX_RATING = 5;

// ── Talent Badge Thresholds ──
export const BADGE_THRESHOLDS = {
  rising_talent: {
    minGigsCompleted: 1,
    minJss: 100,
    requiresVerification: true,
  },
  top_rated: {
    minGigsCompleted: 10,
    minJss: 90,
    minWeeksActive: 12,
    minLifetimeEarnings: 50_000,
  },
  top_rated_plus: {
    minLifetimeEarnings: 200_000,
    invitation: true,
  },
} as const;

// ── Auth ──
export const ACCESS_TOKEN_EXPIRY = '15m';
export const REFRESH_TOKEN_EXPIRY = '7d';
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MINUTES = 15;
export const BCRYPT_ROUNDS = 12;

// ── Pagination ──
export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 100;
