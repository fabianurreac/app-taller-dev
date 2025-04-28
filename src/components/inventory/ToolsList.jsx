import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';
import ToolCard from './ToolCard';

const ToolsList = () => {
  const { tools, loading, error, loadTools } = useInventory();
  const { user } = useAuth();
  const [filteredTools, setFilteredTools] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [conditionFilter, setConditionFilter] = useState('all');

  // Verificar si el usuario es administrador
  const isAdmin = user?.role === 'admin';

  // Aplicar filtros cuando cambian los tools o los filtros
  useEffect(() => {
    filterTools();
  }, [tools, searchTerm, statusFilter, conditionFilter]);

  // Función para filtrar herramientas
  const filterTools = () => {
    let filtered = [...tools];

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(tool => 
        tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(tool => tool.status === statusFilter);
    }

    // Filtrar por condición
    if (conditionFilter !== 'all') {
      filtered = filtered.filter(tool => tool.condition === conditionFilter);
    }

    setFilteredTools(filtered);
  };

  // Función para limpiar filtros
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setConditionFilter('all');
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">Inventario de Herramientas</h2>
          {isAdmin && (
            <Link
              to="/inventory/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Agregar Herramienta
            </Link>
          )}
        </div>
        
        {/* Filtros */}
        <div className="mb-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
              Buscar
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="search"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Nombre, descripción o código"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Estado
            </label>
            <div className="mt-1">
              <select
                id="status"
                name="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              >
                <option value="all">Todos</option>
                <option value="disponible">Disponible</option>
                <option value="no_disponible">No disponible</option>
                <option value="mantenimiento">En mantenimiento</option>
              </select>
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="condition" className="block text-sm font-medium text-gray-700">
              Condición
            </label>
            <div className="mt-1">
              <select
                id="condition"
                name="condition"
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value)}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              >
                <option value="all">Todas</option>
                <option value="buen_estado">Buen estado</option>
                <option value="deterioro">Deterioro</option>
                <option value="mal_estado">Mal estado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-between mb-6">
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Limpiar filtros
          </button>
          <button
            type="button"
            onClick={loadTools}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Actualizar
          </button>
        </div>

        {/* Mostrar error si existe */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
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

        {/* Mostrar cargando */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Cargando...</span>
          </div>
        ) : (
          <>
            {/* Lista de herramientas */}
            {filteredTools.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron herramientas</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || statusFilter !== 'all' || conditionFilter !== 'all' ? 
                    'Intenta con otros filtros o limpia los filtros actuales.' : 
                    'Aún no hay herramientas registradas en el sistema.'}
                </p>
                {isAdmin && (
                  <div className="mt-6">
                    <Link
                      to="/inventory/new"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Agregar nueva herramienta
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ToolsList;