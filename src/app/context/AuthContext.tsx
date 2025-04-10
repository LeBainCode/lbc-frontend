// src/app/context/AuthContext.tsx
"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { AuthContextType, User } from "../types/auth";

const debug = (message: string, data?: unknown) => {
  const timestamp = new Date().toISOString();
  if (data?.status === 401) {
    console.log(`[AuthContext] ${message} (Expected - User not authenticated)`);
  } else {
    console.log(`[AuthContext] ${message}`, data || "");
  }

  if (typeof window !== "undefined") {
    try {
      const logs = JSON.parse(localStorage.getItem("authContextLogs") || "[]");
      logs.push({ timestamp, message, data });
      // Keep only the last 50 logs
      if (logs.length > 50) logs.shift();
      localStorage.setItem("authContextLogs", JSON.stringify(logs));
    } catch (error) {
      console.warn("[AuthContext] LocalStorage error:", error);
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

      // Handle 401 as normal non-authenticated state
      if (response.status === 401) {
        debug("User not authenticated", { status: 401 });
        setUser(null);
        setIsLoading(false);
        return null;
      }

      // Handle other non-200 responses as actual errors
      if (!response.ok) {
        debug("API error response", { status: response.status });
        setError(`API error: ${response.status}`);
        setIsLoading(false);
        return null;
      }

      const { authenticated, user } = await response.json();
      debug("Authentication check complete", { authenticated });

      if (authenticated && user) {
        debug("User authenticated", { userId: user.id });
        setUser(user);
      } else {
        debug("No authenticated user");
        setUser(null);
      }

      setIsLoading(false);
      return user;
    } catch (error) {
      debug("Error checking authentication", error);
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
