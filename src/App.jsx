import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Páginas de autenticación
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Página del dashboard
import DashboardPage from './pages/dashboard/DashboardPage';

// Páginas de inventario
import InventoryPage from './pages/inventory/InventoryPage';
import ToolDetailPage from './pages/inventory/ToolDetailPage';

// Páginas de reservas
import ReservationsPage from './pages/reservations/ReservationsPage';
import NewReservationPage from './pages/reservations/NewReservationPage';

// Página de alertas
import AlertsPage from './pages/alerts/AlertsPage';

// Página de calificaciones
import RatingsPage from './pages/ratings/RatingsPage';

// Página de reportes
import ReportsPage from './pages/reports/ReportsPage';

// Componente para el manejo de rutas
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rutas de autenticación */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          
          {/* Rutas del dashboard */}
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* Rutas de inventario */}
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/inventory/:id" element={<ToolDetailPage />} />
          
          {/* Rutas de reservas */}
          <Route path="/reservations" element={<ReservationsPage />} />
          <Route path="/reservations/new" element={<NewReservationPage />} />
          
          {/* Ruta de alertas */}
          <Route path="/alerts" element={<AlertsPage />} />
          
          {/* Ruta de calificaciones */}
          <Route path="/ratings" element={<RatingsPage />} />
          
          {/* Ruta de reportes */}
          <Route path="/reports" element={<ReportsPage />} />
          
          {/* Ruta por defecto: redirigir al login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;