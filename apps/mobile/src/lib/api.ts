import Constants from 'expo-constants';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './storage';

const API_BASE_URL =
  Constants.expoConfig?.extra?.apiUrl || 'https://intemso.com/api/v1';

// ── Types ──

export interface AuthResponse {
  user: { id: string; email: string | null; ghanaCardNumber?: string | null; role: string };
  accessToken: string;
  refreshToken: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

// ── Token refresh ──

let isRefreshing = false;
let refreshPromise: Promise<TokenResponse | null> | null = null;

async function refreshAccessToken(): Promise<TokenResponse | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      await clearTokens();
      return null;
    }

    const data: TokenResponse = await res.json();
    await setTokens(data.accessToken, data.refreshToken);
    return data;
  } catch {
    await clearTokens();
    return null;
  }
}

// ── Core fetch wrapper ──

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const accessToken = await getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401 && (await getRefreshToken())) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshAccessToken();
    }

    const tokens = await refreshPromise;
    isRefreshing = false;
    refreshPromise = null;

    if (tokens) {
      headers['Authorization'] = `Bearer ${tokens.accessToken}`;
      res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
    }
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({
      statusCode: res.status,
      message: res.statusText,
    }));
    throw errorBody as ApiError;
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Upload helper ──

export async function apiUpload<T = unknown>(
  path: string,
  formData: FormData,
): Promise<T> {
  const accessToken = await getAccessToken();
  const headers: Record<string, string> = {};
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({
      statusCode: res.status,
      message: res.statusText,
    }));
    throw errorBody as ApiError;
  }

  if (res.status === 204) return undefined as T;
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

  registerWithGhanaCard(data: {
    ghanaCardNumber: string;
    fullName: string;
    password: string;
    role: 'student' | 'employer';
    university?: string;
  }) {
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

  logout(refreshToken: string) {
    return apiFetch<{ message: string }>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },
};

// ── Users API ──

export const usersApi = {
  getProfile() {
    return apiFetch<{
      id: string;
      email: string;
      role: string;
      avatarUrl: string | null;
      emailVerified: boolean;
      createdAt: string;
      studentProfile: Record<string, any> | null;
      employerProfile: Record<string, any> | null;
    }>('/users/me');
  },

  getPublicProfile(userId: string) {
    return apiFetch<any>(`/users/${userId}/profile`);
  },

  updateStudentProfile(data: Record<string, any>) {
    return apiFetch('/users/me/student-profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  updateEmployerProfile(data: Record<string, any>) {
    return apiFetch('/users/me/employer-profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
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
  list() {
    return apiFetch<Category[]>('/categories');
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
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export const gigsApi = {
  list(params?: {
    page?: number;
    limit?: number;
    category?: string;
    budgetType?: string;
    search?: string;
  }) {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.limit) sp.set('limit', String(params.limit));
    if (params?.category) sp.set('category', params.category);
    if (params?.budgetType) sp.set('budgetType', params.budgetType);
    if (params?.search) sp.set('search', params.search);
    const qs = sp.toString();
    return apiFetch<PaginatedGigs>(`/gigs${qs ? `?${qs}` : ''}`);
  },

  getById(id: string) {
    return apiFetch<GigListItem & { applications: any[] }>(`/gigs/${id}`);
  },

  listMine(params?: { page?: number; limit?: number; status?: string }) {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.limit) sp.set('limit', String(params.limit));
    if (params?.status) sp.set('status', params.status);
    const qs = sp.toString();
    return apiFetch<PaginatedGigs>(`/gigs/mine${qs ? `?${qs}` : ''}`);
  },
};

// ── Applications API ──

export const applicationsApi = {
  apply(gigId: string, data: { note?: string; suggestedRate?: number }) {
    return apiFetch<any>(`/applications/${gigId}/apply`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  listMine(params?: { page?: number; status?: string }) {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.status) sp.set('status', params.status);
    const qs = sp.toString();
    return apiFetch<any>(`/applications/mine${qs ? `?${qs}` : ''}`);
  },

  withdraw(applicationId: string) {
    return apiFetch<any>(`/applications/${applicationId}/withdraw`, {
      method: 'PATCH',
    });
  },
};

// ── Messages API ──

export const messagesApi = {
  listConversations() {
    return apiFetch<any[]>('/conversations');
  },

  getMessages(conversationId: string, page = 1) {
    return apiFetch<any>(`/conversations/${conversationId}/messages?page=${page}`);
  },

  sendMessage(conversationId: string, content: string) {
    return apiFetch<any>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  createConversation(participantId: string) {
    return apiFetch<any>('/conversations', {
      method: 'POST',
      body: JSON.stringify({ participantId }),
    });
  },

  markRead(conversationId: string) {
    return apiFetch<any>(`/conversations/${conversationId}/read`, {
      method: 'PATCH',
    });
  },
};

// ── Notifications API ──

export const notificationsApi = {
  list(page = 1) {
    return apiFetch<any>(`/notifications?page=${page}`);
  },

  unreadCount() {
    return apiFetch<{ count: number }>('/notifications/unread-count');
  },

  markRead(id: string) {
    return apiFetch<any>(`/notifications/${id}/read`, { method: 'PATCH' });
  },

  markAllRead() {
    return apiFetch<any>('/notifications/read-all', { method: 'PATCH' });
  },
};

// ── Connects API ──

export const connectsApi = {
  getBalance() {
    return apiFetch<{ balance: number; freeRemaining: number }>('/connects/balance');
  },
};

// ── Contracts API ──

export const contractsApi = {
  listMine(params?: { page?: number; status?: string }) {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.status) sp.set('status', params.status);
    const qs = sp.toString();
    return apiFetch<any>(`/contracts/mine${qs ? `?${qs}` : ''}`);
  },

  getById(id: string) {
    return apiFetch<any>(`/contracts/${id}`);
  },
};

// ── Wallet API ──

export const walletApi = {
  getWallet() {
    return apiFetch<any>('/wallet');
  },
};

// ── Services API ──

export const servicesApi = {
  list(params?: { page?: number; search?: string; category?: string }) {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.search) sp.set('search', params.search);
    if (params?.category) sp.set('category', params.category);
    const qs = sp.toString();
    return apiFetch<any>(`/services${qs ? `?${qs}` : ''}`);
  },

  getById(id: string) {
    return apiFetch<any>(`/services/${id}`);
  },
};
