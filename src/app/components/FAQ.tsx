'use client'
import { useState } from 'react'

interface FAQItem {
  question: string;
}

const faqData: FAQItem[] = [
  { question: "What is green energy?" },
  { question: "How does green energy benefit the environment?" },
  { question: "What green energy solutions does your company offer?" },
  { question: "What support services do you offer after installing green energy solutions?" },
  { question: "How do solar panels work?" },
  // Duplicate test questions for right column
  { question: "What is green energy?" },
  { question: "How does green energy benefit the environment?" },
  { question: "What green energy solutions does your company offer?" },
  { question: "What support services do you offer after installing green energy solutions?" },
  { question: "How do solar panels work?" },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-4xl font-bold text-white mb-2">FAQ</h2>
      <p className="text-gray-400 mb-8">Here you will find the answers to the frequently asked questions.</p>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-4">
          {faqData.slice(0, 5).map((faq, index) => (
            <button
              key={index}
              onClick={() => toggleQuestion(index)}
              className={`w-full text-left p-4 rounded-lg transition-colors ${
                openIndex === index 
                  ? 'bg-[#BF9ACA] text-white' 
                  : 'bg-gray-800/50 text-white hover:bg-gray-800'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-sm">{faq.question}</span>
                <span className="text-xl">{openIndex === index ? '−' : '+'}</span>
              </div>
              {openIndex === index && (
                <div className="mt-4 text-sm text-white/80">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                  varius enim in eros elementum tristique.
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {faqData.slice(5, 10).map((faq, index) => (
            <button
              key={index + 5}
              onClick={() => toggleQuestion(index + 5)}
              className={`w-full text-left p-4 rounded-lg transition-colors ${
                openIndex === index + 5 
                  ? 'bg-[#BF9ACA] text-white' 
                  : 'bg-gray-800/50 text-white hover:bg-gray-800'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-sm">{faq.question}</span>
                <span className="text-xl">{openIndex === index + 5 ? '−' : '+'}</span>
              </div>
              {openIndex === index + 5 && (
                <div className="mt-4 text-sm text-white/80">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                  varius enim in eros elementum tristique.
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}