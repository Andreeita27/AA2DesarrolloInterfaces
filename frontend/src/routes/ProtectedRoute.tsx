import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Esta ruta protegida comprueba si el usuario está autenticado, y si no lo esta lo manda al login
export default function ProtectedRoute() {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    // Mientras se comprueba si existe sesión guardada, se muestra carga
    if (isLoading) {
        return <p>Cargando sesión...</p>;
    }

    // Si no hay sesión, redirige al login y guarda la ruta para volver luego
    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // Si está autenticado puede pasar
    return <Outlet />;
}