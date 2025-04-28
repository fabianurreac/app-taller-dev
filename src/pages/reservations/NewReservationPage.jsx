import React from 'react';
import { InventoryProvider } from '../../context/InventoryContext';
import ReservationForm from '../../components/reservations/ReservationForm';
import DashboardLayout from '../../components/layout/DashboardLayout';

const NewReservationPage = () => {
  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Nueva Reserva</h1>
          <p className="text-sm text-gray-500 mt-1">
            Selecciona una herramienta y escanea el código QR del trabajador
          </p>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <InventoryProvider>
              <ReservationForm />
            </InventoryProvider>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NewReservationPage;