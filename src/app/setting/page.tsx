"use client";
import React, { useState, useEffect, useMemo } from "react";
import Navbar from "../components/navcomp/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

// Typage Role
type Role = "user" | "admin";

// URL de base de l'API
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://lebaincode-backend.onrender.com";

export default function Settings() {
  const { user, setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [emailMessage, setEmailMessage] = useState<{
    error: boolean;
    text: string;
  } | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const [password, setPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<{
    error: boolean;
    text: string;
  } | null>(null);
  const [passwordConfirm, setPasswordConfirm] = useState("");

  // Récupère le rôle de l'utilisateur
  const role: Role = (user?.role as Role) || "user";

  // Définition des onglets disponibles selon le rôle
  const tabs = useMemo(() => {
    const tabsByRole = {
      user: ["email", "terms"],
      admin: ["email", "password", "terms"],
    };
    return tabsByRole[role] || ["email", "terms"];
  }, [role]);

  const [selectedTab, setSelectedTab] = useState(tabs[0]);

  // Initialiser l'email avec celui de l'utilisateur connecté
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user?.email]);

  // Reset selectedTab si tabs change
  useEffect(() => {
    if (!tabs.includes(selectedTab)) {
      setSelectedTab(tabs[0]);
    }
  }, [tabs, selectedTab]);

  // Vérifier si l'email existe déjà en utilisant l'API réelle
  const handleVerifyEmail = async () => {
    setEmailMessage(null);
    setIsEmailVerified(false);

    if (!isValidEmail(email)) {
      setEmailMessage({ error: true, text: "Format d'email invalide" });
      return;
    }

    try {
      setVerifyingEmail(true);

      // Utiliser /api/email/check pour vérifier dans les deux collections
      const response = await fetch(`${API_BASE_URL}/api/email/check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Erreur serveur: ${response.status}`);
      }

      const data = await response.json();

      if (data.exists) {
        setEmailMessage({ error: true, text: "Cet email est déjà utilisé." });
        setIsEmailVerified(false);
      } else {
        setEmailMessage({ error: false, text: "Email disponible." });
        setIsEmailVerified(true);
      }
    } catch (error) {
      setEmailMessage({
        error: true,
        text:
          error instanceof Error
            ? error.message
            : "Erreur lors de la vérification.",
      });
      setIsEmailVerified(false);
    } finally {
      setVerifyingEmail(false);
    }
  };

  // Mettre à jour l'email en utilisant l'API réelle
  const handleChangeEmail = async () => {
    setEmailMessage(null);

    if (!isEmailVerified) {
      setEmailMessage({
        error: true,
        text: "Veuillez vérifier que l'email est disponible avant de changer.",
      });
      return;
    }

    if (!user?.id) {
      setEmailMessage({
        error: true,
        text: "Impossible de mettre à jour l'email: utilisateur non identifié.",
      });
      return;
    }

    try {
      setChangingEmail(true);

      // Utiliser l'endpoint /api/email/update/me pour mettre à jour son propre email
      const response = await fetch(`${API_BASE_URL}/api/email/update/me`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Erreur serveur: ${response.status}`
        );
      }

      const updatedUser = await response.json();

      // Mettre à jour l'utilisateur dans le contexte
      setUser({ ...user, email: updatedUser.email || email });

      setEmailMessage({ error: false, text: "Email mis à jour avec succès." });
      setIsEmailVerified(false);
    } catch (error) {
      setEmailMessage({
        error: true,
        text:
          error instanceof Error
            ? error.message
            : "Erreur lors de la mise à jour.",
      });
    } finally {
      setChangingEmail(false);
    }
  };

  // Mettre à jour le mot de passe (admin seulement) en utilisant l'API réelle
  const handleChangePassword = async () => {
    if (password !== passwordConfirm) {
      setPasswordMessage({
        error: true,
        text: "Les mots de passe ne correspondent pas.",
      });
      return;
    }

    if (password.length < 8) {
      setPasswordMessage({
        error: true,
        text: "Le mot de passe doit contenir au moins 8 caractères.",
      });
      return;
    }

    if (!user?.id) {
      setPasswordMessage({
        error: true,
        text: "Impossible de mettre à jour le mot de passe: utilisateur non identifié.",
      });
      return;
    }

    setPasswordMessage(null);

    try {
      setChangingPassword(true);

      // Utiliser l'endpoint de changement de mot de passe sécurisé
      const response = await fetch(
        `${API_BASE_URL}/api/security/password/change`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password,
            confirmPassword: passwordConfirm,
          }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Erreur serveur: ${response.status}`
        );
      }

      setPasswordMessage({
        error: false,
        text: "Mot de passe changé avec succès.",
      });
      setPassword("");
      setPasswordConfirm("");
    } catch (error) {
      setPasswordMessage({
        error: true,
        text:
          error instanceof Error
            ? error.message
            : "Erreur lors du changement de mot de passe.",
      });
    } finally {
      setChangingPassword(false);
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
            <p className="text-gray-400">Modify your settings here.</p>

            <div className="flex flex-col md:flex-row gap-6 bg-[#1F2937] rounded-lg shadow-xl overflow-hidden mt-8">
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
                        disabled={verifyingEmail || changingEmail}
                        className="flex-1 px-3 py-2 bg-[#e6e6e6] text-[#252525] rounded border border-gray-600 disabled:bg-gray-300"
                      />
                      <button
                        className={`px-4 py-2 bg-[#e6e6e6] text-[#252525] rounded hover:bg-[#9B7AA5] disabled:opacity-50 disabled:cursor-not-allowed`}
                        onClick={handleVerifyEmail}
                        disabled={!email || verifyingEmail || changingEmail}
                      >
                        {verifyingEmail ? (
                          <span className="flex items-center">
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-800"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Vérification...
                          </span>
                        ) : (
                          "Verify Email"
                        )}
                      </button>
                      <button
                        className={`px-4 py-2 bg-[#e6e6e6] text-[#252525] rounded hover:bg-[#9B7AA5] disabled:opacity-50 disabled:cursor-not-allowed`}
                        onClick={handleChangeEmail}
                        disabled={!email || !isEmailVerified || changingEmail}
                      >
                        {changingEmail ? (
                          <span className="flex items-center">
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-800"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Mise à jour...
                          </span>
                        ) : (
                          "Change Email"
                        )}
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
                        disabled={changingPassword}
                        className="flex-1 px-3 py-2 bg-[#e6e6e6] text-[#252525] rounded border border-gray-600 disabled:bg-gray-300"
                      />
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        value={passwordConfirm}
                        onChange={(e) => {
                          setPasswordConfirm(e.target.value);
                          setPasswordMessage(null);
                        }}
                        disabled={changingPassword}
                        className="flex-1 px-3 py-2 bg-[#e6e6e6] text-[#252525] rounded border border-gray-600 disabled:bg-gray-300"
                      />
                    </div>
                    <button
                      className={`px-4 py-2 bg-[#e6e6e6] text-[#252525] rounded hover:bg-[#9B7AA5] disabled:opacity-50 disabled:cursor-not-allowed`}
                      onClick={handleChangePassword}
                      disabled={
                        !password ||
                        !passwordConfirm ||
                        password !== passwordConfirm ||
                        password.length < 8 ||
                        changingPassword
                      }
                    >
                      {changingPassword ? (
                        <span className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-800"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Mise à jour...
                        </span>
                      ) : (
                        "Change Password"
                      )}
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
                  <div className="text-gray-400">
                    <h3 className="text-xl font-medium text-white mb-4">
                      Termes et conditions
                    </h3>
                    <p className="mb-4">
                      En utilisant ce service, vous acceptez les conditions
                      générales décrites ci-dessous.
                    </p>
                    <p className="mb-4">
                      Le Bain Code se réserve le droit de modifier ces
                      conditions à tout moment. Les utilisateurs seront notifiés
                      des modifications par email.
                    </p>
                    <h4 className="text-lg font-medium text-white mt-6 mb-2">
                      Politique de confidentialité
                    </h4>
                    <p>
                      Vos données sont protégées selon notre politique de
                      confidentialité et ne seront jamais vendues à des tiers
                      sans votre consentement.
                    </p>
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
