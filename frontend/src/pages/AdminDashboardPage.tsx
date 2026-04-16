import { useEffect, useMemo, useReducer } from 'react';
import { appointmentService } from '../services/appointmentService';
import { useAuth } from '../contexts/AuthContext';
import type { Appointment } from '../types/appointment';

// Estado de la página
// Este estado NO lo hago global porque solo le interesa a este dashboard
interface AdminDashboardState {
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
type AdminDashboardAction =
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
const initialState: AdminDashboardState = {
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
function adminDashboardReducer(
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

// Función auxiliar para mostrar fecha más bonita en pantalla.
function formatDate(dateString: string): string {
    const date = new Date(dateString);

    return new Intl.DateTimeFormat('es-ES', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(date);
}

export default function AdminDashboardPage() {
    const { token } = useAuth();

    // Reducer local: aquí sí está justificado porque manejamos un pequeño flujo
    // de estados y no simples useState aislados.
    const [state, dispatch] = useReducer(adminDashboardReducer, initialState);

    // Carga inicial de datos
    useEffect(() => {
        const loadAppointments = async () => {
            if (!token) return;

            dispatch({ type: 'FETCH_START' });

            try {
                const data = await appointmentService.getAll(token);
                dispatch({ type: 'FETCH_SUCCESS', payload: data });
            } catch (error) {
                dispatch({
                    type: 'FETCH_ERROR',
                    payload:
                        error instanceof Error ? error.message : 'Error al cargar las citas',
                });
            }
        };

        loadAppointments();
    }, [token]);

    // Datos filtrados y ordenados.
    // useMemo evita recalcularlo todo en renders innecesarios.
    const visibleAppointments = useMemo(() => {
        let result = [...state.appointments];

        // Filtro de búsqueda
        if (state.search.trim() !== '') {
            const searchLower = state.search.toLowerCase();

            result = result.filter((appointment) =>
                appointment.clientFullName.toLowerCase().includes(searchLower)
            );
        }

        // Filtro por estado
        if (state.stateFilter !== '') {
            result = result.filter(
                (appointment) => appointment.state === state.stateFilter
            );
        }

        // Ordenación
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

    // Resúmenes rápidos para el dashboard.
    const totalAppointments = state.appointments.length;
    const pendingAppointments = state.appointments.filter(
        (appointment) => appointment.state === 'PENDING'
    ).length;
    const confirmedAppointments = state.appointments.filter(
        (appointment) => appointment.state === 'CONFIRMED'
    ).length;
    const completedAppointments = state.appointments.filter(
        (appointment) => appointment.state === 'COMPLETED'
    ).length;

    return (
        <section>
            <h1>Dashboard administrador</h1>

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

            {/* Zona de filtros */}
            <div
                style={{
                    display: 'flex',
                    gap: '1rem',
                    flexWrap: 'wrap',
                    marginBottom: '1rem',
                }}
            >
                <div>
                    <label htmlFor="search">Buscar por cliente</label>
                    <input
                        id="search"
                        type="text"
                        value={state.search}
                        onChange={(event) =>
                            dispatch({ type: 'SET_SEARCH', payload: event.target.value })
                        }
                        placeholder="Nombre o apellidos"
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
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                        <option value="NO_SHOW">NO_SHOW</option>
                    </select>
                </div>
            </div>

            {/* Estados de carga y error */}
            {state.loading && <p>Cargando citas...</p>}

            {state.error && <p style={{ color: 'crimson' }}>{state.error}</p>}

            {/* Estado vacío */}
            {!state.loading && !state.error && visibleAppointments.length === 0 && (
                <p>No hay citas que mostrar con los filtros actuales.</p>
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
                                                payload: 'clientFullName',
                                            })
                                        }
                                        style={sortButtonStyle}
                                    >
                                        Cliente
                                    </button>
                                </th>

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
                                    <td style={tdStyle}>{appointment.clientFullName}</td>
                                    <td style={tdStyle}>{appointment.professionalName}</td>
                                    <td style={tdStyle}>
                                        {formatDate(appointment.startDateTime)}
                                    </td>
                                    <td style={tdStyle}>{appointment.state}</td>
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

// Estilos inline sencillos
// Luego lo paso a css aparte
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