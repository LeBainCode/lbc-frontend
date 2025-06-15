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
import { useRouter } from "next/navigation";
import { classNames } from "@/lib/utils";

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
  const router = useRouter();
  const [admins, setAdmins] = useState<any[]>([]);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdminData, setNewAdminData] = useState({
    username: "",
    email: "",
    role: "admin"
  });

  const getApiUrl = () => {
    return process.env.NEXT_PUBLIC_API_URL;
  };

  // Function to fetch all required data
  const fetchData = async (retryCount = 0) => {
    try {
      if (apiCallInProgress.current) return;
      apiCallInProgress.current = true;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      // Fetch user count
      const userCountResponse = await fetch(`${apiUrl}/api/admin/users/count`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        signal: controller.signal
      });

      // Fetch users
      const usersResponse = await fetch(`${apiUrl}/api/admin/users`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        signal: controller.signal
      });

      // Fetch prospects
      const prospectsResponse = await fetch(`${apiUrl}/api/admin/prospects`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        signal: controller.signal
      });

      // Fetch admins
      const adminsResponse = await fetch(`${apiUrl}/api/admin/admins`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (userCountResponse.status === 401 || usersResponse.status === 401 || 
          prospectsResponse.status === 401 || adminsResponse.status === 401) {
        debugAdmin("Authentication required", null, true);
        router.push("/login");
        return;
      }

      if (!userCountResponse.ok || !usersResponse.ok || !prospectsResponse.ok || !adminsResponse.ok) {
        throw new Error(`Failed to fetch data: ${userCountResponse.status} ${usersResponse.status} ${prospectsResponse.status} ${adminsResponse.status}`);
      }

      const userCountData = await userCountResponse.json();
      const usersData = await usersResponse.json();
      const prospectsData = await prospectsResponse.json();
      const adminsData = await adminsResponse.json();

      // Ensure data is in the correct format
      const safeUsersData = Array.isArray(usersData) ? usersData : [];
      const safeProspectsData = Array.isArray(prospectsData) ? prospectsData : [];
      const safeAdminsData = Array.isArray(adminsData) ? adminsData : [];

      setRegularUsers(safeUsersData);
      setUserCount(userCountData.count || safeUsersData.length);
      setProspects(safeProspectsData);
      setError(null);
    } catch (error) {
      console.error("Error:", error);
      if (error instanceof Error && error.name === "AbortError") {
        debugAdmin("Request timeout", null, true);
      }
      
      // Retry logic
      if (retryCount < 3) {
        debugAdmin(`Retrying fetch (attempt ${retryCount + 1})`, null, true);
        setTimeout(() => fetchData(retryCount + 1), 1000 * (retryCount + 1));
        return;
      }

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

  // Function to handle admin user management
  const handleAdminAction = async (action: 'create' | 'update' | 'delete', adminId?: string, data?: any) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      let endpoint = `${apiUrl}/api/admin/admins`;
      let method = 'POST';

      if (action === 'update' && adminId) {
        endpoint = `${apiUrl}/api/admin/admins/${adminId}`;
        method = 'PUT';
      } else if (action === 'delete' && adminId) {
        endpoint = `${apiUrl}/api/admin/admins/${adminId}`;
        method = 'DELETE';
      }

      const response = await fetch(endpoint, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: data ? JSON.stringify(data) : undefined
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} admin: ${response.status}`);
      }

      // Refresh data after successful action
      fetchData();
    } catch (error) {
      console.error(`Error ${action}ing admin:`, error);
      setError(error instanceof Error ? error.message : `Failed to ${action} admin`);
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
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
          <Tab
            className={({ selected }) =>
              classNames(
                "w-full rounded-lg py-2.5 text-sm font-medium leading-5",
                "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
                selected
                  ? "bg-white text-blue-700 shadow"
                  : "text-blue-100 hover:bg-white/[0.12] hover:text-white"
              )
            }
          >
            Users
          </Tab>
          <Tab
            className={({ selected }) =>
              classNames(
                "w-full rounded-lg py-2.5 text-sm font-medium leading-5",
                "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
                selected
                  ? "bg-white text-blue-700 shadow"
                  : "text-blue-100 hover:bg-white/[0.12] hover:text-white"
              )
            }
          >
            Prospects
          </Tab>
          <Tab
            className={({ selected }) =>
              classNames(
                "w-full rounded-lg py-2.5 text-sm font-medium leading-5",
                "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
                selected
                  ? "bg-white text-blue-700 shadow"
                  : "text-blue-100 hover:bg-white/[0.12] hover:text-white"
              )
            }
          >
            Beta Program
          </Tab>
          <Tab
            className={({ selected }) =>
              classNames(
                "w-full rounded-lg py-2.5 text-sm font-medium leading-5",
                "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
                selected
                  ? "bg-white text-blue-700 shadow"
                  : "text-blue-100 hover:bg-white/[0.12] hover:text-white"
              )
            }
          >
            Admins
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
                <div className="flex flex-col space-y-4">
                  <BetaUsersTable
                    applications={betaApplications}
                    isLoading={loadingBeta}
                    error={betaError}
                    onApprove={handleApprovalBeta}
                    onReject={handleRejectionBeta}
                    refreshData={fetchBetaApplications}
                  />
                  <button
                    onClick={() => router.push("/admin/beta")}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    <BeakerIcon className="h-5 w-5 mr-2" />
                    Go to Beta Administration
                  </button>
                </div>
              </div>
            </div>
          </Tab.Panel>
          <Tab.Panel>
            {/* Admins Panel */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Admin Users</h2>
                <button
                  onClick={() => setShowAddAdminModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Admin
                </button>
              </div>
              
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {admins.map((admin) => (
                      <tr key={admin.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{admin.username}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{admin.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{admin.role}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleAdminAction('delete', admin.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      {/* Add Admin Modal */}
      {showAddAdminModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Admin</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  value={newAdminData.username}
                  onChange={(e) => setNewAdminData({ ...newAdminData, username: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={newAdminData.email}
                  onChange={(e) => setNewAdminData({ ...newAdminData, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddAdminModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleAdminAction('create', undefined, newAdminData);
                    setShowAddAdminModal(false);
                    setNewAdminData({ username: "", email: "", role: "admin" });
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
