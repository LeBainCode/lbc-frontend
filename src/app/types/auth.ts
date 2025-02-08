// src/app/types/auth.ts

// Progress interface remains the same
export interface UserProgress {
  cModule: {
    completed: number;
    total: number;
  };
  examModule: {
    completed: number;
    total: number;
    isUnlocked: boolean;
  };
}

//  User interface
export interface User {
  _id: string;
  username: string;
  email?: string;
  githubId?: string;
  githubUsername?: string;  
  githubAvatar?: string;    
  role: 'user' | 'admin';
  progress: UserProgress;
  // Add any other GitHub-related fields you might need
}

// AuthContextType 
export interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  fetchUserData: () => Promise<User | null>;
  isLoading: boolean;
  error: string | null;                    //  error state
  logout: () => void;                      //  logout function
  isAuthenticated: boolean;                // authentication status
  githubLogin?: () => Promise<void>;       // direct GitHub login method
}

//GitHub-specific types if needed
export interface GitHubAuthResponse {
  accessToken: string;
  user: User;
}

// Error types 
export type AuthError = {
  message: string;
  code?: string;
  status?: number;
}