"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const AuthCallback = () => {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(
          "https://lebaincode-backend.onrender.com/api/auth/me",
          {
            credentials: "include", // essentiel pour les cookies HttpOnly
          }
        );

        if (!res.ok) throw new Error("Not authenticated");

        router.push("/dashboard");
      } catch (err) {
        console.error("Session check failed:", err);
        router.push("/login");
      }
    };

    checkSession();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#111827] flex items-center justify-center">
      <p className="text-white">Checking session...</p>
    </div>
  );
};

export default AuthCallback;
