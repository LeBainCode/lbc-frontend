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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('https://lebaincode-backend.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        setUser(data.user);
        onClose(); 
        router.push('/dashboard'); 
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again or contact us.');
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
              className="bg-[#BF9ACA] px-4 py-2 rounded text-sm hover:bg-[#7C3AED] transition-colors flex-1"
            >
              Login
            </button>
            <button
              type="button"
              onClick={onClose}
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