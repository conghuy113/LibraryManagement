'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { logout as logoutAction } from '../app/actions/user/logout';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: string | null;
  user: User | null;
  logout: () => void;
  checkAuth: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userRole: null,
  user: null,
  logout: () => {},
  checkAuth: () => {},
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = async () => {
    try {
      const accessToken = Cookies.get('accessToken');
      const refreshToken = Cookies.get('refreshToken');
      
      if (accessToken && refreshToken) {
        await logoutAction(accessToken, refreshToken);
      }
      
      toast.success('Đăng xuất thành công!');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Xóa cookies và reset state
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      Cookies.remove('userRole');
      setIsAuthenticated(false);
      setUserRole(null);
      setUser(null);
      router.push('/');
    }
  };

  const checkAuth = () => {
    setIsLoading(true);
    const accessToken = Cookies.get('accessToken');
    const role = Cookies.get('userRole');
    
    if (accessToken && role) {
      setIsAuthenticated(true);
      setUserRole(role);
      // You can extract user info from token or make API call here
      setUser({
        id: 'user-id', // Extract from token
        email: 'user@example.com', // Extract from token
        firstName: 'User',
        lastName: 'Name',
        role: role
      });
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
      setUser(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userRole, 
      user, 
      logout, 
      checkAuth, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
