import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

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
    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top, rgba(212, 175, 55, 0.08), transparent 25%), #0f0f0f',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.25rem' }}>
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            gap: '1rem',
            flexWrap: 'wrap',
            padding: '1rem 1.25rem',
            borderRadius: '18px',
            background: 'rgba(18, 18, 18, 0.92)',
            border: '1px solid rgba(212, 175, 55, 0.15)',
            boxShadow: '0 10px 24px rgba(0, 0, 0, 0.28)',
          }}
        >
          {/* Navegación principal */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              flexWrap: 'wrap',
            }}
          >
            {/* Logo / nombre del proyecto */}
            <Link
              to="/"
              style={{
                fontSize: '1.2rem',
                fontWeight: 800,
                color: '#f5f5f5',
                textDecoration: 'none',
              }}
            >
              62 Rosas Tattoo
            </Link>

            <nav style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
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
              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ color: '#f0f0f0' }}>
                  {/* Muestra email y rol del usuario autenticado */}
                  {user?.email}
                </span>

                {/* Botón para cerrar sesión */}
                <button
                  onClick={handleLogout}
                  style={{
                    backgroundColor: '#f5f5f5',
                    color: '#111',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0.7rem 1rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <span style={{ color: '#c9c9c9' }}>Modo público</span>
            )}
          </div>
        </header>

        {/* Aquí se renderiza la página activa */}
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}