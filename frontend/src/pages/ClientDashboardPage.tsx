import { useEffect, useMemo, useReducer, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { appointmentService } from '../services/appointmentService';
import type { Appointment } from '../types/appointment';
import { clientDashboardInitialState, clientDashboardReducer } from '../features/dashboard/clientDashBoardReducer';

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

// Badge visual para los estados de cita
function getBadgeClass(state: string): string {
    switch (state) {
        case 'PENDING':
            return 'status-badge status-pending';
        case 'CONFIRMED':
            return 'status-badge status-confirmed';
        case 'COMPLETED':
            return 'status-badge status-completed';
        case 'CANCELLED':
            return 'status-badge status-cancelled';
        case 'NO_SHOW':
            return 'status-badge status-no-show';
        default:
            return 'status-badge status-default';
    }
}

export default function ClientDashboardPage() {
    const { user, token } = useAuth();

    // useReducer local porque la vista combina varios estados relacionados
    const [state, dispatch] = useReducer(clientDashboardReducer, clientDashboardInitialState);

    // Estados locales auxiliares para acciones rápidas
    // No hace falta meterlos en el reducer porque son puntuales y simples
    const [actionMessage, setActionMessage] = useState('');
    const [actionError, setActionError] = useState('');
    const [processingId, setProcessingId] = useState<number | null>(null);

    // Carga de citas del cliente autenticado
    const loadMyAppointments = async () => {
        if (!token) return;

        dispatch({ type: 'FETCH_START' });

        try {
            const data = await appointmentService.getMy(token);
            dispatch({ type: 'FETCH_SUCCESS', payload: data });
        } catch (error) {
            dispatch({
                type: 'FETCH_ERROR',
                payload:
                    error instanceof Error
                        ? error.message
                        : 'Error al cargar tus citas',
            });
        }
    };

    useEffect(() => {
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

    // Acción común para no repetir la misma lógica en cada botón
    const runRowAction = async (
        actionFn: () => Promise<Appointment>,
        successMessage: string
    ) => {
        setActionMessage('');
        setActionError('');

        try {
            await actionFn();
            setActionMessage(successMessage);

            // Tras la acción, recargamos desde backend para mantener la tabla sincronizada
            await loadMyAppointments();
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

    // El cliente solo puede cancelar sus propias citas
    const handleCancel = async (appointment: Appointment) => {
        if (!token) return;

        const confirmed = window.confirm(
            '¿Seguro que quieres cancelar esta cita?'
        );

        if (!confirmed) return;

        setProcessingId(appointment.id);

        await runRowAction(
            () => appointmentService.cancel(appointment.id, token),
            'La cita se ha cancelado correctamente.'
        );
    };

    return (
        <section className="dashboard-section">
            <h1 className="page-title">Dashboard cliente</h1>

            <p className="page-subtitle">
                Bienvenido, <strong>{user?.email}</strong>
            </p>

            {/* Tarjetas resumen */}
            <div className="summary-grid">
                <div className="summary-card">
                    <h3>Total</h3>
                    <p>{totalAppointments}</p>
                </div>

                <div className="summary-card">
                    <h3>Pendientes</h3>
                    <p>{pendingAppointments}</p>
                </div>

                <div className="summary-card">
                    <h3>Confirmadas</h3>
                    <p>{confirmedAppointments}</p>
                </div>

                <div className="summary-card">
                    <h3>Completadas</h3>
                    <p>{completedAppointments}</p>
                </div>
            </div>

            {/* Mensajes de acción */}
            {actionMessage && <p className="text-success">{actionMessage}</p>}
            {actionError && <p className="text-danger">{actionError}</p>}

            {/* Filtros */}
            <div className="dashboard-filters">
                <div className="form-field search-field">
                    <label htmlFor="search" className="form-label">Buscar</label>
                    <input
                        id="search"
                        type="text"
                        value={state.search}
                        onChange={(event) =>
                            dispatch({ type: 'SET_SEARCH', payload: event.target.value })
                        }
                        placeholder="Profesional o idea"
                        className="form-input"
                    />
                </div>

                <div className="form-field">
                    <label htmlFor="stateFilter" className="form-label">Filtrar por estado</label>
                    <select
                        id="stateFilter"
                        value={state.stateFilter}
                        onChange={(event) =>
                            dispatch({
                                type: 'SET_STATE_FILTER',
                                payload: event.target.value,
                            })
                        }
                        className="form-select"
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
            {state.error && <p className="text-danger">{state.error}</p>}

            {/* Estado vacío */}
            {!state.loading && !state.error && visibleAppointments.length === 0 && (
                <p>No tienes citas que mostrar con los filtros actuales.</p>
            )}

            {/* Tabla */}
            {!state.loading && !state.error && visibleAppointments.length > 0 && (
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            dispatch({
                                                type: 'SET_SORT',
                                                payload: 'professionalName',
                                            })
                                        }
                                        className="sort-button"
                                    >
                                        Profesional
                                    </button>
                                </th>

                                <th>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            dispatch({
                                                type: 'SET_SORT',
                                                payload: 'startDateTime',
                                            })
                                        }
                                        className="sort-button"
                                    >
                                        Fecha
                                    </button>
                                </th>

                                <th>Tipo</th>

                                <th>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            dispatch({
                                                type: 'SET_SORT',
                                                payload: 'state',
                                            })
                                        }
                                        className="sort-button"
                                    >
                                        Estado
                                    </button>
                                </th>

                                <th>Depósito</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {visibleAppointments.map((appointment) => (
                                <tr key={appointment.id}>
                                    <td>{appointment.professionalName}</td>
                                    <td>{formatDate(appointment.startDateTime)}</td>
                                    <td>{appointment.appointmentType}</td>
                                    <td>
                                        <span className={getBadgeClass(appointment.state)}>
                                            {getStateLabel(appointment.state)}
                                        </span>
                                    </td>
                                    <td>{appointment.depositPaid ? 'Sí' : 'No'}</td>
                                    <td>
                                        <div className="row-actions">
                                            {/* El cliente también puede ver el detalle */}
                                            <Link
                                                to={`/appointments/${appointment.id}`}
                                                className="btn btn-dark btn-mini btn-link"
                                            >
                                                Ver detalle
                                            </Link>

                                            {/* El cliente puede cancelar solo si la cita no está ya cerrada */}
                                            {appointment.state !== 'CANCELLED' &&
                                                appointment.state !== 'COMPLETED' &&
                                                appointment.state !== 'NO_SHOW' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCancel(appointment)}
                                                        disabled={processingId === appointment.id}
                                                        className="btn btn-danger btn-mini"
                                                    >
                                                        Cancelar
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