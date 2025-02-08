// components/LoginModal.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter();
  const { setUser } = useAuth();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [apiUrl, setApiUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initialize API URL from environment variable
    setApiUrl(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
    console.log('Initial API URL:', process.env.NEXT_PUBLIC_API_URL);
  }, []);

  if (!isOpen) return null;

  const checkBackendHealth = async (url: string): Promise<boolean> => {
    try {
      console.log(`Checking backend health at: ${url}/api/health`);
      const response = await fetch(`${url}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        console.warn(`Health check failed for ${url}:`, response.status);
        return false;
      }

      const data = await response.json();
      console.log('Health check response:', data);
      return true;
    } catch (error) {
      console.error(`Health check error for ${url}:`, error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Debug current state
      console.log('Starting login process...');
      console.log('Current API URL:', apiUrl);
      console.log('Environment:', process.env.NODE_ENV);

      // Check local backend first
      const isLocalAvailable = await checkBackendHealth(apiUrl);

      if (!isLocalAvailable) {
        console.log('Local backend not available, switching to Render');
        setApiUrl('https://lebaincode-backend.onrender.com');
      }

      console.log('Using API URL:', apiUrl);

      // Attempt login
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      console.log('Login response status:', response.status);
      
      if (response.ok) {
        console.log('Login successful');
        if (data.token) {
          localStorage.setItem('token', data.token);
          console.log('Token stored in localStorage');
        }
        setUser(data.user);
        onClose();
        router.push('/dashboard');
      } else {
        console.error('Login failed:', data.message);
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-[#1F2937] p-8 rounded-lg w-96">
        <h2 className="text-2xl font-bold text-white mb-6">Organization Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              className="w-full px-3 py-2 bg-gray-700 rounded text-white border border-gray-600 focus:outline-none focus:border-[#BF9ACA]"
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-3 py-2 bg-gray-700 rounded text-white border border-gray-600 focus:outline-none focus:border-[#BF9ACA]"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            />
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className={`bg-[#BF9ACA] px-4 py-2 rounded text-sm hover:bg-[#7C3AED] transition-colors flex-1 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="border border-gray-600 px-4 py-2 rounded text-sm hover:bg-gray-700 transition-colors flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}