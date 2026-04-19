import { Link } from 'react-router-dom';

// Footer reutilizable para toda la aplicación
// Se muestra en todas las páginas dentro del layout principal
export default function Footer() {
    return (
        <footer className="app-footer">
            <div className="app-footer-content">
                <div className="app-footer-brand">
                    <h3 className="app-footer-title">62 Rosas Tattoo</h3>
                    <p className="app-footer-text">
                        Proyecto de la AA2 de Desarrollo de Interfaces.
                    </p>
                </div>

                <div className="app-footer-links">
                    <h4 className="app-footer-subtitle">Navegación</h4>

                    <nav className="app-footer-nav">
                        <Link to="/">Inicio</Link>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Registro</Link>
                    </nav>
                </div>
            </div>

            <div className="app-footer-bottom">
                <p className="app-footer-copy">
                    © 2026 62 Rosas Tattoo · Andrea Fernández
                </p>
            </div>
        </footer>
    );
}