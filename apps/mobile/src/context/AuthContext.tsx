import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, usersApi, AuthResponse } from '../lib/api';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../lib/storage';

interface User {
  id: string;
  email: string;
  role: string;
  avatarUrl: string | null;
  studentProfile: Record<string, any> | null;
  employerProfile: Record<string, any> | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGhanaCard: (ghanaCardNumber: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: 'student' | 'employer') => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  loginWithGhanaCard: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const token = await getAccessToken();
      if (!token) {
        setUser(null);
        return;
      }
      const profile = await usersApi.getProfile();
      setUser(profile as any);
    } catch {
      setUser(null);
      await clearTokens();
    }
  }, []);

  useEffect(() => {
    fetchUser().finally(() => setIsLoading(false));
  }, [fetchUser]);

  const handleAuthResponse = async (res: AuthResponse) => {
    await setTokens(res.accessToken, res.refreshToken);
    const profile = await usersApi.getProfile();
    setUser(profile as any);
  };

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    await handleAuthResponse(res);
  };

  const loginWithGhanaCard = async (ghanaCardNumber: string, password: string) => {
    const res = await authApi.loginWithGhanaCard(ghanaCardNumber, password);
    await handleAuthResponse(res);
  };

  const register = async (email: string, password: string, role: 'student' | 'employer') => {
    const res = await authApi.register(email, password, role);
    await handleAuthResponse(res);
  };

  const logout = async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (refreshToken) await authApi.logout(refreshToken);
    } catch {
      // ignore
    }
    await clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        loginWithGhanaCard,
        register,
        logout,
        refreshUser: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
