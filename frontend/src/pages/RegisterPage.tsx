import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Página de registro de usuarios
export default function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();

    // Estado local del formulario de registro
    const [formData, setFormData] = useState({
        clientName: '',
        clientSurname: '',
        email: '',
        phone: '',
        birthDate: '',
        showPhoto: false,
        password: '',
    });

    // Estados locales auxiliares
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Función reutilizable para actualizar cualquier campo del formulario
    const handleChange = (field: 'clientName' | 'clientSurname' | 'email' | 'phone' | 'birthDate' | 'password', value: string) => {
        setFormData((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    // Envío del formulario
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage('');
        setIsSubmitting(true);

        try {
            // Registramos al usuario
            const newUser = await register(formData);

            // Redirigimos según el rol devuelto
            if (newUser.role === 'ADMIN') {
                navigate('/admin/dashboard', { replace: true });
            } else {
                navigate('/client/dashboard', { replace: true });
            }
        } catch (error) {
            setErrorMessage(
                error instanceof Error ? error.message : 'No se pudo completar el registro'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section style={{ maxWidth: '520px' }}>
            <h2>Registro</h2>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="clientName">Nombre</label>
                    <input
                        id="clientName"
                        type="text"
                        value={formData.clientName}
                        onChange={(event) => handleChange('clientName', event.target.value)}
                        required
                        style={{ display: 'block', width: '100%', padding: '0.5rem' }}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="clientSurname">Apellidos</label>
                    <input
                        id="clientSurname"
                        type="text"
                        value={formData.clientSurname}
                        onChange={(event) =>
                            handleChange('clientSurname', event.target.value)
                        }
                        required
                        style={{ display: 'block', width: '100%', padding: '0.5rem' }}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(event) => handleChange('email', event.target.value)}
                        required
                        style={{ display: 'block', width: '100%', padding: '0.5rem' }}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="phone">Teléfono</label>
                    <input
                        id="phone"
                        type="text"
                        value={formData.phone}
                        onChange={(event) => handleChange('phone', event.target.value)}
                        style={{ display: 'block', width: '100%', padding: '0.5rem' }}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="birthDate">Fecha de nacimiento</label>
                    <input
                        id="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={(event) => handleChange('birthDate', event.target.value)}
                        style={{ display: 'block', width: '100%', padding: '0.5rem' }}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    {/* Checkbox sencillo para showPhoto */}
                    <label>
                        <input
                            type="checkbox"
                            checked={formData.showPhoto}
                            onChange={(event) =>
                                setFormData((previous) => ({
                                    ...previous,
                                    showPhoto: event.target.checked,
                                }))
                            }
                        />{' '}
                        Mostrar tus tatuajes en la web
                    </label>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="password">Contraseña</label>
                    <input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(event) => handleChange('password', event.target.value)}
                        required
                        style={{ display: 'block', width: '100%', padding: '0.5rem' }}
                    />
                </div>

                {/* Mensaje de error si algo falla */}
                {errorMessage && (
                    <p style={{ color: 'crimson', marginBottom: '1rem' }}>
                        {errorMessage}
                    </p>
                )}

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Registrando...' : 'Crear cuenta'}
                </button>
            </form>
        </section>
    );
}