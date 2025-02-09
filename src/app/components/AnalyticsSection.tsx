// src/app/components/AnalyticsSection.tsx
'use client';
import { useState, useEffect } from 'react';

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

export default function AnalyticsSection() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isProduction = process.env.NODE_ENV === 'production';

  // Fetch analytics data from backend
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiUrl}/api/admin/analytics/frontend-data`, {
          credentials: "include", // Maintain HTTP cookies
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }

        const data = await response.json();
        setAnalyticsData(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 60000);
    return () => clearInterval(interval);
  }, []);

  // Track page views only in production
  useEffect(() => {
    const trackPageView = () => {
      if (isProduction) {
        const pageView: PageView = {
          path: window.location.pathname,
          timestamp: new Date().toISOString(),
          domain: window.location.hostname
        };

        const storedViews = JSON.parse(localStorage.getItem('pageViews') || '[]');
        localStorage.setItem('pageViews', JSON.stringify([...storedViews, pageView]));
      }
    };

    trackPageView();
  }, [isProduction]);

  if (isLoading) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Website Analytics</h3>
        <div className="text-gray-400">Loading analytics data...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-white mb-4">Website Analytics</h3>
      
      {!isProduction && (
        <div className="bg-yellow-800/50 text-yellow-200 px-4 py-2 rounded-md mb-4 text-sm">
          ⚠️ Development Mode: Viewing production analytics data. Page views are not being tracked in development.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Analytics Cards */}
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
              : '0s'}
          </p>
        </div>

        <div className="bg-gray-700/50 p-4 rounded-lg">
          <h4 className="text-sm text-gray-400">Bounce Rate</h4>
          <p className="text-2xl font-bold text-white">
            {analyticsData?.bounceRate
              ? `${(analyticsData.bounceRate * 100).toFixed(1)}%`
              : '0%'}
          </p>
        </div>

        {/* Most Visited Pages */}
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