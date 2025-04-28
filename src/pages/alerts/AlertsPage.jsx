import React from 'react';
import AlertsList from '../../components/alerts/AlertsList';
import DashboardLayout from '../../components/layout/DashboardLayout';

const AlertsPage = () => {
  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Alertas de Herramientas</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <AlertsList />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AlertsPage;