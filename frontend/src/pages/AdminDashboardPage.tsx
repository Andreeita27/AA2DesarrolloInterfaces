import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { appointmentService } from '../services/appointmentService';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import type { Appointment } from '../types/appointment';
import { adminDashboardReducer, adminDashboardInitialState } from '../features/dashboard/adminDashboardReducer';

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

// Badge de color para los estados
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

export default function AdminDashboardPage() {
    const { token } = useAuth();

    // Reducer local: aquí sí está justificado porque manejamos un pequeño flujo
    // de estados y no simples useState aislados
    const [state, dispatch] = useReducer(adminDashboardReducer, adminDashboardInitialState);

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
        <section className="dashboard-section">
            <h1 className="page-title">Dashboard administrador</h1>

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

            {/* Mensajes de acciones */}
            {actionMessage && <p className="text-success">{actionMessage}</p>}
            {actionError && <p className="text-danger">{actionError}</p>}

            {/* Filtros */}
            <div className="dashboard-filters">
                <div className="form-field search-field">
                    <label htmlFor="search" className="form-label">Buscar por cliente</label>
                    <input
                        id="search"
                        type="text"
                        value={state.search}
                        onChange={(event) =>
                            dispatch({ type: 'SET_SEARCH', payload: event.target.value })
                        }
                        placeholder="Nombre o apellidos"
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
            {state.loading && <p>Cargando citas...</p>}
            {state.error && <p className="text-danger">{state.error}</p>}

            {/* Estado vacío */}
            {!state.loading && !state.error && visibleAppointments.length === 0 && (
                <p>No hay citas que mostrar con los filtros actuales.</p>
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
                                                payload: 'clientFullName',
                                            })
                                        }
                                        className="sort-button"
                                    >
                                        Cliente
                                    </button>
                                </th>

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

                                <th>Estado</th>
                                <th>Depósito</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {visibleAppointments.map((appointment) => (
                                <tr key={appointment.id}>
                                    <td>{appointment.clientFullName}</td>
                                    <td>{appointment.professionalName}</td>
                                    <td>{formatDate(appointment.startDateTime)}</td>
                                    <td>
                                        <span className={getBadgeClass(appointment.state)}>
                                            {getStateLabel(appointment.state)}
                                        </span>
                                    </td>
                                    <td>{appointment.depositPaid ? 'Sí' : 'No'}</td>
                                    <td>
                                        <div className="row-actions">
                                            {/* Ver detalle siempre visible */}
                                            <Link
                                                to={`/appointments/${appointment.id}`}
                                                className="btn btn-dark btn-mini btn-link"
                                            >
                                                Ver detalle
                                            </Link>

                                            {/* Señal pagada solo tiene sentido si está pendiente */}
                                            {appointment.state === 'PENDING' && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleConfirmDeposit(appointment)}
                                                    disabled={processingId === appointment.id}
                                                    className="btn btn-primary btn-mini"
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
                                                    className="btn btn-primary btn-mini"
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
                                                        className="btn btn-danger btn-mini"
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
                                                    className="btn btn-primary btn-mini"
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