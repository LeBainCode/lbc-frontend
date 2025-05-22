"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import LoginModal from "./LoginModal";

import { ConsoleDebugger } from "../../utils/consoleDebug";
import type { DebugInfo } from "../../utils/consoleDebug";

interface HeroProps {
  onNewProspect: (email: string) => void;
}

export default function Hero({ onNewProspect }: HeroProps) {
  const [email, setEmail] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [apiUrl, setApiUrl] = useState<string>("");

  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
      setEmailMessage("Welcome back!");
    }

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

    console.group("🏠 Home Component Initialized");
    console.log("User:", user);
    console.log("Initial Email:", email);
    console.log("Environment:", debugInfo.environment);
    console.groupEnd();
  }, [user, email]);

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (!user) {
        const checkUser = await fetch(`${apiUrl}/api/users/check-email`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const userData = await checkUser.json();
        if (userData.exists) {
          setEmailMessage(`Hi ${userData.username}, please login`);
          return;
        }

        const checkProspect = await fetch(
          `${apiUrl}/api/prospects/check-email`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          }
        );

        const prospectData = await checkProspect.json();
        if (prospectData.exists) {
          setEmailMessage("This email is already registered");
          return;
        }

        const response = await fetch(`${apiUrl}/api/prospects/email`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const responseData = await response.json();
        if (!response.ok) throw new Error(responseData.message);

        setEmailMessage("Email saved successfully!");
        onNewProspect(email); // ✅ Ajout dans la liste des prospects
      } else {
        setEmail(user.email || "");
        setEmailMessage("Welcome back!");
      }
    } catch (error) {
      setEmailMessage(
        error instanceof Error ? error.message : "An error occurred"
      );
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
        <div className="max-w-4xl mx-auto ">
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
                className="w-full md:w-[40%] px-4 py-2 text-sm bg-[#BF9ACA] hover:bg-[#7C3AED] transition-colors rounded md:rounded-r md:rounded-l-none"
              >
                Submit
              </button>
              {emailMessage && (
                <div className="absolute -top-8 left-0 bg-[#BF9ACA] text-white px-3 py-1 rounded text-sm animate-fade-in-out">
                  {emailMessage}
                </div>
              )}
            </form>

            {!user ? (
              <div className="flex flex-col md:flex-row gap-2 w-full sm:w-4/5 md:w-full mt-4">
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
                  Organization Login <span className="text-gray-400">→</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleDashboardClick}
                className="w-full sm:w-4/5 md:w-auto mt-4 border border-[#BF9ACA] px-4 py-2 rounded text-sm hover:bg-gray-700 transition-colors"
              >
                Dashboard <span className="text-gray-400">→</span>
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
