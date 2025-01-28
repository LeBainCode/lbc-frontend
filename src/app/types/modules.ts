// types/modules.ts
export interface ModuleProgress {
    completed: number;
    total: number;
}

export interface UserModules {
    cProgress: ModuleProgress;
    examProgress: ModuleProgress;
    examUnlocked: boolean;
}