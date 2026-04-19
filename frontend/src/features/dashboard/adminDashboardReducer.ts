import type { Appointment } from "../../types/appointment";

// Estado de la página
// Este estado NO lo hago global porque solo le interesa a este dashboard
export interface AdminDashboardState {
    appointments: Appointment[];
    loading: boolean;
    error: string | null;

    // Filtros y ordenación
    search: string;
    stateFilter: string;
    sortField: 'clientFullName' | 'professionalName' | 'startDateTime' | 'state';
    sortDirection: 'asc' | 'desc';
}

// Acciones del reducer
// Aquí es donde tiene sentido usar reducer porque hay transiciones relacionadas entre sí: carga, éxito, error, filtros y ordenación.
export type AdminDashboardAction =
    | { type: 'FETCH_START' }
    | { type: 'FETCH_SUCCESS'; payload: Appointment[] }
    | { type: 'FETCH_ERROR'; payload: string }
    | { type: 'SET_SEARCH'; payload: string }
    | { type: 'SET_STATE_FILTER'; payload: string }
    | {
        type: 'SET_SORT';
        payload: AdminDashboardState['sortField'];
    };

// Estado inicial del reducer
export const adminDashboardInitialState: AdminDashboardState = {
    appointments: [],
    loading: false,
    error: null,
    search: '',
    stateFilter: '',
    sortField: 'startDateTime',
    sortDirection: 'asc',
};

// Reducer local del dashboard.
// Lo hacemos aquí porque solo esta página necesita esta lógica.
export function adminDashboardReducer(
    state: AdminDashboardState,
    action: AdminDashboardAction
): AdminDashboardState {
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

        case 'SET_SORT': {
            // Si el usuario pulsa la misma columna, invertimos el sentido
            if (state.sortField === action.payload) {
                return {
                    ...state,
                    sortDirection: state.sortDirection === 'asc' ? 'desc' : 'asc',
                };
            }

            // Si cambia de columna, volvemos a ascendente
            return {
                ...state,
                sortField: action.payload,
                sortDirection: 'asc',
            };
        }

        default:
            return state;
    }
}