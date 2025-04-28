import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Si está cargando, mostramos un indicador de carga
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-12 w-12 text-red-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-500">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barra de navegación móvil */}
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Sidebar y contenido principal */}
      <div className="md:flex">
        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Contenido principal */}
        <main className="flex-1 md:ml-64">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;