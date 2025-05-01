"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const AuthCallback = () => {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(
          "https://lebaincode-backend.onrender.com/api/auth/user/profile",
          {
            method: "GET",
            credentials: "include", // Important pour envoyer les cookies
          }
        );

        if (!res.ok) {
          throw new Error("Utilisateur non authentifié");
        }

        const user = await res.json();
        console.log("Utilisateur connecté :", user);

        router.push("/dashboard");
      } catch (err) {
        console.error("Erreur lors de la vérification de session :", err);
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#111827] flex items-center justify-center">
      <p className="text-white">Connexion en cours...</p>
    </div>
  );
};

export default AuthCallback;
