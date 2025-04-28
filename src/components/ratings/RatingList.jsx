import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';

const RatingList = () => {
  const { user } = useAuth();
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar si el usuario es administrador
  const isAdmin = user?.role === 'admin';

  // Cargar calificaciones cuando se monta el componente
  useEffect(() => {
    loadRatings();
  }, []);

  // Función para cargar las calificaciones
  const loadRatings = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('ratings')
        .select(`
          *,
          tools (*),
          users:user_id (*),
          reservations (*),
          admins:rated_by (*)
        `)
        .order('created_at', { ascending: false });

      // Si no es admin, filtrar solo las calificaciones del usuario actual
      if (!isAdmin && user) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;
      
      if (error) {
        setError(error.message);
      } else {
        setRatings(data || []);
        setError(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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

  // Renderizar estrellas para la calificación
  const renderRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg
          key={i}
          className={`h-5 w-5 ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
      );
    }
    return stars;
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
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Historial de Calificaciones
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {isAdmin ? 'Todas las calificaciones de herramientas devueltas.' : 'Tus calificaciones recibidas por el uso de herramientas.'}
          </p>
        </div>
        <button
          onClick={loadRatings}
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

      {/* Lista de calificaciones */}
      <div className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Cargando calificaciones...</span>
          </div>
        ) : ratings.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay calificaciones</h3>
            <p className="mt-1 text-sm text-gray-500">
              Aún no hay calificaciones registradas en el sistema.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {ratings.map((rating) => (
              <li key={rating.id} className="p-4 hover:bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {rating.tools?.image_url ? (
                        <img 
                          className="h-12 w-12 rounded-md object-cover" 
                          src={rating.tools.image_url} 
                          alt={rating.tools.name} 
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-md bg-gray-200 flex items-center justify-center">
                          <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {rating.tools?.name || 'Herramienta desconocida'}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Usuario: {rating.users?.name || 'Desconocido'}
                      </p>
                      <div className="flex items-center mt-1">
                        <span className="text-sm text-gray-500 mr-2">Calificación del usuario:</span>
                        <div className="flex">
                          {renderRatingStars(rating.user_rating)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 sm:mt-0 flex flex-col items-end">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getConditionColor(rating.tool_condition)}`}>
                      {formatCondition(rating.tool_condition)}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      Calificado el {formatDate(rating.created_at)}
                    </p>
                    {isAdmin && (
                      <p className="text-sm text-gray-500">
                        Por: {rating.admins?.name || 'Administrador'}
                      </p>
                    )}
                  </div>
                </div>
                {rating.comments && (
                  <div className="mt-3 text-sm text-gray-700 bg-gray-50 p-3 rounded">
                    <p className="font-medium mb-1">Comentarios:</p>
                    <p>{rating.comments}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RatingList;