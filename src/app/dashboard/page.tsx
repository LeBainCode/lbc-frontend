"use client";

import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";
import Stats from "../components/Stats";
import Modules from "../components/Modules";
import AdminPanel from "../components/AdminPanel";
import AlertPopup from "../components/AlertPopup";

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

      <main className="min-h-screen bg-[#0D1117]">
        <div className="container mx-auto px-6 pt-32">
          <div className="mb-1">
            <h1 className="text-6xl font-bold text-[#e6e6e6]">
              Hello {user.username}
              {user.role === "admin" && (
                <span className="text-[#BF9ACA] ml-2">(Admin)</span>
              )}
            </h1>
            <Link
              href="/setting"
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
          {user.role === "admin" && <AdminPanel />}
        </div>
        <AlertPopup hasEmail={Boolean(user.email)} />
      </main>
      <Footer />
    </>
  );
}
