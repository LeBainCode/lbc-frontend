"use client";

import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "../components/navcomp/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";
import Stats from "../components/dashboardcomp/Stats";
import Modules from "../components/dashboardcomp/Modules";
import AdminPanel from "../components/dashboardcomp/AdminPanel";
import AlertPopup from "../components/dashboardcomp/AlertPopup";
import Profil from "../components/dashboardcomp/Profil";
// Define TypeScript interfaces
interface Progress {
  cModule: {
    completed: number;
  };
}

interface User {
  username: string;
  role: string;
  email?: string;
  progress?: Progress;
}

interface UserStats {
  hoursCoding: number;
  exercises: string;
  notionsMastered: number;
  daysLeft: number;
}

interface AuthContextType {
  user: User | null;
  fetchUserData: () => Promise<User | null>;
}

export default function Dashboard() {
  const { user, fetchUserData } = useAuth() as AuthContextType;
  console.log(user);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-session`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (response.ok) {
          if (!user) {
            await fetchUserData();
          }
        } else {
          router.push("/");
        }
      } catch (error) {
        console.error("Error verifying session:", error);
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, [fetchUserData, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#111827] flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#111827] flex items-center justify-center">
        <p className="text-white">Redirecting...</p>
      </div>
    );
  }

  const stats: UserStats = {
    hoursCoding: (user.progress?.cModule?.completed || 0) * 4,
    exercises: `${(user.progress?.cModule?.completed || 0) * 5}+`,
    notionsMastered: user.progress?.cModule?.completed || 0,
    daysLeft: 30 - (user.progress?.cModule?.completed || 0) * 3,
  };
  return (
    <>
      <header className="bg-[#24292f] flex items-center justify-between p-4">
        <Navbar />
      </header>

      <main className="min-h-screen bg-[#0D1117] overflow-x-hidden flex flex-col items-center">
        <div className="mb-10 pt-8">
          <Profil username={user.username} role={user.role} />
        </div>
        <div className="mb-10 pt-8">
          <h2 className="text-white text-2xl font-medium mb-6">Statistiques</h2>
          <Stats userStats={stats} />
        </div>

        <div className=" hidden mb-10 pt-8">
          <Modules />
        </div>

        <div className="mb-10 pt-8">
          {user.role === "admin" && <AdminPanel />}
        </div>

        <AlertPopup hasEmail={Boolean(user.email)} />
      </main>
      <Footer />
    </>
  );
}
