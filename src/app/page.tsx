// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { useRouter } from "next/navigation";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
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

        setEmailMessage("Email saved successfully!");
      } else if (typeof user.email === "string") {
        setEmail(user.email);
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
      <header className="bg-[#24292f]">
        <Navbar />
      </header>

      <main className="min-h-screen bg-[#0D1117]">
        <div className="container mx-auto mb-20 px-6 pt-32" id="/">
          <Hero />
        </div>

        <div
          className="container mx-auto px-6 mt-32 flex justify-center"
          id="rules"
        >
          <Rules />
        </div>

        <div className="container mx-auto px-6 mt-32 mb-20">
          <AddOns />
        </div>

        <div className="container mx-auto px-6 mt-32 mb-20">
          <Pricing />
        </div>

        <div className="container mx-auto px-6 mt-32 mb-20">
          <FAQ />
        </div>

        <div className="container mx-auto px-6 mt-32 pb-32" id="contact">
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
