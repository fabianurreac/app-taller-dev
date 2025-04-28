import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchAlerts } from '../../supabaseClient';
import AlertBadge from './AlertBadge';

const AlertsList = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Cargar alertas cuando se monta el componente
  useEffect(() => {
    loadAlerts();
  }, []);

  // Función para cargar las alertas
  const loadAlerts = async () => {
    setLoading(true);
    try {
      const { data, error } = await fetchAlerts();
      
      if (error) {
        setError(error.message);
      } else {
        setAlerts(data || []);
        setFilteredAlerts(data || []);
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
    if (priorityFilter === 'all') {
      setFilteredAlerts(alerts);
    } else {
      setFilteredAlerts(alerts.filter(alert => alert.priority === priorityFilter));
    }
  }, [priorityFilter, alerts]);

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
            Alertas de Herramientas
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Herramientas que requieren atención debido a su estado.
          </p>
        </div>
        <button
          onClick={loadAlerts}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Actualizar
        </button>
      </div>

      {/* Filtros */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center">
          <label htmlFor="priority-filter" className="block text-sm font-medium text-gray-700 mr-3">
            Filtrar por prioridad:
          </label>
          <select
            id="priority-filter"
            name="priority-filter"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block sm:text-sm border-gray-300 rounded-md"
          >
            <option value="all">Todas</option>
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
            <option value="crítica">Crítica</option>
          </select>
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

      {/* Lista de alertas */}
      <div className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Cargando alertas...</span>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay alertas</h3>
            <p className="mt-1 text-sm text-gray-500">
              {priorityFilter !== 'all' ? 
                `No hay alertas con prioridad: ${priorityFilter}.` : 
                'Todas las herramientas están en buen estado.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredAlerts.map((alert) => (
              <li key={alert.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {alert.tools?.image_url ? (
                      <img 
                        className="h-12 w-12 rounded-md object-cover" 
                        src={alert.tools.image_url} 
                        alt={alert.tools.name} 
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-md bg-gray-200 flex items-center justify-center">
                        <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {alert.tools?.name || 'Herramienta desconocida'}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {alert.description}
                    </p>
                    <div className="mt-1 flex items-center">
                      <AlertBadge priority={alert.priority} />
                      <span className="ml-2 text-xs text-gray-500">
                        Creada el {formatDate(alert.created_at)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Link
                      to={`/inventory/${alert.tool_id}`}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Ver herramienta
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AlertsList;