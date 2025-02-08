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
  const VERCEL_DOMAIN = ' https://lebaincodefront-d2j7aye5k-jayzhehs-projects.vercel.app/';

  useEffect(() => {
    const trackPageView = () => {
      if (window.location.hostname !== 'localhost') {
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
  }, []);

  useEffect(() => {
    const processAnalytics = () => {
      try {
        const allPageViews: PageView[] = JSON.parse(localStorage.getItem('pageViews') || '[]');
        
        // Filter for Vercel domain only
        const vercelPageViews = allPageViews.filter(view => 
          view.domain.includes(VERCEL_DOMAIN)
        );

        // Calculate unique visitors (by timestamp hour)
        const uniqueVisits = new Set(
          vercelPageViews.map(view => 
            new Date(view.timestamp).toISOString().split(':')[0]
          )
        ).size;

        // Calculate page views by path
        const pageViewsByPath = vercelPageViews.reduce<{[key: string]: number}>((acc, view) => {
          acc[view.path] = (acc[view.path] || 0) + 1;
          return acc;
        }, {});

        // Calculate bounce rate (single page visits)
        const sessions = vercelPageViews.reduce<{[key: string]: string[]}>((acc, view) => {
          const hour = new Date(view.timestamp).toISOString().split(':')[0];
          acc[hour] = acc[hour] || [];
          if (!acc[hour].includes(view.path)) {
            acc[hour].push(view.path);
          }
          return acc;
        }, {});

        const bounceRate = Object.values(sessions).filter(paths => paths.length === 1).length / 
                          Object.keys(sessions).length;

        // Calculate average session duration
        const sessionDurations = Object.values(sessions).map(paths => {
          const pathViews = vercelPageViews.filter(view => 
            paths.includes(view.path)
          );
          if (pathViews.length < 2) return 0;
          return new Date(pathViews[pathViews.length - 1].timestamp).getTime() - 
                 new Date(pathViews[0].timestamp).getTime();
        });

        const averageSessionDuration = sessionDurations.reduce((a, b) => a + b, 0) / 
                                     sessionDurations.length;

        setAnalyticsData({
          totalVisits: vercelPageViews.length,
          uniqueVisitors: uniqueVisits,
          averageSessionDuration,
          bounceRate,
          pageViews: pageViewsByPath
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Error processing analytics:', error);
        setIsLoading(false);
      }
    };

    processAnalytics();
    const interval = setInterval(processAnalytics, 60000);
    return () => clearInterval(interval);
  }, []);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Visits */}
        <div className="bg-gray-700/50 p-4 rounded-lg">
          <h4 className="text-sm text-gray-400">Total Visits</h4>
          <p className="text-2xl font-bold text-white">
            {analyticsData?.totalVisits || 0}
          </p>
        </div>

        {/* Unique Visitors */}
        <div className="bg-gray-700/50 p-4 rounded-lg">
          <h4 className="text-sm text-gray-400">Unique Visitors</h4>
          <p className="text-2xl font-bold text-white">
            {analyticsData?.uniqueVisitors || 0}
          </p>
        </div>

        {/* Average Session Duration */}
        <div className="bg-gray-700/50 p-4 rounded-lg">
          <h4 className="text-sm text-gray-400">Avg. Session Duration</h4>
          <p className="text-2xl font-bold text-white">
            {analyticsData?.averageSessionDuration
              ? `${Math.round(analyticsData.averageSessionDuration / 1000)}s`
              : '0s'}
          </p>
        </div>

        {/* Bounce Rate */}
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