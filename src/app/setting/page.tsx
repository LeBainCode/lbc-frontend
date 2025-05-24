"use client";
import React, { useState, useEffect } from "react";
import Navbar from "../components/navcomp/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext"; // adapte selon ton contexte auth

export default function Settings() {
  const { user } = useAuth();
  const role = user?.role || "user";

  const tabsByRole = {
    user: ["email", "terms"],
    admin: ["email", "password", "terms"],
  };
  const tabs = tabsByRole[role] || ["email", "terms"];

  const [selectedTab, setSelectedTab] = useState(tabs[0]);
  useEffect(() => {
    if (!tabs.includes(selectedTab)) {
      setSelectedTab(tabs[0]);
    }
  }, [role, selectedTab, tabs]);

  const [email, setEmail] = useState("");
  const [emailMessage, setEmailMessage] = useState(null);

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordMessage, setPasswordMessage] = useState(null);

  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Vérifie si l'email existe déjà en base
  const handleVerifyEmail = async () => {
    setEmailMessage(null);
    setIsEmailVerified(false);

    if (!isValidEmail(email)) {
      setEmailMessage({ error: true, text: "Format d'email invalide" });
      return;
    }

    try {
      setVerifyingEmail(true);
      // Ici faire un fetch vers ton API réel pour vérifier l'existence
      await new Promise((r) => setTimeout(r, 1000));
      const emailExists = false; // change selon ta logique

      if (emailExists) {
        setEmailMessage({ error: true, text: "Cet email est déjà utilisé." });
        setIsEmailVerified(false);
      } else {
        setEmailMessage({ error: false, text: "Email disponible." });
        setIsEmailVerified(true);
      }
    } catch (error) {
      setEmailMessage({ error: true, text: "Erreur lors de la vérification." });
      setIsEmailVerified(false);
    } finally {
      setVerifyingEmail(false);
    }
  };

  const handleChangeEmail = async () => {
    setEmailMessage(null);
    if (!isEmailVerified) {
      setEmailMessage({
        error: true,
        text: "Veuillez vérifier que l'email est disponible avant de changer.",
      });
      return;
    }
    try {
      // Appel API réel pour changer l'email
      await new Promise((r) => setTimeout(r, 1000));
      setEmailMessage({ error: false, text: "Email mis à jour avec succès." });
      setEmail("");
      setIsEmailVerified(false);
    } catch (error) {
      setEmailMessage({ error: true, text: "Erreur lors de la mise à jour." });
    }
  };

  const handleChangePassword = async () => {
    setPasswordMessage(null);
    if (password !== passwordConfirm) {
      setPasswordMessage({
        error: true,
        text: "Les mots de passe ne correspondent pas.",
      });
      return;
    }
    if (password.length < 6) {
      setPasswordMessage({
        error: true,
        text: "Mot de passe trop court (min 6 caractères).",
      });
      return;
    }
    try {
      // Appel API réel pour changer le mot de passe
      await new Promise((r) => setTimeout(r, 1000));
      setPasswordMessage({
        error: false,
        text: "Mot de passe mis à jour avec succès.",
      });
      setPassword("");
      setPasswordConfirm("");
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
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    className={`px-4 py-2 rounded ${
                      selectedTab === tab
                        ? "bg-indigo-500 text-white"
                        : "text-gray-400"
                    }`}
                    onClick={() => setSelectedTab(tab)}
                  >
                    {tab === "email"
                      ? "Email"
                      : tab === "password"
                      ? "Password"
                      : "Terms & Services"}
                  </button>
                ))}
              </div>

              {/* Content (right) */}
              <div className="flex flex-col gap-4 p-4 w-full">
                {selectedTab === "email" && (
                  <>
                    <div className="flex flex-col sm:flex-row gap-2 items-center">
                      <input
                        type="email"
                        placeholder="Enter new email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setIsEmailVerified(false); // reset verification
                          setEmailMessage(null);
                        }}
                        className="flex-1 px-3 py-2 bg-[#e6e6e6] text-[#252525] rounded border border-gray-600"
                      />
                      <button
                        className="px-4 py-2 bg-[#e6e6e6] text-[#252525] rounded hover:bg-[#9B7AA5]"
                        onClick={handleVerifyEmail}
                        disabled={!email || verifyingEmail}
                      >
                        {verifyingEmail ? "Vérification..." : "Verify Email"}
                      </button>
                      <button
                        className="px-4 py-2 bg-[#e6e6e6] text-[#252525] rounded hover:bg-[#9B7AA5]"
                        onClick={handleChangeEmail}
                        disabled={!email || !isEmailVerified}
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

                {selectedTab === "password" && role === "admin" && (
                  <>
                    <div className="flex flex-col sm:flex-row gap-2 items-center">
                      <input
                        type="password"
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setPasswordMessage(null);
                        }}
                        className="flex-1 px-3 py-2 bg-[#e6e6e6] text-[#252525] rounded border border-gray-600"
                      />
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        value={passwordConfirm}
                        onChange={(e) => {
                          setPasswordConfirm(e.target.value);
                          setPasswordMessage(null);
                        }}
                        className="flex-1 px-3 py-2 bg-[#e6e6e6] text-[#252525] rounded border border-gray-600"
                      />
                    </div>
                    <button
                      className="px-4 py-2 bg-[#e6e6e6] text-[#252525] rounded hover:bg-[#9B7AA5]"
                      onClick={handleChangePassword}
                      disabled={
                        !password ||
                        !passwordConfirm ||
                        password !== passwordConfirm ||
                        password.length < 6
                      }
                    >
                      Change Password
                    </button>
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
