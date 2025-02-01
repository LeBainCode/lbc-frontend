// src/app/components/AdminPanel.tsx
"use client";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { Prospect, RegularUser } from "@/app/types/admin";
import UserCount from "./admin/UserCount";
import RegularUsersTable from "./admin/RegularUsersTable";
import ProspectsTable from "./admin/ProspectsTable";

export default function AdminPanel() {
  const { user } = useAuth();
  const [userCount, setUserCount] = useState<number | null>(null);
  const [regularUsers, setRegularUsers] = useState<RegularUser[]>([]);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [showNoEmail, setShowNoEmail] = useState(true);

  const getApiUrl = async () => {
    try {
      // Try to connect to local backend first
      const healthCheck = await fetch("http://localhost:5000/api/health");
      if (healthCheck.ok) {
        return "http://localhost:5000";
      }
    } catch {
      console.log("Local backend not available, using Render backend");
    }
    return "https://lebaincode-backend.onrender.com";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = await getApiUrl();
        console.log("Current API URL:", apiUrl);

        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const [countResponse, usersResponse, prospectsResponse] =
          await Promise.all([
            fetch(`${apiUrl}/api/admin/users/count`, { headers }),
            fetch(`${apiUrl}/api/admin/users`, { headers }),
            fetch(`${apiUrl}/api/admin/prospects`, { headers }),
          ]);

        if (!countResponse.ok || !usersResponse.ok || !prospectsResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const [countData, usersData, prospectsData] = await Promise.all([
          countResponse.json(),
          usersResponse.json(),
          prospectsResponse.json(),
        ]);

        setUserCount(countData.count);
        setRegularUsers(usersData);
        setProspects(prospectsData);
      } catch (error) {
        console.error("Error:", error);
        setError("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role === "admin") {
      fetchData();
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleTypeChange = async (email: string, type: string) => {
    try {
      const apiUrl = await getApiUrl();
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${apiUrl}/api/admin/prospects/${email}/type`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
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
            ? { ...p, type: type as "individual" | "organization" | "other" }
            : p
        )
      );
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleReachedOutChange = async (email: string, reachedOut: boolean) => {
    try {
      const apiUrl = await getApiUrl();
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${apiUrl}/api/admin/prospects/${email}/reached-out`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
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
    }
  };

  const handleCommentChange = async (email: string, comment: string) => {
    try {
      const apiUrl = await getApiUrl();
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${apiUrl}/api/admin/prospects/${email}/comment`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
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
    }
  };

  if (user?.role !== "admin") {
    return null;
  }

  return (
    <div className="bg-[#1F2937] rounded-lg p-6 mt-16">
      <h2 className="text-2xl font-bold text-white mb-4">
        Admin Control Panel
      </h2>
      <UserCount count={userCount} isLoading={isLoading} error={error} />
      <RegularUsersTable
        users={regularUsers}
        showNoEmail={showNoEmail}
        onShowNoEmailChange={setShowNoEmail}
      />
      <ProspectsTable
        prospects={prospects}
        selectedType={selectedType}
        onTypeChange={handleTypeChange}
        onReachedOutChange={handleReachedOutChange}
        onCommentChange={handleCommentChange}
        onFilterChange={setSelectedType}
      />
    </div>
  );
}
