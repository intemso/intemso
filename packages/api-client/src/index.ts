export const API_BASE_URL =
  (typeof window !== 'undefined' && (window as any).__INTEMSO_API_URL__) ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3001/api/v1';

/** Shape returned by login/register */
export interface AuthResponse {
  user: { id: string; email: string | null; ghanaCardNumber?: string | null; role: string };
  accessToken: string;
  refreshToken: string;
}

/** Shape returned by token refresh */
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

/** Standard API error shape from NestJS */
export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

// ── Token storage helpers ──

const ACCESS_TOKEN_KEY = 'intemso_access_token';
const REFRESH_TOKEN_KEY = 'intemso_refresh_token';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// ── Core fetch wrapper ──

let isRefreshing = false;
let refreshPromise: Promise<TokenResponse | null> | null = null;

async function refreshAccessToken(): Promise<TokenResponse | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      clearTokens();
      return null;
    }

    const data: TokenResponse = await res.json();
    setTokens(data.accessToken, data.refreshToken);
    return data;
  } catch {
    clearTokens();
    return null;
  }
}

/**
 * Authenticated fetch wrapper.
 * - Attaches Bearer token to every request
 * - On 401, tries to refresh the token once and retry
 * - Throws ApiError-shaped errors for non-ok responses
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const accessToken = getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // If 401 and we have a refresh token, attempt refresh once
  if (res.status === 401 && getRefreshToken()) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshAccessToken();
    }

    const tokens = await refreshPromise;
    isRefreshing = false;
    refreshPromise = null;

    if (tokens) {
      headers['Authorization'] = `Bearer ${tokens.accessToken}`;
      res = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
      });
    }
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({
      statusCode: res.status,
      message: res.statusText,
    }));
    throw errorBody as ApiError;
  }

  // Handle 204 No Content
  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

// ── Auth API ──

export const authApi = {
  login(email: string, password: string) {
    return apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  loginWithGhanaCard(ghanaCardNumber: string, password: string) {
    return apiFetch<AuthResponse>('/auth/login/ghana-card', {
      method: 'POST',
      body: JSON.stringify({ ghanaCardNumber, password }),
    });
  },

  register(email: string, password: string, role: 'student' | 'employer') {
    return apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });
  },

  registerWithGhanaCard(data: { ghanaCardNumber: string; fullName: string; password: string; role: 'student' | 'employer'; university?: string }) {
    return apiFetch<AuthResponse>('/auth/register/ghana-card', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  refresh(refreshToken: string) {
    return apiFetch<TokenResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },

  forgotPassword(email: string) {
    return apiFetch<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword(token: string, newPassword: string) {
    return apiFetch<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  },

  createCode() {
    return apiFetch<{ code: string }>('/auth/create-code', {
      method: 'POST',
    });
  },

  exchangeCode(code: string) {
    return apiFetch<TokenResponse>('/auth/exchange-code', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },

  logout(refreshToken: string) {
    return apiFetch<{ message: string }>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },
};

// ── Users API ──

export interface PublicUserProfile {
  id: string;
  role: string;
  avatarUrl: string | null;
  createdAt: string;
  studentProfile: {
    firstName: string;
    lastName: string;
    professionalTitle: string | null;
    bio: string | null;
    university: string;
    major: string | null;
    skills: string[];
    hourlyRate: number | null;
    ratingAvg: number;
    ratingCount: number;
    gigsCompleted: number;
    totalEarned: number;
    jobSuccessScore: number;
    talentBadge: string;
    onTimeRate: number;
    isVerified: boolean;
    portfolioUrls: string[];
  } | null;
  employerProfile: {
    businessName: string;
    businessType: string | null;
    description: string | null;
    website: string | null;
    contactPerson: string | null;
    ratingAvg: number;
    ratingCount: number;
    gigsPosted: number;
    totalSpent: number;
    hireRate: number;
    isVerified: boolean;
  } | null;
  reviewsReceived: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    reviewer: {
      id: string;
      avatarUrl: string | null;
      role: string;
      studentProfile: { firstName: string; lastName: string } | null;
      employerProfile: { businessName: string; contactPerson: string | null } | null;
    };
  }[];
  _count: {
    communityPosts: number;
    reviewsReceived: number;
    followers: number;
    following: number;
  };
}

export const usersApi = {
  getProfile() {
    return apiFetch<{
      id: string;
      email: string;
      role: string;
      avatarUrl: string | null;
      emailVerified: boolean;
      createdAt: string;
      studentProfile: Record<string, unknown> | null;
      employerProfile: Record<string, unknown> | null;
    }>('/users/me');
  },

  getPublicProfile(userId: string) {
    return apiFetch<PublicUserProfile>(`/users/${userId}/profile`);
  },

  updateStudentProfile(data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    university?: string;
    bio?: string;
    professionalTitle?: string;
    major?: string;
    skills?: string[];
    hourlyRate?: number;
  }) {
    return apiFetch('/users/me/student-profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  updateEmployerProfile(data: {
    businessName?: string;
    businessType?: string;
    description?: string;
    website?: string;
    phone?: string;
    contactPerson?: string;
  }) {
    return apiFetch('/users/me/employer-profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  updateMedia(data: { avatarUrl?: string; bannerUrl?: string }) {
    return apiFetch<{ id: string; avatarUrl: string | null; bannerUrl: string | null }>('/users/me/media', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  getSuggestions(limit?: number) {
    const qs = limit ? `?limit=${limit}` : '';
    return apiFetch<Array<{
      id: string;
      role: string;
      avatarUrl: string | null;
      studentProfile: { firstName: string; lastName: string; university: string; professionalTitle: string | null; skills: string[] } | null;
      employerProfile: { businessName: string; contactPerson: string } | null;
    }>>(`/users/suggestions${qs}`);
  },

  followUser(userId: string) {
    return apiFetch(`/users/${userId}/follow`, { method: 'POST' });
  },

  unfollowUser(userId: string) {
    return apiFetch(`/users/${userId}/follow`, { method: 'DELETE' });
  },

  getFollowers(userId: string, page = 1, limit = 20) {
    return apiFetch<{ data: Array<{ followerId: string; followedAt: string; follower: { id: string; avatarUrl: string | null; studentProfile: { firstName: string; lastName: string } | null; employerProfile: { businessName: string } | null } }>; total: number; page: number; totalPages: number }>(
      `/users/${userId}/followers?page=${page}&limit=${limit}`,
    );
  },

  getFollowing(userId: string, page = 1, limit = 20) {
    return apiFetch<{ data: Array<{ followingId: string; followedAt: string; following: { id: string; avatarUrl: string | null; studentProfile: { firstName: string; lastName: string } | null; employerProfile: { businessName: string } | null } }>; total: number; page: number; totalPages: number }>(
      `/users/${userId}/following?page=${page}&limit=${limit}`,
    );
  },

  getFollowStatus(userId: string) {
    return apiFetch<{ isFollowing: boolean; followers: number; following: number }>(
      `/users/${userId}/follow-status`,
    );
  },
};

// ── Categories API ──

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  _count: { gigs: number };
}

export const categoriesApi = {
  list(active?: boolean | 'all') {
    const params = active === 'all' ? '?active=all' : active === false ? '?active=false' : '';
    return apiFetch<Category[]>(`/categories${params}`);
  },

  getBySlug(slug: string) {
    return apiFetch<Category>(`/categories/${encodeURIComponent(slug)}`);
  },
};

// ── Gigs API ──

export interface GigListItem {
  id: string;
  title: string;
  description: string;
  budgetType: string;
  budgetMin: string | null;
  budgetMax: string | null;
  currency: string;
  locationType: string;
  locationAddress: string | null;
  experienceLevel: string;
  projectScope: string;
  urgency: string;
  durationHours: number | null;
  deadline: string | null;
  status: string;
  viewsCount: number;
  applicationsCount: number;
  requiredSkills: string[];
  connectsRequired: number;
  createdAt: string;
  publishedAt: string | null;
  employer: {
    id: string;
    businessName: string;
    contactPerson: string | null;
    logoUrl: string | null;
  };
  category: { id: string; name: string } | null;
}

export interface PaginatedGigs {
  data: GigListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const gigsApi = {
  list(params?: {
    page?: number;
    limit?: number;
    category?: string;
    budgetType?: string;
    search?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.category) searchParams.set('category', params.category);
    if (params?.budgetType) searchParams.set('budgetType', params.budgetType);
    if (params?.search) searchParams.set('search', params.search);
    const qs = searchParams.toString();
    return apiFetch<PaginatedGigs>(`/gigs${qs ? `?${qs}` : ''}`);
  },

  listMine(params?: { page?: number; limit?: number; status?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.status) searchParams.set('status', params.status);
    const qs = searchParams.toString();
    return apiFetch<PaginatedGigs>(`/gigs/mine${qs ? `?${qs}` : ''}`);
  },

  getById(id: string) {
    return apiFetch<GigListItem & { applications: { id: string; status: string; suggestedRate: string | null }[] }>(
      `/gigs/${encodeURIComponent(id)}`,
    );
  },

  create(data: {
    title: string;
    description: string;
    categoryId?: string;
    requiredSkills?: string[];
    budgetType: string;
    budgetMin?: number;
    budgetMax?: number;
    locationType: string;
    locationAddress?: string;
    experienceLevel?: string;
    projectScope?: string;
    urgency?: string;
    durationHours?: number;
    deadline?: string;
    screeningQuestions?: string[];
  }) {
    return apiFetch<GigListItem>('/gigs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update(id: string, data: Record<string, unknown>) {
    return apiFetch<GigListItem>(`/gigs/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  remove(id: string) {
    return apiFetch<{ deleted: boolean }>(`/gigs/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};

// ── Applications API (Easy Apply) ──

export interface ApplicationListItem {
  id: string;
  gigId: string;
  studentId: string;
  note: string | null;
  suggestedRate: string | null;
  screeningAnswers: string[];
  connectsSpent: number;
  status: string;
  employerNotes: string | null;
  createdAt: string;
  updatedAt: string;
  gig?: {
    id: string;
    title: string;
    budgetType: string;
    budgetMin: string | null;
    budgetMax: string | null;
    currency: string;
    status: string;
    employer: {
      id: string;
      businessName: string;
      contactPerson: string | null;
      logoUrl: string | null;
      ratingAvg: string;
    };
  };
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    professionalTitle: string | null;
    university: string;
    skills: string[];
    hourlyRate: string | null;
    ratingAvg: string;
    ratingCount: number;
    gigsCompleted: number;
    userId: string;
  };
  contract?: { id: string; status: string } | null;
}

export interface PaginatedApplications {
  data: ApplicationListItem[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export const applicationsApi = {
  /** Student applies for a gig (Easy Apply) */
  create(gigId: string, data: { note?: string; suggestedRate?: number; screeningAnswers?: string[] }) {
    return apiFetch<ApplicationListItem>(`/gigs/${encodeURIComponent(gigId)}/applications`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /** Employer views applications for their gig */
  listByGig(gigId: string, params?: { page?: number; limit?: number; status?: string }) {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.limit) sp.set('limit', String(params.limit));
    if (params?.status) sp.set('status', params.status);
    const qs = sp.toString();
    return apiFetch<PaginatedApplications>(`/gigs/${encodeURIComponent(gigId)}/applications${qs ? `?${qs}` : ''}`);
  },

  /** Student views their own applications */
  listMine(params?: { page?: number; limit?: number; status?: string }) {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.limit) sp.set('limit', String(params.limit));
    if (params?.status) sp.set('status', params.status);
    const qs = sp.toString();
    return apiFetch<PaginatedApplications>(`/applications/me${qs ? `?${qs}` : ''}`);
  },

  /** Employer views all received applications across their gigs */
  listReceived(params?: { page?: number; limit?: number; status?: string }) {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.limit) sp.set('limit', String(params.limit));
    if (params?.status) sp.set('status', params.status);
    const qs = sp.toString();
    return apiFetch<PaginatedApplications>(`/applications/received${qs ? `?${qs}` : ''}`);
  },

  /** Get single application detail */
  getById(id: string) {
    return apiFetch<ApplicationListItem>(`/applications/${encodeURIComponent(id)}`);
  },

  /** Employer updates application status */
  updateStatus(id: string, data: { status: string; employerNotes?: string }) {
    return apiFetch<ApplicationListItem>(`/applications/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /** Student withdraws their application */
  withdraw(id: string) {
    return apiFetch<ApplicationListItem>(`/applications/${encodeURIComponent(id)}/withdraw`, {
      method: 'PATCH',
    });
  },
};

// ── Contracts API ──

export interface MilestoneItem {
  id: string;
  contractId: string;
  title: string;
  description: string | null;
  amount: string;
  dueDate: string | null;
  sortOrder: number;
  status: string;
  deliverables: string[];
  revisionCount: number;
  maxRevisions: number;
  submittedAt: string | null;
  approvedAt: string | null;
  paidAt: string | null;
  autoApproveAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContractListItem {
  id: string;
  gigId: string | null;
  applicationId: string | null;
  studentId: string;
  employerId: string;
  contractType: string;
  title: string;
  description: string | null;
  agreedRate: string;
  currency: string;
  weeklyLimit: number | null;
  status: string;
  isDirect: boolean;
  startedAt: string;
  pausedAt: string | null;
  completedAt: string | null;
  lifetimeBillings: string;
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    userId: string;
    ratingAvg: string;
  };
  employer: {
    id: string;
    businessName: string;
    contactPerson: string | null;
    logoUrl: string | null;
    ratingAvg: string;
    userId: string;
  };
  gig: { id: string; title: string } | null;
  milestones: MilestoneItem[];
}

export interface PaginatedContracts {
  data: ContractListItem[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface WeeklyInvoice {
  id: string;
  billingWeek: string;
  totalHours: string;
  hourlyRate: string;
  subtotal: string;
  platformFee: string;
  status: string;
  paidAt: string | null;
  createdAt: string;
}

export const contractsApi = {
  /** Employer creates a direct contract */
  create(data: {
    gigId?: string;
    applicationId?: string;
    studentId: string;
    contractType: string;
    title: string;
    description?: string;
    agreedRate: number;
    weeklyLimit?: number;
    isDirect?: boolean;
  }) {
    return apiFetch<ContractListItem>('/contracts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /** User's contracts (works for both student and employer) */
  listMine(params?: { page?: number; limit?: number; status?: string }) {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.limit) sp.set('limit', String(params.limit));
    if (params?.status) sp.set('status', params.status);
    const qs = sp.toString();
    return apiFetch<PaginatedContracts>(`/contracts/me${qs ? `?${qs}` : ''}`);
  },

  /** Single contract with milestones */
  getById(id: string) {
    return apiFetch<ContractListItem>(`/contracts/${encodeURIComponent(id)}`);
  },

  /** Update contract status */
  updateStatus(id: string, data: { status: string; endReason?: string }) {
    return apiFetch<ContractListItem>(`/contracts/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /** List weekly invoices for an hourly contract */
  getInvoices(contractId: string) {
    return apiFetch<{ contractId: string; invoices: WeeklyInvoice[] }>(
      `/contracts/${encodeURIComponent(contractId)}/invoices`,
    );
  },
};

// ── Milestones API ──

export const milestonesApi = {
  /** Add a milestone to a contract */
  create(contractId: string, data: { title: string; description?: string; amount: number; dueDate?: string; sortOrder?: number }) {
    return apiFetch<MilestoneItem>(`/contracts/${encodeURIComponent(contractId)}/milestones`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /** Student submits deliverables for a milestone */
  submit(milestoneId: string, data?: { deliverables?: string[]; message?: string }) {
    return apiFetch<MilestoneItem>(`/milestones/${encodeURIComponent(milestoneId)}/submit`, {
      method: 'PATCH',
      body: JSON.stringify(data ?? {}),
    });
  },

  /** Employer approves a submitted milestone */
  approve(milestoneId: string) {
    return apiFetch<MilestoneItem>(`/milestones/${encodeURIComponent(milestoneId)}/approve`, {
      method: 'PATCH',
    });
  },

  /** Employer requests revision */
  requestRevision(milestoneId: string, data?: { reason?: string }) {
    return apiFetch<MilestoneItem>(`/milestones/${encodeURIComponent(milestoneId)}/request-revision`, {
      method: 'PATCH',
      body: JSON.stringify(data ?? {}),
    });
  },
};

// ── Payments API ──

export interface PaymentInitResponse {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

export const paymentsApi = {
  /** Initialize a Paystack payment (milestone escrow or connect purchase) */
  initialize(data: {
    purpose: 'milestone_escrow' | 'connects_purchase';
    milestoneId?: string;
    packSize?: number;
    callbackUrl?: string;
  }) {
    return apiFetch<PaymentInitResponse>('/payments/initialize', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /** Verify a payment by reference */
  verify(reference: string) {
    return apiFetch<any>('/payments/verify', {
      method: 'POST',
      body: JSON.stringify({ reference }),
    });
  },
};

// ── Wallet API ──

export interface WalletBalance {
  id: string;
  balance: string;
  pendingBalance: string;
  currency: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  paymentId: string | null;
  type: string;
  amount: string;
  balanceAfter: string;
  description: string | null;
  createdAt: string;
  payment?: { type: string; milestoneId: string | null; contractId: string | null } | null;
}

export interface WithdrawalItem {
  id: string;
  walletId: string;
  userId: string;
  amount: string;
  destination: { provider: string; accountNumber: string; accountName: string; bankCode?: string };
  status: string;
  processedAt: string | null;
  createdAt: string;
}

export interface PaginatedTransactions {
  data: WalletTransaction[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface PaginatedWithdrawals {
  data: WithdrawalItem[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export const walletApi = {
  /** Get wallet balance */
  getBalance() {
    return apiFetch<WalletBalance>('/wallet');
  },

  /** Request a withdrawal */
  withdraw(data: {
    amount: number;
    provider: string;
    accountNumber: string;
    accountName: string;
    bankCode?: string;
  }) {
    return apiFetch<WithdrawalItem>('/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /** Wallet transaction history */
  getTransactions(params?: { page?: number; limit?: number }) {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.limit) sp.set('limit', String(params.limit));
    const qs = sp.toString();
    return apiFetch<PaginatedTransactions>(`/wallet/transactions${qs ? `?${qs}` : ''}`);
  },

  /** Withdrawal history */
  getWithdrawals(params?: { page?: number; limit?: number }) {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.limit) sp.set('limit', String(params.limit));
    const qs = sp.toString();
    return apiFetch<PaginatedWithdrawals>(`/wallet/withdrawals${qs ? `?${qs}` : ''}`);
  },
};

// ── Connects API ──

export interface ConnectBalance {
  free: number;
  purchased: number;
  rollover: number;
  total: number;
  lastRefreshAt: string;
}

export interface ConnectTransactionItem {
  id: string;
  studentId: string;
  type: string;
  amount: number;
  balanceAfter: number;
  referenceId: string | null;
  description: string | null;
  createdAt: string;
}

export interface PaginatedConnectTransactions {
  data: ConnectTransactionItem[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export const connectsApi = {
  /** Get connect balance */
  getBalance() {
    return apiFetch<ConnectBalance>('/connects/balance');
  },

  /** Connect transaction history */
  getTransactions(params?: { page?: number; limit?: number }) {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.limit) sp.set('limit', String(params.limit));
    const qs = sp.toString();
    return apiFetch<PaginatedConnectTransactions>(`/connects/transactions${qs ? `?${qs}` : ''}`);
  },
};

// ── Messaging interfaces ──

export interface ConversationParticipant {
  id: string;
  role: string;
  name: string;
  avatar?: string;
}

export interface ConversationLastMessage {
  id: string;
  content: string;
  senderId: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  gigId: string | null;
  gig: { id: string; title: string } | null;
  lastMessageAt: string | null;
  createdAt: string;
  lastMessage: ConversationLastMessage | null;
  unreadCount: number;
  participant: ConversationParticipant | null;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachments: string[];
  isRead: boolean;
  createdAt: string;
}

export interface PaginatedMessages {
  data: Message[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

// ── Messaging API ──

export const messagingApi = {
  /** Create or find a conversation */
  createConversation(data: { participantId: string; gigId?: string; message?: string }) {
    return apiFetch<Conversation>('/conversations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /** List all conversations for current user */
  listConversations() {
    return apiFetch<Conversation[]>('/conversations');
  },

  /** Get messages for a conversation */
  getMessages(conversationId: string, params?: { page?: number; limit?: number }) {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.limit) sp.set('limit', String(params.limit));
    const qs = sp.toString();
    return apiFetch<PaginatedMessages>(`/conversations/${conversationId}/messages${qs ? `?${qs}` : ''}`);
  },

  /** Send a message */
  sendMessage(conversationId: string, data: { content: string; attachments?: string[] }) {
    return apiFetch<Message>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /** Mark conversation as read */
  markAsRead(conversationId: string) {
    return apiFetch<{ marked: number }>(`/conversations/${conversationId}/read`, {
      method: 'PATCH',
    });
  },
};

// ── Notifications interfaces ──

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, any>;
  isRead: boolean;
  channel: string;
  createdAt: string;
}

export interface PaginatedNotifications {
  data: Notification[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

// ── Notifications API ──

export const notificationsApi = {
  /** List notifications */
  list(params?: { page?: number; limit?: number; unreadOnly?: boolean }) {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.limit) sp.set('limit', String(params.limit));
    if (params?.unreadOnly) sp.set('unreadOnly', 'true');
    const qs = sp.toString();
    return apiFetch<PaginatedNotifications>(`/notifications${qs ? `?${qs}` : ''}`);
  },

  /** Get unread count */
  getUnreadCount() {
    return apiFetch<{ unread: number }>('/notifications/unread-count');
  },

  /** Mark single notification as read */
  markAsRead(id: string) {
    return apiFetch<Notification>(`/notifications/${id}/read`, { method: 'PATCH' });
  },

  /** Mark all as read */
  markAllAsRead() {
    return apiFetch<{ marked: number }>('/notifications/read-all', { method: 'PATCH' });
  },
};

// ── Reviews interfaces ──

export interface Review {
  id: string;
  contractId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string | null;
  isFlagged: boolean;
  isVisible: boolean;
  createdAt: string;
  reviewerName?: string;
  contract?: { id: string; title: string };
}

export interface PaginatedReviews {
  data: Review[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

// ── Reviews API ──

export const reviewsApi = {
  /** Submit a review for a completed contract */
  create(contractId: string, data: { rating: number; comment?: string }) {
    return apiFetch<Review>(`/contracts/${contractId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /** Get reviews for a user (public) */
  getByUser(userId: string, params?: { page?: number; limit?: number }) {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.limit) sp.set('limit', String(params.limit));
    const qs = sp.toString();
    return apiFetch<PaginatedReviews>(`/users/${userId}/reviews${qs ? `?${qs}` : ''}`);
  },

  /** Get reviews for a contract */
  getByContract(contractId: string) {
    return apiFetch<Review[]>(`/contracts/${contractId}/reviews`);
  },

  /** Flag a review */
  flag(reviewId: string) {
    return apiFetch<Review>(`/reviews/${reviewId}/flag`, { method: 'POST' });
  },
};

// ── Reports API ──

export const reportsApi = {
  /** Report a user, gig, or review */
  create(data: { reportedEntity: string; reportedId: string; reason: string }) {
    return apiFetch<{ id: string }>('/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /** Raise a dispute on a contract */
  createDispute(contractId: string, data: { reason: string }) {
    return apiFetch<{ id: string }>(`/contracts/${contractId}/disputes`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /** Get dispute detail */
  getDispute(id: string) {
    return apiFetch<any>(`/disputes/${id}`);
  },

  /** List my disputes */
  listDisputes(params?: { page?: number; limit?: number }) {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.limit) sp.set('limit', String(params.limit));
    const qs = sp.toString();
    return apiFetch<any>(`/disputes${qs ? `?${qs}` : ''}`);
  },
};

// ── Students / Talent API ──

export interface StudentListItem {
  id: string;
  firstName: string;
  lastName: string;
  professionalTitle: string | null;
  university: string;
  bio: string | null;
  skills: string[];
  hourlyRate: string | null;
  isVerified: boolean;
  avatarUrl?: string | null;
  ratingAvg: string;
  ratingCount: number;
  jobSuccessScore: number;
  totalEarned: string;
  gigsCompleted: number;
  responseTimeHrs: string | null;
  onTimeRate: string;
  talentBadge: string;
  portfolioUrls: string[];
  availability: any;
  createdAt: string;
}

export interface StudentDetail extends StudentListItem {
  userId: string;
  major: string | null;
  rehireRate: string;
  user?: { createdAt: string };
}

export interface PaginatedStudents {
  data: StudentListItem[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export const studentsApi = {
  search(params?: {
    search?: string;
    skills?: string;
    university?: string;
    minRate?: number;
    maxRate?: number;
    minRating?: number;
    talentBadge?: string;
    availability?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    limit?: number;
  }) {
    const sp = new URLSearchParams();
    if (params?.search) sp.set('search', params.search);
    if (params?.skills) sp.set('skills', params.skills);
    if (params?.university) sp.set('university', params.university);
    if (params?.minRate) sp.set('minRate', String(params.minRate));
    if (params?.maxRate) sp.set('maxRate', String(params.maxRate));
    if (params?.minRating) sp.set('minRating', String(params.minRating));
    if (params?.talentBadge) sp.set('talentBadge', params.talentBadge);
    if (params?.availability) sp.set('availability', params.availability);
    if (params?.sortBy) sp.set('sortBy', params.sortBy);
    if (params?.sortOrder) sp.set('sortOrder', params.sortOrder);
    if (params?.page) sp.set('page', String(params.page));
    if (params?.limit) sp.set('limit', String(params.limit));
    const qs = sp.toString();
    return apiFetch<PaginatedStudents>(`/students${qs ? `?${qs}` : ''}`);
  },

  getById(id: string) {
    return apiFetch<StudentDetail>(`/students/${id}`);
  },
};

// ── Saved Items API ──

export const savedGigsApi = {
  save(gigId: string) {
    return apiFetch<{ id: string; saved: boolean }>(`/saved-gigs/${gigId}`, { method: 'POST' });
  },
  unsave(gigId: string) {
    return apiFetch<{ saved: boolean }>(`/saved-gigs/${gigId}`, { method: 'DELETE' });
  },
  list(params?: { page?: number; limit?: number }) {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.limit) sp.set('limit', String(params.limit));
    const qs = sp.toString();
    return apiFetch<{ data: any[]; meta: any }>(`/saved-gigs${qs ? `?${qs}` : ''}`);
  },
};

export const savedTalentApi = {
  save(studentId: string) {
    return apiFetch<{ id: string; saved: boolean }>(`/saved-talent/${studentId}`, { method: 'POST' });
  },
  unsave(studentId: string) {
    return apiFetch<{ saved: boolean }>(`/saved-talent/${studentId}`, { method: 'DELETE' });
  },
  list(params?: { page?: number; limit?: number }) {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.limit) sp.set('limit', String(params.limit));
    const qs = sp.toString();
    return apiFetch<{ data: StudentListItem[]; meta: any }>(`/saved-talent${qs ? `?${qs}` : ''}`);
  },
};

// ── Services API ──

export interface ServiceListItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  deliveryDays: number;
  tiers: any;
  images: any;
  status: string;
  ordersCount: number;
  ratingAvg: string;
  ratingCount: number;
  createdAt: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    professionalTitle: string | null;
    ratingAvg: string;
    ratingCount: number;
    isVerified: boolean;
    university: string;
  };
  category: { name: string; slug: string } | null;
}

export interface PaginatedServices {
  data: ServiceListItem[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export const servicesApi = {
  list(params?: {
    search?: string;
    categoryId?: string;
    tags?: string;
    maxDeliveryDays?: number;
    sortBy?: string;
    page?: number;
    limit?: number;
  }) {
    const sp = new URLSearchParams();
    if (params?.search) sp.set('search', params.search);
    if (params?.categoryId) sp.set('categoryId', params.categoryId);
    if (params?.tags) sp.set('tags', params.tags);
    if (params?.maxDeliveryDays) sp.set('maxDeliveryDays', String(params.maxDeliveryDays));
    if (params?.sortBy) sp.set('sortBy', params.sortBy);
    if (params?.page) sp.set('page', String(params.page));
    if (params?.limit) sp.set('limit', String(params.limit));
    const qs = sp.toString();
    return apiFetch<PaginatedServices>(`/services${qs ? `?${qs}` : ''}`);
  },

  getById(id: string) {
    return apiFetch<ServiceListItem & { _count: { orders: number } }>(`/services/${id}`);
  },

  create(data: {
    title: string;
    description: string;
    categoryId?: string;
    tags?: string[];
    deliveryDays: number;
    tiers?: any;
    faq?: any;
  }) {
    return apiFetch<ServiceListItem>('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update(id: string, data: any) {
    return apiFetch<ServiceListItem>(`/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  mine() {
    return apiFetch<ServiceListItem[]>('/services/mine');
  },

  order(serviceId: string, data: { tierSelected: string; amount: number; requirements?: string }) {
    return apiFetch<any>(`/services/${serviceId}/order`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getOrder(orderId: string) {
    return apiFetch<any>(`/services/orders/${orderId}`);
  },

  listMyOrders(params?: { page?: number; limit?: number }) {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.limit) sp.set('limit', String(params.limit));
    const qs = sp.toString();
    return apiFetch<any>(`/services/orders/mine${qs ? `?${qs}` : ''}`);
  },

  updateOrderStatus(orderId: string, status: string) {
    return apiFetch<any>(`/services/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};

// ── Showcase / Portfolio API ──

export interface PortfolioStudent {
  id: string;
  firstName: string;
  lastName: string;
  professionalTitle: string | null;
  university: string;
  ratingAvg: string;
  ratingCount: number;
  isVerified: boolean;
  gigsCompleted: number;
  skills: string[];
  user: { avatarUrl: string | null };
}

export interface PortfolioItem {
  id: string;
  studentId: string;
  title: string;
  description: string;
  categoryId: string | null;
  skills: string[];
  images: string[];
  projectUrl: string | null;
  clientName: string | null;
  completedAt: string | null;
  status: 'draft' | 'published' | 'archived';
  isFeatured: boolean;
  likeCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  student: PortfolioStudent;
  category: { id: string; name: string; slug: string } | null;
}

export interface PaginatedPortfolio {
  data: PortfolioItem[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export const showcaseApi = {
  list(params?: {
    search?: string;
    categoryId?: string;
    skills?: string;
    studentId?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }) {
    const sp = new URLSearchParams();
    if (params?.search) sp.set('search', params.search);
    if (params?.categoryId) sp.set('categoryId', params.categoryId);
    if (params?.skills) sp.set('skills', params.skills);
    if (params?.studentId) sp.set('studentId', params.studentId);
    if (params?.sortBy) sp.set('sortBy', params.sortBy);
    if (params?.page) sp.set('page', String(params.page));
    if (params?.limit) sp.set('limit', String(params.limit));
    const qs = sp.toString();
    return apiFetch<PaginatedPortfolio>(`/showcase${qs ? `?${qs}` : ''}`);
  },

  featured(limit?: number) {
    const qs = limit ? `?limit=${limit}` : '';
    return apiFetch<PortfolioItem[]>(`/showcase/featured${qs}`);
  },

  getById(id: string) {
    return apiFetch<PortfolioItem>(`/showcase/${id}`);
  },

  mine() {
    return apiFetch<PortfolioItem[]>('/showcase/mine');
  },

  create(data: {
    title: string;
    description: string;
    categoryId?: string;
    skills?: string[];
    images?: string[];
    projectUrl?: string;
    clientName?: string;
    completedAt?: string;
    status?: string;
  }) {
    return apiFetch<PortfolioItem>('/showcase', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update(id: string, data: Record<string, unknown>) {
    return apiFetch<PortfolioItem>(`/showcase/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  remove(id: string) {
    return apiFetch<{ deleted: boolean }>(`/showcase/${id}`, {
      method: 'DELETE',
    });
  },

  like(id: string) {
    return apiFetch<{ id: string; likeCount: number }>(`/showcase/${id}/like`, {
      method: 'POST',
    });
  },
};

// ── Admin API ──

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  isSuspended: boolean;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  studentProfile: {
    id: string;
    firstName: string;
    lastName: string;
    university: string;
    ratingAvg: string;
    gigsCompleted: number;
    totalEarned: string;
  } | null;
  employerProfile: {
    id: string;
    businessName: string;
    contactPerson: string | null;
    ratingAvg: string;
    totalSpent: string;
    gigsPosted: number;
  } | null;
}

export interface AdminDispute {
  id: string;
  contractId: string;
  reason: string;
  status: string;
  adminNotes: string | null;
  createdAt: string;
  resolvedAt: string | null;
  contract: { id: string; title: string; status: string; agreedRate: string };
  raisedBy: { id: string; email: string; role: string };
  resolvedBy: { id: string; email: string } | null;
}

export interface AdminReport {
  id: string;
  reportedEntity: string;
  reportedId: string;
  reason: string;
  status: string;
  adminNotes: string | null;
  createdAt: string;
  reporter: { id: string; email: string; role: string };
}

export interface AdminStats {
  users: { total: number; students: number; employers: number; recentSignups: number };
  gigs: { total: number; open: number };
  contracts: { total: number; active: number; completed: number };
  disputes: { open: number };
  reports: { pending: number };
  financial: { totalPayments: number; platformFees: number; escrowHeld: number; totalReleased: number };
  community: { posts: number; comments: number; likes: number };
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  _count: { gigs: number };
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
  user: { id: string; email: string; role: string };
}

export const adminApi = {
  // Users
  listUsers(params?: { search?: string; role?: string; status?: string; page?: number; limit?: number }) {
    const sp = new URLSearchParams();
    if (params?.search) sp.set('search', params.search);
    if (params?.role) sp.set('role', params.role);
    if (params?.status) sp.set('status', params.status);
    if (params?.page) sp.set('page', String(params.page));
    if (params?.limit) sp.set('limit', String(params.limit));
    const qs = sp.toString();
    return apiFetch<{ data: AdminUser[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(
      `/admin/users${qs ? `?${qs}` : ''}`
    );
  },

  updateUser(id: string, data: { role?: string; suspend?: boolean; activate?: boolean }) {
    return apiFetch<AdminUser>(`/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Disputes
  listDisputes(params?: { status?: string; page?: number; limit?: number }) {
    const sp = new URLSearchParams();
    if (params?.status) sp.set('status', params.status);
    if (params?.page) sp.set('page', String(params.page));
    if (params?.limit) sp.set('limit', String(params.limit));
    const qs = sp.toString();
    return apiFetch<{ data: AdminDispute[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(
      `/admin/disputes${qs ? `?${qs}` : ''}`
    );
  },

  resolveDispute(id: string, data: { resolution: string; adminNotes?: string }) {
    return apiFetch<AdminDispute>(`/admin/disputes/${id}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Reports
  listReports(params?: { status?: string; entity?: string; page?: number; limit?: number }) {
    const sp = new URLSearchParams();
    if (params?.status) sp.set('status', params.status);
    if (params?.entity) sp.set('entity', params.entity);
    if (params?.page) sp.set('page', String(params.page));
    if (params?.limit) sp.set('limit', String(params.limit));
    const qs = sp.toString();
    return apiFetch<{ data: AdminReport[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(
      `/admin/reports${qs ? `?${qs}` : ''}`
    );
  },

  reviewReport(id: string, data: { status: string; adminNotes?: string }) {
    return apiFetch<AdminReport>(`/admin/reports/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Community Moderation
  hideCommunityPost(postId: string) {
    return apiFetch<{ hidden: boolean }>(`/admin/community/posts/${postId}/hide`, { method: 'POST' });
  },

  deleteCommunityPost(postId: string) {
    return apiFetch<{ deleted: boolean }>(`/admin/community/posts/${postId}`, { method: 'DELETE' });
  },

  deleteCommunityComment(commentId: string) {
    return apiFetch<{ deleted: boolean }>(`/admin/community/comments/${commentId}`, { method: 'DELETE' });
  },

  // Stats
  getStats() {
    return apiFetch<AdminStats>('/admin/stats');
  },

  // Categories
  listCategories() {
    return apiFetch<AdminCategory[]>('/admin/categories');
  },

  createCategory(data: { name: string; slug: string; icon?: string; description?: string; sortOrder?: number }) {
    return apiFetch<AdminCategory>('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateCategory(id: string, data: { name?: string; slug?: string; icon?: string; description?: string; sortOrder?: number; isActive?: boolean }) {
    return apiFetch<AdminCategory>(`/admin/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteCategory(id: string) {
    return apiFetch<void>(`/admin/categories/${id}`, { method: 'DELETE' });
  },

  // Audit Log
  getAuditLog(limit = 100) {
    return apiFetch<AuditLogEntry[]>(`/admin/audit-log?limit=${limit}`);
  },
};

// ── Uploads API ──

export interface OptimizedVariant {
  suffix: string;
  width: number;
  url: string;
}

export interface OptimizedInfo {
  primaryUrl: string;
  blurDataUri: string;
  dominantColor: string;
  variants: OptimizedVariant[];
}

export interface UploadedFile {
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  url: string;
  publicId?: string;
  optimized?: OptimizedInfo;
}

async function uploadFiles(endpoint: string, files: File[], fieldName = 'file'): Promise<UploadedFile[]> {
  const token = getAccessToken();
  const formData = new FormData();
  if (files.length === 1 && fieldName === 'file') {
    formData.append('file', files[0]);
  } else {
    files.forEach((f) => formData.append('files', f));
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Upload failed' }));
    throw error;
  }

  const data = await res.json();
  return Array.isArray(data) ? data : [data];
}

export const uploadsApi = {
  uploadAvatar(file: File) {
    return uploadFiles('/uploads/avatar', [file]).then((r) => r[0]);
  },
  uploadPortfolio(files: File[]) {
    return uploadFiles('/uploads/portfolio', files, 'files');
  },
  uploadDeliverable(files: File[]) {
    return uploadFiles('/uploads/deliverable', files, 'files');
  },
  uploadAttachment(file: File) {
    return uploadFiles('/uploads/attachment', [file]).then((r) => r[0]);
  },
};

/** Apply Cloudinary transforms to an image URL. No-op for non-Cloudinary URLs. */
export function cloudinaryUrl(url: string, transforms: string): string {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  return url.replace('/upload/', `/upload/${transforms}/`);
}

/** Get a resized Cloudinary thumbnail. No-op for non-Cloudinary URLs. */
export function cloudinaryThumb(url: string, w: number, h?: number): string {
  const t = h ? `w_${w},h_${h},c_fill,f_auto,q_auto` : `w_${w},c_limit,f_auto,q_auto`;
  return cloudinaryUrl(url, t);
}

// ── Community API ──

export interface CommunityPost {
  id: string;
  authorId: string;
  type: 'discussion' | 'question' | 'tip' | 'achievement' | 'event' | 'gig_posted' | 'gig_completed' | 'review_received';
  content: string;
  images: string[];
  tags: string[];
  gigId?: string | null;
  isPinned: boolean;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  savedAt?: string;
  editedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    email: string;
    role: string;
    avatarUrl: string | null;
    reputationScore?: number;
    studentProfile?: { firstName: string; lastName: string; university: string; professionalTitle?: string } | null;
    employerProfile?: { businessName: string; contactPerson?: string } | null;
  };
  gig?: {
    id: string;
    title: string;
    budgetMin: string | null;
    budgetMax: string | null;
    currency: string;
    status: string;
    requiredSkills: string[];
  } | null;
  _count: { comments: number; likes: number };
}

export interface CommunityComment {
  id: string;
  postId: string;
  authorId: string;
  parentId: string | null;
  content: string;
  likeCount: number;
  createdAt: string;
  author: CommunityPost['author'];
  replies?: CommunityComment[];
  _count?: { replies: number };
}

export interface MentionUser {
  id: string;
  avatarUrl: string | null;
  studentProfile?: { firstName: string; lastName: string } | null;
  employerProfile?: { businessName: string } | null;
}

export interface CommunityFeed {
  items: CommunityPost[];
  total: number;
  page: number;
  pages: number;
}

export interface CommentsPage {
  items: CommunityComment[];
  total: number;
  page: number;
  pages: number;
}

export interface ReputationTier {
  name: string;
  level: number;
}

export interface CommunityAnalytics {
  overview: {
    totalPosts: number;
    totalComments: number;
    totalLikes: number;
    totalViews: number;
  };
  activity: {
    posts: { today: number; week: number; month: number };
    comments: { today: number; week: number; month: number };
    activeUsersWeek: number;
  };
  topPosts: Array<{
    id: string;
    content: string;
    type: string;
    likeCount: number;
    commentCount: number;
    viewCount: number;
    createdAt: string;
    author: {
      id: string;
      avatarUrl: string | null;
      studentProfile?: { firstName: string; lastName: string } | null;
      employerProfile?: { businessName: string } | null;
    };
  }>;
  topContributors: Array<{
    id: string;
    avatarUrl: string | null;
    reputationScore: number;
    studentProfile?: { firstName: string; lastName: string } | null;
    employerProfile?: { businessName: string } | null;
  }>;
  dailyPostCounts: Array<{ date: string; count: number }>;
}

export const communityApi = {
  getFeed(params?: { page?: number; limit?: number; type?: string; authenticated?: boolean }) {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.limit) sp.set('limit', String(params.limit));
    if (params?.type) sp.set('type', params.type);
    const qs = sp.toString();
    const endpoint = params?.authenticated ? '/community/feed/me' : '/community/feed';
    return apiFetch<CommunityFeed>(`${endpoint}${qs ? `?${qs}` : ''}`);
  },

  getFollowingFeed(params?: { page?: number; limit?: number; type?: string }) {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.limit) sp.set('limit', String(params.limit));
    if (params?.type) sp.set('type', params.type);
    const qs = sp.toString();
    return apiFetch<CommunityFeed>(`/community/feed/following${qs ? `?${qs}` : ''}`);
  },

  createPost(data: { content: string; type?: string; images?: string[]; tags?: string[] }) {
    return apiFetch<CommunityPost>('/community/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getPost(id: string) {
    return apiFetch<CommunityPost>(`/community/posts/${id}`);
  },

  deletePost(id: string) {
    return apiFetch<{ deleted: boolean }>(`/community/posts/${id}`, { method: 'DELETE' });
  },

  updatePost(id: string, data: { content?: string; tags?: string[] }) {
    return apiFetch<CommunityPost>(`/community/posts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  getComments(postId: string, params?: { page?: number; limit?: number }) {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.limit) sp.set('limit', String(params.limit));
    const qs = sp.toString();
    return apiFetch<CommentsPage>(`/community/posts/${postId}/comments${qs ? `?${qs}` : ''}`);
  },

  createComment(postId: string, content: string, parentId?: string) {
    const sp = parentId ? `?parentId=${parentId}` : '';
    return apiFetch<CommunityComment>(`/community/posts/${postId}/comments${sp}`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  deleteComment(id: string) {
    return apiFetch<{ deleted: boolean }>(`/community/comments/${id}`, { method: 'DELETE' });
  },

  toggleLikePost(postId: string) {
    return apiFetch<{ liked: boolean }>(`/community/posts/${postId}/like`, { method: 'POST' });
  },

  toggleLikeComment(commentId: string) {
    return apiFetch<{ liked: boolean }>(`/community/comments/${commentId}/like`, { method: 'POST' });
  },

  getUserFeed(userId: string, params?: { page?: number; limit?: number }) {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.limit) sp.set('limit', String(params.limit));
    const qs = sp.toString();
    return apiFetch<CommunityFeed>(`/community/feed/user/${userId}${qs ? `?${qs}` : ''}`);
  },

  reportPost(postId: string, data: { reason: string; description?: string }) {
    return apiFetch<{ id: string }>(`/community/posts/${postId}/report`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  reportComment(commentId: string, data: { reason: string; description?: string }) {
    return apiFetch<{ id: string }>(`/community/comments/${commentId}/report`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  blockUser(userId: string) {
    return apiFetch<{ blocked: boolean }>(`/community/users/${userId}/block`, { method: 'POST' });
  },

  unblockUser(userId: string) {
    return apiFetch<{ blocked: boolean }>(`/community/users/${userId}/block`, { method: 'DELETE' });
  },

  getBlockedUsers() {
    return apiFetch<Array<{ id: string; blockedAt: string; avatarUrl: string | null; studentProfile: any; employerProfile: any }>>(
      '/community/blocked-users',
    );
  },

  search(params: { q: string; type?: string; tags?: string; page?: number; limit?: number }) {
    const sp = new URLSearchParams();
    sp.set('q', params.q);
    if (params.type) sp.set('type', params.type);
    if (params.tags) sp.set('tags', params.tags);
    if (params.page) sp.set('page', String(params.page));
    if (params.limit) sp.set('limit', String(params.limit));
    return apiFetch<CommunityFeed>(`/community/search?${sp.toString()}`);
  },

  getTrendingTags(params?: { days?: number; limit?: number }) {
    const sp = new URLSearchParams();
    if (params?.days) sp.set('days', String(params.days));
    if (params?.limit) sp.set('limit', String(params.limit));
    const qs = sp.toString();
    return apiFetch<Array<{ tag: string; count: number }>>(`/community/trending${qs ? `?${qs}` : ''}`);
  },

  createGigDiscussion(gigId: string) {
    return apiFetch<{ postId: string; alreadyExists: boolean }>(`/community/gigs/${gigId}/discuss`, {
      method: 'POST',
    });
  },

  getGigDiscussionId(gigId: string) {
    return apiFetch<{ postId: string | null }>(`/community/gigs/${gigId}/discussion`);
  },

  crossPostGig(gigId: string) {
    return apiFetch<{ postId: string; alreadyExists: boolean }>(`/community/gigs/${gigId}/cross-post`, {
      method: 'POST',
    });
  },

  toggleSavePost(postId: string) {
    return apiFetch<{ saved: boolean }>(`/community/posts/${postId}/save`, { method: 'POST' });
  },

  getSavedPosts(params?: { page?: number; limit?: number }) {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.limit) sp.set('limit', String(params.limit));
    const qs = sp.toString();
    return apiFetch<CommunityFeed>(`/community/saved${qs ? `?${qs}` : ''}`);
  },

  searchMentions(query: string) {
    return apiFetch<MentionUser[]>(`/community/mentions/search?q=${encodeURIComponent(query)}`);
  },

  recordView(postId: string) {
    return apiFetch<{ viewed: boolean }>(`/community/posts/${postId}/view`, { method: 'POST' });
  },

  getReputation(userId: string) {
    return apiFetch<{ score: number; tier: { name: string; level: number } }>(`/community/reputation/${userId}`);
  },

  recalculateReputation() {
    return apiFetch<{ score: number; tier: { name: string; level: number } }>('/community/reputation/recalculate', { method: 'POST' });
  },

  getCommunityAnalytics() {
    return apiFetch<CommunityAnalytics>('/community/analytics');
  },
};

// ── Blog API ──

export interface BlogPostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  featuredImageAlt: string | null;
  category: string | null;
  tags: string[];
  readingTimeMin: number;
  viewCount: number;
  publishedAt: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  author: { id: string; avatarUrl: string | null };
}

export interface BlogPost extends BlogPostSummary {
  content: string;
  status: 'draft' | 'published' | 'archived';
  canonicalUrl: string | null;
  ogImage: string | null;
  noIndex: boolean;
  focusKeyword: string | null;
  structuredData: object | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostFeed {
  data: BlogPostSummary[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface BlogPostAdminFeed {
  data: BlogPost[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface BlogCategory { name: string; count: number; }
export interface BlogTag { name: string; count: number; }

export const blogApi = {
  // Public
  list(params?: { category?: string; tag?: string; search?: string; page?: number; limit?: number }) {
    const sp = new URLSearchParams();
    if (params?.category) sp.set('category', params.category);
    if (params?.tag) sp.set('tag', params.tag);
    if (params?.search) sp.set('search', params.search);
    if (params?.page) sp.set('page', String(params.page));
    if (params?.limit) sp.set('limit', String(params.limit));
    const qs = sp.toString();
    return apiFetch<BlogPostFeed>(`/blog${qs ? `?${qs}` : ''}`);
  },

  getBySlug(slug: string) {
    return apiFetch<BlogPost>(`/blog/slug/${slug}`);
  },

  getRelated(slug: string, limit = 3) {
    return apiFetch<BlogPostSummary[]>(`/blog/slug/${slug}/related?limit=${limit}`);
  },

  getCategories() {
    return apiFetch<BlogCategory[]>('/blog/categories');
  },

  getTags() {
    return apiFetch<BlogTag[]>('/blog/tags');
  },

  // Admin
  adminList(params?: { status?: string; category?: string; search?: string; page?: number; limit?: number }) {
    const sp = new URLSearchParams();
    if (params?.status) sp.set('status', params.status);
    if (params?.category) sp.set('category', params.category);
    if (params?.search) sp.set('search', params.search);
    if (params?.page) sp.set('page', String(params.page));
    if (params?.limit) sp.set('limit', String(params.limit));
    const qs = sp.toString();
    return apiFetch<BlogPostAdminFeed>(`/blog/admin${qs ? `?${qs}` : ''}`);
  },

  adminGet(id: string) {
    return apiFetch<BlogPost>(`/blog/admin/${id}`);
  },

  adminCreate(data: {
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    featuredImage?: string;
    featuredImageAlt?: string;
    category?: string;
    tags?: string[];
    status?: 'draft' | 'published' | 'archived';
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    ogImage?: string;
    noIndex?: boolean;
    focusKeyword?: string;
  }) {
    return apiFetch<BlogPost>('/blog/admin', { method: 'POST', body: JSON.stringify(data) });
  },

  adminUpdate(id: string, data: {
    title?: string;
    slug?: string;
    content?: string;
    excerpt?: string;
    featuredImage?: string;
    featuredImageAlt?: string;
    category?: string;
    tags?: string[];
    status?: 'draft' | 'published' | 'archived';
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    ogImage?: string;
    noIndex?: boolean;
    focusKeyword?: string;
  }) {
    return apiFetch<BlogPost>(`/blog/admin/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  },

  adminDelete(id: string) {
    return apiFetch<{ message: string }>(`/blog/admin/${id}`, { method: 'DELETE' });
  },

  adminUploadImage(file: File) {
    return uploadFiles('/blog/admin/upload-image', [file]).then((r) => r[0]);
  },
};
