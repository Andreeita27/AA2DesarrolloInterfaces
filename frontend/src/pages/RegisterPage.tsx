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
        <section className="auth-section">
            <div className="auth-card">
                <p className="eyebrow">Nueva cuenta</p>
                <h2 className="page-title">Registro</h2>

                <form onSubmit={handleSubmit} className="form-grid">
                    <div className="form-field">
                        <label htmlFor="clientName" className="form-label">Nombre</label>
                        <input
                            id="clientName"
                            type="text"
                            value={formData.clientName}
                            onChange={(event) => handleChange('clientName', event.target.value)}
                            required
                            className="form-input"
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="clientSurname" className="form-label">Apellidos</label>
                        <input
                            id="clientSurname"
                            type="text"
                            value={formData.clientSurname}
                            onChange={(event) =>
                                handleChange('clientSurname', event.target.value)
                            }
                            required
                            className="form-input"
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(event) => handleChange('email', event.target.value)}
                            required
                            className="form-input"
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="phone" className="form-label">Teléfono</label>
                        <input
                            id="phone"
                            type="text"
                            value={formData.phone}
                            onChange={(event) => handleChange('phone', event.target.value)}
                            className="form-input"
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="birthDate" className="form-label">Fecha de nacimiento</label>
                        <input
                            id="birthDate"
                            type="date"
                            value={formData.birthDate}
                            onChange={(event) => handleChange('birthDate', event.target.value)}
                            className="form-input"
                        />
                    </div>

                    <div className="checkbox-row">
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

                    <div className="form-field">
                        <label htmlFor="password" className="form-label">Contraseña</label>
                        <input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(event) => handleChange('password', event.target.value)}
                            required
                            className="form-input"
                        />
                    </div>

                    {/* Mensaje de error si algo falla */}
                    {errorMessage && <p className="text-danger">{errorMessage}</p>}

                    <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                        {isSubmitting ? 'Registrando...' : 'Crear cuenta'}
                    </button>
                </form>
            </div>
        </section>
    );
}