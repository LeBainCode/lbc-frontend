"use client";

import { useRouter } from "next/navigation";
import { BeakerIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/app/context/AuthContext";

export default function BetaPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    occupation: "",
    discordId: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    toast.dismiss();

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/api/beta/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit application.");
      }

      // Simulate sending confirmation email (backend should handle this)
      // const emailResponse = await fetch("/api/email/beta/confirmation", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email: formData.email, username: formData.discordId }),
      // });

      // if (!emailResponse.ok) {
      //   throw new Error("Failed to send confirmation email.");
      // }

      toast.success("Application submitted! Check your email for confirmation.");
      setShowForm(false); // Hide form after submission
      setFormData({ email: "", occupation: "", discordId: "" }); // Clear form
    } catch (error: any) {
      console.error("Error submitting beta application:", error);
      toast.error(error.message || "Failed to submit application. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-[#1F2937] rounded-lg p-6 sm:p-8 shadow-xl">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-6">
            <BeakerIcon className="h-8 w-8 text-purple-500" />
            <h1 className="text-2xl sm:text-3xl font-bold">
              Welcome to LeBainCode Beta! 🚀
            </h1>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <p className="text-gray-300">
              Thank you for your interest in our beta program! As a beta tester, you'll have the opportunity to:
            </p>

            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                Get early access to new features and improvements
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                Help shape the future of LeBainCode
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                Provide valuable feedback to make our platform better
              </li>
            </ul>

            <div className="bg-[#374151] p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-3">Next Steps</h2>
              <ol className="space-y-2 text-gray-300">
                <li className="flex items-center">
                  <span className="text-purple-500 mr-2">1.</span>
                  Join our Discord community to stay updated
                </li>
                <li className="flex items-center">
                  <span className="text-purple-500 mr-2">2.</span>
                  Keep an eye on your email for beta access updates
                </li>
                <li className="flex items-center">
                  <span className="text-purple-500 mr-2">3.</span>
                  Start exploring and providing feedback!
                </li>
              </ol>
            </div>

            {!showForm && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-lg font-semibold"
                >
                  Join the Beta Program
                </button>
              </div>
            )}

            {showForm && (
              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <div>
                  <label htmlFor="email" className="block text-gray-300 text-sm font-bold mb-2">
                    Email:
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label htmlFor="occupation" className="block text-gray-300 text-sm font-bold mb-2">
                    Professional Occupation:
                  </label>
                  <input
                    type="text"
                    id="occupation"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleInputChange}
                    required
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label htmlFor="discordId" className="block text-gray-300 text-sm font-bold mb-2">
                    Discord ID:
                  </label>
                  <input
                    type="text"
                    id="discordId"
                    name="discordId"
                    value={formData.discordId}
                    onChange={handleInputChange}
                    required
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Submitting..." : "Submit Application"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="ml-4 text-gray-400 hover:text-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Back button */}
          <div className="mt-8">
            <button
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 