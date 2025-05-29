// src/app/components/BetaTesterPopup.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface BetaTesterPopupProps {
  isBetaTester: boolean;
}

export default function BetaTesterPopup({ isBetaTester }: BetaTesterPopupProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isBetaTester) return;

    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, [isBetaTester]);

  const handleClose = () => setIsOpen(false);

  if (!isOpen || !isBetaTester) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#1F2937] rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-white">
            Accès Beta Testeur 🔧
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
            Merci de participer à l'amélioration de notre plateforme. Vous avez accès à l'espace dédié aux beta testeurs pour nous faire part de vos retours !
          </p>

          <div className="bg-[#374151] p-4 rounded-lg">
            <p className="text-white font-medium mb-2">
              👉 Cliquez ici pour signaler un bug ou une suggestion :
            </p>
            <Link
              href="/beta"
              className="inline-block bg-[#BF9ACA] text-white px-4 py-2 rounded hover:bg-opacity-90 transition-colors"
            >
              Accéder à l'espace Beta Testeur
            </Link>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleClose}
            className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            Fermer
          </button>
