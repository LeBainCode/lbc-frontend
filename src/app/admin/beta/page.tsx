"use client";

import { useState, useEffect } from "react";
import { Check, X, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { sendBetaEmail } from "@/app/services/emails";

// Types
type BetaStatus = "pending" | "accepted" | "rejected";

interface BetaApplicant {
  id: string;
  email: string;
  occupation: string;
  discordId: string;
  status: BetaStatus;
  appliedAt: string;
  username: string;
}

interface PaginatedResponse {
  applicants: BetaApplicant[];
  total: number;
  page: number;
  totalPages: number;
}

// Filter types
type FilterType = "all" | BetaStatus;

const ITEMS_PER_PAGE = 10;

export default function BetaAdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [applicants, setApplicants] = useState<BetaApplicant[]>([]);
  const [currentFilter, setCurrentFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Handle admin check and redirect
  useEffect(() => {
    console.log("[BetaAdminPage] User effect triggered. User:", user);
    if (user && user.role !== "admin") {
      console.log("[BetaAdminPage] User is not admin, redirecting.");
      router.push("/dashboard");
    }
  }, [user, router]);

  // Fetch applicants
  const fetchApplicants = async () => {
    console.log("[BetaAdminPage] fetchApplicants called. User:", user);
    if (!user || user.role !== "admin") {
      console.log("[BetaAdminPage] fetchApplicants: User is not admin or not loaded, returning.");
      return;
    }

    try {
      setIsLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      console.log("[BetaAdminPage] Fetching applicants from API:", `${apiUrl}/api/beta/applications?page=${currentPage}&limit=${ITEMS_PER_PAGE}&status=${currentFilter === "all" ? "" : currentFilter}`);
      const response = await fetch(
        `${apiUrl}/api/beta/applications?page=${currentPage}&limit=${ITEMS_PER_PAGE}&status=${currentFilter === "all" ? "" : currentFilter}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch applicants");
      }

      const data: PaginatedResponse = await response.json();
      setApplicants(data.applicants || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching applicants:", error);
      toast.error("Failed to load applicants");
      setApplicants([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on mount and when filter/page changes
  useEffect(() => {
    fetchApplicants();
  }, [currentFilter, currentPage, user]);

  // Handle applicant status change
  const handleStatusChange = async (applicantId: string, newStatus: BetaStatus) => {
    if (!user || user.role !== "admin") return;

    setLoading((prev) => ({ ...prev, [applicantId]: true }));

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const applicant = applicants.find((a) => a.id === applicantId);

      if (!applicant) {
        throw new Error("Applicant not found");
      }

      // Update status in backend
      const response = await fetch(`${apiUrl}/api/beta/${newStatus}/${applicantId}`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to update status: ${response.status}`);
      }

      // Send email
      await sendBetaEmail({
        email: applicant.email,
        username: applicant.username,
        type: newStatus === "accepted" ? "approval" : "rejection",
      });

      // Update local state
      setApplicants((prev) =>
        prev.map((a) =>
          a.id === applicantId ? { ...a, status: newStatus } : a
        )
      );

      toast.success(
        `Successfully ${newStatus === "accepted" ? "accepted" : "rejected"} applicant`
      );
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update applicant status");
    } finally {
      setLoading((prev) => ({ ...prev, [applicantId]: false }));
    }
  };

  // If not admin, don't render anything
  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-8">Beta Program Administration</h1>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(["all", "pending", "accepted", "rejected"] as FilterType[]).map((filter) => (
            <button
              key={filter}
              onClick={() => {
                setCurrentFilter(filter);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${
                  currentFilter === filter
                    ? "bg-purple-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        {/* Applicants list */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : applicants.length === 0 ? (
            <div className="flex justify-center items-center p-8 text-gray-400">
              No applicants found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-700">
                      <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Occupation</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Discord ID</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Applied</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {applicants.map((applicant) => (
                      <tr key={applicant.id} className="hover:bg-gray-700/50">
                        <td className="px-4 py-3 text-sm">{applicant.email}</td>
                        <td className="px-4 py-3 text-sm">{applicant.occupation}</td>
                        <td className="px-4 py-3 text-sm">{applicant.discordId}</td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${
                                applicant.status === "accepted"
                                  ? "bg-green-100 text-green-800"
                                  : applicant.status === "rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                          >
                            {applicant.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {new Date(applicant.appliedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleStatusChange(applicant.id, "accepted")}
                              disabled={loading[applicant.id]}
                              className={`p-1 rounded-full transition-colors
                                ${
                                  applicant.status === "accepted"
                                    ? "bg-green-600 text-white"
                                    : "bg-gray-600 text-gray-300 hover:bg-green-600 hover:text-white"
                                }`}
                            >
                              {loading[applicant.id] ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleStatusChange(applicant.id, "rejected")}
                              disabled={loading[applicant.id]}
                              className={`p-1 rounded-full transition-colors
                                ${
                                  applicant.status === "rejected"
                                    ? "bg-red-600 text-white"
                                    : "bg-gray-600 text-gray-300 hover:bg-red-600 hover:text-white"
                                }`}
                            >
                              {loading[applicant.id] ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <X className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-700">
                  <div className="flex items-center">
                    <p className="text-sm text-gray-400">
                      Page {currentPage} of {totalPages}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 