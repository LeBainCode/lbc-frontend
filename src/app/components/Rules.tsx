"use client";

import { useState } from "react";

interface Rule {
  id: string;
  text: string;
}

const rules: Rule[][] = [
  [
    { id: "1", text: "Quis autem vel eum iure reprehenderit." },
    { id: "2", text: "Quis autem vel eum iure reprehenderit." },
    { id: "3", text: "Quis autem vel eum iure reprehenderit." },
  ],
  [
    { id: "4", text: "Quis autem vel eum iure reprehenderit." },
    { id: "5", text: "Quis autem vel eum iure reprehenderit." },
    { id: "6", text: "Quis autem vel eum iure reprehenderit." },
  ],
  [
    { id: "4", text: "Quis autem vel eum iure reprehenderit." },
    { id: "5", text: "Quis autem vel eum iure reprehenderit." },
  ],
  // Add more sets of rules here
];

export default function Rules() {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = rules.length;

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleBack = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-white mb-4">Regles</h2>
      <p className="text-#e6e6e6 text-base mb-8">
        This is a paragraph with more information about something important.
        This something has many uses and is made of 100% recycled material.
      </p>

      {/* Progress indicator */}
      <div className="mb-6">
        <div className="text-gray-400 text-sm mb-2">
          {currentPage + 1} of {totalPages}
        </div>
        <div className="bg-gray-700 h-1 rounded-full">
          <div
            className="bg-[#BEF264] h-1 rounded-full transition-all duration-300"
            style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
          />
        </div>
      </div>

      <p className="text-#e6e6e6 text-base mb-8">
        This is a sentence about something important.
      </p>
      {/* Rules content */}
      <div className="space-y-4 mb-8">
        {rules[currentPage].map((rule) => (
          <div
            key={rule.id}
            className="bg-[#e6e6e6] p-4 rounded-lg cursor-pointer hover:bg-[#7C3AED] transition-colors"
          >
            <div className="flex items-center">
              <span className="text-gray-400 mr-2">{rule.id}</span>
              <span className="text-[#344054]">{rule.text}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <button
          onClick={handleBack}
          className={`px-4 py-2 rounded text-sm ${
            currentPage === 0
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-gray-800 text-white hover:bg-gray-700"
          }`}
          disabled={currentPage === 0}
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className={`px-4 py-2 rounded text-sm ${
            currentPage === totalPages - 1
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-[#e6e6e6] text-[#344054] hover:bg-[#7C3AED] hover:text-[#e6e6e6]"
          }`}
          disabled={currentPage === totalPages - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
}
