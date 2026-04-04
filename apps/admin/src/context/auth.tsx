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
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    usersApi
      .getProfile()
      .then((profile) => {
        const u = profile as User;
        // Enforce admin-only access
        if (u.role !== 'ADMIN') {
          clearTokens();
          setUser(null);
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

    // Reject non-admin logins
    if (u.role !== 'ADMIN') {
      clearTokens();
      throw new Error('Access denied. Admin credentials required.');
    }

    setUser(u);
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
