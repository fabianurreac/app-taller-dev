import React from 'react';
import ToolForm from '../../components/inventory/ToolForm';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

const NewToolPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Redirigir si no es administrador
  if (!isAdmin) {
    return <Navigate to="/inventory" replace />;
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Agregar Nueva Herramienta</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <ToolForm />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NewToolPage;