// src/app/types/auth.ts

// Progress interface 
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

// User interface 
export interface User {
  _id: string;
  username: string;
  email?: string;  // Add this line
  githubId?: string;  // Add this line if needed
  role: 'user' | 'admin';  
  progress: UserProgress;  
}

// AuthContextType 
export interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  fetchUserData: () => Promise<User | null>;
  isLoading: boolean;
}