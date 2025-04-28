import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';
import { createReservation, fetchTools } from '../../supabaseClient';
import QRScanner from './QRScanner';

const ReservationForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { tools: inventoryTools, loading: inventoryLoading } = useInventory();
  
  const [selectedToolId, setSelectedToolId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  
  const [availableTools, setAvailableTools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Estados para el escáner QR
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  
  // Verificar si el usuario es administrador
  const isAdmin = user?.role === 'admin';
  
  // Obtener el ID de la herramienta de los parámetros de la URL si existe
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const toolId = params.get('tool');
    
    if (toolId) {
      setSelectedToolId(toolId);
    }
  }, [location]);
  
  // Filtrar las herramientas disponibles
  useEffect(() => {
    if (inventoryTools) {
      const filtered = inventoryTools.filter(tool => tool.status === 'disponible');
      setAvailableTools(filtered);
    }
  }, [inventoryTools]);
  
  // Manejador para el escáner QR
  const handleScanQR = () => {
    setShowQRScanner(true);
  };
  
  // Callback cuando se escanea un trabajador
  const handleWorkerScanned = (worker) => {
    setSelectedWorker(worker);
    setShowQRScanner(false);
  };
  
  // Cancelar el escaneo QR
  const handleCancelQR = () => {
    setShowQRScanner(false);
  };
  
  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedToolId || !startDate || !endDate) {
      setError('Por favor, completa todos los campos requeridos.');
      return;
    }
    
    if (isAdmin && !selectedWorker) {
      setError('Por favor, escanea el código QR del trabajador.');
      return;
    }
    
    // Verificar que la fecha de fin sea posterior a la de inicio
    if (new Date(endDate) <= new Date(startDate)) {
      setError('La fecha de devolución debe ser posterior a la fecha de inicio.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Crear el objeto de reserva
      const reservation = {
        tool_id: selectedToolId,
        user_id: isAdmin ? selectedWorker.id : user.id, // Si es admin, usa el trabajador escaneado
        start_date: startDate,
        end_date: endDate,
        notes: notes,
        status: isAdmin ? 'activa' : 'pendiente' // Si es admin, la reserva comienza activa
      };
      
      // Guardar la reserva en la base de datos
      const { error: submitError } = await createReservation(reservation);
      
      if (submitError) {
        setError(submitError.message || 'Error al crear la reserva');
      } else {
        // Redirigir a la lista de reservas
        navigate('/reservations');
      }
    } catch (err) {
      setError(err.message || 'Error al crear la reserva');
    } finally {
      setLoading(false);
    }
  };
  
  // Obtener el mínimo para la fecha de inicio (hoy)
  const today = new Date().toISOString().split('T')[0];
  
  // Obtener el mínimo para la fecha de fin (la fecha de inicio seleccionada o hoy)
  const minEndDate = startDate || today;

  // Nombre de la herramienta seleccionada para mostrar en la confirmación
  const selectedToolName = selectedToolId 
    ? availableTools.find(tool => tool.id.toString() === selectedToolId.toString())?.name || 'Herramienta seleccionada'
    : '';

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Nueva Reserva de Herramienta
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          {isAdmin 
            ? 'Escanea el código QR del trabajador y asigna una herramienta.' 
            : 'Completa el formulario para solicitar una herramienta.'}
        </p>
      </div>
      
      {/* Mostrar error si existe */}
      {error && (
        <div className="mx-4 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="border-t border-gray-200">
        {inventoryLoading ? (
          <div className="flex justify-center items-center py-12">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Cargando herramientas disponibles...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
            {/* Selección de herramienta */}
            <div className="mb-6">
              <label htmlFor="tool_id" className="block text-sm font-medium text-gray-700">
                Herramienta <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <select
                  id="tool_id"
                  name="tool_id"
                  required
                  value={selectedToolId}
                  onChange={(e) => setSelectedToolId(e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="">-- Seleccionar herramienta --</option>
                  {availableTools.map((tool) => (
                    <option key={tool.id} value={tool.id}>
                      {tool.name} {tool.code ? `(${tool.code})` : ''}
                    </option>
                  ))}
                </select>
                {availableTools.length === 0 && (
                  <p className="mt-2 text-sm text-red-600">
                    No hay herramientas disponibles para reservar en este momento.
                  </p>
                )}
              </div>
            </div>
            
            {/* Selección de trabajador mediante QR (solo para administradores) */}
            {isAdmin && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700">
                  Trabajador <span className="text-red-500">*</span>
                </label>
                
                {selectedWorker ? (
                  <div className="mt-2 p-4 bg-gray-50 rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{selectedWorker.name}</p>
                        <p className="text-sm text-gray-500">Cédula: {selectedWorker.identification || 'No registrada'}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedWorker(null)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Cambiar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-1">
                    <button
                      type="button"
                      onClick={handleScanQR}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1v-2a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                      Escanear Código QR del Trabajador
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Fecha de inicio */}
            <div className="mb-6">
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                Fecha de inicio <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="date"
                  name="start_date"
                  id="start_date"
                  required
                  min={today}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            {/* Fecha de fin */}
            <div className="mb-6">
              <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                Fecha de devolución <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="date"
                  name="end_date"
                  id="end_date"
                  required
                  min={minEndDate}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            {/* Notas */}
            <div className="mb-6">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notas adicionales
              </label>
              <div className="mt-1">
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Detalles sobre el uso de la herramienta o cualquier información adicional..."
                />
              </div>
            </div>
            
            {/* Panel de confirmación cuando hay trabajador y herramienta seleccionados */}
            {isAdmin && selectedWorker && selectedToolId && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Resumen de la reserva</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500">Herramienta</p>
                    <p className="text-sm text-gray-900">{selectedToolName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Trabajador</p>
                    <p className="text-sm text-gray-900">{selectedWorker.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Cédula</p>
                    <p className="text-sm text-gray-900">{selectedWorker.identification || 'No registrada'}</p>
                  </div>
                  {startDate && (
                    <div>
                      <p className="text-xs font-medium text-gray-500">Fecha inicio</p>
                      <p className="text-sm text-gray-900">{new Date(startDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  {endDate && (
                    <div>
                      <p className="text-xs font-medium text-gray-500">Fecha devolución</p>
                      <p className="text-sm text-gray-900">{new Date(endDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Botones */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/reservations')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || availableTools.length === 0 || (isAdmin && !selectedWorker)}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${(loading || availableTools.length === 0 || (isAdmin && !selectedWorker)) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Guardando...' : 'Completar Reserva'}
              </button>
            </div>
          </form>
        )}
      </div>
      
      {/* Modal para el escáner QR */}
      {showQRScanner && (
        <QRScanner 
          onUserScanned={handleWorkerScanned} 
          onCancel={handleCancelQR} 
        />
      )}
    </div>
  );
};

export default ReservationForm;