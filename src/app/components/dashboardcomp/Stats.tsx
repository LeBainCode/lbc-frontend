// src/app/components/dashboardcomp/Stats.tsx
import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";

// Optimized debug utility to prevent console spam
const debugStats = (() => {
  const seenMessages = new Set<string>();
  let lastLog = 0;
  const MIN_LOG_INTERVAL = 1000; // ms between similar logs
  
  return (message: string, data?: unknown, isError = false) => {
    if (process.env.NODE_ENV !== "development") return;
    
    const now = Date.now();
    const dataStr = data ? 
      (typeof data === "object" ? JSON.stringify(data) : String(data)) 
      : "";
    const key = `${message}:${dataStr}`;
    
    // Skip duplicate messages that happen too quickly
    if (seenMessages.has(key) && now - lastLog < MIN_LOG_INTERVAL) return;
    
    seenMessages.add(key);
    lastLog = now;
    
    // Prevent memory leaks
    if (seenMessages.size > 30) {
      seenMessages.clear();
    }
    
    if (isError) {
      console.error(`[Stats] ${message}`, data || "");
    } else {
      console.log(`[Stats] ${message}`, data || "");
    }
  };
})();

// API response interfaces
interface DashboardResponse {
  user: {
    username: string;
    email: string;
    role: string;
    hasBetaAccess: boolean;
    hasPaidAccess: boolean;
  };
  stats: {
    totalHoursSpent: number;
    exercisesCompleted: number;
    totalExercises: number;
    completionPercentage: number;
    notionsMastered: number;
    daysCompleted: number;
    totalDays: number;
  };
  modules: Array<{
    id: string;
    name: string;
    slug: string;
    description: string;
    accessStatus: string;
    progress: {
      started: boolean;
      completed: boolean;
      percentage: number;
    };
    testScore: number;
    testPassed: boolean;
  }>;
}

// Component props interface
interface StatsProps {
  userStats: {
    hoursCoding: number;
    exercises: string;
    notionsMastered: number;
    daysLeft: number;
  };
}

export default function Stats({ userStats }: StatsProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState(userStats);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiCallInProgress = useRef(false);

  // Fetch dashboard data from real API endpoint
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || apiCallInProgress.current) {
        return;
      }
      
      apiCallInProgress.current = true;
      setIsLoading(true);
      debugStats("Fetching dashboard data for user", { username: user.username });
      
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiUrl}/api/dashboard`, {
          method: "GET",
          credentials: "include",
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch dashboard data: ${response.status}`);
        }
        
        const data: DashboardResponse = await response.json();
        debugStats("Dashboard data received", { 
          role: data.user.role,
          totalHours: data.stats.totalHoursSpent,
          exercises: `${data.stats.exercisesCompleted}/${data.stats.totalExercises}`,
          notions: data.stats.notionsMastered
        });
        
        // Map API data to component stats format
        setStats({
          hoursCoding: data.stats.totalHoursSpent,
          exercises: `${data.stats.exercisesCompleted}/${data.stats.totalExercises}`,
          notionsMastered: data.stats.notionsMastered,
          daysLeft: data.stats.totalDays - data.stats.daysCompleted,
        });
        
        setError(null);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        debugStats("Error fetching dashboard data", errorMessage, true);
        setError(errorMessage);
        
        // Fallback to props if API fails
        setStats(userStats);
      } finally {
        setIsLoading(false);
        apiCallInProgress.current = false;
      }
    };

    fetchDashboardData();
  }, [user, userStats]);

  return (
    <div className="w-full max-w-[90vw] sm:w-[80vw] md:w-[70vw] xl:w-[60vw] 2xl:w-[50vw] mx-auto border-2 border-[#BF9ACA] rounded-lg sm:p-8">
      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#BF9ACA]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 place-items-center text-center">
          <div className="flex flex-col items-center justify-center">
            <p className="text-3xl sm:text-4xl font-medium text-white mb-1 sm:mb-2">
              {stats.hoursCoding}
            </p>
            <p className="text-gray-400 text-sm sm:text-base">Hours Coding</p>
          </div>

          <div className="flex flex-col items-center justify-center">
            <p className="text-3xl sm:text-4xl font-medium text-white mb-1 sm:mb-2">
              {stats.exercises}
            </p>
            <p className="text-gray-400 text-sm sm:text-base">Exercises</p>
          </div>

          <div className="flex flex-col items-center justify-center">
            <p className="text-3xl sm:text-4xl font-medium text-white mb-1 sm:mb-2">
              {stats.notionsMastered}
            </p>
            <p className="text-gray-400 text-sm sm:text-base">Notions mastered</p>
          </div>

          <div className="flex flex-col items-center justify-center">
            <p className="text-3xl sm:text-4xl font-medium text-white mb-1 sm:mb-2">
              {stats.daysLeft}
            </p>
            <p className="text-gray-400 text-sm sm:text-base">Days left</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mt-2 text-center text-sm text-red-400 px-4 py-1 bg-red-900/20 rounded">
          {error}
        </div>
      )}
    </div>
  );
}

