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
          {/* Navegación principal */}
          <div className="app-header-left">
            {/* Logo / nombre del proyecto */}
            <Link to="/" className="app-logo">
              62 Rosas Tattoo
            </Link>

            <nav className="app-nav">
              <Link to="/">Inicio</Link>

              {/* Si no hay sesión, se muestra login y registro */}
              {!isAuthenticated && (
                <>
                  <Link to="/login">Login</Link>
                  <Link to="/register">Registro</Link>
                </>
              )}

              {/* Si es cliente, enseña su dashboard */}
              {isAuthenticated && user?.role === 'CLIENT' && (
                <Link to="/client/dashboard">Dashboard cliente</Link>
              )}

              {/* Si es admin, enseña su dashboard */}
              {isAuthenticated && user?.role === 'ADMIN' && (
                <Link to="/admin/dashboard">Dashboard admin</Link>
              )}
            </nav>
          </div>

          {/* Zona de usuario */}
          <div>
            {isAuthenticated ? (
              <div className="app-user-zone">
                <span className="app-user-email">
                  {/* Muestra email y rol del usuario autenticado */}
                  {user?.email}
                </span>

                {/* Botón para cerrar sesión */}
                <button onClick={handleLogout} className="btn btn-light">
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <span className="app-user-public">Modo público</span>
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