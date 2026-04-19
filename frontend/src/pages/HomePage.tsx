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
        <section className="home-section">
            {/* HERO PRINCIPAL */}
            <section
                className="home-hero"
                style={{
                    backgroundImage: `linear-gradient(
                        rgba(0, 0, 0, 0.65),
                        rgba(0, 0, 0, 0.75)
                    ), url(${heroImage})`,
                }}
            >
                <div className="home-hero-content">
                    <p className="eyebrow">Estudio de tatuajes · Gestión de citas</p>

                    <h1 className="home-hero-title">62 Rosas Tattoo</h1>

                    <p className="home-hero-text">
                        Plataforma web para gestionar citas, consultar reservas y
                        organizar el trabajo del estudio.
                    </p>

                    <div className="home-actions">
                        {/* Si no hay sesión, invitamos a iniciar sesión o registrarse */}
                        {!isAuthenticated && (
                            <>
                                <Link to="/login" className="btn btn-primary btn-link">
                                    Iniciar sesión
                                </Link>

                                <Link to="/register" className="btn btn-secondary btn-link">
                                    Crear cuenta
                                </Link>
                            </>
                        )}

                        {/* Si ya hay sesión, llevamos al dashboard correspondiente */}
                        {isAuthenticated && user?.role === 'CLIENT' && (
                            <Link
                                to="/client/dashboard"
                                className="btn btn-primary btn-link"
                            >
                                Ir a mi dashboard
                            </Link>
                        )}

                        {isAuthenticated && user?.role === 'ADMIN' && (
                            <Link
                                to="/admin/dashboard"
                                className="btn btn-primary btn-link"
                            >
                                Ir al panel admin
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            {/* GALERÍA */}
            <section>
                <div className="home-gallery-header">
                    <p className="eyebrow">Galería</p>
                    <h2 className="page-title">Estilo visual del estudio</h2>
                </div>

                <div className="home-gallery-grid">
                    {galleryImages.map((imageUrl, index) => (
                        <article key={index} className="home-gallery-card">
                            <img
                                src={imageUrl}
                                alt={`Imagen decorativa del estudio ${index + 1}`}
                                className="home-gallery-image"
                            />

                            <div className="home-gallery-body">
                                <h3 className="home-gallery-title">Diseño {index + 1}</h3>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </section>
    );
}