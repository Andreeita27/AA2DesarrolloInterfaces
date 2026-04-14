export type UserRole = 'ADMIN' | 'CLIENT';

export interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    user: AuthUser;
}