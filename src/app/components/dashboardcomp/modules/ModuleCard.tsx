// components/modules/ModuleCard.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface ModuleCardProps {
  type: "C" | "Exam";
  progress: number;
  isLocked?: boolean;
  href: string;
}

export default function ModuleCard({
  type,
  isLocked = false,
  href,
}: ModuleCardProps) {
  const router = useRouter();

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/");
  };

  return (
    <Link href={isLocked ? "#" : href}>
      <div className="flex flex-col justify-center bg-[#e8e6fe] bg-opacity-90 rounded-lg w-[300px] h-[300px] relative">
        {/* Barre de progression + bouton alignés horizontalement */}
        <div className="flex items-center px-3 pt-2 pb-1">
          {/* Barre de progression */}
          <div className="h-5 bg-gray-300 rounded-full flex-grow overflow-hidden">
            <div className="h-full bg-[#BF9ACA] w-[30%] transition-all duration-300" />
          </div>

          {/* Bouton de fermeture */}
          <button
            onClick={handleClose}
            className="ml-2 text-[#252525] hover:text-gray-600 text-xl cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Barre de séparation */}
        <div className="border-b border-gray-700 "></div>

        {/* Contenu principal */}
        <div className="flex items-center justify-center flex-grow">
          {isLocked ? (
            <svg
              className="w-14 h-14 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          ) : (
            <span className="text-4xl font-bold text-black">{type}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
