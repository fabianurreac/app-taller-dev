import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import UserReport from '../../components/reports/UserReport';
import ToolReport from '../../components/reports/ToolReport';
import AdvancedReport from '../../components/reports/AdvancedReport';
import DashboardLayout from '../../components/layout/DashboardLayout';

const ReportsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('basic');
  
  // Detectar la pestaña seleccionada a partir de los parámetros de URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    
    if (tab && (tab === 'basic' || tab === 'advanced')) {
      setActiveTab(tab);
    } else if (location.search && !tab) {
      // Si hay búsqueda pero no hay parámetro tab, añadirlo
      navigate('/reports?tab=basic', { replace: true });
    }
  }, [location, navigate]);
  
  // Función para cambiar de pestaña
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/reports?tab=${tab}`);
  };
  
  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Reportes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Analiza el uso de herramientas y los usuarios más activos del sistema.
          </p>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
          {/* Pestañas de navegación */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => handleTabChange('basic')}
                className={`${
                  activeTab === 'basic'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm sm:px-4`}
                aria-current={activeTab === 'basic' ? 'page' : undefined}
              >
                Reportes Básicos
              </button>
              <button
                onClick={() => handleTabChange('advanced')}
                className={`${
                  activeTab === 'advanced'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm sm:px-4 ml-8`}
                aria-current={activeTab === 'advanced' ? 'page' : undefined}
              >
                Reportes Avanzados
              </button>
            </nav>
          </div>
          
          {/* Contenido de las pestañas */}
          <div className="py-4">
            {activeTab === 'basic' ? (
              <div className="grid grid-cols-1 gap-6">
                <UserReport />
                <ToolReport />
              </div>
            ) : (
              <AdvancedReport />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReportsPage;