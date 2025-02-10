// components/LoginModal.tsx

'use client';
import { useState } from 'react';
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
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      console.log('Attempting login at:', `${apiUrl}/api/auth/login`);

      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      console.log('Login successful');
      
      setUser(data.user);
      onClose();
      router.push('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1F2937] p-8 rounded-lg w-96 relative">
        <h2 className="text-2xl font-bold text-white mb-6">Organization Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              className="w-full px-3 py-2 bg-gray-700 rounded text-white border border-gray-600 focus:outline-none focus:border-[#BF9ACA]"
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
              disabled={isLoading}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-3 py-2 bg-gray-700 rounded text-white border border-gray-600 focus:outline-none focus:border-[#BF9ACA]"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              disabled={isLoading}
              required
            />
          </div>
          
          {error && (
            <div className="mt-2 p-2 bg-red-500 bg-opacity-10 border border-red-500 rounded">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className={`bg-[#BF9ACA] px-4 py-2 rounded text-sm hover:bg-[#7C3AED] transition-colors flex-1 relative ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <span className="opacity-0">Login</span>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </>
              ) : (
                'Login'
              )}
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