'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import {
  authApi,
  usersApi,
  setTokens,
  clearTokens,
  getAccessToken,
  type AuthResponse,
} from '@/lib/api';

type GhanaCardRegisterData = { ghanaCardNumber: string; fullName: string; password: string; role: 'student'; university?: string; };

export interface User {
  id: string;
  email: string;
  role: string;
  avatarUrl: string | null;
  emailVerified: boolean;
  createdAt: string;
  studentProfile: Record<string, unknown> | null;
  employerProfile: Record<string, unknown> | null;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGhanaCard: (ghanaCardNumber: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  registerWithGhanaCard: (data: GhanaCardRegisterData) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'http://localhost:3000';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for tokens passed via URL hash (cross-domain redirect from intemso.com)
    if (typeof window !== 'undefined' && window.location.hash) {
      const params = new URLSearchParams(window.location.hash.slice(1));
      const hashAccess = params.get('access_token');
      const hashRefresh = params.get('refresh_token');
      if (hashAccess && hashRefresh) {
        setTokens(hashAccess, hashRefresh);
        // Clear the hash from URL to avoid exposing tokens
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }

    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    usersApi
      .getProfile()
      .then((profile) => {
        const u = profile as User;
        // Enforce student-only access
        if (u.role !== 'student') {
          clearTokens();
          setUser(null);
          window.location.href = PUBLIC_SITE_URL + '/auth/login?error=wrong_portal';
          return;
        }
        setUser(u);
      })
      .catch(() => {
        clearTokens();
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res: AuthResponse = await authApi.login(email, password);
    setTokens(res.accessToken, res.refreshToken);

    const profile = await usersApi.getProfile();
    const u = profile as User;

    // Reject non-student logins
    if (u.role !== 'student') {
      clearTokens();
      throw new Error('This portal is for students only. Please use the correct portal for your account.');
    }

    setUser(u);
  }, []);

  const loginWithGhanaCard = useCallback(async (ghanaCardNumber: string, password: string) => {
    const res: AuthResponse = await authApi.loginWithGhanaCard(ghanaCardNumber, password);
    setTokens(res.accessToken, res.refreshToken);

    const profile = await usersApi.getProfile();
    const u = profile as User;

    if (u.role !== 'student') {
      clearTokens();
      throw new Error('This portal is for students only. Please use the correct portal for your account.');
    }

    setUser(u);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const res: AuthResponse = await authApi.register(email, password, 'student');
    setTokens(res.accessToken, res.refreshToken);
    const profile = await usersApi.getProfile();
    setUser(profile as User);
  }, []);

  const registerWithGhanaCard = useCallback(async (data: GhanaCardRegisterData) => {
    const res: AuthResponse = await authApi.registerWithGhanaCard(data);
    setTokens(res.accessToken, res.refreshToken);
    const profile = await usersApi.getProfile();
    setUser(profile as User);
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    window.location.href = '/auth/login';
  }, []);

  const refreshProfile = useCallback(async () => {
    const profile = await usersApi.getProfile();
    setUser(profile as User);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        loginWithGhanaCard,
        register,
        registerWithGhanaCard,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
