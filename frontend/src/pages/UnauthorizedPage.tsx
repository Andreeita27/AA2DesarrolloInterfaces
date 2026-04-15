// Página a la que redirigimos cuando el usuario está logueado
// pero no tiene permiso para entrar a una ruta concreta.
export default function UnauthorizedPage() {
    return (
        <section>
            <h1>Acceso no autorizado</h1>
            <p>No tienes permisos para acceder a esta página.</p>
        </section>
    );
}