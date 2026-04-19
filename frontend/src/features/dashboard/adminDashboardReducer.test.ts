import { describe, expect, it } from 'vitest';
import { adminDashboardInitialState, adminDashboardReducer, } from './adminDashboardReducer';
import type { Appointment } from '../../types/appointment';

// Cita de ejemplo para no repetir datos en todos los tests.
const appointmentMock: Appointment = {
    id: 1,
    appointmentType: 'TATTOO',
    startDateTime: '2026-04-20T16:00:00',
    professionalName: 'David el Titi',
    professionalId: 1,
    clientId: 10,
    bodyPlacement: 'Brazo',
    ideaDescription: 'Rosa blackwork',
    firstTime: false,
    tattooSize: 'MEDIUM',
    referenceImageUrl: null,
    durationMinutes: 120,
    state: 'PENDING',
    depositPaid: false,
    clientName: 'Andrea',
    clientSurname: 'Fernández',
    clientFullName: 'Andrea Fernández',
    showroomTattooCreated: false,
    showroomTattooId: null,
};

describe('adminDashboardReducer', () => {
    it('Activa loading y limpia el error en FETCH_START', () => {
        const stateWithError = {
            ...adminDashboardInitialState,
            error: 'Había un error anterior',
        };

        const result = adminDashboardReducer(stateWithError, {
            type: 'FETCH_START',
        });

        expect(result.loading).toBe(true);
        expect(result.error).toBeNull();
    });

    it('Guarda las citas y desactiva loading en FETCH_SUCCESS', () => {
        const result = adminDashboardReducer(
            {
                ...adminDashboardInitialState,
                loading: true,
            },
            {
                type: 'FETCH_SUCCESS',
                payload: [appointmentMock],
            }
        );

        expect(result.loading).toBe(false);
        expect(result.appointments).toHaveLength(1);
        expect(result.appointments[0].clientFullName).toBe('Andrea Fernández');
    });

    it('Cambia el texto de búsqueda con SET_SEARCH', () => {
        const result = adminDashboardReducer(adminDashboardInitialState, {
            type: 'SET_SEARCH',
            payload: 'Andrea',
        });

        expect(result.search).toBe('Andrea');
    });

    it('Invierte la dirección si se pulsa dos veces la misma columna', () => {
        const firstClick = adminDashboardReducer(adminDashboardInitialState, {
            type: 'SET_SORT',
            payload: 'startDateTime',
        });

        const secondClick = adminDashboardReducer(firstClick, {
            type: 'SET_SORT',
            payload: 'startDateTime',
        });

        expect(secondClick.sortField).toBe('startDateTime');
        expect(secondClick.sortDirection).toBe('asc');
    });

    it('Reinicia a ascendente si cambia la columna de ordenación', () => {
        const state = {
            ...adminDashboardInitialState,
            sortField: 'startDateTime' as const,
            sortDirection: 'desc' as const,
        };

        const result = adminDashboardReducer(state, {
            type: 'SET_SORT',
            payload: 'clientFullName',
        });

        expect(result.sortField).toBe('clientFullName');
        expect(result.sortDirection).toBe('asc');
    });
});
