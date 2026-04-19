import type { Appointment } from '../../types/appointment';

// Estado local de la página, no global
export interface ClientDashboardState {
    appointments: Appointment[];
    loading: boolean;
    error: string | null;

    // Filtros y ordenación
    search: string;
    stateFilter: string;
    sortField: 'professionalName' | 'startDateTime' | 'state';
    sortDirection: 'asc' | 'desc';
}

// Acciones del reducer
// Aqui tiene sentido usarlo xq se manejan transiciones relacionadas: carga, error,filtros y ordenacion
export type ClientDashboardAction =
    | { type: 'FETCH_START' }
    | { type: 'FETCH_SUCCESS'; payload: Appointment[] }
    | { type: 'FETCH_ERROR'; payload: string }
    | { type: 'SET_SEARCH'; payload: string }
    | { type: 'SET_STATE_FILTER'; payload: string }
    | {
        type: 'SET_SORT';
        payload: ClientDashboardState['sortField'];
    };

// Estado inicial
export const clientDashboardInitialState: ClientDashboardState = {
    appointments: [],
    loading: false,
    error: null,
    search: '',
    stateFilter: '',
    sortField: 'startDateTime',
    sortDirection: 'asc',
};

// Reducer local del dashboard de clientes, centraliza logica y deja la pagina mas mantenible
export function clientDashboardReducer(state: ClientDashboardState, action: ClientDashboardAction): ClientDashboardState {
    switch (action.type) {
        case 'FETCH_START':
            return {
                ...state,
                loading: true,
                error: null,
            };

        case 'FETCH_SUCCESS':
            return {
                ...state,
                loading: false,
                appointments: action.payload,
            };

        case 'FETCH_ERROR':
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        case 'SET_SEARCH':
            return {
                ...state,
                search: action.payload,
            };

        case 'SET_STATE_FILTER':
            return {
                ...state,
                stateFilter: action.payload,
            };

        case 'SET_SORT':
            // Si pulsa la misma columna, invertimos el sentido
            if (state.sortField === action.payload) {
                return {
                    ...state,
                    sortDirection: state.sortDirection === 'asc' ? 'desc' : 'asc',
                };
            }

            // Si cambia de columna, volvemos a asc
            return {
                ...state,
                sortField: action.payload,
                sortDirection: 'asc',
            };

        default:
            return state;
    }
}