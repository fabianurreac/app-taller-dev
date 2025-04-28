import React, { useState, useEffect } from 'react';
import { fetchUserReport } from '../../supabaseClient';

const UserReport = () => {
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos de usuarios cuando se monta el componente
  useEffect(() => {
    loadUserReport();
  }, []);

  // Función para cargar los datos del reporte
  const loadUserReport = async () => {
    setLoading(true);
    try {
      const { data, error } = await fetchUserReport();
      
      if (error) {
        setError(error.message || 'Error al cargar el reporte de usuarios');
      } else {
        // Tomamos los 10 usuarios con más reservas
        setUserData(data?.slice(0, 10) || []);
        setError(null);
      }
    } catch (err) {
      setError('Error inesperado al cargar el reporte');
      console.error('Error inesperado en UserReport:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calcular el porcentaje para la barra de progreso
  const calculatePercentage = (count) => {
    if (userData.length === 0) return 0;
    const maxCount = userData[0].count || 1; // El primer usuario tiene la mayor cantidad
    return (count / maxCount) * 100;
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Usuarios con más reservas
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Listado de los usuarios que más solicitan herramientas.
          </p>
        </div>
        <button
          onClick={loadUserReport}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Actualizar
        </button>
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

      {/* Lista de usuarios */}
      <div className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Cargando datos...</span>
          </div>
        ) : userData.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay datos disponibles</h3>
            <p className="mt-1 text-sm text-gray-500">
              No hay suficientes datos para generar este reporte.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {userData.map((user, index) => (
              <li key={user.user_id} className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-medium">
                      {index + 1}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.users?.name || 'Usuario desconocido'}</div>
                      <div className="text-sm text-gray-500">{user.users?.email || 'Sin email'}</div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {user.count} reservas
                  </div>
                </div>
                <div className="mt-2">
                  <div className="bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${calculatePercentage(user.count)}%` }}
                    ></div>
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

export default UserReport;