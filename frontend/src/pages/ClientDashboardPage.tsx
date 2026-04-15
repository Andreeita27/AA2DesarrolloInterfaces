import { useAuth } from '../contexts/AuthContext';

// Dashboard provisional para usuarios con rol CLIENT
export default function ClientDashboardPage() {
    const { user } = useAuth();

    return (
        <section>
            <h1>Dashboard cliente</h1>
            <p>Bienvenida, {user?.email}</p>
            <p>Más adelante aquí pongo tarjetas resumen y tabla de citas.</p>
        </section>
    );
}