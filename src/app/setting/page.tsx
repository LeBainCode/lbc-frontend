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
        <div className="container mx-auto px-6 pt-32">
          <div className="max-w-2xl ">
            <h1 className="text-6xl font-bold text-white mb-6">Settings</h1>

            <div className="flex gap-6 bg-[#1F2937] rounded-lg shadow-xl overflow-hidden">
              <div className="flex flex-col gap-3 px-6 py-4 border-r border-gray-700">
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

              <div className="flex flex-col gap-4 p-4  rounded-lg w-full max-w-md">
                {selectedTab === "settings" && (
                  <div>
                    <p className="text-gray-400">Modify your settings here.</p>
                  </div>
                )}

                {selectedTab === "email" && (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        placeholder="Enter new email"
                        className="flex-1 px-3 py-2 bg-[#e6e6e6] text-[#252525] rounded border border-gray-600"
                      />
                      <button className="px-4 py-2 bg-[#e6e6e6] text-[#252525] rounded hover:bg-[#9B7AA5]">
                        Change Email
                      </button>
                    </div>
                  </div>
                )}

                {selectedTab === "terms" && (
                  <div>
                    <p className="text-gray-400">Here are the terms...</p>
                  </div>
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
