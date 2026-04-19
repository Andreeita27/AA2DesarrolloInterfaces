import { Link } from 'react-router-dom';

// Página a la que redirigimos cuando el usuario está logueado
// pero no tiene permiso para entrar a una ruta concreta.
export default function UnauthorizedPage() {
    return (
        <section className="center-card">
            <div className="card">
                <p className="eyebrow">Permisos</p>
                <h1 className="page-title">Acceso no autorizado</h1>
                <p className="page-subtitle">
                    No tienes permisos para acceder a esta página.
                </p>

                <Link to="/" className="btn btn-primary btn-link">
                    Volver al inicio
                </Link>
            </div>
        </section>
    );
}