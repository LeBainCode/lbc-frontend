// src/app/page.tsx
"use client";

import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/home/Hero";
import Rules from "./components/home/Rules";
import AddOns from "./components/home/AddOns";
import Pricing from "./components/home/Pricing";
import FAQ from "./components/home/FAQ";
import Contact from "./components/home/Contact";
import Footer from "./components/Footer";
import LoginModal from "./components/LoginModal";

export default function Home() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

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
