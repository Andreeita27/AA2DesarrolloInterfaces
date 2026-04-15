import { useAuth } from '../contexts/AuthContext';

// Dashboard provisional para usuarios con rol ADMIN.
export default function AdminDashboardPage() {
    const { user } = useAuth();

    return (
        <section>
            <h1>Dashboard administrador</h1>
            <p>Bienvenida, {user?.name}</p>
            <p>Aquí irá la tabla con filtros, ordenación y resúmenes.</p>
        </section>
    );
}