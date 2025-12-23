/**
 * Authentication Context
 * Manages user authentication state and trial status
 * SECURITY: Uses httpOnly cookies for JWT storage (set by backend)
 */
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, TrialStatus, UserRole } from '@/lib/validators';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  trialStatus: TrialStatus | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, full_name: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshTrialStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fetch current user on mount
  useEffect(() => {
    console.log('AuthContext: Fetching current user...');
    fetchCurrentUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCurrentUser = async () => {
    try {
      console.log('AuthContext: Calling /users/me');
      const response = await api.get('/users/me');
      console.log('AuthContext: User fetched:', response.data);
      setUser(response.data);
      
      // If user is EMPRESA, fetch trial status
      if (response.data.role === 'EMPRESA') {
        await fetchTrialStatus();
      }
    } catch (error: any) {
      // User not authenticated or token expired
      console.log('AuthContext: User not authenticated or token expired');
      setUser(null);
      setTrialStatus(null);
      
      // If we get 401, redirect to login
      if (error.response?.status === 401) {
        console.log('AuthContext: Redirecting to login due to 401');
        try {
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            router.push('/login');
          }
        } catch (err) {
          console.error('AuthContext: redirect error', err);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTrialStatus = async () => {
    try {
      const response = await api.get('/users/trial-status');
      setTrialStatus(response.data);
    } catch (error) {
      console.error('Error fetching trial status:', error);
    }
  };

  const login = async (email: string, password: string) => {
    // Login request - backend sets httpOnly cookie
    await api.post('/auth/login', { email, password });
    
    // Fetch user data with the new cookie
    const userResponse = await api.get('/users/me');
    const userData = userResponse.data;
    setUser(userData);
    
    // If user is EMPRESA, fetch trial status
    if (userData.role === 'EMPRESA') {
      await fetchTrialStatus();
    }
    
    // Redirect based on role (only if target differs from current path)
    const role = userData.role;
    const target =
      role === 'EMPRESA'
        ? '/empresa/dashboard'
        : role === 'INFLUENCER'
        ? '/influencer/dashboard'
        : role === 'ADMIN'
        ? '/admin/dashboard'
        : null;

    try {
      if (target && typeof window !== 'undefined' && window.location.pathname !== target) {
        console.log('AuthContext: redirecting to', target);
        router.push(target);
      } else {
        console.log('AuthContext: no redirect needed (already at)', target);
      }
    } catch (err) {
      console.error('AuthContext: redirect error', err);
    }
  };

  const register = async (email: string, password: string, full_name: string, role: UserRole) => {
    await api.post('/auth/register', {
      email,
      password,
      full_name,
      role,
    });
    
    // Auto-login after registration
    await login(email, password);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setTrialStatus(null);
      // Avoid pushing to same path repeatedly
      try {
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          router.push('/login');
        }
      } catch (err) {
        console.error('AuthContext: logout redirect error', err);
      }
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  const refreshTrialStatus = async () => {
    if (user?.role === 'EMPRESA') {
      await fetchTrialStatus();
    }
  };

  const value: AuthContextType = {
    user,
    trialStatus,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    refreshTrialStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
