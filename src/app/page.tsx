// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from "./components/Navbar";
import Rules from "./components/Rules";
import AddOns from "./components/AddOns";
import Pricing from "./components/Pricing";
import FAQ from "./components/FAQ";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import LoginModal from "./components/LoginModal";
import { ConsoleDebugger } from './utils/consoleDebug';
import type { DebugInfo } from './utils/consoleDebug';

interface Prospect {
  email: string;
  createdAt: string;
  type?: 'individual' | 'organization' | 'other';
  reachedOut?: boolean;
  comment?: string;
}

export default function Home() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [emailMessage, setEmailMessage] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  const [apiUrl, setApiUrl] = useState<string>('');
  

  useEffect(() => {
    const consoleDebugger = ConsoleDebugger.getInstance();
    const debugInfo: DebugInfo = {
      environment: process.env.NODE_ENV || 'development',
      apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://lebaincode-backend.onrender.com',
      version: '1.0.0',
      buildTime: new Date().toISOString()
    };

    // Store the API URL in state
    setApiUrl(debugInfo.apiUrl);
  
    consoleDebugger.showUserWelcome();
    consoleDebugger.showDevConsole(debugInfo);
  
    console.group('🏠 Home Component Initialized');
    console.log('User:', user);
    console.log('Initial Email:', email);
    console.log('Environment:', debugInfo.environment);
    console.groupEnd();
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    console.group('📧 Email Submission');
    console.log('Starting email submission process', {
      email,
      isLoggedIn: !!user,
      timestamp: new Date().toISOString()
    });
  
    try {
      console.log('Using API URL:', apiUrl);
  
      if (!user) {
        const userCheckResponse = await fetch(`${apiUrl}/api/users/check-email`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email })
        });
  
        const userData = await userCheckResponse.json();
        console.log('User check response:', userData);
        console.groupEnd();
  
        if (userData.exists) {
          console.log('✓ Existing user found:', userData.username);
          setEmailMessage(`Hi ${userData.username}, please login`);
          return;
        }
  
        console.group('🔍 Prospect Check');
        // Check if email exists in Prospects collection
        const prospectCheckResponse = await fetch(`${apiUrl}/api/prospects/check-email`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email })
        });
  
        const prospectData = await prospectCheckResponse.json();
        console.log('Prospect check response:', prospectData);
        console.groupEnd();
  
        if (prospectData.exists) {
          console.log('✓ Existing prospect found');
          setEmailMessage('This email is already registered');
          return;
        }
  
        console.group('📝 New Prospect Registration');
        // Register new prospect
        const response = await fetch(`${apiUrl}/api/prospects/email`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email })
        });
  
        const responseData = await response.json();
        console.log('Registration response:', responseData);
        console.groupEnd();
  
        if (!response.ok) {
          throw new Error(responseData.message || 'Failed to save email');
        }
  
        console.log('✔ Email saved successfully');
        setEmailMessage('Email saved successfully!');
        setIsSubmitted(true);
      } else {
        console.log('👤 Logged in user:', user);
        setEmail(user.email || '');
        setEmailMessage('Welcome back!');
      }
  
      setTimeout(() => setEmailMessage(''), 3000);
    } catch (error) {
      console.group('❌ Error');
      console.error('Email submission error:', error);
      console.trace('Error stack:');
      console.groupEnd();
      
      setEmailMessage(error instanceof Error ? error.message : 'An error occurred');
      setTimeout(() => setEmailMessage(''), 3000);
    } finally {
      console.groupEnd();
    }
  };
  

  const handleDashboardClick = () => {
    router.push('/dashboard');
  };

  const handleGitHubSignIn = () => {
    window.location.href = process.env.NODE_ENV === 'production'
      ? 'https://lebaincode-backend.onrender.com/api/auth/github'
      : 'http://localhost:5000/api/auth/github';
  };

  return (
    <>
      <main className="min-h-screen bg-[#0D1117]">
        <Navbar />
        <div className="container mx-auto px-6 pt-32" id="/">
          <div className="max-w-2xl">
            <h1 className="text-6xl font-bold text-white mb-6">Le Bain Code</h1>
            <p className="text-gray-400 text-base mb-8 max-w-md leading-relaxed">
              This is a paragraph with more information about something
              important. This something has many uses and is made of 100%
              recycled material.
            </p>
            <div className="flex gap-3">
            {!user ? (
              <form onSubmit={handleEmailSubmit} className="flex relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className={`w-[240px] px-3 py-2 bg-transparent rounded-l text-sm border border-gray-700
                            focus:outline-none focus:border-[#BF9ACA] text-[#BF9ACA]
                            placeholder-gray-500 transition-all duration-300`}
                />
                <button 
                  type="submit"
                  className="bg-[#BF9ACA] px-4 py-2 rounded-r text-sm hover:bg-[#7C3AED] transition-colors whitespace-nowrap"
                >
                  Submit
                </button>
                {emailMessage && (
                  <div className="absolute -top-8 left-0 bg-[#BF9ACA] text-white px-3 py-1 rounded text-sm animate-fade-in-out">
                    {emailMessage}
                  </div>
                )}
                <button 
                  onClick={handleGitHubSignIn}
                  className="ml-2 bg-[#BF9ACA] px-4 py-2 rounded text-sm hover:bg-[#7C3AED] transition-colors whitespace-nowrap"
                >
                  Sign in through GitHub
                </button>
              </form>
            ) : (
              <form onSubmit={handleEmailSubmit} className="flex flex-1 max-w-[440px] relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={user.email 
                    ? `Any updates will be sent to ${user.email}`
                    : "Enter your email address for updates, no spam promise"
                  }
                  className={`flex-1 px-3 py-2 bg-transparent rounded-l text-sm border border-gray-700
                            focus:outline-none focus:border-[#BF9ACA] text-[#BF9ACA]
                            placeholder-gray-500 transition-all duration-300`}
                />
                <button 
                  type="submit"
                  className="bg-[#BF9ACA] px-4 py-2 rounded-r text-sm hover:bg-[#7C3AED] transition-colors"
                >
                  Submit
                </button>
                {emailMessage && (
                  <div className="absolute -top-8 left-0 bg-[#BF9ACA] text-white px-3 py-1 rounded text-sm animate-fade-in-out">
                    {emailMessage}
                  </div>
                )}
              </form>
            )}
                {user ? (
                // Dashboard button for logged-in users
                <button 
                  onClick={handleDashboardClick}
                  className="border-2 border-[#BF9ACA] px-4 py-2 rounded text-sm hover:bg-gray-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  Dashboard
                  <span className="text-gray-400">→</span>
                </button>
              ) : (
                // Organization Login button for non-logged-in users
                <button 
                  onClick={() => setIsLoginModalOpen(true)}
                  className="border-2 border-[#BF9ACA] px-4 py-2 rounded text-sm hover:bg-gray-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  Organization Login
                  <span className="text-gray-400">→</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div
          className="container mx-auto px-6 mt-32 flex justify-center"
          id="rules"
        >
          <Rules />
        </div>

        <div className="container mx-auto px-6 mt-32 mb-20 flex justify-center">
          <AddOns />
        </div>

        <div className="container mx-auto px-6 mt-32 mb-20 flex justify-center">
          <Pricing />
        </div>

        <div className="container mx-auto px-6 mt-32 mb-20 flex justify-center">
          <FAQ />
        </div>

        <div
          className="container mx-auto px-6 mt-32 pb-32 flex justify-center"
          id="contact"
        >
          <Contact />
        </div>
      </main>
      <Footer />
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </>
  );
}
