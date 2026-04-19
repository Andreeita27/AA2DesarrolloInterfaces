import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Aquí uso imágenes alojadas en Cloudinary
export default function HomePage() {
    const { isAuthenticated, user } = useAuth();

    const heroImage =
        'https://res.cloudinary.com/dcxm3wvdf/image/upload/v1776591585/WhatsApp_Image_2026-04-19_at_11.39.16_1_yikwbz.jpg';

    const galleryImages = [
        'https://res.cloudinary.com/dcxm3wvdf/image/upload/v1773770277/62rosas/tattoos/oyjw1nboven6zr0hvugq.jpg',
        'https://res.cloudinary.com/dcxm3wvdf/image/upload/v1773769936/62rosas/tattoos/huipvra5ekkg6gd6n8pg.jpg',
        'https://res.cloudinary.com/dcxm3wvdf/image/upload/v1773769871/62rosas/tattoos/dbgliz48gvwe2mh08jjc.jpg',
    ];

    return (
        <section style={{ display: 'grid', gap: '2rem' }}>
            {/* HERO PRINCIPAL */}
            <section
                style={{
                    position: 'relative',
                    minHeight: '420px',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '3rem',
                    backgroundImage: `linear-gradient(
                        rgba(0, 0, 0, 0.65),
                        rgba(0, 0, 0, 0.75)
                    ), url(${heroImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: '1px solid rgba(212, 175, 55, 0.25)',
                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.35)',
                }}
            >
                <div style={{ maxWidth: '650px' }}>
                    <p
                        style={{
                            margin: '0 0 0.8rem 0',
                            color: '#d4af37',
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                        }}
                    >
                        Estudio de tatuajes · Gestión de citas
                    </p>

                    <h1
                        style={{
                            margin: '0 0 1rem 0',
                            fontSize: '3rem',
                            lineHeight: 1.1,
                        }}
                    >
                        62 Rosas Tattoo
                    </h1>

                    <p
                        style={{
                            margin: '0 0 1.5rem 0',
                            fontSize: '1.1rem',
                            lineHeight: 1.7,
                            color: '#f1f1f1',
                        }}
                    >
                        Plataforma web para gestionar citas, consultar reservas y
                        organizar el trabajo del estudio.
                    </p>

                    <div
                        style={{
                            display: 'flex',
                            gap: '1rem',
                            flexWrap: 'wrap',
                        }}
                    >
                        {/* Si no hay sesión, invitamos a iniciar sesión o registrarse */}
                        {!isAuthenticated && (
                            <>
                                <Link
                                    to="/login"
                                    style={primaryButtonStyle}
                                >
                                    Iniciar sesión
                                </Link>

                                <Link
                                    to="/register"
                                    style={secondaryButtonStyle}
                                >
                                    Crear cuenta
                                </Link>
                            </>
                        )}

                        {/* Si ya hay sesión, llevamos al dashboard correspondiente */}
                        {isAuthenticated && user?.role === 'CLIENT' && (
                            <Link
                                to="/client/dashboard"
                                style={primaryButtonStyle}
                            >
                                Ir a mi dashboard
                            </Link>
                        )}

                        {isAuthenticated && user?.role === 'ADMIN' && (
                            <Link
                                to="/admin/dashboard"
                                style={primaryButtonStyle}
                            >
                                Ir al panel admin
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            {/* GALERÍA */}
            <section>
                <div style={{ marginBottom: '1rem' }}>
                    <p
                        style={{
                            color: '#d4af37',
                            margin: 0,
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                        }}
                    >
                        Galería
                    </p>

                    <h2 style={{ margin: '0.4rem 0 0 0', fontSize: '2rem' }}>
                        Estilo visual del estudio
                    </h2>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: '1rem',
                    }}
                >
                    {galleryImages.map((imageUrl, index) => (
                        <article
                            key={index}
                            style={{
                                background: '#171717',
                                borderRadius: '18px',
                                overflow: 'hidden',
                                border: '1px solid rgba(212, 175, 55, 0.18)',
                                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.25)',
                            }}
                        >
                            <img
                                src={imageUrl}
                                alt={`Imagen decorativa del estudio ${index + 1}`}
                                style={{
                                    width: '100%',
                                    height: '280px',
                                    objectFit: 'cover',
                                    display: 'block',
                                }}
                            />

                            <div style={{ padding: '1rem' }}>
                                <h3
                                    style={{
                                        margin: '0 0 0.5rem 0',
                                        fontSize: '1.1rem',
                                    }}
                                >
                                    Diseño {index + 1}
                                </h3>

                                <p
                                    style={{
                                        margin: 0,
                                        color: '#d7d7d7',
                                        lineHeight: 1.6,
                                    }}
                                >
                                </p>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </section>
    );
}

// Estilos reutilizables para no repetir mucho código inline
const primaryButtonStyle: React.CSSProperties = {
    display: 'inline-block',
    backgroundColor: '#d4af37',
    color: '#111',
    padding: '0.85rem 1.2rem',
    borderRadius: '10px',
    fontWeight: 700,
    textDecoration: 'none',
};

const secondaryButtonStyle: React.CSSProperties = {
    display: 'inline-block',
    backgroundColor: 'transparent',
    color: '#f5f5f5',
    padding: '0.85rem 1.2rem',
    borderRadius: '10px',
    fontWeight: 700,
    textDecoration: 'none',
    border: '1px solid rgba(255,255,255,0.25)',
};