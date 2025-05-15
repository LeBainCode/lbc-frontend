// src/app/page.tsx
"use client";

// import { useState } from "react";
import Navbar from "./components/navcomp/Navbar";
import Hero from "./components/home/Hero";
import Rules from "./components/home/Rules";
import AddOns from "./components/home/AddOns";
import Pricing from "./components/home/Pricing";
import FAQ from "./components/home/FAQ";
import Contact from "./components/home/Contact";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <header className="bg-[#24292f] flex items-center justify-between p-4">
        <Navbar />
      </header>

      <main className="min-h-screen bg-[#0D1117] flex flex-col">
        <div className="mb-10 pt-32" id="/">
          <Hero />
        </div>

        <div className="mb-10 pt-32" id="rules">
          <Rules />
        </div>

        <div className="mb-10 pt-32">
          <AddOns />
        </div>

        <div className="mb-10 pt-32">
          <Pricing />
        </div>

        <div className="mb-10 pt-32">
          <FAQ />
        </div>

        <div className="mb-10 pt-32" id="contact">
          <Contact />
        </div>
      </main>

      <Footer />
    </>
  );
}
