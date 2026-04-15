import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Página de registro de usuarios
export default function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();

    // Estado local del formulario de registro
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });

    // Estados locales auxiliares
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Función reutilizable para actualizar cualquier campo del formulario
    const handleChange = (field: 'name' | 'email' | 'password', value: string) => {
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
        <section style={{ maxWidth: '420px' }}>
            <h2>Registro</h2>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="name">Nombre</label>
                    <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(event) => handleChange('name', event.target.value)}
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