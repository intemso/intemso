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
  getRefreshToken,
  type AuthResponse,
} from '@/lib/api';

type GhanaCardRegisterData = { ghanaCardNumber: string; fullName: string; password: string; role: 'employer'; };

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
    // Check for one-time auth code from cross-domain redirect
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const authCode = params.get('auth_code');
      if (authCode) {
        // Clear the code from URL immediately
        params.delete('auth_code');
        const newSearch = params.toString();
        window.history.replaceState(null, '', window.location.pathname + (newSearch ? '?' + newSearch : ''));
        // Exchange the code for tokens
        authApi
          .exchangeCode(authCode)
          .then(({ accessToken, refreshToken }) => {
            setTokens(accessToken, refreshToken);
            // Reload to initialize with the new tokens
            window.location.reload();
          })
          .catch(() => {
            // Code invalid or expired — continue without auth
            setIsLoading(false);
          });
        return;
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
        // Enforce employer-only access
        if (u.role !== 'employer') {
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

    // Reject non-employer logins
    if (u.role !== 'employer') {
      clearTokens();
      throw new Error('This portal is for employers only. Please use the correct portal for your account.');
    }

    setUser(u);
  }, []);

  const loginWithGhanaCard = useCallback(async (ghanaCardNumber: string, password: string) => {
    const res: AuthResponse = await authApi.loginWithGhanaCard(ghanaCardNumber, password);
    setTokens(res.accessToken, res.refreshToken);

    const profile = await usersApi.getProfile();
    const u = profile as User;

    if (u.role !== 'employer') {
      clearTokens();
      throw new Error('This portal is for employers only. Please use the correct portal for your account.');
    }

    setUser(u);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const res: AuthResponse = await authApi.register(email, password, 'employer');
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
    const rt = getRefreshToken();
    if (rt) authApi.logout(rt).catch(() => {});
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
