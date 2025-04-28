import React, { useState, useEffect } from 'react';
import { fetchToolUsageReport, fetchUserUsageReport } from '../../supabaseClient';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const AdvancedReport = () => {
  const [toolUsageData, setToolUsageData] = useState([]);
  const [userUsageData, setUserUsageData] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Colores para los gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#8DD1E1', '#82CA9D', '#A4DE6C', '#D0ED57', '#FFC658'];
  
  // Cargar datos cuando cambian las fechas
  useEffect(() => {
    loadReports();
  }, []);

  // Cargar los reportes con los filtros aplicados
  const loadReports = async () => {
    setLoading(true);
    try {
      const formattedStartDate = startDate ? startDate : null;
      const formattedEndDate = endDate ? endDate : null;
      
      // Cargar reporte de uso de herramientas
      const { data: toolData, error: toolError } = await fetchToolUsageReport(formattedStartDate, formattedEndDate);
      
      if (toolError) {
        setError(toolError.message || 'Error al cargar el reporte de herramientas');
      } else {
        setToolUsageData(toolData || []);
      }
      
      // Cargar reporte de uso por usuario
      const { data: userData, error: userError } = await fetchUserUsageReport(formattedStartDate, formattedEndDate);
      
      if (userError) {
        setError(userError.message || 'Error al cargar el reporte de usuarios');
      } else {
        setUserUsageData(userData || []);
      }
      
      if (!toolError && !userError) {
        setError(null);
      }
    } catch (err) {
      setError('Error inesperado al cargar los reportes');
      console.error('Error en la carga de reportes avanzados:', err);
    } finally {
      setLoading(false);
    }
  };

  // Preparar datos para los gráficos
  const prepareChartData = (data, valueKey, limit = 5) => {
    if (!data || data.length === 0) return [];
    
    // Tomar los primeros N elementos
    const topItems = data.slice(0, limit);
    
    // Calcular el total para "Otros"
    const remainingItems = data.slice(limit);
    const otherValue = remainingItems.reduce((sum, item) => sum + item[valueKey], 0);
    
    // Crear los datos para el gráfico
    const chartData = topItems.map(item => ({
      name: item.name,
      value: item[valueKey]
    }));
    
    // Agregar "Otros" si hay más elementos
    if (remainingItems.length > 0) {
      chartData.push({
        name: 'Otros',
        value: otherValue
      });
    }
    
    return chartData;
  };

  // Manejar cambio en el rango de fechas
  const handleDateRangeChange = () => {
    loadReports();
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Reportes Avanzados
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Análisis detallado del uso de herramientas y actividad de usuarios.
        </p>
      </div>
      
      {/* Filtros de fecha */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">
              Fecha inicio
            </label>
            <input
              type="date"
              id="start-date"
              name="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">
              Fecha fin
            </label>
            <input
              type="date"
              id="end-date"
              name="end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <button
              type="button"
              onClick={handleDateRangeChange}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Aplicar filtro
            </button>
          </div>
          <div>
            <button
              type="button"
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setTimeout(loadReports, 0);
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Limpiar filtro
            </button>
          </div>
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

      {/* Contenido de los reportes */}
      <div className="px-4 py-5 sm:p-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Cargando reportes...</span>
          </div>
        ) : (
          <>
            {/* Sección: Tiempo de uso de herramientas */}
            <div className="mb-8">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Tiempo total de uso de herramientas (días)</h4>
              
              {toolUsageData.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded">
                  <p className="text-sm text-gray-500">No hay datos disponibles para este período.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Gráfico: Tiempo de uso (días) */}
                  <div className="bg-gray-50 rounded p-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2 text-center">Distribución de tiempo de uso</h5>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={prepareChartData(toolUsageData, 'totalDays')}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {prepareChartData(toolUsageData, 'totalDays').map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} días`, 'Tiempo de uso']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  {/* Gráfico: Frecuencia de uso (reservas) */}
                  <div className="bg-gray-50 rounded p-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2 text-center">Frecuencia de reservas</h5>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={prepareChartData(toolUsageData, 'reservationCount')}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {prepareChartData(toolUsageData, 'reservationCount').map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} reservas`, 'Cantidad']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Tabla con las herramientas más y menos utilizadas */}
              {toolUsageData.length > 0 && (
                <div className="mt-6 border rounded overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-y border-gray-200">
                    {/* Herramientas más utilizadas */}
                    <div>
                      <h5 className="px-4 py-2 bg-gray-50 text-sm font-medium text-gray-700">
                        Herramientas más utilizadas
                      </h5>
                      <ul className="divide-y divide-gray-200">
                        {toolUsageData.slice(0, 5).map((tool) => (
                          <li key={tool.tool_id} className="px-4 py-3 flex justify-between items-center">
                            <span className="text-sm text-gray-900">{tool.name}</span>
                            <span className="text-sm text-gray-500">{tool.totalDays} días</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Herramientas menos utilizadas */}
                    <div>
                      <h5 className="px-4 py-2 bg-gray-50 text-sm font-medium text-gray-700">
                        Herramientas menos utilizadas
                      </h5>
                      <ul className="divide-y divide-gray-200">
                        {toolUsageData.slice(-5).reverse().map((tool) => (
                          <li key={tool.tool_id} className="px-4 py-3 flex justify-between items-center">
                            <span className="text-sm text-gray-900">{tool.name}</span>
                            <span className="text-sm text-gray-500">{tool.totalDays} días</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Sección: Uso por usuarios */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Uso de herramientas por usuario</h4>
              
              {userUsageData.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded">
                  <p className="text-sm text-gray-500">No hay datos disponibles para este período.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Gráfico: Tiempo de uso por usuario */}
                  <div className="bg-gray-50 rounded p-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2 text-center">Tiempo de uso por usuario (días)</h5>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={prepareChartData(userUsageData, 'totalDays')}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {prepareChartData(userUsageData, 'totalDays').map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} días`, 'Tiempo de uso']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  {/* Gráfico: Reservas por usuario */}
                  <div className="bg-gray-50 rounded p-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2 text-center">Reservas por usuario</h5>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={prepareChartData(userUsageData, 'reservationCount')}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {prepareChartData(userUsageData, 'reservationCount').map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} reservas`, 'Cantidad']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Tabla con los usuarios más y menos activos */}
              {userUsageData.length > 0 && (
                <div className="mt-6 border rounded overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-y border-gray-200">
                    {/* Usuarios más activos */}
                    <div>
                      <h5 className="px-4 py-2 bg-gray-50 text-sm font-medium text-gray-700">
                        Usuarios más activos
                      </h5>
                      <ul className="divide-y divide-gray-200">
                        {userUsageData.slice(0, 5).map((user) => (
                          <li key={user.user_id} className="px-4 py-3 flex justify-between items-center">
                            <span className="text-sm text-gray-900">{user.name}</span>
                            <span className="text-sm text-gray-500">{user.totalDays} días / {user.reservationCount} reservas</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Usuarios menos activos */}
                    <div>
                      <h5 className="px-4 py-2 bg-gray-50 text-sm font-medium text-gray-700">
                        Usuarios menos activos
                      </h5>
                      <ul className="divide-y divide-gray-200">
                        {userUsageData.slice(-5).reverse().map((user) => (
                          <li key={user.user_id} className="px-4 py-3 flex justify-between items-center">
                            <span className="text-sm text-gray-900">{user.name}</span>
                            <span className="text-sm text-gray-500">{user.totalDays} días / {user.reservationCount} reservas</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdvancedReport;