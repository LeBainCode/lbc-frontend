// src/app/types/admin.ts
export interface Prospect {
  type: "individual" | "organization" | "other" | "bot" | "spam" | "developmentTest";
  email: string;
  reachedOut: boolean;
  comment: string;
  createdAt: Date;
  lastUpdatedBy?: {
    type?: {
      admin: string;
      timestamp: Date;
    };
    reachedOut?: {
      admin: string;
      timestamp: Date;
    };
    comment?: {
      admin: string;
      timestamp: Date;
    };
  };
}

export interface RegularUser {
  _id: string;
  username: string;
  email?: string;
  createdAt: Date;
}
