import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Página de inicio de sesión
export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Estado local del formulario
    // Es local porque solo se usa en este componente, no hace falta contexto
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Estado local para error y envio del formulario
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Si el formulario fue redirigido aqui desde ruta protegida, guarda esa ruta para volver despues del login
    const from = (location.state as { from?: { pathname?: string } })?.from?.pathname;

    //Si el login viene de una redirección por sesión caducada se muestra este mensaje
    const params = new URLSearchParams(location.search);
    const sessionExpired = params.get('sessionExpired') === '1';

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
                navigate(from, { replace: true });
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
        <section className="auth-section">
            <div className="auth-card">
                <p className="eyebrow">Acceso</p>
                <h2 className="page-title">Iniciar sesión</h2>

                {sessionExpired && !errorMessage && (
                    <p className="text-warning">
                        Tu sesión ha caducado, vuelve a iniciar sesión.
                    </p>
                )}

                <form onSubmit={handleSubmit} className="form-grid">
                    <div className="form-field">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                            className="form-input"
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="password" className="form-label">Contraseña</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                            className="form-input"
                        />
                    </div>

                    {/* Mostramos el mensaje de error si existe */}
                    {errorMessage && <p className="text-danger">{errorMessage}</p>}

                    <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                        {isSubmitting ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
            </div>
        </section>
    );
}