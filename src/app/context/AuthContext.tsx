// src/app/context/AuthContext.tsx
'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType, User } from '../types/auth';
import { useSearchParams } from 'next/navigation';

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const searchParams = useSearchParams();


  useEffect(() => {
    // Check for token in URL params (from GitHub callback)
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      localStorage.setItem('token', tokenFromUrl);
      fetchUserData();
    } else {
      // Check localStorage as fallback
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        fetchUserData();
      }
    }
  }, [searchParams]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        return;
      }
  
      const response = await fetch('https://lebaincode-backend.onrender.com/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
  
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUser(null);
      localStorage.removeItem('token');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserData();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, fetchUserData }}>
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