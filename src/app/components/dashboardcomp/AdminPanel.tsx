// src/app/components/dashboardcomp/AdminPanel.tsx
"use client";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { Prospect, RegularUser } from "@/app/types/admin";
import UserCount from "./admin/UserCount";
import ProspectsTable from "./admin/ProspectsTable";
import { Tab } from "@headlessui/react";
import {
  UserGroupIcon,
  UsersIcon,
  ChartBarIcon,
  LinkIcon,
  UserPlusIcon,
  BeakerIcon,
} from "@heroicons/react/24/outline";
import AnalyticsSection from "./AnalyticsSection";
import BetaUsersTable from "./admin/BetaUsersTable";

// Mailchimp service for email notifications
const sendMailchimpEmail = async (
  type: "approval" | "rejection",
  email: string,
  username: string
) => {
  console.log(
    `[Mailchimp] Sending ${type} email to ${email} for user ${username}`
  );

  // This is a placeholder - will be replaced with actual Mailchimp API integration
  try {
    // In a real implementation, this would call the Mailchimp API
    // For now, we just log that we would send an email
    return true;
  } catch (error) {
    console.error(`Failed to send ${type} email:`, error);
    return false;
  }
};

// Debug utility for efficient logging
const debugAdmin = (() => {
  const seenMessages = new Set<string>();
  let lastLog = 0;

  return (message: string, data?: unknown, isError = false) => {
    if (process.env.NODE_ENV !== "development") return;

    const now = Date.now();
    const key = `${message}:${JSON.stringify(data || "")}`;

    if (seenMessages.has(key) && now - lastLog < 1000) return;
    seenMessages.add(key);
    lastLog = now;

    if (seenMessages.size > 30) seenMessages.clear();

    if (isError) {
      console.error(`[AdminPanel] ${message}`, data || "");
    } else {
      console.log(`[AdminPanel] ${message}`, data || "");
    }
  };
})();

// Interface for beta applications
interface BetaApplication {
  _id: string;
  userId: string;
  username: string;
  email: string;
  reason: string;
  occupation: string;
  discordId?: string;
  status: "pending" | "approved" | "rejected";
  appliedAt: string;
  decidedAt?: string;
}

export default function AdminPanel() {
  const { user } = useAuth();
  const [userCount, setUserCount] = useState<number | null>(null);
  const [regularUsers, setRegularUsers] = useState<RegularUser[]>([]);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [betaApplications, setBetaApplications] = useState<BetaApplication[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [loadingBeta, setLoadingBeta] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [betaError, setBetaError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [showNoEmail, setShowNoEmail] = useState(true);
  const apiCallInProgress = useRef(false);

  const getApiUrl = () => {
    return process.env.NEXT_PUBLIC_API_URL;
  };

  // Function to fetch all required data
  const fetchData = async () => {
    try {
      if (apiCallInProgress.current) return;
      apiCallInProgress.current = true;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      // Fetch users
      const usersResponse = await fetch(`${apiUrl}/api/admin/users`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Fetch prospects
      const prospectsResponse = await fetch(`${apiUrl}/api/admin/prospects`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!usersResponse.ok || !prospectsResponse.ok) {
        throw new Error("Failed to fetch data");
      }

      const usersData = await usersResponse.json();
      const prospectsData = await prospectsResponse.json();

      // Ensure usersData is an array
      const safeUsersData = Array.isArray(usersData) ? usersData : [];
      const safeProspectsData = Array.isArray(prospectsData)
        ? prospectsData
        : [];

      setRegularUsers(safeUsersData);
      setUserCount(safeUsersData.length);
      setProspects(safeProspectsData);
    } catch (error) {
      console.error("Error:", error);
      setError(error instanceof Error ? error.message : "Failed to load data");
      // Set safe defaults on error
      setRegularUsers([]);
      setProspects([]);
      setUserCount(0);
    } finally {
      setIsLoading(false);
      apiCallInProgress.current = false;
    }
  };

  // Function to fetch beta applications
  const fetchBetaApplications = async () => {
    try {
      setLoadingBeta(true);
      setBetaError(null);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/api/beta/applications`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch beta applications: ${response.status}`
        );
      }

      const data = await response.json();
      setBetaApplications(data);
      debugAdmin("Fetched beta applications", { count: data.length });
    } catch (error) {
      debugAdmin("Error fetching beta applications", error, true);
      setBetaError(
        error instanceof Error
          ? error.message
          : "Failed to load beta applications"
      );
    } finally {
      setLoadingBeta(false);
    }
  };

  // Handle beta application approval
  const handleApprovalBeta = async (
    applicationId: string,
    userId: string,
    email: string
  ) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      debugAdmin("Approving beta access", { userId, email });

      const response = await fetch(`${apiUrl}/api/beta/approve/${userId}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to approve beta access: ${response.status}`);
      }

      // Get username for the email
      const username =
        betaApplications.find((app) => app._id === applicationId)?.username ||
        email.split("@")[0];

      // Send approval email via Mailchimp
      await sendMailchimpEmail("approval", email, username);

      // Refresh data after approval
      fetchBetaApplications();
    } catch (error) {
      debugAdmin("Error approving beta access", error, true);
      throw error;
    }
  };

  // Handle beta application rejection
  const handleRejectionBeta = async (
    applicationId: string,
    userId: string,
    email: string
  ) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      debugAdmin("Rejecting beta access", { userId, email });

      const response = await fetch(`${apiUrl}/api/beta/revoke/${userId}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to reject beta access: ${response.status}`);
      }

      // Get username for the email
      const username =
        betaApplications.find((app) => app._id === applicationId)?.username ||
        email.split("@")[0];

      // Send rejection email via Mailchimp
      await sendMailchimpEmail("rejection", email, username);

      // Refresh data after rejection
      fetchBetaApplications();
    } catch (error) {
      debugAdmin("Error rejecting beta access", error, true);
      throw error;
    }
  };

  // Handle prospect type changes
  const handleTypeChange = async (email: string, type: string) => {
    try {
      const apiUrl = await getApiUrl();

      const response = await fetch(
        `${apiUrl}/api/admin/prospects/${email}/type`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ type }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update prospect type");
      }

      setProspects(
        prospects.map((p) =>
          p.email === email
            ? {
                ...p,
                type: type as
                  | "individual"
                  | "organization"
                  | "other"
                  | "bot"
                  | "spam"
                  | "developmentTest",
              }
            : p
        )
      );
    } catch (error) {
      console.error("Error:", error);
      setError(error instanceof Error ? error.message : "Failed to load data");
    }
  };

  // Handle prospect reached out status changes
  const handleReachedOutChange = async (email: string, reachedOut: boolean) => {
    try {
      const apiUrl = await getApiUrl();

      const response = await fetch(
        `${apiUrl}/api/admin/prospects/${email}/reached-out`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reachedOut }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update reached out status");
      }

      setProspects(
        prospects.map((p) => (p.email === email ? { ...p, reachedOut } : p))
      );
    } catch (error) {
      console.error("Error:", error);
      setError(error instanceof Error ? error.message : "Failed to load data");
    }
  };

  // Handle prospect comment changes
  const handleCommentChange = async (email: string, comment: string) => {
    try {
      const apiUrl = await getApiUrl();

      const response = await fetch(
        `${apiUrl}/api/admin/prospects/${email}/comment`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ comment }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update comment");
      }

      setProspects(
        prospects.map((p) => (p.email === email ? { ...p, comment } : p))
      );
    } catch (error) {
      console.error("Error:", error);
      setError(error instanceof Error ? error.message : "Failed to load data");
    }
  };

  // Load data when component mounts
  useEffect(() => {
    if (user?.role === "admin") {
      fetchData();
      fetchBetaApplications();
      const interval = setInterval(() => {
        fetchData();
        fetchBetaApplications();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Don't render anything if user is not an admin
  if (user?.role !== "admin") {
    return null;
  }

  return (
    <div className="w-full max-w-[90vw] sm:w-[80vw] md:w-[70vw] xl:w-[60vw] 2xl:w-[50vw] mx-auto">
      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-gray-800/50 p-1">
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5
              ${
                selected
                  ? "bg-purple-600 text-white shadow"
                  : "text-gray-400 hover:bg-gray-700 hover:text-white"
              }`
            }
          >
            <div className="flex items-center justify-center space-x-2">
              <UserGroupIcon className="h-5 w-5" />
              <span>Users</span>
            </div>
          </Tab>
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5
              ${
                selected
                  ? "bg-purple-600 text-white shadow"
                  : "text-gray-400 hover:bg-gray-700 hover:text-white"
              }`
            }
          >
            <div className="flex items-center justify-center space-x-2">
              <UsersIcon className="h-5 w-5" />
              <span>Prospects</span>
            </div>
          </Tab>
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5
              ${
                selected
                  ? "bg-purple-600 text-white shadow"
                  : "text-gray-400 hover:bg-gray-700 hover:text-white"
              }`
            }
          >
            <div className="flex items-center justify-center space-x-2">
              <ChartBarIcon className="h-5 w-5" />
              <span>Analytics</span>
            </div>
          </Tab>
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5
              ${
                selected
                  ? "bg-purple-600 text-white shadow"
                  : "text-gray-400 hover:bg-gray-700 hover:text-white"
              }`
            }
          >
            <div className="flex items-center justify-center space-x-2">
              <BeakerIcon className="h-5 w-5" />
              <span>Beta Program</span>
            </div>
          </Tab>
        </Tab.List>
        <Tab.Panels className="mt-4">
          <Tab.Panel>
            {/* Users Panel */}
            <div className="space-y-6">
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4">
                  User Statistics
                </h3>
                <div className="space-y-4">
                  <UserCount count={userCount} isLoading={isLoading} error={error} />
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Conversion Metrics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <p className="text-sm text-gray-400">Total Users</p>
                    <p className="text-2xl font-bold text-white">
                      {Array.isArray(regularUsers) ? regularUsers.length : 0}
                    </p>
                  </div>
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <p className="text-sm text-gray-400">Users with Email</p>
                    <p className="text-2xl font-bold text-white">
                      {Array.isArray(regularUsers)
                        ? regularUsers.filter((user) => user.email).length
                        : 0}
                    </p>
                  </div>
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <p className="text-sm text-gray-400">Email Conversion Rate</p>
                    <p className="text-2xl font-bold text-white">
                      {Array.isArray(regularUsers) && regularUsers.length > 0
                        ? `${(
                            (regularUsers.filter((user) => user.email).length /
                              regularUsers.length) *
                            100
                          ).toFixed(1)}%`
                        : "0%"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Tab.Panel>
          <Tab.Panel>
            {/* Prospects Panel */}
            <div className="space-y-6">
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Prospect Management
                </h3>
                <ProspectsTable
                  prospects={prospects}
                  selectedType={selectedType}
                  onFilterChange={setSelectedType}
                  onTypeChange={handleTypeChange}
                  onReachedOutChange={handleReachedOutChange}
                  onCommentChange={handleCommentChange}
                  setSelectedType={setSelectedType}
                  showNoEmail={showNoEmail}
                  setShowNoEmail={setShowNoEmail}
                />
              </div>
            </div>
          </Tab.Panel>
          <Tab.Panel>
            {/* Analytics Panel */}
            <AnalyticsSection />
          </Tab.Panel>
          <Tab.Panel>
            {/* Beta Program Panel */}
            <div className="space-y-6">
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Beta Program Management
                </h3>
                <p className="text-gray-400 mb-6">
                  Review and manage applications for the beta program. Approve or
                  reject applications and monitor the status of users with beta
                  access.
                </p>
                <BetaUsersTable
                  applications={betaApplications}
                  isLoading={loadingBeta}
                  error={betaError}
                  onApprove={handleApprovalBeta}
                  onReject={handleRejectionBeta}
                  refreshData={fetchBetaApplications}
                />
              </div>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
