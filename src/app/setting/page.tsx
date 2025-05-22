"use client";
import React, { useState } from "react";
import Navbar from "../components/navcomp/Navbar";
import Footer from "../components/Footer";

export default function Settings() {
  const [selectedTab, setSelectedTab] = useState("settings");

  // États email
  const [email, setEmail] = useState("");
  const [emailMessage, setEmailMessage] = useState(null);

  // États password
  const [password, setPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState(null);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChangeEmail = async () => {
    setEmailMessage(null);
    if (!isValidEmail(email)) {
      setEmailMessage({ error: true, text: "Format d'email invalide" });
      return;
    }
    try {
      // Remplace ici par ton appel API réel (fetch / axios)
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setEmailMessage({ error: false, text: "Email mis à jour avec succès." });
      setEmail("");
    } catch (error) {
      setEmailMessage({ error: true, text: "Erreur lors de la mise à jour." });
    }
  };

  const handleChangePassword = async () => {
    setPasswordMessage(null);
    if (password.length < 6) {
      setPasswordMessage({
        error: true,
        text: "Mot de passe trop court (min 6 caractères).",
      });
      return;
    }
    try {
      // Remplace ici par ton appel API réel (fetch / axios)
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setPasswordMessage({
        error: false,
        text: "Mot de passe mis à jour avec succès.",
      });
      setPassword("");
    } catch (error) {
      setPasswordMessage({
        error: true,
        text: "Erreur lors de la mise à jour.",
      });
    }
  };

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
                {["settings", "email", "password", "terms"].map((tab) => (
                  <button
                    key={tab}
                    className={`px-4 py-2 rounded ${
                      selectedTab === tab
                        ? "bg-indigo-500 text-white"
                        : "text-gray-400"
                    }`}
                    onClick={() => setSelectedTab(tab)}
                  >
                    {tab === "settings"
                      ? "Settings"
                      : tab === "email"
                      ? "Email"
                      : tab === "password"
                      ? "Password"
                      : "Terms & Services"}
                  </button>
                ))}
              </div>

              {/* Content (right) */}
              <div className="flex flex-col gap-4 p-4 w-full">
                {selectedTab === "settings" && (
                  <p className="text-gray-400">Modify your settings here.</p>
                )}

                {selectedTab === "email" && (
                  <>
                    <div className="flex flex-col sm:flex-row gap-2 items-center">
                      <input
                        type="email"
                        placeholder="Enter new email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 px-3 py-2 bg-[#e6e6e6] text-[#252525] rounded border border-gray-600"
                      />
                      <button
                        className="px-4 py-2 bg-[#e6e6e6] text-[#252525] rounded hover:bg-[#9B7AA5]"
                        onClick={handleChangeEmail}
                        disabled={!email}
                      >
                        Change Email
                      </button>
                    </div>
                    {emailMessage && (
                      <p
                        className={`text-sm ${
                          emailMessage.error ? "text-red-500" : "text-green-500"
                        }`}
                      >
                        {emailMessage.text}
                      </p>
                    )}
                  </>
                )}

                {selectedTab === "password" && (
                  <>
                    <div className="flex flex-col sm:flex-row gap-2 items-center">
                      <input
                        type="password"
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="flex-1 px-3 py-2 bg-[#e6e6e6] text-[#252525] rounded border border-gray-600"
                      />
                      <button
                        className="px-4 py-2 bg-[#e6e6e6] text-[#252525] rounded hover:bg-[#9B7AA5]"
                        onClick={handleChangePassword}
                        disabled={!password}
                      >
                        Change Password
                      </button>
                    </div>
                    {passwordMessage && (
                      <p
                        className={`text-sm ${
                          passwordMessage.error
                            ? "text-red-500"
                            : "text-green-500"
                        }`}
                      >
                        {passwordMessage.text}
                      </p>
                    )}
                  </>
                )}

                {selectedTab === "terms" && (
                  <p className="text-gray-400">
                    Here are the terms and services...
                  </p>
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
