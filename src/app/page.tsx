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
