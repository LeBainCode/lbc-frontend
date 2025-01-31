// src/app/dashboard/page.tsx
'use client'
import { useAuth } from '../context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react'; 
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import Link from "next/link"
import Stats from "../components/Stats"
import Modules from "../components/Modules"
import AdminPanel from '../components/AdminPanel';
import AlertPopup from '../components/AlertPopup';

export default function Dashboard() {
    const { user, fetchUserData } = useAuth(); 
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const handleAuthentication = async () => {
          try {
              const token = searchParams.get('token');
              console.log('Token from URL:', token);

              if (token) {
                  // Save token and clean up URL before fetching user data
                  localStorage.setItem('token', token);
                  console.log('Token saved to localStorage');

                  // Clean up URL by removing token
                  const url = new URL(window.location.href);
                  url.searchParams.delete('token');
                  window.history.replaceState({}, document.title, url.toString());
                  console.log('URL cleaned up');

                  // Fetch user data with the new token
                  await fetchUserData();
                  console.log('User data fetched successfully');
              } else {
                  // Check if we have a token in localStorage
                  const storedToken = localStorage.getItem('token');
                  if (!storedToken) {
                      console.log('No token found, redirecting to home');
                      router.push('/');
                      return;
                  }
                  // If we have a stored token but no user data, try to fetch it
                  if (!user) {
                      await fetchUserData();
                  }
              }
          } catch (error) {
              console.error('Authentication error:', error);
              localStorage.removeItem('token'); // Clear invalid token
              router.push('/');
              return;
          } finally {
              setIsLoading(false);
          }
      };

      handleAuthentication();
  }, [searchParams, router, fetchUserData]); 

    // Show loading state while authenticating
    if (isLoading) {
      return (
          <div className="min-h-screen bg-[#111827] flex items-center justify-center">
              <p className="text-white">Loading...</p>
          </div>
      );
  }

  // If no user after loading, redirect to home
  if (!user) {
      router.push('/');
      return null;
  }

    // Safe access to user properties
    const stats = {
        hoursCoding: user?.progress?.cModule?.completed * 4 || 0,
        exercises: `${user?.progress?.cModule?.completed * 5 || 0}+`,
        notionsMastered: user?.progress?.cModule?.completed || 0,
        daysLeft: 30 - ((user?.progress?.cModule?.completed || 0) * 3)
    };

    return (
        <>
            <main className="min-h-screen bg-[#111827]">
                <Navbar />
                <div className="container mx-auto px-6 pt-32">
                    <div className="mb-1">
                        <h1 className="text-6xl font-bold text-white">
                            Hello {user.username}
                            {user.role === 'admin' && <span className="text-[#BF9ACA] ml-2">(Admin)</span>}
                        </h1>
                        <Link 
                            href="/settings" 
                            className="text-[#84cc16] text-sm hover:underline"
                        >
                            Settings
                        </Link>
                    </div>
                    
                    <div className="mt-12">
                        <h2 className="text-white text-2xl font-medium mb-6">
                            Statistiques
                        </h2>
                        <Stats userStats={stats} />
                    </div>

                    <div className="mt-12">
                        <Modules />
                    </div>
                    <AdminPanel />
                </div>
                <AlertPopup hasEmail={Boolean(user?.email)} />
            </main>
            <Footer />
        </>
    );
}