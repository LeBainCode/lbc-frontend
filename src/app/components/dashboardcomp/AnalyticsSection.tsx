// src/app/components/AnalyticsSection.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";

// Analytics data interface definitions
interface PageView {
  path: string;
  timestamp: string;
  domain: string;
}

interface AnalyticsData {
  totalVisits: number;
  uniqueVisitors: number;
  averageSessionDuration: number;
  bounceRate: number;
  pageViews: {
    [key: string]: number;
  };
}

// Efficient debug utility with deduplication and rate limiting
const debugAnalytics = (() => {
  // State maintained between calls
  const seenMessages = new Set<string>();
  let lastLog = 0;
  const MIN_LOG_INTERVAL = 1000; // ms between similar logs
  
  // Return the actual debug function
  return (message: string, data?: unknown, isError = false) => {
    // Skip logging in production
    if (process.env.NODE_ENV !== "development") return;
    
    const now = Date.now();
    const dataStr = data ? 
      (typeof data === "object" ? JSON.stringify(data) : String(data)) 
      : "";
    const key = `${message}:${dataStr}`;
    
    // Determine if this is an important message
    const isImportant = 
      isError || 
      message.includes("error") || 
      message.includes("failed");
    
    // Skip duplicate messages that happen too frequently
    if (seenMessages.has(key) && now - lastLog < MIN_LOG_INTERVAL) return;
    
    // Skip non-important messages we've seen before
    if (!isImportant && seenMessages.has(key)) return;
    
    // Update tracking
    seenMessages.add(key);
    lastLog = now;
    
    // Prevent memory leaks by clearing set periodically
    if (seenMessages.size > 30) {
      seenMessages.clear();
    }
    
    // Format log message
    const prefix = `[Analytics]`;
    if (isError) {
      console.error(`${prefix} ${message}`, data || "");
    } else {
      console.log(`${prefix} ${message}`, data || "");
    }
  };
})();

export default function AnalyticsSection() {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isProduction = process.env.NODE_ENV === "production";
  const fetchInProgress = useRef(false);

  useEffect(() => {
    // Log API URL once on component mount
    debugAnalytics("Component initialized with API URL", process.env.NEXT_PUBLIC_API_URL);
    
    const fetchAnalytics = async () => {
      // Prevent multiple simultaneous fetches
      if (fetchInProgress.current) return;
      fetchInProgress.current = true;
      
      if (!user) {
        setError("Authentication required");
        setIsLoading(false);
        fetchInProgress.current = false;
        return;
      }

      try {
        debugAnalytics("Fetching analytics data");
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        const response = await fetch(`${apiUrl}/api/admin/analytics/frontend-data`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch analytics data");
        }

        const data = await response.json();
        debugAnalytics("Analytics data received", {
          totalVisits: data.totalVisits,
          uniqueVisitors: data.uniqueVisitors
        });
        
        setAnalyticsData(data);
        setError(null);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        debugAnalytics("Error fetching analytics", errorMessage, true);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
        fetchInProgress.current = false;
      }
    };

    // Initial fetch
    fetchAnalytics();
    
    // Setup interval for updates
    const interval = setInterval(fetchAnalytics, 60000);
    return () => {
      clearInterval(interval);
      debugAnalytics("Component cleanup, interval cleared");
    };
  }, [user]);

  // Track page views in production only
  useEffect(() => {
    if (!isProduction) return;
    
    try {
      const pageView: PageView = {
        path: window.location.pathname,
        timestamp: new Date().toISOString(),
        domain: window.location.hostname,
      };

      // Get existing page views
      const storedViews = JSON.parse(localStorage.getItem("pageViews") || "[]");
      
      // Limit stored views to prevent memory issues (keep only last 100)
      const updatedViews = [...storedViews, pageView];
      if (updatedViews.length > 100) {
        updatedViews.splice(0, updatedViews.length - 100);
      }
      
      localStorage.setItem("pageViews", JSON.stringify(updatedViews));
      debugAnalytics("Page view tracked", { path: pageView.path });
    } catch (error) {
      debugAnalytics("Error tracking page view", error, true);
      // Silent fail - don't interrupt user experience for analytics
    }
  }, [isProduction]);

  if (!user) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">
          Website Analytics
        </h3>
        <div className="text-red-400">Please log in to view analytics</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">
          Website Analytics
        </h3>
        <div className="text-gray-400">Loading analytics data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">
          Website Analytics
        </h3>
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-white mb-4">
        Website Analytics
      </h3>

      {!isProduction && (
        <div className="bg-yellow-800/50 text-yellow-200 px-4 py-2 rounded-md mb-4 text-sm">
          ⚠️ Development Mode: Viewing production analytics data. Page views are
          not being tracked in development.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-700/50 p-4 rounded-lg">
          <h4 className="text-sm text-gray-400">Total Visits</h4>
          <p className="text-2xl font-bold text-white">
            {analyticsData?.totalVisits || 0}
          </p>
        </div>

        <div className="bg-gray-700/50 p-4 rounded-lg">
          <h4 className="text-sm text-gray-400">Unique Visitors</h4>
          <p className="text-2xl font-bold text-white">
            {analyticsData?.uniqueVisitors || 0}
          </p>
        </div>

        <div className="bg-gray-700/50 p-4 rounded-lg">
          <h4 className="text-sm text-gray-400">Avg. Session Duration</h4>
          <p className="text-2xl font-bold text-white">
            {analyticsData?.averageSessionDuration
              ? `${Math.round(analyticsData.averageSessionDuration / 1000)}s`
              : "0s"}
          </p>
        </div>

        <div className="bg-gray-700/50 p-4 rounded-lg">
          <h4 className="text-sm text-gray-400">Bounce Rate</h4>
          <p className="text-2xl font-bold text-white">
            {analyticsData?.bounceRate
              ? `${(analyticsData.bounceRate * 100).toFixed(1)}%`
              : "0%"}
          </p>
        </div>

        <div className="bg-gray-700/50 p-4 rounded-lg col-span-full">
          <h4 className="text-sm text-gray-400 mb-2">Most Visited Pages</h4>
          <div className="space-y-2">
            {Object.entries(analyticsData?.pageViews || {})
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([path, count]) => (
                <div key={path} className="flex justify-between text-sm">
                  <span className="text-gray-300">{path}</span>
                  <span className="text-gray-400">{count} views</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
