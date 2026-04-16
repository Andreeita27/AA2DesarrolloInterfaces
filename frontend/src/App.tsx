import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AppLayout from './components/layout/AppLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ClientDashboardPage from './pages/ClientDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';
import AppointmentDetailPage from './pages/AppointmentDetailPage';

// Componente principal de la aplicación
export default function App() {
  return (
    // El provider envuelve toda la app para que el contexto esté disponible
    <AuthProvider>
      {/* BrowserRouter activa el sistema de rutas */}
      <BrowserRouter>
        <Routes>
          {/* Layout común para todas las páginas */}
          <Route element={<AppLayout />}>
            {/* Rutas públicas */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Rutas que requieren estar autenticado */}
            <Route element={<ProtectedRoute />}>
              {/* Rutas exclusivas para CLIENT */}
              <Route element={<RoleRoute allowedRole="CLIENT" />}>
                <Route
                  path="/client/dashboard"
                  element={<ClientDashboardPage />}
                />
              </Route>

              {/* Rutas exclusivas para ADMIN */}
              <Route element={<RoleRoute allowedRole="ADMIN" />}>
                <Route
                  path="/admin/dashboard"
                  element={<AdminDashboardPage />}
                />
              </Route>
              <Route path="/appointments/:id" element={<AppointmentDetailPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
