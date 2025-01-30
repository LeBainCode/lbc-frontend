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

export default function Home() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { user, setUser } = useAuth();
  const router = useRouter();
  const [emailMessage, setEmailMessage] = useState('');

  // Effect to set email if user has one
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      const baseUrl = process.env.NODE_ENV === 'production'
        ? 'https://lebaincode-backend.onrender.com'
        : 'http://localhost:5000';
  
      // If user is not logged in
      if (!user) {
        // Check if email exists in User collection
        const userCheckResponse = await fetch(`${baseUrl}/api/users/check-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email })
        });
        const userData = await userCheckResponse.json();
  
        if (userData.exists) {
          setEmailMessage(`Hi ${userData.username}, please login`);
          return;
        }
  
        // Check if email exists in Prospects collection
        const prospectCheckResponse = await fetch(`${baseUrl}/api/prospects/check-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email })
        });
        const prospectData = await prospectCheckResponse.json();
  
        if (prospectData.exists) {
          setEmailMessage('This email is already registered');
          return;
        }
  
        // If email doesn't exist anywhere, register as new prospect
        const response = await fetch(`${baseUrl}/api/prospects/email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email })
        });
  
        if (!response.ok) {
          throw new Error('Failed to save email');
        }
  
        setEmailMessage('Email saved successfully!');
      } else {
        // User is logged in - show their email with message
        setEmail(user.email || '');
        setEmailMessage('Welcome back!');
      }
  
      setTimeout(() => setEmailMessage(''), 3000);
    } catch (error) {
      console.error('Error:', error);
      setEmailMessage('An error occurred');
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
