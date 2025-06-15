"use client";

import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Navbar from "../components/navcomp/Navbar";
import AlertPopup from "../components/dashboardcomp/AlertPopup";
import Profil from "../components/dashboardcomp/Profil";
import Modules from "../components/dashboardcomp/Modules";
import Stats from "../components/dashboardcomp/Stats";
import AdminPanel from "../components/dashboardcomp/AdminPanel";
import Footer from "../components/Footer";

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
  profilePic?: string;
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

// Efficient debug utility for Dashboard page
const debug = (() => {
  const seenMessages = new Set<string>();
  let lastLog = 0;
  const MIN_LOG_INTERVAL = 1000; // Minimum ms between similar logs

  return (message: string, data?: unknown, isError = false) => {
    // Skip logging in production
    if (process.env.NODE_ENV !== "development") return;

    const now = Date.now();
    // Create a deduplication key based on message and data
    const dataStr = data
      ? typeof data === "object"
        ? JSON.stringify(data)
        : String(data)
      : "";
    const key = `${message}:${dataStr}`;

    // Determine if this is an important message that should always be logged
    const isImportant =
      isError ||
      message.includes("error") ||
      message.includes("auth") ||
      message.includes("session") ||
      message.includes("redirect");

    // Skip duplicate messages that happen too frequently
    if (seenMessages.has(key) && now - lastLog < MIN_LOG_INTERVAL) return;

    // Skip non-important messages we've seen before
    if (!isImportant && seenMessages.has(key)) return;

    // Update tracking
    seenMessages.add(key);
    lastLog = now;

    // Prevent memory leaks by clearing set periodically
    if (seenMessages.size > 30) {
      seenMessages.clear();
    }

    // Format and output message
    const logPrefix = `[Dashboard] ${message}`;
    if (isError) {
      console.error(logPrefix, data || "");
    } else {
      console.log(logPrefix, data || "");
    }

    // Keep record of important logs for debugging
    if (isImportant && typeof window !== "undefined") {
      try {
        const logs = JSON.parse(localStorage.getItem("dashboardLogs") || "[]");

        const timestamp = new Date().toISOString();
        // Safely clone data to prevent circular reference issues
        const safeData =
          typeof data === "object" && data !== null
            ? JSON.parse(JSON.stringify(data))
            : data;

        logs.push({ timestamp, message, data: safeData });

        // Limit logs storage
        if (logs.length > 20) logs.shift();
        localStorage.setItem("dashboardLogs", JSON.stringify(logs));
      } catch {
        // Silent fail for localStorage errors
      }
    }
  };
})();

export default function Dashboard() {
  const { user, fetchUserData } = useAuth() as AuthContextType;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const isSessionChecking = useRef(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      // Prevent duplicate API calls
      if (isSessionChecking.current) {
        debug("Session check already in progress, skipping duplicate request");
        return;
      }

      isSessionChecking.current = true;
      debug("Checking user authentication status");

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-session`,
          {
            method: "GET",
            credentials: "include",
            signal: controller.signal,
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json"
            }
          }
        );

        clearTimeout(timeoutId);

        if (response.status === 401) {
          debug("Session expired, redirecting to login", null, true);
          router.push("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(`Session verification failed: ${response.status}`);
        }

        debug("Session verification succeeded");

        if (!user) {
          debug("User not in context, fetching user data");
          await fetchUserData();
        } else {
          debug("User already in context", {
            username: user.username,
            role: user.role,
          });
        }
      } catch (error) {
        debug("Error verifying session", error, true);
        if (error instanceof Error && error.name === "AbortError") {
          debug("Request timeout", null, true);
        }
        router.push("/login");
      } finally {
        setIsLoading(false);
        isSessionChecking.current = false;
      }
    };

    checkAuthentication();
  }, [fetchUserData, user, router]);

  // Log user data once after loading, not on every render
  useEffect(() => {
    if (!isLoading && user) {
      debug("Dashboard loaded with user", {
        username: user.username,
        role: user.role,
        hasEmail: !!user.email,
        progressLevel: user.progress?.cModule?.completed || 0,
      });
    }
  }, [isLoading, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#111827] flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (!user) {
    debug("No user available after loading, redirecting");
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
          <Profil
            username={user.username}
            role={user.role}
            profilePic={user.profilePic}
          />
        </div>
        <div className="mb-10 pt-8">
          <h2 className="text-white text-2xl font-medium mb-6">Statistiques</h2>
          <Stats userStats={stats} />
        </div>

        <div className="hidden mb-10 pt-8">
          <Modules />
        </div>

        <div className="mb-10 pt-8">
          {user.role === "admin" && <AdminPanel />}
        </div>

        <AlertPopup
          hasEmail={!!user.email}
          isAdmin={user.role === "admin"}
        />
      </main>
      <Footer />
    </>
  );
}
