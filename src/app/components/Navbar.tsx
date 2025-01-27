import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
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
        <Link href="/rules" className="text-#e6e6e6 hover:text-white text-sm">
          Rules
        </Link>
        <Link href="/contact" className="text-#e6e6e6 hover:text-white text-sm">
          Contact
        </Link>
      </div>
      <div className="flex items-center space-x-6">
        <Link href="/sign-in" className="text-#e6e6e6 hover:text-white text-sm">
          Sign in
        </Link>
        <Link
          href="/sign-up"
          className="border-2 border-[#e6e6e6] px-3 py-1 rounded text-sm text-#e6e6e6 hover:bg-gray-700"
        >
          Sign up
        </Link>
      </div>
    </nav>
  );
}
