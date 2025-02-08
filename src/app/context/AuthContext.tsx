// src/app/context/AuthContext.tsx

'use client';
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AuthContextType, User } from '../types/auth';

const debug = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[AuthContext] ${message}`, data || '');
  
  if (typeof window !== 'undefined') {
    try {
      const logs = JSON.parse(localStorage.getItem('authContextLogs') || '[]');
      logs.push({ timestamp, message, data });
      localStorage.setItem('authContextLogs', JSON.stringify(logs));
    } catch (error) {
      console.warn('[AuthContext] LocalStorage error:', error);
    }
  }
};

// Update the initial context value to include isAuthenticated
export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  fetchUserData: async () => {
    throw new Error('fetchUserData not implemented');
  },
  isLoading: true,
  error: null,
  logout: () => {},
  isAuthenticated: false // Add this line
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isValidToken = (token: string): boolean => {
    try {
      return token.length > 0 && typeof token === 'string';
    } catch {
      return false;
    }
  };

  const logout = useCallback(() => {
    debug('Logging out user');
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  }, []);

  const fetchUserData = async () => {
    try {
      debug('Fetching user data');
  
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/check`, {
        credentials: 'include', 
      });
  
      if (!response.ok) {
        debug('API response not ok', { status: response.status });
        logout();
        setIsLoading(false);
        return null;
      }
  
      const { authenticated, user } = await response.json();
      debug('User data received', { authenticated, user });
  
      if (authenticated && user) {
        setUser(user);
      } else {
        logout();
      }
  
      setIsLoading(false);
      return user;
    } catch (error) {
      debug('Error fetching user data', error);
      setError('Failed to fetch user data');
      logout();
      setIsLoading(false);
      return null;
    }
  };

  useEffect(() => {
    debug('Initializing auth state', {
      apiUrl: process.env.NEXT_PUBLIC_API_URL,
      environment: process.env.NODE_ENV
    });
    fetchUserData();
  }, []);

  useEffect(() => {
    debug('Auth state updated', { 
      isAuthenticated: !!user,
      isLoading,
      hasError: !!error 
    });
  }, [user, isLoading, error]);

  // Include isAuthenticated in the context value
  const value: AuthContextType = {
    user,
    setUser,
    fetchUserData,
    isLoading,
    error,
    logout,
    isAuthenticated: !!user 
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}