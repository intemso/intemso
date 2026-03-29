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
  register: (email: string, password: string, role: 'student' | 'employer') => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, check if we have a token and load the profile
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    usersApi
      .getProfile()
      .then((profile) => setUser(profile as User))
      .catch(() => {
        clearTokens();
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res: AuthResponse = await authApi.login(email, password);
    setTokens(res.accessToken, res.refreshToken);

    // Fetch full profile (includes student/employer profile data)
    const profile = await usersApi.getProfile();
    setUser(profile as User);
  }, []);

  const register = useCallback(
    async (email: string, password: string, role: 'student' | 'employer') => {
      const res: AuthResponse = await authApi.register(email, password, role);
      setTokens(res.accessToken, res.refreshToken);

      // Fetch full profile
      const profile = await usersApi.getProfile();
      setUser(profile as User);
    },
    [],
  );

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    // Redirect to home
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
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
        register,
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
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
