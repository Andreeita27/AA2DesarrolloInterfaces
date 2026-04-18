import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { appointmentService } from '../services/appointmentService';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
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

// Traduccion para los estados
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

// Badge de color para los estados de momento lo meto aqui
function getBadgeStyle(state: string): React.CSSProperties {
    switch (state) {
        case 'PENDING':
            return {
                backgroundColor: '#6b5500',
                color: '#fff',
                padding: '0.3rem 0.6rem',
                borderRadius: '999px',
                display: 'inline-block',
            };
        case 'CONFIRMED':
            return {
                backgroundColor: '#0b4f8a',
                color: '#fff',
                padding: '0.3rem 0.6rem',
                borderRadius: '999px',
                display: 'inline-block',
            };
        case 'COMPLETED':
            return {
                backgroundColor: '#1f6b2a',
                color: '#fff',
                padding: '0.3rem 0.6rem',
                borderRadius: '999px',
                display: 'inline-block',
            };
        case 'CANCELLED':
            return {
                backgroundColor: '#8a1f1f',
                color: '#fff',
                padding: '0.3rem 0.6rem',
                borderRadius: '999px',
                display: 'inline-block',
            };
        case 'NO_SHOW':
            return {
                backgroundColor: '#5a2a2a',
                color: '#fff',
                padding: '0.3rem 0.6rem',
                borderRadius: '999px',
                display: 'inline-block',
            };
        default:
            return {
                backgroundColor: '#333',
                color: '#fff',
                padding: '0.3rem 0.6rem',
                borderRadius: '999px',
                display: 'inline-block',
            };
    }
}

export default function AdminDashboardPage() {
    const { token } = useAuth();

    // Reducer local: aquí sí está justificado porque manejamos un pequeño flujo
    // de estados y no simples useState aislados
    const [state, dispatch] = useReducer(adminDashboardReducer, initialState);

    // Estado local auxiliar para acciones rápidas
    // No va al reducer porque solo controla mensajes y bloqueo momentáneo de botones
    const [actionMessage, setActionMessage] = useState('');
    const [actionError, setActionError] = useState('');
    const [processingId, setProcessingId] = useState<number | null>(null);

    // Función reutilizable para recargar citas.
    // useCallback evita recrearla innecesariamente y permite reutilizarla después de las acciones de la tabla
    const loadAppointments = useCallback(async () => {
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
    }, [token]);

    useEffect(() => {
        loadAppointments();
    }, [loadAppointments]);

    // Datos filtrados y ordenados.
    // useMemo evita recalcularlo todo en renders innecesarios
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

    // Resúmenes rápidos para el dashboard
    const totalAppointments = state.appointments.length;
    const pendingAppointments = state.appointments.filter((appointment) => appointment.state === 'PENDING').length;
    const confirmedAppointments = state.appointments.filter((appointment) => appointment.state === 'CONFIRMED').length;
    const completedAppointments = state.appointments.filter((appointment) => appointment.state === 'COMPLETED').length;

    // Acción común para evitar repetir lógica en todos los botones
    const runRowAction = async (
        actionFn: () => Promise<Appointment>,
        successMessage: string
    ) => {
        setActionMessage('');
        setActionError('');

        try {
            await actionFn();
            setActionMessage(successMessage);

            // Tras la acción, recargamos desde backend, es simple, fiable y evita inconsistencias
            await loadAppointments();
        } catch (error) {
            setActionError(
                error instanceof Error
                    ? error.message
                    : 'No se pudo actualizar la cita'
            );
        } finally {
            setProcessingId(null);
        }
    };

    const handleConfirmDeposit = async (appointment: Appointment) => {
        if (!token) return;

        const confirmed = window.confirm(
            `¿Marcar como señal pagada la cita de ${appointment.clientFullName}?`
        );

        if (!confirmed) return;

        setProcessingId(appointment.id);

        await runRowAction(
            () => appointmentService.confirmDeposit(appointment.id, token),
            'La cita se ha marcado como confirmada.'
        );
    };

    const handleCompleted = async (appointment: Appointment) => {
        if (!token) return;

        const confirmed = window.confirm(
            `¿Marcar como completada la cita de ${appointment.clientFullName}?`
        );

        if (!confirmed) return;

        setProcessingId(appointment.id);

        await runRowAction(
            () => appointmentService.markCompleted(appointment.id, token),
            'La cita se ha marcado como completada.'
        );
    };

    const handleCancel = async (appointment: Appointment) => {
        if (!token) return;

        const confirmed = window.confirm(
            `¿Seguro que quieres cancelar la cita de ${appointment.clientFullName}?`
        );

        if (!confirmed) return;

        setProcessingId(appointment.id);

        await runRowAction(
            () => appointmentService.cancel(appointment.id, token),
            'La cita se ha cancelado correctamente.'
        );
    };

    const handleNoShow = async (appointment: Appointment) => {
        if (!token) return;

        const confirmed = window.confirm(
            `¿Marcar como no asistido a ${appointment.clientFullName}?`
        );

        if (!confirmed) return;

        setProcessingId(appointment.id);

        await runRowAction(
            () => appointmentService.markNoShow(appointment.id, token),
            'La cita se ha marcado como no asistida.'
        );
    };

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

            {/* Mensajes de acciones */}
            {actionMessage && (
                <p style={{ color: '#7CFC98', marginBottom: '1rem' }}>{actionMessage}</p>
            )}

            {actionError && (
                <p style={{ color: 'crimson', marginBottom: '1rem' }}>{actionError}</p>
            )}

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
                        <option value="PENDING">Pendiente</option>
                        <option value="CONFIRMED">Confirmada</option>
                        <option value="COMPLETED">Completada</option>
                        <option value="CANCELLED">Cancelada</option>
                        <option value="NO_SHOW">No asistió</option>
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

                                <th style={thStyle}>Estado</th>
                                <th style={thStyle}>Depósito</th>
                                <th style={thStyle}>Acciones</th>
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
                                    <td style={tdStyle}>
                                        <span style={getBadgeStyle(appointment.state)}>
                                            {getStateLabel(appointment.state)}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>
                                        {appointment.depositPaid ? 'Sí' : 'No'}
                                    </td>
                                    <td style={tdStyle}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                gap: '0.5rem',
                                                flexWrap: 'wrap',
                                            }}
                                        >
                                            {/* Ver detalle siempre visible */}
                                            <Link
                                                to={`/appointments/${appointment.id}`}
                                                style={linkButtonStyle}
                                            >
                                                Ver detalle
                                            </Link>

                                            {/* Señal pagada solo tiene sentido si está pendiente */}
                                            {appointment.state === 'PENDING' && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleConfirmDeposit(appointment)}
                                                    disabled={processingId === appointment.id}
                                                    style={miniButtonStyle}
                                                >
                                                    Señal pagada
                                                </button>
                                            )}

                                            {/* Completar solo tiene sentido si la cita está confirmada*/}
                                            {appointment.state === 'CONFIRMED' && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleCompleted(appointment)}
                                                    disabled={processingId === appointment.id}
                                                    style={miniButtonStyle}
                                                >
                                                    Completar
                                                </button>
                                            )}

                                            {/* Cancelar no tiene sentido si ya está cancelada o completada */}
                                            {appointment.state !== 'CANCELLED' &&
                                                appointment.state !== 'COMPLETED' &&
                                                appointment.state !== 'NO_SHOW' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCancel(appointment)}
                                                        disabled={processingId === appointment.id}
                                                        style={miniDangerButtonStyle}
                                                    >
                                                        Cancelar
                                                    </button>
                                                )}

                                            {/* No asistido suele tener sentido cuando ya estaba confirmada */}
                                            {appointment.state === 'CONFIRMED' && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleNoShow(appointment)}
                                                    disabled={processingId === appointment.id}
                                                    style={miniButtonStyle}
                                                >
                                                    No asistido
                                                </button>
                                            )}
                                        </div>
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
    verticalAlign: 'top',
};

const sortButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: '#f5f5f5',
    cursor: 'pointer',
    fontWeight: 'bold',
    padding: 0,
};

const miniButtonStyle: React.CSSProperties = {
    backgroundColor: '#d4af37',
    color: '#111',
    border: 'none',
    borderRadius: '8px',
    padding: '0.45rem 0.7rem',
    cursor: 'pointer',
};

const miniDangerButtonStyle: React.CSSProperties = {
    backgroundColor: '#8a1f1f',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.45rem 0.7rem',
    cursor: 'pointer',
};

const linkButtonStyle: React.CSSProperties = {
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: '8px',
    padding: '0.45rem 0.7rem',
    textDecoration: 'none',
    display: 'inline-block',
};