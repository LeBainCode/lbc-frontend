// /app/components/Navbar.tsx
"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from "next/link"
import Image from "next/image"
import { useAuth } from '../context/AuthContext'
import AuthModal from './AuthModal'

export default function Navbar() {
  const { user, setUser } = useAuth()
  const router = useRouter()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  const handleSignOut = async () => {
    console.log('Signing out...');
    try {
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
  
      if (response.ok) {
        console.log('Backend logout successful');
      } else {
        console.error('Failed to log out on the backend');
      }
  
      setUser(null);
      router.push('/');
      console.log('User signed out and redirected to home.');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
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
          {user ? (
            <>
              <span className="text-white">
                {user.role === 'admin' ? user.username : `User ${user.username}`}
              </span>
              <button 
                onClick={handleSignOut}
                className="text-gray-300 hover:text-white"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="text-gray-300 hover:text-white"
            >
              Sign in
            </button>
          )}
        </div>
      </nav>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  )
}