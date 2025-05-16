"use client";

import { useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../../context/AuthContext";
import AuthModal from "./AuthModal";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDown, LogOut, Settings, LayoutDashboard } from "lucide-react";

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
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (response.ok) {
        setUser(null);
        router.push("/");
      } else {
        throw new Error("Logout failed");
      }
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between px-4 py-3 bg-[#24292f]">
      <div className="flex items-center space-x-4 sm:mx-auto">
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
      </div>

      <div className="flex items-center sm:mx-auto">
        {user ? (
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center space-x-2 text-white hover:text-gray-200 text-sm focus:outline-none">
              {/* Avatar à gauche */}
              <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white text-xs">
                {user.username.charAt(0).toUpperCase()}
              </div>
              {/* Nom d'utilisateur */}
              <span className="truncate max-w-[100px]">
                {user.role === "admin"
                  ? user.username
                  : `User ${user.username}`}
              </span>
              {/* Flèche */}
              <ChevronDown className="w-4 h-4 ml-1" />
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-44 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none z-50">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => router.push("/dashboard")}
                        className={`${
                          active ? "bg-gray-100" : ""
                        } w-full px-4 py-2 text-left text-sm text-gray-700 flex items-center gap-2`}
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </button>
                    )}
                  </Menu.Item>

                  <div className="border-t my-1 border-gray-200" />

                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => router.push("/setting")}
                        className={`${
                          active ? "bg-gray-100" : ""
                        } w-full px-4 py-2 text-left text-sm text-gray-700 flex items-center gap-2`}
                      >
                        <Settings className="w-4 h-4" />
                        Paramètres
                      </button>
                    )}
                  </Menu.Item>

                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleSignOut}
                        disabled={isLoading}
                        className={`${
                          active ? "bg-gray-100" : ""
                        } w-full px-4 py-2 text-left text-sm text-red-600 flex items-center gap-2 ${
                          isLoading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        <LogOut className="w-4 h-4" />
                        Déconnexion
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        ) : (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="text-gray-300 hover:text-white text-sm transition-colors"
          >
            Sign in
          </button>
        )}
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
