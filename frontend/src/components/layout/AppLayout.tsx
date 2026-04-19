import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Footer from './Footer';

// Layout principal de la aplicación.
// Contiene cabecera común y el Outlet donde se renderizan las páginas.
export default function AppLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Al cerrar sesión limpiamos el contexoto y mandamos al usuario a inicio
  // Así evito que se quede guardada una ruta protegida como destino de vuelta
  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="app-shell">
      <div className="app-container">
        <header className="app-header">
          {/* IZQUIERDA: logo + navegación */}
          <div className="app-header-left">
            {/* Logo */}
            <Link to="/" className="app-logo">
              62 Rosas Tattoo
            </Link>

            {/* Navegación principal */}
            <nav className="app-nav">
              <Link to="/">Inicio</Link>

              {/* Si es cliente */}
              {isAuthenticated && user?.role === 'CLIENT' && (
                <Link to="/client/dashboard">Dashboard cliente</Link>
              )}

              {/* Si es admin */}
              {isAuthenticated && user?.role === 'ADMIN' && (
                <Link to="/admin/dashboard">Dashboard admin</Link>
              )}
            </nav>
          </div>

          {/* DERECHA: acciones */}
          <div className="app-actions">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="btn btn-secondary btn-link">
                  Iniciar sesión
                </Link>

                <Link to="/register" className="btn btn-primary btn-link">
                  Crear cuenta
                </Link>
              </>
            ) : (
              <div className="app-user-zone">
                <span className="app-user-email">{user?.email}</span>

                <button onClick={handleLogout} className="btn btn-primary">
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Aquí se renderiza la página activa */}
        <main>
          <Outlet />
        </main>

        {/* Footer reutilizable de toda la aplicación */}
        <Footer />
      </div>
    </div>
  );
}