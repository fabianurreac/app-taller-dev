import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';
import { fetchToolById, updateTool, supabase } from '../../supabaseClient';

const ToolDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToolById, updateToolStatus, loading, error } = useInventory();
  const { user } = useAuth();
  
  const [tool, setTool] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Verificar si el usuario es administrador
  const isAdmin = user?.role === 'admin';

  // Cargar la herramienta cuando cambia el ID
  useEffect(() => {
    const loadTool = async () => {
      const { data, error } = await getToolById(id);
      if (error) {
        console.error('Error al cargar la herramienta:', error);
      } else {
        setTool(data);
      }
    };

    if (id) {
      loadTool();
    }
  }, [id, getToolById]);

  // Función para actualizar el estado de la herramienta
  const handleUpdateStatus = async (newStatus) => {
    setUpdating(true);
    setUpdateError(null);
    
    try {
      const { error } = await updateToolStatus(id, { status: newStatus });
      
      if (error) {
        setUpdateError(error.message || 'Error al actualizar el estado');
      } else {
        // Actualizar el estado local
        setTool({ ...tool, status: newStatus });
      }
    } catch (err) {
      setUpdateError(err.message || 'Error al actualizar el estado');
    } finally {
      setUpdating(false);
    }
  };

  // Función para actualizar la condición de la herramienta
  const handleUpdateCondition = async (newCondition) => {
    setUpdating(true);
    setUpdateError(null);
    
    try {
      const { error } = await updateToolStatus(id, { condition: newCondition });
      
      if (error) {
        setUpdateError(error.message || 'Error al actualizar la condición');
      } else {
        // Actualizar el estado local
        setTool({ ...tool, condition: newCondition });
      }
    } catch (err) {
      setUpdateError(err.message || 'Error al actualizar la condición');
    } finally {
      setUpdating(false);
    }
  };

  // Función para eliminar la herramienta
  const handleDelete = async () => {
    if (!isAdmin) return;
    
    setDeleting(true);
    try {
      // Verificar si la herramienta tiene reservas activas
      const { data: activeReservations, error: checkError } = await supabase
        .from('reservations')
        .select('id')
        .eq('tool_id', id)
        .in('status', ['pendiente', 'activa']);
      
      if (checkError) {
        throw checkError;
      }
      
      if (activeReservations && activeReservations.length > 0) {
        throw new Error('No se puede eliminar la herramienta porque tiene reservas activas o pendientes.');
      }

      // Eliminar la herramienta
      const { error: deleteError } = await supabase
        .from('tools')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        throw deleteError;
      }

      // Redirigir al inventario
      navigate('/inventory');
    } catch (err) {
      setUpdateError(err.message || 'Error al eliminar la herramienta');
      setDeleteConfirm(false);
    } finally {
      setDeleting(false);
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

  // Obtener el color del estado
  const getStatusColor = (status) => {
    switch (status) {
      case 'disponible':
        return 'bg-green-100 text-green-800';
      case 'no_disponible':
        return 'bg-red-100 text-red-800';
      case 'mantenimiento':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtener el color del estado de condición
  const getConditionColor = (condition) => {
    switch (condition) {
      case 'buen_estado':
        return 'bg-green-100 text-green-800';
      case 'deterioro':
        return 'bg-yellow-100 text-yellow-800';
      case 'mal_estado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Formatear el nombre para mostrar
  const formatStatus = (status) => {
    const statusMap = {
      'disponible': 'Disponible',
      'no_disponible': 'No disponible',
      'mantenimiento': 'En mantenimiento'
    };
    return statusMap[status] || status;
  };

  const formatCondition = (condition) => {
    const conditionMap = {
      'buen_estado': 'Buen estado',
      'deterioro': 'Deterioro',
      'mal_estado': 'Mal estado'
    };
    return conditionMap[condition] || condition;
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      {/* Encabezado */}
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Detalle de Herramienta
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Información completa y gestión de la herramienta.
          </p>
        </div>
        <div className="flex space-x-3">
          {isAdmin && (
            <>
              <button
                type="button"
                onClick={() => navigate(`/inventory/edit/${id}`)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirm(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Eliminar
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => navigate('/inventory')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Volver
          </button>
        </div>
      </div>

      {/* Modal de confirmación para eliminar */}
      {deleteConfirm && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Eliminar herramienta
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      ¿Estás seguro de que deseas eliminar esta herramienta? Esta acción no se puede deshacer.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:ml-10 sm:pl-4 sm:flex">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDelete}
                  className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:w-auto sm:text-sm"
                >
                  {deleting ? 'Eliminando...' : 'Eliminar'}
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setDeleteConfirm(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 bg-white text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mostrar error si existe */}
      {(error || updateError) && (
        <div className="mx-4 mt-4 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error || updateError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Contenido */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Cargando...</span>
        </div>
      ) : tool ? (
        <div>
          {/* Imagen de la herramienta */}
          <div className="bg-gray-100 p-4">
            <div className="max-w-md mx-auto">
              {tool.image_url ? (
                <img 
                  src={tool.image_url} 
                  alt={tool.name} 
                  className="h-64 w-full object-cover rounded-lg shadow-md"
                />
              ) : (
                <div className="h-64 w-full rounded-lg shadow-md bg-gray-200 flex items-center justify-center">
                  <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Información de la herramienta */}
          <div className="border-t border-gray-200">
            <dl>
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50">
                <dt className="text-sm font-medium text-gray-500">Nombre</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{tool.name}</dd>
              </div>
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Código</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{tool.code || 'N/A'}</dd>
              </div>
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50">
                <dt className="text-sm font-medium text-gray-500">Descripción</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{tool.description}</dd>
              </div>
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Estado</dt>
                <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tool.status)}`}>
                    {formatStatus(tool.status)}
                  </span>
                  
                  {isAdmin && (
                    <div className="mt-2">
                      <div className="text-sm text-gray-500 mb-1">Cambiar estado:</div>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          disabled={updating || tool.status === 'disponible'}
                          onClick={() => handleUpdateStatus('disponible')}
                          className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded bg-green-100 text-green-800 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${updating || tool.status === 'disponible' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          Disponible
                        </button>
                        <button
                          type="button"
                          disabled={updating || tool.status === 'no_disponible'}
                          onClick={() => handleUpdateStatus('no_disponible')}
                          className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded bg-red-100 text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${updating || tool.status === 'no_disponible' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          No disponible
                        </button>
                        <button
                          type="button"
                          disabled={updating || tool.status === 'mantenimiento'}
                          onClick={() => handleUpdateStatus('mantenimiento')}
                          className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded bg-yellow-100 text-yellow-800 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 ${updating || tool.status === 'mantenimiento' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          En mantenimiento
                        </button>
                      </div>
                    </div>
                  )}
                </dd>
              </div>
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50">
                <dt className="text-sm font-medium text-gray-500">Condición</dt>
                <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConditionColor(tool.condition)}`}>
                    {formatCondition(tool.condition)}
                  </span>
                  
                  {isAdmin && (
                    <div className="mt-2">
                      <div className="text-sm text-gray-500 mb-1">Cambiar condición:</div>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          disabled={updating || tool.condition === 'buen_estado'}
                          onClick={() => handleUpdateCondition('buen_estado')}
                          className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded bg-green-100 text-green-800 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${updating || tool.condition === 'buen_estado' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          Buen estado
                        </button>
                        <button
                          type="button"
                          disabled={updating || tool.condition === 'deterioro'}
                          onClick={() => handleUpdateCondition('deterioro')}
                          className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded bg-yellow-100 text-yellow-800 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 ${updating || tool.condition === 'deterioro' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          Deterioro
                        </button>
                        <button
                          type="button"
                          disabled={updating || tool.condition === 'mal_estado'}
                          onClick={() => handleUpdateCondition('mal_estado')}
                          className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded bg-red-100 text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${updating || tool.condition === 'mal_estado' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          Mal estado
                        </button>
                      </div>
                    </div>
                  )}
                </dd>
              </div>
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Fecha de adquisición</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatDate(tool.acquisition_date)}</dd>
              </div>
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50">
                <dt className="text-sm font-medium text-gray-500">Fecha último mantenimiento</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatDate(tool.last_maintenance_date)}</dd>
              </div>
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Categoría</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{tool.category || 'No especificada'}</dd>
              </div>
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50">
                <dt className="text-sm font-medium text-gray-500">Ubicación</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{tool.location || 'No especificada'}</dd>
              </div>
              {tool.notes && (
                <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Notas adicionales</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{tool.notes}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Botones de acción */}
          <div className="px-4 py-5 sm:px-6 bg-gray-50 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate(`/reservations/new?tool=${tool.id}`)}
              disabled={tool.status !== 'disponible' || updating}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${(tool.status !== 'disponible' || updating) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Reservar herramienta
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Herramienta no encontrada</h3>
          <p className="mt-1 text-sm text-gray-500">
            No se pudo encontrar la herramienta solicitada.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => navigate('/inventory')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Volver al inventario
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolDetail;