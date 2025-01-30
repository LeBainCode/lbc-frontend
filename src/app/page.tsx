// src/app/page.tsx
'use client';

import { useState } from 'react';
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
  const { user } = useAuth();
  const router = useRouter();

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
                  // Show GitHub sign-in when user is not logged in
                  <div className="flex">
                    <input
                      type="email"
                      placeholder="Email address"
                      className="w-[240px] px-3 py-2 bg-#e6e6e6 rounded text-sm border border-gray-700 focus:outline-none focus:border-gray-600"
                    />
                    <button 
                      onClick={handleGitHubSignIn}
                      className="bg-[#BF9ACA] px-4 py-2 rounded text-sm hover:bg-[#7C3AED] transition-colors whitespace-nowrap"
                    >
                      Sign in through GitHub
                    </button>
                  </div>
                ) : (
                  // Show elongated email input for logged-in users
                  <div className="flex flex-1 max-w-[440px]">
                    <input
                      type="email"
                      placeholder="Enter your email address for updates, no spam promise"
                      className="flex-1 px-3 py-2 bg-#e6e6e6 rounded text-sm border border-gray-700 focus:outline-none focus:border-gray-600"
                    />
                  </div>
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
