// src/app/components/home/Hero.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import LoginModal from "./LoginModal";

export default function Hero() {
  const [email, setEmail] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [apiUrl, setApiUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuth();
  const router = useRouter();

  // Set API URL from environment variables
  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://lebaincode-backend.onrender.com";
    setApiUrl(baseUrl);
    console.log("Hero initialized with user:", user);
  }, []);

  // Fetch the user's email by username when logged in
  useEffect(() => {
    const fetchUserEmail = async () => {
      if (user && user.username && apiUrl) {
        try {
          console.log("Fetching email for user:", user.username);
          
          // Use the specific endpoint to get user's email by username
          const response = await fetch(`${apiUrl}/api/email/users/${user.username}`, {
            method: "GET",
            credentials: "include",
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log("User email data:", data);
            
            // The response structure is { success: true, user: { username, email } }
            if (data.success && data.user && data.user.email) {
              console.log("Setting email from API response:", data.user.email);
              setEmail(data.user.email);
            } else {
              console.log("User data found but no email in the expected format:", data);
              setEmail("");
            }
          } else {
            console.error("Failed to fetch user email:", response.status);
          }
        } catch (error) {
          console.error("Error fetching user email:", error);
        }
      }
    };
    
    fetchUserEmail();
  }, [user, apiUrl]);

  // Rest of your component stays the same...
  
  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailMessage("");

    if (!email.trim()) {
      setEmailMessage("Please enter an email address");
      return;
    }

    setIsLoading(true);

    try {
      // If user is not authenticated, check email status and handle accordingly
      if (!user) {
        // Use the correct endpoint from the Swagger documentation
        const checkResponse = await fetch(`${apiUrl}/api/email/check`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email })
        });

        if (!checkResponse.ok) {
          throw new Error(`Failed to check email status: ${checkResponse.status}`);
        }

        const checkData = await checkResponse.json();
        console.log("Email check response:", checkData);

        // If email exists in User collection, invite to sign in
        if (checkData.exists && checkData.isUser) {
          setEmailMessage("Welcome back! Please login to continue");
          setTimeout(() => setIsLoginModalOpen(true), 1000);
          return;
        }

        // If it's already a prospect, invite to create GitHub account
        if (checkData.exists && !checkData.isUser) {
          setEmailMessage("This email is already registered. Please create a GitHub account to continue.");
          return;
        }

        // If email is new, save as prospect using the correct endpoint
        const saveProspectResponse = await fetch(`${apiUrl}/api/email/prospect`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email })
        });

        if (!saveProspectResponse.ok) {
          const errorData = await saveProspectResponse.json();
          throw new Error(errorData.message || "Failed to save your email");
        }

        setEmailMessage("Thank you for your interest! Please create a GitHub account to continue.");
      } else {
        // User is already authenticated, display appropriate message
        if (user.role === "admin") {
          setEmailMessage(`Welcome back, admin ${user.username || ""}!`);
        } else if (user.betaAccess) {
          setEmailMessage(`Welcome back, beta tester ${user.username || ""}!`);
        } else {
          setEmailMessage(`Welcome back, ${user.username || ""}!`);
        }
      }
    } catch (error) {
      console.error("Error processing email:", error);
      setEmailMessage(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDashboardClick = () => router.push("/dashboard");

  const handleGitHubSignIn = () => {
    // Redirect to GitHub OAuth endpoint
    window.location.href = `${apiUrl}/api/auth/github`;
  };

  return (
    <>
      <section className="w-full px-4 sm:px-6 lg:px-8 py-16 text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Le Bain Code
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-xl leading-relaxed mb-10">
            This is a paragraph with more information about something important.
            This something has many uses and is made of 100% recycled material.
          </p>
          <div className="flex flex-col sm:items-center sm:gap-4 max-w-2xl w-full">
            <form
              onSubmit={handleEmailSubmit}
              className="flex flex-col md:flex-row w-full sm:w-4/5 md:w-full items-stretch gap-2 relative"
            >
              <input
                type="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  user && !email
                    ? `Hey ${user.username}, give us an email to send you updates`
                    : user
                    ? "Any updates will be sent to your email"
                    : "Please enter your email address for early access, news and updates"
                }
                disabled={isLoading}
                className="w-full md:w-[60%] px-4 py-2 text-sm bg-transparent border border-gray-600 rounded md:rounded-l md:rounded-r-none text-[#BF9ACA] placeholder-gray-500 focus:outline-none focus:border-[#BF9ACA] transition-all duration-300 disabled:opacity-50"
              />
              
              {/* Hide submit button when a user is logged in and has an email */}
              {(!user || !email) && (
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full md:w-[40%] px-4 py-2 text-sm ${
                    isLoading ? "bg-gray-500" : "bg-[#BF9ACA] hover:bg-[#7C3AED]"
                  } transition-colors rounded md:rounded-r md:rounded-l-none disabled:cursor-not-allowed`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Checking...
                    </span>
                  ) : (
                    "Submit"
                  )}
                </button>
              )}
              
              {emailMessage && (
                <div className="absolute -top-8 left-0 bg-[#BF9ACA] text-white px-3 py-1 rounded text-sm animate-fade-in-out">
                  {emailMessage}
                </div>
              )}
            </form>
            {!user ? (
              <div className="flex flex-col sm:flex-col md:flex-row gap-2 w-full sm:w-4/5 md:w-full mt-4">
                <button
                  onClick={handleGitHubSignIn}
                  className="w-full md:w-auto bg-[#BF9ACA] px-4 py-2 rounded text-sm hover:bg-[#7C3AED] transition-colors"
                >
                  Sign in through GitHub
                </button>
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="w-full md:w-auto border border-[#BF9ACA] px-4 py-2 rounded text-sm hover:bg-gray-700 transition-colors"
                >
                  Organization Login
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-4/5 md:w-full mt-4">
                <button
                  onClick={handleDashboardClick}
                  className="w-full sm:w-auto border border-[#BF9ACA] px-4 py-2 rounded text-sm hover:bg-gray-700 transition-colors"
                >
                  Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}
