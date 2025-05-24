// src/app/setting/page.tsx
"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import Navbar from "../components/navcomp/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

// Role type
type Role = "user" | "admin";

// Efficient debug logger with rate limiting and deduplication
const debugSettings = (() => {
  const seenMessages = new Set<string>();
  let lastLog = 0;
  const MIN_LOG_INTERVAL = 1000; // ms
  
  return (message: string, data?: unknown, isError = false) => {
    if (process.env.NODE_ENV !== "development") return;
    
    const now = Date.now();
    const key = `${message}:${JSON.stringify(data || '')}`;
    
    // Skip duplicates that happen too frequently
    if (seenMessages.has(key) && now - lastLog < MIN_LOG_INTERVAL) return;
    
    seenMessages.add(key);
    lastLog = now;
    
    // Prevent memory leaks
    if (seenMessages.size > 30) {
      seenMessages.clear();
    }
    
    // Log with component prefix
    if (isError) {
      console.error(`[Settings] ${message}`, data || '');
    } else {
      console.log(`[Settings] ${message}`, data || '');
    }
  };
})();

export default function Settings() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");
  const [emailMessage, setEmailMessage] = useState<{
    error: boolean;
    text: string;
  } | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);
  
  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<{
    error: boolean;
    text: string;
  } | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);
  
  // API URL
  const [apiUrl, setApiUrl] = useState("");
  const apiCallInProgress = useRef(false);
  
  // Validation utilities
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Get user role
  const role: Role = (user?.role as Role) || "user";

  // Set API URL
  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://lebaincode-backend.onrender.com";
    setApiUrl(baseUrl);
    debugSettings("Component initialized with API URL", baseUrl);
  }, []);

  // Fetch user's email on component mount
  useEffect(() => {
    const fetchUserEmail = async () => {
      if (!user?.username || !apiUrl || apiCallInProgress.current) return;
      
      apiCallInProgress.current = true;
      
      try {
        debugSettings("Fetching user email", { username: user.username });
        
        // Use the appropriate endpoint to get the user's email
        const response = await fetch(`${apiUrl}/api/email/users/${user.username}`, {
          method: "GET",
          credentials: "include",
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.user && data.user.email) {
            debugSettings("Email retrieved successfully");
            setEmail(data.user.email);
            setOriginalEmail(data.user.email);
          } else {
            debugSettings("No email found for user", null, true);
          }
        } else {
          debugSettings("Failed to fetch email", { status: response.status }, true);
        }
      } catch (error) {
        debugSettings("Error fetching user email", error, true);
      } finally {
        apiCallInProgress.current = false;
      }
    };
    
    fetchUserEmail();
  }, [user, apiUrl]);

  // Available tabs based on user role
  const tabs = useMemo(() => {
    const tabsByRole = {
      user: ["email", "terms"],
      admin: ["email", "password", "terms"],
    };
    return tabsByRole[role] || ["email", "terms"];
  }, [role]);

  const [selectedTab, setSelectedTab] = useState(tabs[0]);

  // Reset selectedTab if tabs change
  useEffect(() => {
    if (!tabs.includes(selectedTab)) {
      setSelectedTab(tabs[0]);
    }
  }, [tabs, selectedTab]);

  // Email verification
  const handleVerifyEmail = async () => {
    setEmailMessage(null);
    setIsEmailVerified(false);

    if (!isValidEmail(email)) {
      setEmailMessage({ error: true, text: "Format d'email invalide" });
      return;
    }

    // If email hasn't changed, no need to verify
    if (email === originalEmail) {
      setEmailMessage({ error: false, text: "C'est votre email actuel" });
      setIsEmailVerified(true);
      return;
    }

    try {
      setVerifyingEmail(true);
      debugSettings("Verifying email availability", { email });
      
      // Use the real API endpoint to check if the email exists
      const response = await fetch(`${apiUrl}/api/email/check`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });
      
      if (!response.ok) {
        throw new Error(`Erreur serveur: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.exists) {
        setEmailMessage({ error: true, text: "Cet email est déjà utilisé" });
        setIsEmailVerified(false);
      } else {
        setEmailMessage({ error: false, text: "Email disponible" });
        setIsEmailVerified(true);
      }
    } catch (error) {
      debugSettings("Email verification error", error, true);
      setEmailMessage({ 
        error: true, 
        text: error instanceof Error ? error.message : "Erreur lors de la vérification" 
      });
      setIsEmailVerified(false);
    } finally {
      setVerifyingEmail(false);
    }
  };

  // Email update
  const handleChangeEmail = async () => {
    setEmailMessage(null);
    
    if (!isEmailVerified && email !== originalEmail) {
      setEmailMessage({
        error: true,
        text: "Veuillez vérifier que l'email est disponible avant de changer",
      });
      return;
    }
    
    try {
      setChangingEmail(true);
      debugSettings("Updating email", { newEmail: email });
      
      // Use the real API endpoint to update the email
      const response = await fetch(`${apiUrl}/api/email/update/me`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la mise à jour");
      }
      
      setEmailMessage({ error: false, text: "Email mis à jour avec succès" });
      setOriginalEmail(email); // Update the original email
      setIsEmailVerified(false);
    } catch (error) {
      debugSettings("Email update error", error, true);
      setEmailMessage({ 
        error: true, 
        text: error instanceof Error ? error.message : "Erreur lors de la mise à jour" 
      });
    } finally {
      setChangingEmail(false);
    }
  };

  // Password change (for admin users)
  const handleChangePassword = async () => {
    setPasswordMessage(null);
    
    // Validate inputs
    if (!currentPassword) {
      setPasswordMessage({
        error: true,
        text: "Le mot de passe actuel est requis",
      });
      return;
    }
    
    if (!newPassword) {
      setPasswordMessage({
        error: true,
        text: "Le nouveau mot de passe est requis",
      });
      return;
    }
    
    if (newPassword !== passwordConfirm) {
      setPasswordMessage({
        error: true,
        text: "Les mots de passe ne correspondent pas",
      });
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordMessage({
        error: true,
        text: "Le mot de passe doit contenir au moins 8 caractères",
      });
      return;
    }
    
    try {
      setChangingPassword(true);
      debugSettings("Changing password");
      
      // Use the correct API endpoint to change password
      const response = await fetch(`${apiUrl}/api/security/password/change`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          currentPassword,
          newPassword
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors du changement de mot de passe");
      }
      
      setPasswordMessage({
        error: false,
        text: "Mot de passe changé avec succès",
      });
      
      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setPasswordConfirm("");
    } catch (error) {
      debugSettings("Password change error", error, true);
      setPasswordMessage({
        error: true,
        text: error instanceof Error ? error.message : "Erreur lors du changement de mot de passe",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <>
      <main className="min-h-screen bg-[#0D1117]">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 pt-16 pb-16">
          <div className="max-w-xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

            {/* Tab navigation */}
            <div className="bg-gray-800/40 rounded-lg p-1 mb-6 flex space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  className={`py-2 px-4 rounded text-sm font-medium flex-grow ${
                    selectedTab === tab
                      ? "bg-indigo-500 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  } transition-all`}
                  onClick={() => setSelectedTab(tab)}
                >
                  {tab === "email"
                    ? "Email"
                    : tab === "password"
                    ? "Password"
                    : "Terms"}
                </button>
              ))}
            </div>

            {/* Content panels */}
            <div className="bg-gray-800/40 rounded-lg p-6 shadow-lg">
              {/* Email panel */}
              {selectedTab === "email" && (
                <div className="space-y-4">
                  <h2 className="text-xl font-medium text-white mb-4">Manage Email</h2>
                  
                  <div className="space-y-4">
                    {/* Email input */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        placeholder={originalEmail || "Enter your email address"}
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (e.target.value !== originalEmail) {
                            setIsEmailVerified(false);
                          } else {
                            setIsEmailVerified(true);
                          }
                          setEmailMessage(null);
                        }}
                        disabled={verifyingEmail || changingEmail}
                        className="w-full px-3 py-2 bg-gray-700/50 text-white rounded border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-colors disabled:opacity-70"
                      />
                    </div>
                    
                    {/* Email action buttons */}
                    <div className="flex flex-wrap gap-3">
                      {email !== originalEmail && (
                        <button
                          onClick={handleVerifyEmail}
                          disabled={!email || verifyingEmail || changingEmail}
                          className="px-3 py-2 bg-gray-700 text-gray-100 rounded hover:bg-gray-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed text-sm"
                        >
                          {verifyingEmail ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Verifying...
                            </span>
                          ) : (
                            "Verify Email"
                          )}
                        </button>
                      )}
                      
                      <button
                        onClick={handleChangeEmail}
                        disabled={!email || (!isEmailVerified && email !== originalEmail) || changingEmail}
                        className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed text-sm flex-grow"
                      >
                        {changingEmail ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Updating...
                          </span>
                        ) : originalEmail ? (
                          "Update Email"
                        ) : (
                          "Save Email"
                        )}
                      </button>
                    </div>
                    
                    {/* Email status message */}
                    {emailMessage && (
                      <p
                        className={`text-sm mt-2 ${
                          emailMessage.error ? "text-red-400" : "text-green-400"
                        }`}
                      >
                        {emailMessage.text}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Password panel - only for admins */}
              {selectedTab === "password" && role === "admin" && (
                <div className="space-y-4">
                  <h2 className="text-xl font-medium text-white mb-4">Change Password</h2>
                  
                  <div className="space-y-4">
                    {/* Current password */}
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300 mb-1">
                        Current Password
                      </label>
                      <input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => {
                          setCurrentPassword(e.target.value);
                          setPasswordMessage(null);
                        }}
                        placeholder="••••••••"
                        disabled={changingPassword}
                        className="w-full px-3 py-2 bg-gray-700/50 text-white rounded border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-colors disabled:opacity-70"
                      />
                    </div>
                    
                    {/* New password */}
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-1">
                        New Password
                      </label>
                      <input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setPasswordMessage(null);
                        }}
                        placeholder="Enter new password"
                        disabled={changingPassword}
                        className="w-full px-3 py-2 bg-gray-700/50 text-white rounded border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-colors disabled:opacity-70"
                      />
                    </div>
                    
                    {/* Confirm new password */}
                    <div>
                      <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-300 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        id="passwordConfirm"
                        type="password"
                        value={passwordConfirm}
                        onChange={(e) => {
                          setPasswordConfirm(e.target.value);
                          setPasswordMessage(null);
                        }}
                        placeholder="Confirm new password"
                        disabled={changingPassword}
                        className="w-full px-3 py-2 bg-gray-700/50 text-white rounded border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-colors disabled:opacity-70"
                      />
                    </div>
                    
                    {/* Password strength indicator - optional */}
                    {newPassword && (
                      <div className="bg-gray-700/30 p-2 rounded">
                        <div className="text-xs text-gray-400 mb-1">Password strength:</div>
                        <div className="h-1.5 w-full bg-gray-700 rounded-full">
                          <div 
                            className={`h-1.5 rounded-full ${
                              newPassword.length < 8 ? "w-1/4 bg-red-500" :
                              newPassword.length < 12 ? "w-2/4 bg-yellow-500" :
                              "w-full bg-green-500"
                            } transition-all duration-300`}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    <button
                      onClick={handleChangePassword}
                      disabled={
                        !currentPassword ||
                        !newPassword ||
                        !passwordConfirm ||
                        newPassword !== passwordConfirm ||
                        newPassword.length < 8 ||
                        changingPassword
                      }
                      className="w-full px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {changingPassword ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Changing Password...
                        </span>
                      ) : (
                        "Change Password"
                      )}
                    </button>
                    
                    {/* Password status message */}
                    {passwordMessage && (
                      <p
                        className={`text-sm mt-2 ${
                          passwordMessage.error ? "text-red-400" : "text-green-400"
                        }`}
                      >
                        {passwordMessage.text}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Terms panel */}
              {selectedTab === "terms" && (
                <div>
                  <h2 className="text-xl font-medium text-white mb-4">Terms & Conditions</h2>
                  <div className="prose prose-sm prose-invert">
                    <p className="text-gray-300 mb-4">
                      By using this service, you accept the terms and conditions described below.
                    </p>
                    <p className="text-gray-300 mb-4">
                      Le Bain Code reserves the right to modify these terms at any time.
                      Users will be notified of changes by email.
                    </p>
                    <h3 className="text-lg font-medium text-white mt-6 mb-2">Privacy Policy</h3>
                    <p className="text-gray-300">
                      Your data is protected according to our privacy policy
                      and will never be sold to third parties without your consent.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
