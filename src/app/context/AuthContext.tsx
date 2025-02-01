// src/app/context/AuthContext.tsx
'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType, User } from '../types/auth';
import { useSearchParams } from 'next/navigation';

const getApiUrl = async () => {
  try {
    const healthCheck = await fetch('http://localhost:5000/api/health');
    if (healthCheck.ok) {
      return 'http://localhost:5000';
    }
  } catch {
    console.log('Local backend not available, using Render backend');
  }
  return 'https://lebaincode-backend.onrender.com';
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  fetchUserData: async () => {
    throw new Error('fetchUserData not implemented');
  },
  isLoading: true
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, clearing user state');
        setUser(null);
        setIsLoading(false);
        return null;
      }
  
      const apiUrl = await getApiUrl();
      console.log('Fetching user data from:', apiUrl);
  
      const response = await fetch(`${apiUrl}/api/auth/user/profile`, { // Updated endpoint
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
  
      if (!response.ok) {
        console.log('Failed to fetch user data:', response.status);
        localStorage.removeItem('token');
        setUser(null);
        setIsLoading(false);
        return null;
      }
  
      const userData = await response.json();
      const transformedUser = {
        _id: userData._id,
        username: userData.username,
        email: userData.email,
        role: userData.role,
        githubId: userData.githubId,
        progress: userData.progress
      };
  
      setUser(transformedUser);
      setIsLoading(false);
      return transformedUser;
    } catch (error) {
      console.error('Error in fetchUserData:', error);
      localStorage.removeItem('token');
      setUser(null);
      setIsLoading(false);
      return null;
    }
  };

  useEffect(() => {
    const handleAuthentication = async () => {
      try {
        const tokenFromUrl = searchParams.get('token');
        
        if (tokenFromUrl) {
          localStorage.setItem('token', tokenFromUrl);
          await fetchUserData();
          // Use window.history.replaceState to remove token from URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          const storedToken = localStorage.getItem('token');
          if (storedToken) {
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

  const value: AuthContextType = {
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