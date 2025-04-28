import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabaseClient';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTools: 0,
    availableTools: 0,
    activeReservations: 0,
    alerts: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentReservations, setRecentReservations] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Memoizar la función para evitar recreaciones en cada renderizado
  const loadDashboardData = useCallback(async () => {
    if (dataLoaded) return; // Evitar cargas repetidas
    
    setLoading(true);
    try {
      // Obtener estadísticas
      const { data: tools, error: toolsError } = await supabase
        .from('tools')
        .select('id, status');
      
      const { data: reservations, error: reservationsError } = await supabase
        .from('reservations')
        .select('id, status')
        .eq('status', 'activa');
      
      const { data: alerts, error: alertsError } = await supabase
        .from('alerts')
        .select('id');
      
      if (!toolsError && !reservationsError && !alertsError) {
        const availableTools = tools ? tools.filter(tool => tool.status === 'disponible') : [];
        
        setStats({
          totalTools: tools ? tools.length : 0,
          availableTools: availableTools.length,
          activeReservations: reservations ? reservations.length : 0,
          alerts: alerts ? alerts.length : 0
        });
      }

      // Obtener reservas recientes
      const { data: recent, error: recentError } = await supabase
        .from('reservations')
        .select(`
          *,
          tools (*),
          users:user_id (*)
        `)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (!recentError) {
        setRecentReservations(recent || []);
      }

      // Obtener alertas recientes
      const { data: recentAlertData, error: recentAlertError } = await supabase
        .from('alerts')
        .select(`
          *,
          tools (*)
        `)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (!recentAlertError) {
        setRecentAlerts(recentAlertData || []);
      }
      
      setDataLoaded(true);
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, [dataLoaded]);

  // Usar useEffect para cargar datos solo una vez
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Función explícita para actualizar datos que puede ser llamada desde botones
  const handleRefreshData = () => {
    setDataLoaded(false); // Permitir nueva carga
    loadDashboardData();
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Bienvenido{user?.name ? `, ${user.name}` : ''}. Aquí tienes un resumen del sistema.
          </p>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Estadísticas */}
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total de herramientas */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total de Herramientas
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {loading ? '...' : stats.totalTools}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link to="/inventory" className="font-medium text-red-600 hover:text-red-900">
                    Ver todas
                  </Link>
                </div>
              </div>
            </div>

            {/* Herramientas disponibles */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Herramientas Disponibles
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {loading ? '...' : stats.availableTools}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link to="/inventory" className="font-medium text-red-600 hover:text-red-900">
                    Ver disponibles
                  </Link>
                </div>
              </div>
            </div>

            {/* Reservas activas */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Reservas Activas
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {loading ? '...' : stats.activeReservations}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link to="/reservations" className="font-medium text-red-600 hover:text-red-900">
                    Ver reservas
                  </Link>
                </div>
              </div>
            </div>

            {/* Alertas */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Alertas Activas
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {loading ? '...' : stats.alerts}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link to="/alerts" className="font-medium text-red-600 hover:text-red-900">
                    Ver alertas
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Contenedor de botón de actualización */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleRefreshData}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Actualizar datos
            </button>
          </div>

          {/* Contenido adicional del dashboard */}
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Reservas recientes */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Reservas recientes
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Últimas 5 reservas registradas.
                  </p>
                </div>
                <Link
                  to="/reservations"
                  className="text-sm font-medium text-red-600 hover:text-red-500"
                >
                  Ver todas
                </Link>
              </div>
              <div className="border-t border-gray-200">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Cargando datos...</span>
                  </div>
                ) : recentReservations.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-500">No hay reservas recientes.</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {recentReservations.map((reservation) => (
                      <li key={reservation.id} className="px-4 py-4">
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {reservation.tools?.name || 'Herramienta desconocida'}
                            </p>
                            <p className="text-sm text-gray-500">
                              Reservada por: {reservation.users?.name || 'Usuario desconocido'}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              Fecha: {formatDate(reservation.created_at)}
                            </p>
                          </div>
                          <div>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              reservation.status === 'activa' ? 'bg-green-100 text-green-800' : 
                              reservation.status === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : 
                              reservation.status === 'completada' ? 'bg-blue-100 text-blue-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {reservation.status?.charAt(0).toUpperCase() + reservation.status?.slice(1)}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Alertas recientes */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Alertas recientes
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Últimas 5 alertas registradas.
                  </p>
                </div>
                <Link
                  to="/alerts"
                  className="text-sm font-medium text-red-600 hover:text-red-500"
                >
                  Ver todas
                </Link>
              </div>
              <div className="border-t border-gray-200">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Cargando datos...</span>
                  </div>
                ) : recentAlerts.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-500">No hay alertas recientes.</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {recentAlerts.map((alert) => (
                      <li key={alert.id} className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {alert.tools?.name || 'Herramienta desconocida'}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {alert.description}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              Fecha: {formatDate(alert.created_at)}
                            </p>
                          </div>
                          <div>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              alert.priority === 'alta' || alert.priority === 'crítica' ? 
                              'bg-red-100 text-red-800' : 
                              alert.priority === 'media' ? 
                              'bg-yellow-100 text-yellow-800' : 
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {alert.priority?.charAt(0)?.toUpperCase() + alert.priority?.slice(1)}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="mt-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Acciones rápidas
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Accede rápidamente a las principales funcionalidades.
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  <Link
                    to="/reservations/new"
                    className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-red-500"
                  >
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="absolute inset-0" aria-hidden="true" />
                      <p className="text-sm font-medium text-gray-900">
                        Nueva Reserva
                      </p>
                    </div>
                  </Link>

                  <Link
                    to="/inventory"
                    className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-red-500"
                  >
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="absolute inset-0" aria-hidden="true" />
                      <p className="text-sm font-medium text-gray-900">
                        Gestionar Inventario
                      </p>
                    </div>
                  </Link>

                  <Link
                    to="/alerts"
                    className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-red-500"
                  >
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="absolute inset-0" aria-hidden="true" />
                      <p className="text-sm font-medium text-gray-900">
                        Ver Alertas
                      </p>
                    </div>
                  </Link>

                  <Link
                    to="/reports"
                    className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-red-500"
                  >
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="absolute inset-0" aria-hidden="true" />
                      <p className="text-sm font-medium text-gray-900">
                        Reportes
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;