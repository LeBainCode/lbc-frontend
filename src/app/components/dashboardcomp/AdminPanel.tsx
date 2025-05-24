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
  UserPlusIcon
} from "@heroicons/react/24/outline";
import AnalyticsSection from "./AnalyticsSection";
import BetaUsersTable from "./admin/BetaUsersTable";

// Mailchimp service for email notifications
const sendMailchimpEmail = async (type: 'approval' | 'rejection', email: string, username: string) => {
  console.log(`[Mailchimp] Sending ${type} email to ${email} for user ${username}`);
  
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
    const key = `${message}:${JSON.stringify(data || '')}`;
    
    if (seenMessages.has(key) && now - lastLog < 1000) return;
    seenMessages.add(key);
    lastLog = now;
    
    if (seenMessages.size > 30) seenMessages.clear();
    
    if (isError) {
      console.error(`[AdminPanel] ${message}`, data || '');
    } else {
      console.log(`[AdminPanel] ${message}`, data || '');
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
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
  decidedAt?: string;
}

export default function AdminPanel() {
  const { user } = useAuth();
  const [userCount, setUserCount] = useState<number | null>(null);
  const [regularUsers, setRegularUsers] = useState<RegularUser[]>([]);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [betaApplications, setBetaApplications] = useState<BetaApplication[]>([]);
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

      setRegularUsers(usersData);
      setUserCount(usersData.length);
      setProspects(prospectsData);
    } catch (error) {
      console.error("Error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load data"
      );
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
        credentials: "include"
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch beta applications: ${response.status}`);
      }
      
      const data = await response.json();
      setBetaApplications(data);
      debugAdmin("Fetched beta applications", { count: data.length });
    } catch (error) {
      debugAdmin("Error fetching beta applications", error, true);
      setBetaError(error instanceof Error ? error.message : "Failed to load beta applications");
    } finally {
      setLoadingBeta(false);
    }
  };

  // Handle beta application approval
  const handleApprovalBeta = async (applicationId: string, userId: string, email: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      debugAdmin("Approving beta access", { userId, email });
      
      const response = await fetch(`${apiUrl}/api/beta/approve/${userId}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to approve beta access: ${response.status}`);
      }
      
      // Get username for the email
      const username = betaApplications.find(app => app._id === applicationId)?.username || email.split('@')[0];
      
      // Send approval email via Mailchimp
      await sendMailchimpEmail('approval', email, username);
      
      // Refresh data after approval
      fetchBetaApplications();
    } catch (error) {
      debugAdmin("Error approving beta access", error, true);
      throw error;
    }
  };
  
  // Handle beta application rejection
  const handleRejectionBeta = async (applicationId: string, userId: string, email: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      debugAdmin("Rejecting beta access", { userId, email });
      
      const response = await fetch(`${apiUrl}/api/beta/revoke/${userId}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to reject beta access: ${response.status}`);
      }
      
      // Get username for the email
      const username = betaApplications.find(app => app._id === applicationId)?.username || email.split('@')[0];
      
      // Send rejection email via Mailchimp
      await sendMailchimpEmail('rejection', email, username);
      
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
            ? { ...p, type: type as "individual" | "organization" | "other" | "bot" | "spam" | "developmentTest" }
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

  // Define tabs for the admin panel
  const tabs = [
    {
      name: "User Information",
      icon: UserGroupIcon,
      content: (
        <div className="space-y-6">
          <div className="bg-gray-800/50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              User Statistics
            </h3>
            <UserCount count={userCount} isLoading={isLoading} error={error} />
          </div>
          <AnalyticsSection />
        </div>
      ),
    },
    {
      name: "User Management",
      icon: UsersIcon,
      content: (
        <div className="space-y-6">
          <div className="bg-gray-800/50 rounded-lg p-6">
            {/* Conversion Metrics Section */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Conversion Metrics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <p className="text-sm text-gray-400">Total Users</p>
                  <p className="text-2xl font-bold text-white">
                    {regularUsers.length}
                  </p>
                </div>
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <p className="text-sm text-gray-400">Users with Email</p>
                  <p className="text-2xl font-bold text-white">
                    {regularUsers.filter((user) => user.email).length}
                  </p>
                </div>
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <p className="text-sm text-gray-400">Email Conversion Rate</p>
                  <p className="text-2xl font-bold text-white">
                    {regularUsers.length > 0
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

            {/* User Management Section */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">User List</h3>
              <div className="flex items-center space-x-2">
                <label className="flex items-center space-x-2 text-sm text-gray-400">
                  <input
                    type="checkbox"
                    checked={!showNoEmail}
                    onChange={(e) => setShowNoEmail(!e.target.checked)}
                    className="rounded border-gray-600 text-indigo-500 focus:ring-indigo-500 bg-gray-700"
                  />
                  <span>Show only users with email</span>
                </label>
              </div>
            </div>

            <div className="overflow-x-auto">
              {!showNoEmail ? (
                regularUsers.filter((user) => user.email).length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Username
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Created At
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800/50 divide-y divide-gray-700">
                      {regularUsers
                        .filter((user) => user.email)
                        .map((user) => (
                          <tr
                            key={user._id}
                            className="hover:bg-gray-700/50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {user.username}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    No regular users with an email address currently
                  </div>
                )
              ) : (
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Username
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Created At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800/50 divide-y divide-gray-700">
                    {regularUsers.map((user) => (
                      <tr
                        key={user._id}
                        className="hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {user.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {user.email || "No email"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      name: "Beta Management",
      icon: UserPlusIcon,
      content: (
        <div className="space-y-6">
          <div className="bg-gray-800/50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              Beta Program Management
            </h3>
            <p className="text-gray-400 mb-6">
              Review and manage applications for the beta program. Approve or reject applications 
              and monitor the status of users with beta access.
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
      ),
    },
    {
      name: "Prospects",
      icon: ChartBarIcon,
      content: (
        <div className="space-y-6">
          <div className="bg-gray-800/50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              Prospect Management
            </h3>
            <ProspectsTable
              prospects={prospects}
              selectedType={selectedType}
              onTypeChange={handleTypeChange}
              onReachedOutChange={handleReachedOutChange}
              onCommentChange={handleCommentChange}
              onFilterChange={setSelectedType}
            />
          </div>
        </div>
      ),
    },
    {
      name: "Socials",
      icon: LinkIcon,
      content: (
        <div className="space-y-6">
          <div className="bg-gray-800/50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              Social Media
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* LinkedIn Link */}
              <a
                href="https://www.linkedin.com/company/le-bain-code"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-4 bg-gray-700/50 p-6 rounded-lg hover:bg-gray-600/50 
                  transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <svg
                    className="w-6 h-6 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h4 className="text-lg font-semibold text-white">LinkedIn</h4>
                  <p className="text-sm text-gray-400">View our company page</p>
                </div>
              </a>

              {/* Discord Link */}
              <a
                href="https://discord.gg/XXhJKjNt"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-4 bg-gray-700/50 p-6 rounded-lg hover:bg-gray-600/50 
                  transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="p-3 bg-indigo-500/10 rounded-lg">
                  <svg
                    className="w-6 h-6 text-indigo-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.118.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h4 className="text-lg font-semibold text-white">Discord</h4>
                  <p className="text-sm text-gray-400">Join our community</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-9xl mx-auto">
        <div className="bg-[#1F2937] rounded-lg shadow-xl p-6 mt-16 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-2xl font-bold text-white">
              Admin Control Panel
            </h2>
          </div>

          <Tab.Group>
            <Tab.List className="flex p-2 space-x-2 bg-gray-800/50 overflow-x-auto">
              {tabs.map((tab) => (
                <Tab
                  key={tab.name}
                  className={({ selected }) => `
                    flex items-center space-x-2 px-4 py-2.5 rounded-lg whitespace-nowrap
                    transition-all duration-200 ease-out
                    ${
                      selected
                        ? "bg-indigo-500 text-white shadow-lg"
                        : "text-gray-400 hover:text-[#252525] hover:bg-[#e5e5e5]"
                    }
                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800
                  `}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </Tab>
              ))}
            </Tab.List>

            <Tab.Panels className="p-6">
              {tabs.map((tab, idx) => (
                <Tab.Panel
                  key={idx}
                  className={`
                    rounded-xl p-6
                    ring-white/5 ring-1
                    focus:outline-none focus:ring-2 focus:ring-indigo-500
                  `}
                >
                  {tab.content}
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </div>
  );
}
