// src/app/types/auth.ts
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

export interface User {
  username: string;
  role: 'user' | 'admin';
  progress: UserProgress;
}

export interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  fetchUserData: () => Promise<void>;
}