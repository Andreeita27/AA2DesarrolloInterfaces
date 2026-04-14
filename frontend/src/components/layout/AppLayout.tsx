import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Layout principal de la aplicación.
// Contiene cabecera común y el Outlet donde se renderizan las páginas.
export default function AppLayout() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1rem' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        {/* Navegación principal */}
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

        {/* Zona de usuario */}
        <div>
          {isAuthenticated ? (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span>
                {/* Muestra nombre y rol del usuario autenticado */}
                {user?.name} ({user?.role})
              </span>

              {/* Botón para cerrar sesión */}
              <button onClick={logout}>Cerrar sesión</button>
            </div>
          ) : (
            <span>No autenticado</span>
          )}
        </div>
      </header>

      {/* Aquí se renderiza la página activa */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}