import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchToolById, createTool, updateTool } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';

const ToolForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    image_url: '',
    status: 'disponible',
    condition: 'buen_estado',
    category_id: '',
    location_id: '',
    acquisition_date: '',
    last_maintenance_date: '',
    notes: ''
  });
  
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Redirigir si no es administrador
  useEffect(() => {
    if (!isAdmin) {
      navigate('/inventory');
    }
  }, [isAdmin, navigate]);

  // Cargar datos para edición
  useEffect(() => {
    const loadTool = async () => {
      if (isEditing) {
        setLoading(true);
        try {
          const { data, error } = await fetchToolById(id);
          if (error) {
            throw error;
          }
          
          if (data) {
            // Formatear fechas para el formato de entrada HTML
            const formattedData = {
              ...data,
              acquisition_date: data.acquisition_date ? new Date(data.acquisition_date).toISOString().split('T')[0] : '',
              last_maintenance_date: data.last_maintenance_date ? new Date(data.last_maintenance_date).toISOString().split('T')[0] : ''
            };
            setFormData(formattedData);
          }
        } catch (err) {
          setError(err.message || 'Error al cargar la herramienta');
        } finally {
          setLoading(false);
        }
      }
    };

    // Cargar categorías y ubicaciones
    const loadCategoriesAndLocations = async () => {
      setLoading(true);
      try {
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        const { data: locationsData, error: locationsError } = await supabase
          .from('locations')
          .select('*')
          .order('name');

        if (categoriesError) throw categoriesError;
        if (locationsError) throw locationsError;

        setCategories(categoriesData || []);
        setLocations(locationsData || []);
      } catch (err) {
        setError(err.message || 'Error al cargar datos auxiliares');
      } finally {
        setLoading(false);
      }
    };

    loadTool();
    loadCategoriesAndLocations();
  }, [id, isEditing]);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      let result;
      
      if (isEditing) {
        // Actualizar herramienta existente
        result = await updateTool(id, formData);
      } else {
        // Crear nueva herramienta
        result = await createTool(formData);
      }

      if (result.error) {
        throw result.error;
      }

      setSuccess(true);
      
      // Redirigir después de un breve retraso
      setTimeout(() => {
        navigate(`/inventory/${isEditing ? id : result.data[0].id}`);
      }, 1500);
    } catch (err) {
      setError(err.message || 'Error al guardar la herramienta');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return null; // No mostrar nada mientras redirige
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {isEditing ? 'Editar Herramienta' : 'Nueva Herramienta'}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {isEditing ? 'Actualiza la información de la herramienta.' : 'Completa los campos para agregar una nueva herramienta.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/inventory')}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancelar
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

      {/* Mostrar mensaje de éxito */}
      {success && (
        <div className="mx-4 mt-4 bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                {isEditing ? 'Herramienta actualizada correctamente' : 'Herramienta creada correctamente'}
              </p>
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
            <span>Cargando...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              {/* Nombre */}
              <div className="sm:col-span-3">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              {/* Código */}
              <div className="sm:col-span-3">
                <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                  Código
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="code"
                    id="code"
                    value={formData.code || ''}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              {/* Descripción */}
              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Descripción <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    required
                    value={formData.description || ''}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              {/* URL de imagen */}
              <div className="sm:col-span-6">
                <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">
                  URL de imagen
                </label>
                <div className="mt-1">
                  <input
                    type="url"
                    name="image_url"
                    id="image_url"
                    value={formData.image_url || ''}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>
              </div>

              {/* Estado */}
              <div className="sm:col-span-3">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Estado <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <select
                    id="status"
                    name="status"
                    required
                    value={formData.status}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="disponible">Disponible</option>
                    <option value="no_disponible">No disponible</option>
                    <option value="mantenimiento">En mantenimiento</option>
                  </select>
                </div>
              </div>

              {/* Condición */}
              <div className="sm:col-span-3">
                <label htmlFor="condition" className="block text-sm font-medium text-gray-700">
                  Condición <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <select
                    id="condition"
                    name="condition"
                    required
                    value={formData.condition}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="buen_estado">Buen estado</option>
                    <option value="deterioro">Deterioro</option>
                    <option value="mal_estado">Mal estado</option>
                  </select>
                </div>
              </div>

              {/* Categoría */}
              <div className="sm:col-span-3">
                <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
                  Categoría
                </label>
                <div className="mt-1">
                  <select
                    id="category_id"
                    name="category_id"
                    value={formData.category_id || ''}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="">-- Seleccione una categoría --</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Ubicación */}
              <div className="sm:col-span-3">
                <label htmlFor="location_id" className="block text-sm font-medium text-gray-700">
                  Ubicación
                </label>
                <div className="mt-1">
                  <select
                    id="location_id"
                    name="location_id"
                    value={formData.location_id || ''}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="">-- Seleccione una ubicación --</option>
                    {locations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fecha de adquisición */}
              <div className="sm:col-span-3">
                <label htmlFor="acquisition_date" className="block text-sm font-medium text-gray-700">
                  Fecha de adquisición
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="acquisition_date"
                    id="acquisition_date"
                    value={formData.acquisition_date || ''}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              {/* Fecha último mantenimiento */}
              <div className="sm:col-span-3">
                <label htmlFor="last_maintenance_date" className="block text-sm font-medium text-gray-700">
                  Fecha último mantenimiento
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="last_maintenance_date"
                    id="last_maintenance_date"
                    value={formData.last_maintenance_date || ''}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              {/* Notas */}
              <div className="sm:col-span-6">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notas adicionales
                </label>
                <div className="mt-1">
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={formData.notes || ''}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Observaciones importantes sobre la herramienta..."
                  />
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="pt-5 flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/inventory')}
                className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Guardando..." : (isEditing ? "Actualizar" : "Crear")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ToolForm;