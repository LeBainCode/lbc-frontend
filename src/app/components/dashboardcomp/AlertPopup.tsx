// src/app/components/AlertPopup.tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AlertPopupProps {
  hasEmail: boolean;
  isAdmin: boolean;
}

export default function AlertPopup({ hasEmail, isAdmin }: AlertPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Show popup after 5 seconds of landing on dashboard
    if (isAdmin) return; // Do not show popup for admins

    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [isAdmin]); // Add isAdmin to dependency array

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleJoinBeta = () => {
    router.push("/beta");
  };

  if (!isOpen || isAdmin) return null; // Also hide if isAdmin is true

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#1F2937] rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-white">
            Beta Testing Opportunity! 🚀
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        
        <div className="text-gray-300 space-y-4">
          <p>
            Welcome to LeBainCode! Our platform is currently in development, and
            while some features are not yet fully accessible, we&apos;re looking
            for beta testers to help shape the future of our platform.
          </p>

          <div className="bg-[#374151] p-4 rounded-lg">
            <h3 className="text-white font-semibold mb-2">
              To become a beta tester:
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span
                  className={`mr-2 ${
                    hasEmail ? "text-green-400" : "text-yellow-400"
                  }`}
                >
                  {hasEmail ? "✓" : "•"}
                </span>
                {hasEmail ? (
                  "Email verified ✨"
                ) : (
                  <span>
                    Add your email in{" "}
                    <Link
                      href="/settings"
                      className="text-[#BF9ACA] hover:underline"
                    >
                      settings
                    </Link>
                  </span>
                )}
              </li>
              <li className="flex items-center">
                <span className="text-yellow-400 mr-2">•</span>
                <span>
                  Join our{" "}
                  <a
                    href="https://discord.gg/zYJpXBNVhk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#BF9ACA] hover:underline"
                  >
                    Discord server
                  </a>
                </span>
              </li>
            </ul>
          </div>

          <p className="text-sm text-gray-400">
            By becoming a beta tester, you&apos;ll get early access to new
            features and help us improve the platform for everyone.
          </p>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="bg-[#374151] text-white px-4 py-2 rounded hover:bg-[#4B5563] transition-colors"
          >
            No, thanks
          </button>
          <button
            onClick={handleJoinBeta}
            className="bg-[#BF9ACA] text-white px-4 py-2 rounded hover:bg-opacity-90 transition-colors"
          >
            Yes, let me in!
          </button>
        </div>
      </div>
    </div>
  );
}
