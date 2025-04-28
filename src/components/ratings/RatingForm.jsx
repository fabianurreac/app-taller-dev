import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createRating, fetchReservations, updateTool } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';

const RatingForm = () => {
  const { reservationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [reservation, setReservation] = useState(null);
  const [toolCondition, setToolCondition] = useState('buen_estado');
  const [userRating, setUserRating] = useState(5);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Verificar si el usuario es administrador
  const isAdmin = user?.role === 'admin';

  // Cargar la reserva cuando se monta el componente
  useEffect(() => {
    const loadReservation = async () => {
      setLoading(true);
      try {
        const { data, error } = await fetchReservations();
        
        if (error) {
          setError(error.message);
        } else {
          // Encontrar la reserva específica
          const foundReservation = data.find(res => res.id === parseInt(reservationId));
          
          if (foundReservation) {
            setReservation(foundReservation);
            setError(null);
          } else {
            setError('No se encontró la reserva solicitada.');
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (reservationId) {
      loadReservation();
    }
  }, [reservationId]);

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAdmin) {
      setError('Solo los administradores pueden calificar las devoluciones.');
      return;
    }
    
    if (!reservation || !toolCondition || !userRating) {
      setError('Por favor, completa todos los campos requeridos.');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Crear el objeto de calificación
      const rating = {
        reservation_id: reservation.id,
        tool_id: reservation.tool_id,
        user_id: reservation.user_id,
        tool_condition: toolCondition,
        user_rating: userRating,
        comments: comments,
        rated_by: user.id,
        created_at: new Date().toISOString()
      };
      
      // Guardar la calificación en la base de datos
      const { error: ratingError } = await createRating(rating);
      
      if (ratingError) {
        setError(ratingError.message || 'Error al guardar la calificación');
      } else {
        // Actualizar el estado de la herramienta según la calificación
        const { error: toolError } = await updateTool(reservation.tool_id, { 
          condition: toolCondition,
          status: 'disponible', // La herramienta vuelve a estar disponible
          last_maintenance_date: toolCondition === 'mal_estado' ? new Date().toISOString() : undefined
        });
        
        if (toolError) {
          setError(toolError.message || 'Error al actualizar el estado de la herramienta');
        } else {
          // Actualizar el estado de la reserva a completada
          const { error: reservationError } = await fetch(`/api/reservations/${reservation.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'completada' })
          }).then(res => res.json());
          
          if (reservationError) {
            setError(reservationError.message || 'Error al actualizar el estado de la reserva');
          } else {
            // Redirigir a la lista de reservas
            navigate('/reservations');
          }
        }
      }
    } catch (err) {
      setError(err.message || 'Error al procesar la calificación');
    } finally {
      setSubmitting(false);
    }
  };

  // Si el usuario no es admin, mostrar mensaje
  if (!isAdmin) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Solo los administradores pueden calificar las devoluciones de herramientas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Calificación de Devolución
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Evalúa el estado de la herramienta y al usuario que la utilizó.
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
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Cargando datos de la reserva...</span>
          </div>
        ) : !reservation ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Reserva no encontrada</h3>
            <p className="mt-1 text-sm text-gray-500">
              No se pudo encontrar la reserva solicitada.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => navigate('/reservations')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Volver a las reservas
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
            {/* Información de la reserva */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Detalles de la reserva</h4>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <p className="block text-sm font-medium text-gray-700">Herramienta</p>
                  <p className="mt-1 text-sm text-gray-900">{reservation.tools?.name || 'Desconocida'}</p>
                </div>
                <div className="sm:col-span-3">
                  <p className="block text-sm font-medium text-gray-700">Usuario</p>
                  <p className="mt-1 text-sm text-gray-900">{reservation.users?.name || 'Desconocido'}</p>
                </div>
                <div className="sm:col-span-3">
                  <p className="block text-sm font-medium text-gray-700">Fecha de inicio</p>
                  <p className="mt-1 text-sm text-gray-900">{new Date(reservation.start_date).toLocaleDateString('es-ES')}</p>
                </div>
                <div className="sm:col-span-3">
                  <p className="block text-sm font-medium text-gray-700">Fecha de devolución</p>
                  <p className="mt-1 text-sm text-gray-900">{new Date(reservation.end_date).toLocaleDateString('es-ES')}</p>
                </div>
              </div>
            </div>
            
            {/* Condición de la herramienta */}
            <div className="mb-6">
              <label htmlFor="tool_condition" className="block text-sm font-medium text-gray-700">
                Estado de la herramienta <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <select
                  id="tool_condition"
                  name="tool_condition"
                  required
                  value={toolCondition}
                  onChange={(e) => setToolCondition(e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="buen_estado">Buen estado</option>
                  <option value="deterioro">Deterioro</option>
                  <option value="mal_estado">Mal estado</option>
                </select>
              </div>
              {toolCondition === 'mal_estado' && (
                <p className="mt-2 text-sm text-yellow-600">
                  <svg className="inline-block h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Se registrará automáticamente como fecha de último mantenimiento el día de hoy.
                </p>
              )}
            </div>
            
            {/* Calificación del usuario */}
            <div className="mb-6">
              <label htmlFor="user_rating" className="block text-sm font-medium text-gray-700">
                Calificación del usuario <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <select
                  id="user_rating"
                  name="user_rating"
                  required
                  value={userRating}
                  onChange={(e) => setUserRating(parseInt(e.target.value))}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="5">5 - Excelente</option>
                  <option value="4">4 - Muy bueno</option>
                  <option value="3">3 - Bueno</option>
                  <option value="2">2 - Regular</option>
                  <option value="1">1 - Malo</option>
                </select>
              </div>
              <div className="mt-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      className="focus:outline-none"
                    >
                      <svg
                        className={`h-6 w-6 ${star <= userRating ? 'text-yellow-400' : 'text-gray-300'}`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Comentarios */}
            <div className="mb-6">
              <label htmlFor="comments" className="block text-sm font-medium text-gray-700">
                Comentarios
              </label>
              <div className="mt-1">
                <textarea
                  id="comments"
                  name="comments"
                  rows={3}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Comentarios sobre el estado de la herramienta o el uso por parte del usuario..."
                />
              </div>
            </div>
            
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
                disabled={submitting}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {submitting ? 'Guardando...' : 'Guardar calificación'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RatingForm;