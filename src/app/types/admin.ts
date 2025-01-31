export interface Prospect {
    email: string;
    type: 'individual' | 'organization' | 'other';
    reachedOut: boolean;
    comment: string;
    createdAt: Date;
}

export interface RegularUser {
    _id: string;
    username: string;
    email?: string;
    createdAt: Date;
}