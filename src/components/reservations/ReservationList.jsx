import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchReservations, updateTool } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';

const ReservationList = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(false);

  // Verificar si el usuario es administrador
  const isAdmin = user?.role === 'admin';

  // Cargar reservas cuando se monta el componente
  useEffect(() => {
    loadReservations();
  }, []);

  // Función para cargar las reservas
  const loadReservations = async () => {
    setLoading(true);
    try {
      const { data, error } = await fetchReservations();
      
      if (error) {
        setError(error.message);
      } else {
        setReservations(data || []);
        setFilteredReservations(data || []);
        setError(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros cuando cambia el estado del filtro
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredReservations(reservations);
    } else {
      setFilteredReservations(reservations.filter(res => res.status === statusFilter));
    }
  }, [statusFilter, reservations]);

  // Función para actualizar el estado de una reserva
  const handleUpdateReservationStatus = async (reservationId, newStatus) => {
    setActionLoading(true);
    try {
      // Actualizar el estado de la reserva en la base de datos
      // Nota: en un caso real, esto sería una llamada a la API para actualizar la reserva
      
      // En este ejemplo, actualizamos localmente
      const updatedReservations = reservations.map(res => 
        res.id === reservationId ? { ...res, status: newStatus } : res
      );
      
      setReservations(updatedReservations);
      
      // Si la reserva se marca como completada, actualizar el estado de la herramienta a disponible
      if (newStatus === 'completada') {
        const reservation = reservations.find(res => res.id === reservationId);
        if (reservation) {
          await updateTool(reservation.tool_id, { status: 'disponible' });
        }
      }
      
      // Si la reserva se marca como activa, actualizar el estado de la herramienta a no disponible
      if (newStatus === 'activa') {
        const reservation = reservations.find(res => res.id === reservationId);
        if (reservation) {
          await updateTool(reservation.tool_id, { status: 'no_disponible' });
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Función para obtener el color del estado
  const getStatusColor = (status) => {
    switch (status) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'activa':
        return 'bg-green-100 text-green-800';
      case 'completada':
        return 'bg-blue-100 text-blue-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Reservas de Herramientas
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Listado de todas las reservas de herramientas.
          </p>
        </div>
        <Link
          to="/reservations/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Nueva Reserva
        </Link>
      </div>

      {/* Filtros */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center">
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mr-3">
            Filtrar por estado:
          </label>
          <select
            id="status-filter"
            name="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block sm:text-sm border-gray-300 rounded-md"
          >
            <option value="all">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="activa">Activa</option>
            <option value="completada">Completada</option>
            <option value="cancelada">Cancelada</option>
          </select>
          <button
            type="button"
            onClick={loadReservations}
            className="ml-4 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Actualizar
          </button>
        </div>
      </div>

      {/* Mostrar error si existe */}
      {error && (
        <div className="mx-4 mt-4 bg-red-50 border-l-4 border-red-400 p-4">
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

      {/* Tabla de reservas */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Cargando reservas...</span>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay reservas</h3>
            <p className="mt-1 text-sm text-gray-500">
              {statusFilter !== 'all' ? 
                `No hay reservas con estado: ${statusFilter}.` : 
                'Aún no hay reservas registradas en el sistema.'}
            </p>
            <div className="mt-6">
              <Link
                to="/reservations/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Crear nueva reserva
              </Link>
            </div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Herramienta
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha inicio
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha devolución
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {reservation.tools?.image_url ? (
                          <img 
                            className="h-10 w-10 rounded-md object-cover" 
                            src={reservation.tools.image_url} 
                            alt={reservation.tools.name} 
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {reservation.tools?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {reservation.tools?.code || 'Sin código'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{reservation.users?.name || 'Usuario desconocido'}</div>
                    <div className="text-sm text-gray-500">{reservation.users?.email || 'Sin email'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(reservation.start_date)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(reservation.end_date)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(reservation.status)}`}>
                      {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {isAdmin && (
                      <div className="flex justify-end space-x-2">
                        {reservation.status === 'pendiente' && (
                          <>
                            <button
                              onClick={() => handleUpdateReservationStatus(reservation.id, 'activa')}
                              disabled={actionLoading}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Aprobar
                            </button>
                            <button
                              onClick={() => handleUpdateReservationStatus(reservation.id, 'cancelada')}
                              disabled={actionLoading}
                              className="text-red-600 hover:text-red-900"
                            >
                              Cancelar
                            </button>
                          </>
                        )}
                        {reservation.status === 'activa' && (
                          <button
                            onClick={() => handleUpdateReservationStatus(reservation.id, 'completada')}
                            disabled={actionLoading}
                            className="text-green-600 hover:text-green-900"
                          >
                            Completar
                          </button>
                        )}
                      </div>
                    )}
                    {!isAdmin && reservation.status === 'pendiente' && (
                      <button
                        onClick={() => handleUpdateReservationStatus(reservation.id, 'cancelada')}
                        disabled={actionLoading}
                        className="text-red-600 hover:text-red-900"
                      >
                        Cancelar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ReservationList;