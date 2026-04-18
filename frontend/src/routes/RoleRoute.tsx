import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../types/auth';

// Props del componente: que rol esta permitido
interface RoleRouteProps {
    allowedRole: UserRole;
}

// Esta ruta comprueba autorizacion
// Ya no basta con estar logueado, el rol tiene que ser el correcto
export default function RoleRoute ({ allowedRole }: RoleRouteProps) {
    const { user, isLoading } = useAuth();

    // Mientras se comprueba la sesion, se muestra la carga
    if (isLoading) {
        return <p>Comprobando permisos...</p>;
    }

    // Si no hay usuario, se le lleva al login
    if (!user){
        return <Navigate to="/login" replace />;
    }

    // Si el rol no coincide, redirige a una pagina de acceso denegado
    if (user.role !== allowedRole) {
        return <Navigate to="/unauthorized" replace />;
    }

    // Si tiene el rol correcto pasa
    return <Outlet />;
}