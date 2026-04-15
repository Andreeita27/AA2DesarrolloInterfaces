export type UserRole = 'ADMIN' | 'CLIENT'; // Roles posibles que puede devolver el backend

// Esto representa al usuario autenticado
// Esta info se guarda en contexto y en localstorage
export interface AuthUser {
    email: string;
    role: UserRole;
    clientId: number | null;
}

//Estos son los datos que se envian al backend para inciar sesión
export interface LoginRequest {
    email: string;
    password: string;
}

//Datos que se envían al backend para registrar un nuevo usuario
export interface RegisterRequest {
    clientName: string;
    clientSurname: string;
    email: string;
    phone: string;
    birthDate: string;
    showPhoto: boolean;
    password: string;
}

//Respuesta real del backend tras login o registro
export interface AuthResponse {
    token: string;
    role: UserRole;
    clientId: number | null;
}