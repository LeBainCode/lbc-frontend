"use client";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
// import { Bentham } from "next/font/google";

export default function Settings() {
  const [selectedTab, setSelectedTab] = useState("settings");
  return (
    <>
      <main className="min-h-screen bg-[#0D1117]">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 pt-24 sm:pt-32">
          <div className="sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] 2xl:w-[50vw] mx-auto">
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">
              Settings
            </h1>

            <div className="flex flex-col md:flex-row gap-6 bg-[#1F2937] rounded-lg shadow-xl overflow-hidden">
              {/* Tabs (left) */}
              <div className="flex flex-row md:flex-col gap-3 px-4 py-4 border-b md:border-b-0 md:border-r border-gray-700">
                <button
                  className={`px-4 py-2 rounded ${
                    selectedTab === "settings"
                      ? "bg-indigo-500 text-white"
                      : "text-gray-400"
                  }`}
                  onClick={() => setSelectedTab("settings")}
                >
                  Settings
                </button>
                <button
                  className={`px-4 py-2 rounded ${
                    selectedTab === "email"
                      ? "bg-indigo-500 text-white"
                      : "text-gray-400"
                  }`}
                  onClick={() => setSelectedTab("email")}
                >
                  Email
                </button>
                <button
                  className={`px-4 py-2 rounded ${
                    selectedTab === "terms"
                      ? "bg-indigo-500 text-white"
                      : "text-gray-400"
                  }`}
                  onClick={() => setSelectedTab("terms")}
                >
                  Terms & Services
                </button>
              </div>

              {/* Content (right) */}
              <div className="flex flex-col gap-4 p-4 w-full">
                {selectedTab === "settings" && (
                  <p className="text-gray-400">Modify your settings here.</p>
                )}

                {selectedTab === "email" && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="email"
                      placeholder="Enter new email"
                      className="flex-1 px-3 py-2 bg-[#e6e6e6] text-[#252525] rounded border border-gray-600"
                    />
                    <button className="px-4 py-2 bg-[#e6e6e6] text-[#252525] rounded hover:bg-[#9B7AA5]">
                      Change Email
                    </button>
                  </div>
                )}

                {selectedTab === "terms" && (
                  <p className="text-gray-400">Here are the terms...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
