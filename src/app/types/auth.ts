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
    role: 'student' | 'admin';
    progress: UserProgress;
  }
  
  export interface AuthContextType {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
  }