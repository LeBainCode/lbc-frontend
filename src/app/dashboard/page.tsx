// app/dashboard/page.tsx
'use client'
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import Link from "next/link"
import Stats from "../components/Stats"
import Modules from "../components/Modules"

export default function Dashboard() {
    const { user } = useAuth(); 
    const router = useRouter();

    if (!user) {
        router.push('/dashboard');
        return null;
    }

    const stats = {
        hoursCoding: user.progress.cModule.completed * 4,
        exercises: `${user.progress.cModule.completed * 5}+`,
        notionsMastered: user.progress.cModule.completed,
        daysLeft: 30 - (user.progress.cModule.completed * 3)
    };

    return (
        <>
        <main className="min-h-screen bg-[#111827]">
            <Navbar />
            <div className="container mx-auto px-6 pt-32">
                <div className="mb-1">
                    <h1 className="text-6xl font-bold text-white">
                        Hello {user.username} {/* Removed # */}
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
                    <Stats userStats={stats} /> {/* Use stats instead of userData.stats */}
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
