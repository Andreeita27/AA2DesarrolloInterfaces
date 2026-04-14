export type UserRole = 'ADMIN' | 'CLIENT'; // Roles posibles que puede devolver el backend

// Esto representa al usuario autenticado
// Esta info se guarda en contexto y en localstorage
export interface AuthUser {
    id: number;
    name: string;
    email: string;
    role: UserRole;
}

//Estos son los datos que se envian al backend para inciar sesión
export interface LoginRequest {
    email: string;
    password: string;
}

//Datos que se envían al backend para registrar un nuevo usuario
export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

//Respuesta esperada del backend tras login o registro
export interface AuthResponse {
    token: string;
    user: AuthUser;
}