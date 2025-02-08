// src/app/auth/callback/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const AuthCallback = () => {
  const router = useRouter();

  useEffect(() => {
    const handleAuthentication = async () => {
      try {
        // Redirect to the dashboard after the backend sets the cookie
        router.push("/dashboard");
      } catch (error) {
        console.error("Error during authentication:", error);
        router.push("/login");
      }
    };

    handleAuthentication();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#111827] flex items-center justify-center">
      <p className="text-white">Processing authentication...</p>
    </div>
  );
};

export default AuthCallback;