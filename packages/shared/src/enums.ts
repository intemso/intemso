// ── User Roles ──
export enum UserRole {
  STUDENT = 'student',
  EMPLOYER = 'employer',
  ADMIN = 'admin',
}

// ── Gig Status ──
export enum GigStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  REVIEWING = 'reviewing',
  HIRED = 'hired',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
}

// ── Budget Type ──
export enum BudgetType {
  FIXED = 'fixed',
  HOURLY = 'hourly',
}

// ── Location Type ──
export enum LocationType {
  REMOTE = 'remote',
  ON_SITE = 'on_site',
  HYBRID = 'hybrid',
}

// ── Experience Level ──
export enum ExperienceLevel {
  ENTRY = 'entry',
  INTERMEDIATE = 'intermediate',
  EXPERT = 'expert',
}

// ── Project Scope ──
export enum ProjectScope {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

// ── Urgency ──
export enum Urgency {
  ASAP = 'asap',
  THIS_WEEK = 'this_week',
  FLEXIBLE = 'flexible',
}

// ── Application Status (Easy Apply) ──
export enum ApplicationStatus {
  APPLIED = 'applied',
  REVIEWED = 'reviewed',
  HIRED = 'hired',
  DECLINED = 'declined',
  WITHDRAWN = 'withdrawn',
}

// ── Contract Status ──
export enum ContractStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  DISPUTED = 'disputed',
  CANCELLED = 'cancelled',
}

// ── Contract Type ──
export enum ContractType {
  FIXED = 'fixed',
  HOURLY = 'hourly',
}

// ── Milestone Status ──
export enum MilestoneStatus {
  PENDING = 'pending',
  FUNDED = 'funded',
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  REVISION_REQUESTED = 'revision_requested',
  APPROVED = 'approved',
  PAID = 'paid',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed',
}

// ── Payment Status ──
export enum PaymentStatus {
  PENDING = 'pending',
  ESCROW = 'escrow',
  RELEASED = 'released',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
  FAILED = 'failed',
}

// ── Payment Type ──
export enum PaymentType {
  MILESTONE_ESCROW = 'milestone_escrow',
  MILESTONE_RELEASE = 'milestone_release',
  HOURLY_WEEKLY = 'hourly_weekly',
  SERVICE_ORDER = 'service_order',
  BONUS = 'bonus',
  REFUND = 'refund',
}

// ── Talent Badge ──
export enum TalentBadge {
  NONE = 'none',
  RISING_TALENT = 'rising_talent',
  TOP_RATED = 'top_rated',
  TOP_RATED_PLUS = 'top_rated_plus',
}

// ── Fee Tier ──
export enum FeeTier {
  TIER_1 = 'tier_1', // 20%
  TIER_2 = 'tier_2', // 10%
  TIER_3 = 'tier_3', // 5%
}

// ── Dispute Status ──
export enum DisputeStatus {
  OPEN = 'open',
  UNDER_REVIEW = 'under_review',
  RESOLVED_STUDENT = 'resolved_student',
  RESOLVED_EMPLOYER = 'resolved_employer',
  RESOLVED_SPLIT = 'resolved_split',
  CLOSED = 'closed',
}

// ── Notification Type ──
export enum NotificationType {
  // Applications
  NEW_APPLICATION = 'new_application',
  APPLICATION_REVIEWED = 'application_reviewed',
  APPLICATION_HIRED = 'application_hired',
  APPLICATION_DECLINED = 'application_declined',
  // Contracts
  CONTRACT_STATUS_CHANGED = 'contract_status_changed',
  // Milestones
  MILESTONE_FUNDED = 'milestone_funded',
  MILESTONE_SUBMITTED = 'milestone_submitted',
  MILESTONE_APPROVED = 'milestone_approved',
  MILESTONE_REVISION = 'milestone_revision',
  // Payments
  PAYMENT_RELEASED = 'payment_released',
  // Messaging
  NEW_MESSAGE = 'new_message',
  // Reviews
  REVIEW_RECEIVED = 'review_received',
  // Disputes
  DISPUTE_OPENED = 'dispute_opened',
  DISPUTE_RESPONSE = 'dispute_response',
  DISPUTE_RESOLVED = 'dispute_resolved',
  DISPUTE_RAISED = 'dispute_raised',
  // Community
  COMMUNITY_COMMENT = 'community_comment',
  COMMUNITY_REPLY = 'community_reply',
  COMMUNITY_LIKE = 'community_like',
  COMMUNITY_MENTION = 'community_mention',
  // Social
  USER_FOLLOWED = 'user_followed',
  // Student metrics
  JSS_UPDATED = 'jss_updated',
  BADGE_EARNED = 'badge_earned',
  CONNECTS_LOW = 'connects_low',
  CONNECTS_REFRESHED = 'connects_refreshed',
  // Services
  SERVICE_ORDER = 'service_order',
  // Future/planned
  GIG_MATCH = 'gig_match',
  INVITE_TO_GIG = 'invite_to_gig',
  DIRECT_OFFER = 'direct_offer',
}

// ── Connect Transaction Type ──
export enum ConnectTransactionType {
  MONTHLY_GRANT = 'monthly_grant',
  PURCHASE = 'purchase',
  APPLICATION_SPENT = 'proposal_spent',
  APPLICATION_REFUND = 'proposal_refund',
  BOOST_SPENT = 'boost_spent',
  ROLLOVER = 'rollover',
  REWARD_GIG_COMPLETED = 'reward_gig_completed',
  REWARD_REVIEW_LEFT = 'reward_review_left',
  REWARD_FIVE_STAR = 'reward_five_star',
  REWARD_PROFILE_COMPLETE = 'reward_profile_complete',
  REWARD_REFERRAL_SIGNUP = 'reward_referral_signup',
  REWARD_REFERRAL_GIG = 'reward_referral_gig',
  REWARD_DAILY_LOGIN = 'reward_daily_login',
}

// ── Service Order Status ──
export enum ServiceOrderStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  DELIVERED = 'delivered',
  REVISION_REQUESTED = 'revision_requested',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed',
}

// ── Gig Visibility ──
export enum GigVisibility {
  PUBLIC = 'public',
  INVITE_ONLY = 'invite_only',
}

// ── Post Type (Community) ──
export enum PostType {
  DISCUSSION = 'discussion',
  QUESTION = 'question',
  TIP = 'tip',
  ACHIEVEMENT = 'achievement',
  EVENT = 'event',
  GIG_POSTED = 'gig_posted',
  GIG_COMPLETED = 'gig_completed',
  REVIEW_RECEIVED = 'review_received',
}

// ── Withdrawal Status ──
export enum WithdrawalStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

// ── Escrow Status ──
export enum EscrowStatus {
  PENDING = 'pending',
  FUNDED = 'funded',
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  RELEASED = 'released',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
  FAILED = 'failed',
  EXPIRED = 'expired',
  DISPUTED = 'disputed',
}

// ── Transaction Type ──
export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
  WITHDRAWAL = 'withdrawal',
  REFUND = 'refund',
  FEE = 'fee',
  CONNECTS_PURCHASE = 'connects_purchase',
  BONUS = 'bonus',
}

// ── Weekly Invoice Status ──
export enum WeeklyInvoiceStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  DISPUTED = 'disputed',
}

// ── Connect Purchase Status ──
export enum ConnectPurchaseStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

// ── Service Listing Status ──
export enum ServiceListingStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  REMOVED = 'removed',
}

// ── Portfolio Status ──
export enum PortfolioStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

// ── Transfer Recipient Type ──
export enum TransferRecipientType {
  MOBILE_MONEY = 'mobile_money',
  GHIPSS = 'ghipss',
}

// ── Report Status ──
export enum ReportStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  ACTION_TAKEN = 'action_taken',
  DISMISSED = 'dismissed',
}
