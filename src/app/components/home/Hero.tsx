"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import LoginModal from "./LoginModal";
import { ConsoleDebugger } from "../../utils/consoleDebug";
import type { DebugInfo } from "../../utils/consoleDebug";

interface UserEmail {
  email: string;
  username?: string;
}

export default function Hero() {
  const [email, setEmail] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [apiUrl, setApiUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuth();
  const router = useRouter();

  // Initial debug info and API setup
  useEffect(() => {
    const consoleDebugger = ConsoleDebugger.getInstance();

    const debugInfo: DebugInfo = {
      environment: process.env.NODE_ENV || "development",
      apiUrl:
        process.env.NEXT_PUBLIC_API_URL ||
        "https://lebaincode-backend.onrender.com",
      version: "1.0.0",
      buildTime: new Date().toISOString(),
    };

    setApiUrl(debugInfo.apiUrl);

    consoleDebugger.showUserWelcome();
    consoleDebugger.showDevConsole(debugInfo);

    console.group("üè† Home Component Initialized");
    console.log("User:", user);
    console.log("Initial Email:", email);
    console.log("Environment:", debugInfo.environment);
    console.groupEnd();
  }, []);

  // Email update when user email is fetched asynchronously
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user?.email]);

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailMessage("");

    if (!email.trim()) {
      setEmailMessage("Please enter an email address");
      return;
    }

    setIsLoading(true);

    try {
      if (!user) {
        const userResponse = await fetch(`${apiUrl}/api/email/users/public`, {
          method: "GET",
          credentials: "include",
        });

        if (!userResponse.ok) throw new Error("Failed to check user emails");

        const userData = await userResponse.json();
        const userEmails: UserEmail[] = userData.users || [];
        const normalizedEmail = email.toLowerCase();

        const userExists =
          Array.isArray(userEmails) &&
          userEmails.some((u) => u.email.toLowerCase() === normalizedEmail);

        if (userExists) {
          setEmailMessage("Welcome back! Please login to continue");
          setTimeout(() => setIsLoginModalOpen(true), 1000);
          return;
        }

        const prospectResponse = await fetch(
          `${apiUrl}/api/email/prospects/${encodeURIComponent(email)}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (prospectResponse.ok) {
          const prospectData = await prospectResponse.json();
          if (prospectData.exists) {
            setEmailMessage(
              "This email is already registered. Please create a GitHub account to continue."
            );
            return;
          }
        }

        const saveResponse = await fetch(`${apiUrl}/api/email/prospect`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        if (saveResponse.ok) {
          setEmailMessage(
            "Thank you for your interest! Please create a GitHub account to continue."
          );
        } else {
          const saveData = await saveResponse.json();
          throw new Error(saveData.message || "Failed to save your email");
        }
      } else {
        if (user.role === "admin") {
          setEmailMessage(`Welcome back, admin ${user.username || ""}!`);
        } else {
          setEmailMessage(`Welcome back, ${user.username || ""}!`);
        }
      }
    } catch (error) {
      console.error("Error processing email:", error);
      setEmailMessage(
        error instanceof Error ? error.message : "An error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDashboardClick = () => router.push("/dashboard");

  const handleGitHubSignIn = () => {
    window.location.href =
      process.env.NODE_ENV === "production"
        ? "https://lebaincode-backend.onrender.com/api/auth/github"
        : "http://localhost:5000/api/auth/github";
  };

  return (
    <>
      <section className="w-full px-4 sm:px-6 lg:px-8 py-16 text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Le Bain Code
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-xl leading-relaxed mb-10">
            This is a paragraph with more information about something important.
            This something has many uses and is made of 100% recycled material.
          </p>
          <div className="flex flex-col sm:items-center sm:gap-4 max-w-2xl w-full">
            <form
              onSubmit={handleEmailSubmit}
              className="flex flex-col md:flex-row w-full sm:w-4/5 md:w-full items-stretch gap-2 relative"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  user?.email
                    ? `Any updates will be sent to ${user.email}`
                    : "Enter your email address"
                }
                className="w-full md:w-[60%] px-4 py-2 text-sm bg-transparent border border-gray-600 rounded md:rounded-l md:rounded-r-none text-[#BF9ACA] placeholder-gray-500 focus:outline-none focus:border-[#BF9ACA] transition-all duration-300"
              />
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full md:w-[40%] px-4 py-2 text-sm ${
                  isLoading ? "bg-gray-500" : "bg-[#BF9ACA] hover:bg-[#7C3AED]"
                } transition-colors rounded md:rounded-r md:rounded-l-none`}
              >
                {isLoading ? "Checking..." : "Submit"}
              </button>
              {emailMessage && (
                <div className="absolute -top-8 left-0 bg-[#BF9ACA] text-white px-3 py-1 rounded text-sm animate-fade-in-out">
                  {emailMessage}
                </div>
              )}
            </form>
            {!user ? (
              <div className="flex flex-col sm:flex-col md:flex-row gap-2 w-full sm:w-4/5 md:w-full mt-4">
                <button
                  onClick={handleGitHubSignIn}
                  className="w-full md:w-auto bg-[#BF9ACA] px-4 py-2 rounded text-sm hover:bg-[#7C3AED] transition-colors"
                >
                  Sign in through GitHub
                </button>
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="w-full md:w-auto border border-[#BF9ACA] px-4 py-2 rounded text-sm hover:bg-gray-700 transition-colors"
                >
                  Organization Login
                </button>
              </div>
            ) : (
              <button
                onClick={handleDashboardClick}
                className="w-full sm:w-4/5 md:w-auto mt-4 border border-[#BF9ACA] px-4 py-2 rounded text-sm hover:bg-gray-700 transition-colors"
              >
                Dashboard
              </button>
            )}
          </div>
        </div>
      </section>
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}
