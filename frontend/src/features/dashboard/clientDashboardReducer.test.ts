import { describe, expect, it } from 'vitest';
import { clientDashboardInitialState, clientDashboardReducer, } from './clientDashBoardReducer';
import type { Appointment } from '../../types/appointment';

// Mock de cita para el dashboard del cliente
const appointmentMock: Appointment = {
    id: 2,
    appointmentType: 'TATTOO',
    startDateTime: '2026-04-22T18:00:00',
    professionalName: 'David el Titi',
    professionalId: 2,
    clientId: 10,
    bodyPlacement: 'Pierna',
    ideaDescription: 'Luna ornamental',
    firstTime: true,
    tattooSize: 'SMALL',
    referenceImageUrl: null,
    durationMinutes: 60,
    state: 'CONFIRMED',
    depositPaid: true,
    clientName: 'Andrea',
    clientSurname: 'Fernández',
    clientFullName: 'Andrea Fernández',
    showroomTattooCreated: false,
    showroomTattooId: null,
};

describe('clientDashboardReducer', () => {
    it('Guarda el filtro por estado', () => {
        const result = clientDashboardReducer(clientDashboardInitialState, {
            type: 'SET_STATE_FILTER',
            payload: 'CONFIRMED',
        });

        expect(result.stateFilter).toBe('CONFIRMED');
    });

    it('Guarda el resultado de la carga en FETCH_SUCCESS', () => {
        const result = clientDashboardReducer(
            {
                ...clientDashboardInitialState,
                loading: true,
            },
            {
                type: 'FETCH_SUCCESS',
                payload: [appointmentMock],
            }
        );

        expect(result.loading).toBe(false);
        expect(result.appointments[0].professionalName).toBe('David el Titi');
    });

    it('Guarda el error en FETCH_ERROR', () => {
        const result = clientDashboardReducer(clientDashboardInitialState,{
            type: 'FETCH_ERROR',
            payload: 'No se pudieron cargar tus citas',
        });

        expect(result.loading).toBe(false);
        expect(result.error).toBe('No se pudieron cargar tus citas');
    });

    it('Invierte la dirección cuando se pulsa dos veces el mismo campo', () => {
        const firstClick = clientDashboardReducer(clientDashboardInitialState, {
            type: 'SET_SORT',
            payload: 'state',
        });

        const secondClick = clientDashboardReducer(firstClick, {
            type: 'SET_SORT',
            payload: 'state',
        });

        expect(secondClick.sortField).toBe('state');
        expect(secondClick.sortDirection).toBe('desc');
    });
});
