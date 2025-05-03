"use client";
import { useState, useEffect, useCallback } from "react";

interface LogEntry {
  timestamp: string;
  message: string;
  data?: unknown;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debug logger function
  const debug = useCallback((message: string, data?: unknown) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [AuthModal] ${message}`;

    if (typeof window !== "undefined") {
      if (data) {
        console.group(logMessage);
        console.log("Data:", data);
        console.groupEnd();
      } else {
        console.log(logMessage);
      }

      try {
        const logs = JSON.parse(
          window.localStorage.getItem("authModalLogs") || "[]"
        ) as LogEntry[];
        logs.push({ timestamp, message, data });
        window.localStorage.setItem("authModalLogs", JSON.stringify(logs));
      } catch (error) {
        console.warn("[AuthModal] LocalStorage not available:", error);
      }
    }
  }, []);

  // Initialize debugging on mount
  useEffect(() => {
    debug("Component mounted", {
      isOpen,
      environment: process.env.NODE_ENV,
      apiUrl: process.env.NEXT_PUBLIC_API_URL,
    });

    const previousLogs = JSON.parse(
      localStorage.getItem("authModalLogs") || "[]"
    ) as LogEntry[];
    if (previousLogs.length > 0) {
      console.group("[AuthModal] Previous session logs");
      previousLogs.forEach((log: LogEntry) => {
        console.log(`[${log.timestamp}]`, log.message, log.data || "");
      });
      console.groupEnd();
    }

    return () => {
      debug("Component unmounting");
    };
  }, [debug, isOpen]);

  const handleGitHubAuth = () => {
    debug("GitHub authentication initiated");
    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;

      debug("Auth configuration", {
        apiUrl,
        clientId: clientId ? "configured" : "missing",
        environment: process.env.NODE_ENV,
      });

      if (!apiUrl || !clientId) {
        throw new Error("Missing required configuration");
      }

      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(
            "githubAuthAttempt",
            JSON.stringify({
              timestamp: new Date().toISOString(),
              apiUrl,
              environment: process.env.NODE_ENV,
            })
          );
        } catch (error) {
          console.warn("Failed to store auth attempt:", error);
        }
      }

      const authUrl = `${apiUrl}/api/auth/github`;
      debug("Redirecting to auth endpoint", { authUrl });
      window.location.href = authUrl; // <-- Redirection standard vers ton backend
    } catch (error) {
      debug("Authentication error", error);
      setIsLoading(false);
      setError("Failed to initiate GitHub authentication");
    }
  };

  // Monitor state changes
  useEffect(() => {
    debug("State updated", { isLoading, error, isOpen });
  }, [debug, isLoading, error, isOpen]);

  // Check API health when modal is open
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiUrl}/api/auth/health`);
        const data = await response.json();
        debug("API health check", { status: response.status, data });
      } catch (error) {
        debug("API health check failed", error);
      }
    };

    if (isOpen) {
      checkApiHealth();
    }
  }, [debug, isOpen]);

  const handleClose = () => {
    debug("Modal closing");
    onClose();
  };

  if (!isOpen) {
    debug("Modal not rendered (closed)");
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          debug("Backdrop clicked");
          handleClose();
        }
      }}
    >
      <div className="bg-[#1F2937] p-8 rounded-lg w-96 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Sign in</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={handleGitHubAuth}
          disabled={isLoading}
          className={`w-full flex items-center justify-center space-x-2 
            ${isLoading ? "bg-gray-600" : "bg-[#24292f] hover:bg-[#2c974b]"}
            text-white px-4 py-3 rounded-md transition-all duration-200 mb-4`}
        >
          {isLoading ? (
            <span>Connecting to GitHub...</span>
          ) : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>Continue with GitHub</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AuthModal;
