// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { useRouter } from "next/navigation";
import Navbar from "./components/Navbar";
import Rules from "./components/Rules";
import AddOns from "./components/AddOns";
import Pricing from "./components/Pricing";
import FAQ from "./components/FAQ";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import LoginModal from "./components/LoginModal";
import { ConsoleDebugger } from "./utils/consoleDebug";
import type { DebugInfo } from "./utils/consoleDebug";

export default function Home() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  // const [isSubmitted, setIsSubmitted] = useState(false);
  const [apiUrl, setApiUrl] = useState<string>("");

  const { user } = useAuth();
  const router = useRouter();

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

    console.group("🏠 Home Component Initialized");
    console.log("User:", user);
    console.log("Initial Email:", email);
    console.log("Environment:", debugInfo.environment);
    console.groupEnd();
  }, [user, email]);

  // useEffect(() => {
  //   let timer: NodeJS.Timeout;
  //   if (emailMessage) {
  //     timer = setTimeout(() => setEmailMessage(""), 3000);
  //   }
  //   return () => clearTimeout(timer);
  // }, [emailMessage]);

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.group("📧 Email Submission");
    console.log("Starting email submission process", {
      email,
      isLoggedIn: !!user,
      timestamp: new Date().toISOString(),
    });

    try {
      console.log("Using API URL:", apiUrl);

      if (!user) {
        const userCheckResponse = await fetch(
          `${apiUrl}/api/users/check-email`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          }
        );

        const userData = await userCheckResponse.json();
        console.log("User check response:", userData);

        if (userData.exists) {
          setEmailMessage(`Hi ${userData.username}, please login`);
          return;
        }

        const prospectCheckResponse = await fetch(
          `${apiUrl}/api/prospects/check-email`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          }
        );

        const prospectData = await prospectCheckResponse.json();
        console.log("Prospect check response:", prospectData);

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
        console.log("Registration response:", responseData);

        if (!response.ok) {
          throw new Error(responseData.message || "Failed to save email");
        }

        // setIsSubmitted(true);
        setEmailMessage("Email saved successfully!");
      } else {
        setEmail(user?.email || "");
        setEmailMessage("Welcome back!");
      }
    } catch (error) {
      console.error("Email submission error:", error);
      setEmailMessage(
        error instanceof Error ? error.message : "An error occurred"
      );
    } finally {
      console.groupEnd();
    }
  };

  const handleDashboardClick = () => {
    router.push("/dashboard");
  };

  const handleGitHubSignIn = () => {
    window.location.href =
      process.env.NODE_ENV === "production"
        ? "https://lebaincode-backend.onrender.com/api/auth/github"
        : "http://localhost:5000/api/auth/github";
  };

  return (
    <>
      <main className="min-h-screen bg-[#0D1117]">
        <Navbar />

        <div
          className="container mx-auto mb-20 px-6 pt-32 flex justify-center"
          id="/"
        >
          <div className="max-w-2xl">
            <h1 className="text-6xl font-bold text-white mb-6">Le Bain Code</h1>
            <p className="text-gray-400 text-base mb-8 max-w-md leading-relaxed">
              This is a paragraph with more information about something
              important. This something has many uses and is made of 100%
              recycled material.
            </p>

            <div className="flex gap-3">
              <form
                onSubmit={handleEmailSubmit}
                className={`flex relative ${
                  user ? "flex-1 max-w-[440px]" : ""
                }`}
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
                  className="w-[240px] px-3 py-2 bg-transparent rounded-l text-sm border border-gray-700
                    focus:outline-none focus:border-[#BF9ACA] text-[#BF9ACA]
                    placeholder-gray-500 transition-all duration-300"
                />
                <button
                  type="submit"
                  className="bg-[#BF9ACA] px-4 py-2 rounded-r text-sm hover:bg-[#7C3AED] transition-colors"
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
                <>
                  <button
                    onClick={handleGitHubSignIn}
                    className="ml-2 bg-[#BF9ACA] px-4 py-2 rounded text-sm hover:bg-[#7C3AED] transition-colors whitespace-nowrap"
                  >
                    Sign in through GitHub
                  </button>
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="border-2 border-[#BF9ACA] px-4 py-2 rounded text-sm hover:bg-gray-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    Organization Login <span className="text-gray-400">→</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleDashboardClick}
                  className="border-2 border-[#BF9ACA] px-4 py-2 rounded text-sm hover:bg-gray-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  Dashboard <span className="text-gray-400">→</span>
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
