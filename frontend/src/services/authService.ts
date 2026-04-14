// Importo utilidad genérica para hacer peticiones
import { apiFetch } from './api';
// Importo los tipos relacionados con autenticación
import type { AuthResponse, LoginRequest, RegisterRequest, AuthUser, } from '../types/auth';

//Servicio de autenticación
// Aqui se centralizan las llamadas relacionadas con auth
// Asi no se hace fetch desde los componenetes
export const authService = {
    // Login: email y password al backend
    login: (credentials: LoginRequest) =>
        apiFetch<AuthResponse>('/auth/login', {
            method: 'POST',
            body: credentials,
        }),

    // Registro: se envian los datos del nuevo usuario
    register: (data: RegisterRequest) =>
        apiFetch<AuthResponse>('/auth/register', {
            method: 'POST',
            body: data,
        }),

    // Obtener perfil del usuario autenticado, se necesita token
    getProfile: (token: string) =>
        apiFetch<AuthUser>('/auth/me', {
            method: 'GET',
            token,
        }),
};