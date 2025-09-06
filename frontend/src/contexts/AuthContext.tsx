'use client';

import { createContext, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { logout } from '@/app/actions/user/logout';

interface AuthContextType {
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const logout = async () => {
    const accessToken = (typeof window !== 'undefined') ? Cookies.get('accessToken') : undefined;
    const refreshToken = (typeof window !== 'undefined') ? Cookies.get('refreshToken') : undefined;
    if (accessToken && refreshToken) {
      const { logout } = await import('@/app/actions/user/logout');
      await logout(accessToken, refreshToken);
    }
    if (typeof window !== 'undefined') {
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
    }
    router.push('/');
  };

  const checkAuth = () => {
    if (typeof window !== 'undefined') {
      const refreshToken = Cookies.get('refreshToken');
      if (!refreshToken) {
        router.push('/');
      }
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated: true, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
