import { apiFetch } from './api';
import type { Appointment } from '../types/appointment';

// Servicio reutilizable para citas
export const appointmentService = {
    // El dashboard de admin puede usar GET /appointments
    getAll: (token: string) =>
        apiFetch<Appointment[]>('/appointments', {
            method: 'GET',
            token,
        }),

    // Citas del usuario autenticado
    getMy: (token:string) =>
        apiFetch<Appointment[]>('/appointments/my', {
            method: 'GET',
            token,
        }),
};