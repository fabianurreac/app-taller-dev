import React from 'react';
import { InventoryProvider } from '../../context/InventoryContext';
import ToolsList from '../../components/inventory/ToolsList';
import DashboardLayout from '../../components/layout/DashboardLayout';

const InventoryPage = () => {
  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Inventario de Herramientas</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <InventoryProvider>
              <ToolsList />
            </InventoryProvider>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InventoryPage;