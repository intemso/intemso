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

// ── Proposal Status ──
export enum ProposalStatus {
  SUBMITTED = 'submitted',
  VIEWED = 'viewed',
  SHORTLISTED = 'shortlisted',
  INTERVIEW = 'interview',
  OFFER_SENT = 'offer_sent',
  HIRED = 'hired',
  DECLINED = 'declined',
  WITHDRAWN = 'withdrawn',
  ARCHIVED = 'archived',
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
  NEW_PROPOSAL = 'new_proposal',
  PROPOSAL_VIEWED = 'proposal_viewed',
  PROPOSAL_SHORTLISTED = 'proposal_shortlisted',
  OFFER_SENT = 'offer_sent',
  OFFER_ACCEPTED = 'offer_accepted',
  PROPOSAL_DECLINED = 'proposal_declined',
  MILESTONE_FUNDED = 'milestone_funded',
  MILESTONE_SUBMITTED = 'milestone_submitted',
  MILESTONE_APPROVED = 'milestone_approved',
  REVISION_REQUESTED = 'revision_requested',
  NEW_MESSAGE = 'new_message',
  PAYMENT_RELEASED = 'payment_released',
  NEW_REVIEW = 'new_review',
  JSS_UPDATED = 'jss_updated',
  BADGE_EARNED = 'badge_earned',
  CONNECTS_LOW = 'connects_low',
  CONNECTS_REFRESHED = 'connects_refreshed',
  SERVICE_ORDER = 'service_order',
  DISPUTE_OPENED = 'dispute_opened',
  DISPUTE_RESOLVED = 'dispute_resolved',
  GIG_MATCH = 'gig_match',
  INVITE_TO_GIG = 'invite_to_gig',
  DIRECT_OFFER = 'direct_offer',
}

// ── Connect Transaction Type ──
export enum ConnectTransactionType {
  MONTHLY_GRANT = 'monthly_grant',
  PURCHASE = 'purchase',
  PROPOSAL_SPENT = 'proposal_spent',
  PROPOSAL_REFUND = 'proposal_refund',
  BOOST_SPENT = 'boost_spent',
  ROLLOVER = 'rollover',
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
