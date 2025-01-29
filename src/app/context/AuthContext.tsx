// src/app/context/AuthContext.tsx
'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType, User } from '../types/auth';
import { useSearchParams } from 'next/navigation';

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const baseUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:5000'
        : 'https://lebaincode-backend.onrender.com';

      const response = await fetch(`${baseUrl}/api/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.error('Failed to fetch user data:', response.status, response.statusText);
        setUser(null);
        localStorage.removeItem('token');
        throw new Error('Failed to fetch user data');
      }

      const userData = await response.json();
      console.log('User data fetched successfully:', userData);
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUser(null);
      localStorage.removeItem('token');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleAuthentication = async () => {
      try {
        // Check for token in URL params (from GitHub callback)
        const tokenFromUrl = searchParams.get('token');
        if (tokenFromUrl) {
          console.log('Token found in URL, saving to localStorage');
          localStorage.setItem('token', tokenFromUrl);
          await fetchUserData();
        } else {
          // Check localStorage as fallback
          const storedToken = localStorage.getItem('token');
          if (storedToken) {
            console.log('Token found in localStorage, fetching user data');
            await fetchUserData();
          } else {
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('Authentication error:', error);
        setIsLoading(false);
      }
    };

    handleAuthentication();
  }, [searchParams]);

  const value = {
    user,
    setUser,
    fetchUserData,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};