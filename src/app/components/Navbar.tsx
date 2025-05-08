"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";

interface User {
  role: string;
  username: string;
}
interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

export default function Navbar() {
  const { user, setUser } = useAuth() as AuthContextType;
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    console.log("Signing out...");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (response.ok) {
        console.log("Backend logout successful");
        setUser(null);
        router.push("/");
      } else {
        console.error("Failed to log out on the backend");
        throw new Error("Logout failed");
      }
    } catch (error) {
      console.error("Error signing out:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <nav className="flex items-center space-x-6">
        <Image
          src="/images/logo.png"
          alt="Le Bain Code Logo"
          width={32}
          height={32}
          priority
        />
        <Link href="/" className="text-[#e6e6e6] hover:text-white text-sm">
          Home
        </Link>
        <Link href="#rules" className="text-[#e6e6e6] hover:text-white text-sm">
          Rules
        </Link>
        <Link
          href="#contact"
          className="text-[#e6e6e6] hover:text-white text-sm"
        >
          Contact
        </Link>
      </nav>

      <div className="flex items-center space-x-6">
        {user ? (
          <>
            <span className="text-white">
              {user?.role === "admin" ? user.username : `User ${user.username}`}
            </span>
            <button
              onClick={handleSignOut}
              disabled={isLoading}
              className={`text-gray-300 hover:text-white transition-colors ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Signing out..." : "Sign out"}
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="text-gray-300 hover:text-white transition-colors"
          >
            Sign in
          </button>
        )}
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
