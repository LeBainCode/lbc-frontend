// src/app/dashboard/page.tsx
"use client";
import { useAuth } from "../context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";
import Stats from "../components/Stats";
import Modules from "../components/Modules";
import AdminPanel from "../components/AdminPanel";
import AlertPopup from "../components/AlertPopup";

export default function Dashboard() {
  const { user, fetchUserData } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    const handleAuthentication = async () => {
      try {
        const token = searchParams.get("token");
        console.log("Token from URL:", token);

        if (token) {
          localStorage.setItem("token", token);
          console.log("Token saved to localStorage");

          const url = new URL(window.location.href);
          url.searchParams.delete("token");
          window.history.replaceState({}, document.title, url.toString());
          console.log("URL cleaned up");

          await fetchUserData();
          console.log("User data fetched successfully");
        } else {
          const storedToken = localStorage.getItem("token");
          if (!storedToken) {
            console.log("No token found, setting redirect flag");
            setShouldRedirect(true);
            return;
          }
          if (!user) {
            await fetchUserData();
          }
        }
      } catch (error) {
        console.error("Authentication error:", error);
        localStorage.removeItem("token");
        setShouldRedirect(true);
      } finally {
        setIsLoading(false);
      }
    };

    handleAuthentication();
  }, [searchParams, fetchUserData]);

  useEffect(() => {
    if (shouldRedirect) {
      router.push("/");
    }
  }, [shouldRedirect, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#111827] flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (!user || shouldRedirect) {
    return (
      <div className="min-h-screen bg-[#111827] flex items-center justify-center">
        <p className="text-white">Redirecting...</p>
      </div>
    );
  }

  const stats = {
    hoursCoding: user?.progress?.cModule?.completed * 4 || 0,
    exercises: `${user?.progress?.cModule?.completed * 5 || 0}+`,
    notionsMastered: user?.progress?.cModule?.completed || 0,
    daysLeft: 30 - (user?.progress?.cModule?.completed || 0) * 3,
  };

  return (
    <>
      <main className="min-h-screen bg-[#111827]">
        <Navbar />
        <div className="container mx-auto px-6 pt-32">
          <div className="mb-1">
            <h1 className="text-6xl font-bold text-white">
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
          <AdminPanel />
        </div>
        <AlertPopup hasEmail={Boolean(user?.email)} />
      </main>
      <Footer />
    </>
  );
}
