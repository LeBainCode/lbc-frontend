import Link from 'next/link'
import Image from 'next/image'

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center p-4 px-6">
      <div className="flex items-center">
        <Image 
          src="/images/logo.png"
          alt="Le Bain Code Logo"
          width={32}
          height={32}
          className="mr-2"
        />
      </div>
      <div className="flex items-center space-x-6">
        <Link href="/" className="text-gray-400 hover:text-white text-sm">Home</Link>
        <Link href="/rules" className="text-gray-400 hover:text-white text-sm">Rules</Link>
        <Link href="/contact" className="text-gray-400 hover:text-white text-sm">Contact</Link>
        <Link href="/sign-in" className="text-gray-400 hover:text-white text-sm">Sign in</Link>
        <Link href="/sign-up" className="bg-gray-800 px-3 py-1 rounded text-sm text-gray-300 hover:bg-gray-700">
          Sign up
        </Link>
      </div>
    </nav>
  )
}