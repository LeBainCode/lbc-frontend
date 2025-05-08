// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { useRouter } from "next/navigation";
import Navbar from "./components/Navbar";
import Hero from "./components/home/Hero";
import Rules from "./components/home/Rules";
import AddOns from "./components/home/AddOns";
import Pricing from "./components/home/Pricing";
import FAQ from "./components/home/FAQ";
import Contact from "./components/home/Contact";
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

  return (
    <>
      <header className="bg-[#24292f]">
        <Navbar />
      </header>

      <main className="min-h-screen bg-[#0D1117] flex flex-col justify-center align-middle">
        <div className="container mb-20 pt-32" id="/">
          <Hero />
        </div>

        <div className="container mt-32" id="rules">
          <Rules />
        </div>

        <div className="container mt-32 mb-20">
          <AddOns />
        </div>

        <div className="container mt-32 mb-20">
          <Pricing />
        </div>

        <div className="container mt-32 mb-20">
          <FAQ />
        </div>

        <div className="container mt-32 pb-32" id="contact">
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
