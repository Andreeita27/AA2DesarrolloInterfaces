import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { appointmentService } from '../services/appointmentService';
import { useAuth } from '../contexts/AuthContext';
import type { Appointment } from '../types/appointment';

// Página de detalle de una cita
export default function AppointmentDetailPage() {
    const { id } = useParams(); //  id de la URL
    const navigate = useNavigate();
    const { token } = useAuth();

    // Estado local, NO hace falta reducer, es simple
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadAppointment = async () => {
            if (!token || !id) return;

            setLoading(true);
            setError(null);

            try {
                const data = await appointmentService.getById(Number(id), token);
                setAppointment(data);
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : 'Error al cargar la cita'
                );
            } finally {
                setLoading(false);
            }
        };

        loadAppointment();
    }, [id, token]);

    // Formateo de fecha bonito
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);

        return new Intl.DateTimeFormat('es-ES', {
            dateStyle: 'full',
            timeStyle: 'short',
        }).format(date);
    };

    if (loading) return <p>Cargando detalle...</p>;

    if (error) return <p style={{ color: 'crimson' }}>{error}</p>;

    if (!appointment) return <p>No se ha encontrado la cita.</p>;

    return (
        <section>
            <h1>Detalle de la cita</h1>

            <button onClick={() => navigate(-1)} style={backButtonStyle}>
                ← Volver
            </button>

            <div style={containerStyle}>
                <div style={cardStyle}>
                    <h3>Información general</h3>

                    <p><strong>Cliente:</strong> {appointment.clientFullName}</p>
                    <p><strong>Profesional:</strong> {appointment.professionalName}</p>
                    <p><strong>Fecha:</strong> {formatDate(appointment.startDateTime)}</p>
                    <p><strong>Estado:</strong> {appointment.state}</p>
                    <p><strong>Tipo:</strong> {appointment.appointmentType}</p>
                    <p><strong>Duración:</strong> {appointment.durationMinutes} minutos</p>
                </div>

                <div style={cardStyle}>
                    <h3>Detalles del tatuaje</h3>

                    <p><strong>Idea:</strong> {appointment.ideaDescription}</p>
                    <p><strong>Tamaño:</strong> {appointment.tattooSize ?? 'N/A'}</p>
                    <p><strong>Zona:</strong> {appointment.bodyPlacement ?? 'N/A'}</p>
                    <p><strong>Primera vez:</strong> {appointment.firstTime ? 'Sí' : 'No'}</p>
                </div>

                <div style={cardStyle}>
                    <h3>Pago</h3>

                    <p>
                        <strong>Señal pagada:</strong>{' '}
                        {appointment.depositPaid ? 'Sí' : 'No'}
                    </p>
                </div>

                {/* Imagen si existe */}
                {appointment.referenceImageUrl && (
                    <div style={cardStyle}>
                        <h3>Imagen de referencia</h3>

                        <img
                            src={appointment.referenceImageUrl}
                            alt="Referencia"
                            style={{ maxWidth: '100%', borderRadius: '8px' }}
                        />
                    </div>
                )}
            </div>
        </section>
    );
}

// Estilos simples luego al css
const containerStyle: React.CSSProperties = {
    display: 'grid',
    gap: '1rem',
    marginTop: '1rem',
};

const cardStyle: React.CSSProperties = {
    backgroundColor: '#1b1b1b',
    border: '1px solid #333',
    borderRadius: '12px',
    padding: '1rem',
};

const backButtonStyle: React.CSSProperties = {
    marginTop: '1rem',
    marginBottom: '1rem',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
};