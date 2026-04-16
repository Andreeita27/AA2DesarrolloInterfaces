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

    // Marcar señal pagada, cambia el estado a confirmed
    confirmDeposit: (id: number, token: string) =>
        apiFetch<Appointment>(`/appointments/${id}/confirm-deposit`, {
            method: 'POST',
            token,
        }),

    // Cancelar cita
    cancel: (id: number, token: string) =>
        apiFetch<Appointment>(`/appointments/${id}/cancel`, {
            method: 'POST',
            token,
        }),

    // Marcar no asistido
    markNoShow: (id: number, token:string) =>
        apiFetch<Appointment>(`/appointments/${id}/mark-no-show`, {
            method: 'POST',
            token,
        }),

    // Obtener detalle de la cita
    getById: (id: number, token: string) =>
        apiFetch<Appointment>(`/appointments/${id}`, {
            method: 'GET',
            token,
        }),
};