// src/app/dashboard/page.tsx
'use client'
import { useAuth } from '../context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react'; 
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import Link from "next/link"
import Stats from "../components/Stats"
import Modules from "../components/Modules"

export default function Dashboard() {
    const { user, fetchUserData } = useAuth(); 
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        console.log('Token from URL:', token); 

        if (token) {
            console.log('Token found, saving to localStorage...');
            localStorage.setItem('token', token);
            fetchUserData()
                .then(() => {
                    console.log('User data fetched successfully.');
                    // Clean up URL
                    router.replace('/dashboard');
                })
                .catch((error) => {
                    console.error('Error fetching user data:', error);
                    // Handle error (e.g., redirect to login or show an error message)
                    router.push('/');
                });
        } else if (!user) {
            console.log('No token found and user is not logged in, redirecting to home...');
            router.push('/');
        }
    }, [searchParams, user, router, fetchUserData]);

    // Lloading state 
    if (!user) {
        return <div className="min-h-screen bg-[#111827] flex items-center justify-center">
            <p className="text-white">Loading...</p>
        </div>;
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
                </div>
            </main>
            <Footer />
        </>
    );
}