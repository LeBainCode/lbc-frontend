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
    const token = localStorage.getItem('token');
    console.log('Token for fetching user data:', token); // Log the token

    if (!token) {
        console.error('No token found, unable to fetch user data.');
        return;
    }
  
    const response = await fetch('https://lebaincode-backend.onrender.com/api/user/profile', {
      headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
      }
  });

  
      if (response.ok) {
        const userData = await response.json();
        console.log('User data fetched successfully:', userData); // Log the user data
        setUser(userData);
    } else {
        console.error('Failed to fetch user data:', response.status, response.statusText); // Log error
        setUser(null);
        localStorage.removeItem('token'); // Clear token if fetch fails
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