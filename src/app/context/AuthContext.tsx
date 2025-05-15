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

// Type guard for response data
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

const debug = (message: string, data?: unknown) => {
  const timestamp = new Date().toISOString();
  const safeData =
    typeof data === "object" && data !== null
      ? JSON.parse(JSON.stringify(data))
      : data;

  if (isResponseData(data) && data.status === 401) {
    console.log(`[AuthContext] ${message} (Expected - User not authenticated)`);
  } else {
    console.log(`[AuthContext] ${message}`, safeData || "");
  }

  if (typeof window !== "undefined") {
    try {
      const logs = JSON.parse(
        localStorage.getItem("authContextLogs") || "[]"
      ) as LogEntry[];
      logs.push({ timestamp, message, data: safeData });
      if (logs.length > 50) logs.shift();
      localStorage.setItem("authContextLogs", JSON.stringify(logs));
    } catch (err) {
      console.warn("[AuthContext] LocalStorage error:", err);
    }
  }
};

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

  const logout = useCallback(() => {
    debug("Logging out user");
    localStorage.removeItem("token");
    setUser(null);
    setError(null);
  }, []);

  const fetchUserData = async () => {
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
        return null;
      }

      if (!response.ok) {
        debug("API error response", { status: response.status });
        setError(`API error: ${response.status}`);
        setIsLoading(false);
        return null;
      }

      const data = await response.json();
      debug("Authentication check complete", {
        authenticated: data.authenticated,
      });

      if (data.authenticated && data.user) {
        debug("User authenticated", { userId: data.user.id });
        setUser(data.user);
      } else {
        debug("No authenticated user");
        setUser(null);
      }

      setIsLoading(false);
      return data.user || null;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      debug("Error checking authentication", { error: errorMessage });
      setError("Failed to check authentication status");
      setIsLoading(false);
      return null;
    }
  };

  useEffect(() => {
    debug("Initializing auth state", {
      apiUrl: process.env.NEXT_PUBLIC_API_URL,
      environment: process.env.NODE_ENV,
      isInitialLoad: true,
    });
    fetchUserData();
  }, []);

  useEffect(() => {
    debug("Auth state updated", {
      isAuthenticated: !!user,
      isLoading,
      hasError: !!error,
    });

    return () => {
      debug("Cleaning up auth state");
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
