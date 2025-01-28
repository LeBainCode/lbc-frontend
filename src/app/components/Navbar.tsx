// /app/components/Navbar.tsx
"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem('token'))
  }, [])

  const handleSignOut = () => {
    localStorage.removeItem('token')
    setIsAuthenticated(false)
    router.push('/')
  }

  return (
    <nav className="bg-[#24292f] flex justify-between items-center p-4 px-6">
      <div className="flex items-center space-x-6">
        <Image
          src="/images/logo.png"
          alt="Le Bain Code Logo"
          width={32}
          height={32}
        />
        <Link href="/" className="text-#e6e6e6 hover:text-white text-sm">
          Home
        </Link>
        <Link href="#rules" className="text-#e6e6e6 hover:text-white text-sm">
          Rules
        </Link>
        <Link href="#contact" className="text-#e6e6e6 hover:text-white text-sm">
          Contact
        </Link>
      </div>
      <div className="flex items-center space-x-6">
      {isAuthenticated ? (
          <button 
            onClick={handleSignOut}
            className="text-gray-300 hover:text-white"
          >
            Sign out
          </button>
        ) : (
          <>
            <Link href="/sign-in">Sign in</Link>
            <Link href="/sign-up">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
