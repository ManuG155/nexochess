export interface UserProfile {
    displayName: string;
    username: string;
    roles: string[];
    createdAt: string;
    dateOfBirth?: string;
}

export interface AuthedUserProfile extends UserProfile {
    email: string;
}