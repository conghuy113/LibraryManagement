'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { logout as logoutAction } from '../app/actions/user/logout';

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: string | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userRole: null,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  const logout = async () => {
    try {
      const accessToken = Cookies.get('accessToken');
      const refreshToken = Cookies.get('refreshToken');
      
      if (accessToken && refreshToken) {
        await logoutAction(accessToken, refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Xóa cookies
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      Cookies.remove('userRole');
      setIsAuthenticated(false);
      setUserRole(null);
      router.push('/');
    }
  };

  const checkAuth = () => {
    const accessToken = Cookies.get('accessToken');
    const role = Cookies.get('userRole');
    setIsAuthenticated(!!accessToken);
    setUserRole(role || null);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
