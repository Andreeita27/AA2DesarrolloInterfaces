import { useEffect, useMemo, useReducer } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { appointmentService } from '../services/appointmentService';
import type { Appointment } from '../types/appointment';

// Estado local de la página, no global
interface ClientDashboardState {
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
type ClientDashboardAction =
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
const initialState: ClientDashboardState = {
    appointments: [],
    loading: false,
    error: null,
    search: '',
    stateFilter: '',
    sortField: 'startDateTime',
    sortDirection: 'asc',
};

// Reducer local del dashboard de clientes, centraliza logica y deja la pagina mas mantenible
function clientDashboardReducer(state: ClientDashboardState, action: ClientDashboardAction): ClientDashboardState {
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

// Formateo de fecha para dejarla mas bonita
function formatDate(dateString: string): string {
    const date = new Date(dateString);

    return new Intl.DateTimeFormat('es-ES', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(date);
}

// Traduccion sencilla del estado para que este toda la web en español
function getStateLabel(state: string): string {
    switch (state) {
        case 'PENDING':
            return 'Pendiente';
        case 'CONFIRMED':
            return 'Confirmada';
        case 'COMPLETED':
            return 'Completada';
        case 'CANCELLED':
            return 'Cancelada';
        case 'NO_SHOW':
            return 'No asistió';
        default:
            return state;
    }
}

export default function ClientDashboardPage() {
    const { user, token } = useAuth();

    // useReducer local porque la vista combina varios estados relacionados
    const [state, dispatch] = useReducer(clientDashboardReducer, initialState);

    // Carga inicial de las citas del cliente autenticado
    useEffect(() => {
        const loadMyAppointments = async () => {
            if (!token) return;

            dispatch({ type: 'FETCH_START' });

            try {
                const data = await appointmentService.getMy(token);
                dispatch({ type: 'FETCH_SUCCESS', payload: data });
            } catch (error) {
                dispatch({
                    type: 'FETCH_ERROR',
                    payload: error instanceof Error? error.message : 'Error al cargar tus citas',
                });
            }
        };

        loadMyAppointments();
    }, [token]);

    // Filtrado y ordenación en memoria, useMemo evita recalcularlo en renders innecesarios
    const visibleAppointments = useMemo(() => {
        let result = [...state.appointments];

        // Busqueda por profesional o descripcion
        if (state.search.trim() !== '') {
            const searchLower = state.search.toLowerCase();

            result = result.filter(
                (appointment) =>
                    appointment.professionalName.toLowerCase().includes(searchLower) ||
                    appointment.ideaDescription.toLowerCase().includes(searchLower)
            );
        }

        // Filtro por estado
        if (state.stateFilter !== '') {
            result = result.filter(
                (appointment) => appointment.state === state.stateFilter
            );
        }

        // Ordenacion
        result.sort((a, b) => {
            const field = state.sortField;

            const valueA = String(a[field] ?? '').toLowerCase();
            const valueB = String(b[field] ?? '').toLowerCase();

            if (valueA < valueB) {
                return state.sortDirection === 'asc' ? -1 : 1;
            }

            if (valueA > valueB) {
                return state.sortDirection === 'asc' ? 1 : -1;
            }

            return 0;
        });

        return result;
    }, [
        state.appointments,
        state.search,
        state.stateFilter,
        state.sortField,
        state.sortDirection,
    ]);

    // Resumenes para las tarjetas superiores
    const totalAppointments = state.appointments.length;
    const pendingAppointments = state.appointments.filter((appointment) => appointment.state === 'PENDING').length;
    const confirmedAppointments = state.appointments.filter((appointment) => appointment.state === 'CONFIRMED').length;
    const completedAppointments = state.appointments.filter((appointment) => appointment.state === 'COMPLETED').length;

    return (
        <section>
            <h1>Dashboard cliente</h1>

            <p>
                Bienvenida, <strong>{user?.email}</strong>
            </p>

            {/* Tarjetas resumen */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1.5rem',
                }}
            >
                <div style={cardStyle}>
                    <h3>Total</h3>
                    <p>{totalAppointments}</p>
                </div>

                <div style={cardStyle}>
                    <h3>Pendientes</h3>
                    <p>{pendingAppointments}</p>
                </div>

                <div style={cardStyle}>
                    <h3>Confirmadas</h3>
                    <p>{confirmedAppointments}</p>
                </div>

                <div style={cardStyle}>
                    <h3>Completadas</h3>
                    <p>{completedAppointments}</p>
                </div>
            </div>

            {/* Filtros */}
            <div
                style={{
                    display: 'flex',
                    gap: '1rem',
                    flexWrap: 'wrap',
                    marginBottom: '1rem',
                }}
            >
                <div>
                    <label htmlFor="search">Buscar</label>
                    <input
                        id="search"
                        type="text"
                        value={state.search}
                        onChange={(event) =>
                            dispatch({ type: 'SET_SEARCH', payload: event.target.value })
                        }
                        placeholder="Profesional o idea"
                        style={{ display: 'block', padding: '0.5rem', minWidth: '220px' }}
                    />
                </div>

                <div>
                    <label htmlFor="stateFilter">Filtrar por estado</label>
                    <select
                        id="stateFilter"
                        value={state.stateFilter}
                        onChange={(event) =>
                            dispatch({
                                type: 'SET_STATE_FILTER',
                                payload: event.target.value,
                            })
                        }
                        style={{ display: 'block', padding: '0.5rem', minWidth: '180px' }}
                    >
                        <option value="">Todos</option>
                        <option value="PENDING">Pendiente</option>
                        <option value="CONFIRMED">Confirmada</option>
                        <option value="COMPLETED">Completada</option>
                        <option value="CANCELLED">Cancelada</option>
                        <option value="NO_SHOW">No asistió</option>
                    </select>
                </div>
            </div>

            {/* Estados de carga y error */}
            {state.loading && <p>Cargando tus citas...</p>}

            {state.error && <p style={{ color: 'crimson' }}>{state.error}</p>}

            {/* Estado vacío */}
            {!state.loading && !state.error && visibleAppointments.length === 0 && (
                <p>No tienes citas que mostrar con los filtros actuales.</p>
            )}

            {/* Tabla */}
            {!state.loading && !state.error && visibleAppointments.length > 0 && (
                <div style={{ overflowX: 'auto' }}>
                    <table
                        style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            marginTop: '1rem',
                        }}
                    >
                        <thead>
                            <tr>
                                <th style={thStyle}>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            dispatch({
                                                type: 'SET_SORT',
                                                payload: 'professionalName',
                                            })
                                        }
                                        style={sortButtonStyle}
                                    >
                                        Profesional
                                    </button>
                                </th>

                                <th style={thStyle}>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            dispatch({
                                                type: 'SET_SORT',
                                                payload: 'startDateTime',
                                            })
                                        }
                                        style={sortButtonStyle}
                                    >
                                        Fecha
                                    </button>
                                </th>

                                <th style={thStyle}>Tipo</th>
                                <th style={thStyle}>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            dispatch({
                                                type: 'SET_SORT',
                                                payload: 'state',
                                            })
                                        }
                                        style={sortButtonStyle}
                                    >
                                        Estado
                                    </button>
                                </th>
                                <th style={thStyle}>Depósito</th>
                            </tr>
                        </thead>

                        <tbody>
                            {visibleAppointments.map((appointment) => (
                                <tr key={appointment.id}>
                                    <td style={tdStyle}>{appointment.professionalName}</td>
                                    <td style={tdStyle}>
                                        {formatDate(appointment.startDateTime)}
                                    </td>
                                    <td style={tdStyle}>{appointment.appointmentType}</td>
                                    <td style={tdStyle}>{getStateLabel(appointment.state)}</td>
                                    <td style={tdStyle}>
                                        {appointment.depositPaid ? 'Sí' : 'No'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}

// Estilos sencillos inline luego hago el css
const cardStyle: React.CSSProperties = {
    backgroundColor: '#1b1b1b',
    border: '1px solid #333',
    borderRadius: '12px',
    padding: '1rem',
};

const thStyle: React.CSSProperties = {
    textAlign: 'left',
    borderBottom: '1px solid #444',
    padding: '0.75rem',
};

const tdStyle: React.CSSProperties = {
    borderBottom: '1px solid #333',
    padding: '0.75rem',
};

const sortButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: '#f5f5f5',
    cursor: 'pointer',
    fontWeight: 'bold',
    padding: 0,
};