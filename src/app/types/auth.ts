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

// User interface with all properties
export interface User {
  _id: string;
  username: string;
  role: 'user' | 'admin';  
  progress: UserProgress;  
}

// AuthContextType 
export interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  fetchUserData: () => Promise<User>; 
  isLoading: boolean;  
}