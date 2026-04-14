import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Página de inicio de sesión
export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Estado local del formulario
    // Es local porque solo se usa en este componente
    const [email, setEmail] = useState('');
    const[password, setPassword] = useState('');

    // Estado local para error y envio del formulario
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Si el formulario fue redirigido aqui desde ruta protegida, guarda esa ruta para volver despues del login
    const from = (location.state as { from?: { pathname?: string } })?.from?.pathname;

    // Funcion que se ejecuta al enviar el formulario
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event?.preventDefault();
        setErrorMessage('');
        setIsSubmitting(true);

        try {
            // LLamamos al login del contexto
            const loggedUser = await login({ email, password });

            // Si venia de ruta protegida, vuelve ahi
            if (from) {
                navigate (from, { replace: true });
                return;
            }

            // Si no redirige segun rol
            if (loggedUser.role === 'ADMIN') {
                navigate('/admin/dashboard', { replace: true });
            } else {
                navigate('/client/dashboard', { replace: true });
            }
        } catch (error) {
            // Si el backend devuelve error, lo muestra
            setErrorMessage(
                error instanceof Error ? error.message : 'No se pudo iniciar sesión'
            );
        } finally {
            // Pase lo que pase, termina el estado de envio
            setIsSubmitting(false);
        }
    };

    return (
        <section style={{ maxWidth: '420px' }}>
            <h2>Iniciar sesión</h2>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    style={{ display: 'block', width: '100%', padding: '0.5rem' }}
                />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="password">Contraseña</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    style={{ display: 'block', width: '100%', padding: '0.5rem' }}
                />
                </div>

                {/* Mostramos el mensaje de error si existe */}
                {errorMessage && (
                <p style={{ color: 'crimson', marginBottom: '1rem' }}>
                    {errorMessage}
                </p>
                )}

                <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Entrando...' : 'Entrar'}
                </button>
            </form>
            </section>
        );
}