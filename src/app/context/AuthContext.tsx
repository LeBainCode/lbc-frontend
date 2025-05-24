"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";

// Define strict types for our context and user
interface User {
  id: string;
  email?: string;
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  fetchUserData: () => Promise<User | null>;
  isLoading: boolean;
  error: string | null;
  logout: () => void;
  isAuthenticated: boolean;
}

interface LogEntry {
  timestamp: string;
  message: string;
  data?: unknown;
}

interface ResponseData {
  status: number;
  [key: string]: unknown;
}

const isResponseData = (data: unknown): data is ResponseData => {
  return (
    typeof data === "object" &&
    data !== null &&
    "status" in data &&
    typeof (data as ResponseData).status === "number"
  );
};

// Optimized debug function with deduplication and rate limiting
const debug = (() => {
  const seenMessages = new Set<string>();
  let lastLog = 0;
  const MIN_LOG_INTERVAL = 1000; // minimum ms between similar logs
  
  return (message: string, data?: unknown) => {
    // Skip in production
    if (process.env.NODE_ENV !== "development") return;
    
    const now = Date.now();
    const dataString = data ? 
      (typeof data === "object" ? JSON.stringify(data) : String(data)) 
      : "";
    const key = `${message}:${dataString}`;
    
    // Determine if this is an important message
    const isImportant = 
      message.includes("authenticated") || 
      message.includes("error") ||
      message.includes("initialized") ||
      message.includes("logout") ||
      message.includes("token");
    
    // Skip duplicate messages that happen too frequently
    if (seenMessages.has(key) && now - lastLog < MIN_LOG_INTERVAL) return;
    
    // Skip non-important messages that we've seen before
    if (!isImportant && seenMessages.has(key)) return;
    
    // Update tracking
    seenMessages.add(key);
    lastLog = now;
    
    // Prevent memory leaks by clearing set periodically
    if (seenMessages.size > 30) {
      seenMessages.clear();
    }
    
    // Format console output
    if (isResponseData(data) && data.status === 401) {
      console.log(`[AuthContext] ${message} (Expected - User not authenticated)`);
    } else {
      console.log(`[AuthContext] ${message}`, data || "");
    }
    
    // Only store important logs in localStorage
    if (isImportant && typeof window !== "undefined") {
      try {
        const logs = JSON.parse(
          localStorage.getItem("authContextLogs") || "[]"
        ) as LogEntry[];
        
        const timestamp = new Date().toISOString();
        // Safely clone data for storage
        const safeData = typeof data === "object" && data !== null
          ? JSON.parse(JSON.stringify(data))
          : data;
          
        logs.push({ timestamp, message, data: safeData });
        
        // Keep logs manageable
        if (logs.length > 20) logs.shift();
        localStorage.setItem("authContextLogs", JSON.stringify(logs));
      } catch (err) {
        // Silent fail for localStorage errors
      }
    }
  };
})();

export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  fetchUserData: async () => {
    throw new Error("fetchUserData not implemented");
  },
  isLoading: true,
  error: null,
  logout: () => {},
  isAuthenticated: false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Track if API request is in progress to prevent duplicates
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  const logout = useCallback(() => {
    debug("Logging out user");
    localStorage.removeItem("token");
    setUser(null);
    setError(null);
  }, []);

  const fetchUserData = async (): Promise<User | null> => {
    // Prevent multiple simultaneous auth checks
    if (isCheckingAuth) {
      debug("Auth check already in progress, skipping duplicate request");
      return user;
    }
    
    setIsCheckingAuth(true);
    
    try {
      debug("Checking authentication status");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/check`,
        {
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (response.status === 401) {
        debug("User not authenticated", { status: 401 });
        setUser(null);
        setIsLoading(false);
        setIsCheckingAuth(false);
        return null;
      }

      if (!response.ok) {
        debug("API error response", { status: response.status });
        setError(`API error: ${response.status}`);
        setIsLoading(false);
        setIsCheckingAuth(false);
        return null;
      }

      const data = await response.json();
      debug("Authentication check complete", {
        authenticated: data.authenticated,
      });

      if (data.authenticated && data.user) {
        const baseUser: User = data.user;

        if (!baseUser.email) {
          try {
            const emailRes = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/email/users/public`,
              {
                credentials: "include",
                headers: {
                  Accept: "application/json",
                },
              }
            );

            if (emailRes.ok) {
              const allUsers: { id: string; email: string }[] =
                await emailRes.json();
              const matchedUser = allUsers.find((u) => u.id === baseUser.id);
              if (matchedUser && matchedUser.email) {
                baseUser.email = matchedUser.email;
              }
            } else {
              debug("Failed to fetch emails from /api/email/users/public", {
                status: emailRes.status,
              });
            }
          } catch (emailError: unknown) {
            const errMsg =
              emailError instanceof Error
                ? emailError.message
                : String(emailError);
            debug("Error fetching emails", errMsg);
          }
        }

        debug("User authenticated", baseUser);
        setUser(baseUser);
        setIsLoading(false);
        setIsCheckingAuth(false);
        return baseUser;
      } else {
        debug("No authenticated user");
        setUser(null);
        setIsLoading(false);
        setIsCheckingAuth(false);
        return null;
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      debug("Error checking authentication", { error: errorMessage });
      setError("Failed to check authentication status");
      setIsLoading(false);
      setIsCheckingAuth(false);
      return null;
    }
  };

  // Initial authentication check
  useEffect(() => {
    // Log once at startup, not on every render
    if (isLoading) {
      debug("Initializing auth state", {
        apiUrl: process.env.NEXT_PUBLIC_API_URL,
        environment: process.env.NODE_ENV,
        isInitialLoad: true,
      });
      fetchUserData();
    }
  }, []);

  // Only log important state changes, not every render
  useEffect(() => {
    const isAuthenticated = !!user;
    const hasError = !!error;
    
    // Only log when something significant changes
    if (!isLoading) {
      debug("Auth state updated", {
        isAuthenticated,
        hasError,
        userId: user?.id || null,
      });
    }
    
    return () => {
      // Only log cleanup once, not on every render
      if (typeof window !== 'undefined' && window.onbeforeunload) {
        debug("Cleaning up auth state");
      }
    };
  }, [user, isLoading, error]);

  const value: AuthContextType = {
    user,
    setUser,
    fetchUserData,
    isLoading,
    error,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
