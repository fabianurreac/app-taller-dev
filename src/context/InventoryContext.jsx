import React, { createContext, useState, useEffect, useContext } from 'react';
import { fetchTools, fetchToolById, updateTool } from '../supabaseClient';

// Crear el contexto
const InventoryContext = createContext();

// Hook personalizado para usar el contexto
export const useInventory = () => {
  return useContext(InventoryContext);
};

// Proveedor del contexto
export const InventoryProvider = ({ children }) => {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar herramientas cuando se monta el componente
  useEffect(() => {
    loadTools();
  }, []);

  // Cargar todas las herramientas
  const loadTools = async () => {
    setLoading(true);
    try {
      const { data, error } = await fetchTools();
      
      if (error) {
        setError(error.message);
      } else {
        setTools(data || []);
        setError(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Obtener una herramienta por ID
  const getToolById = async (id) => {
    setLoading(true);
    try {
      const { data, error } = await fetchToolById(id);
      
      if (error) {
        setError(error.message);
        return { error };
      }
      
      return { data };
    } catch (err) {
      setError(err.message);
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  // Actualizar una herramienta
  const updateToolStatus = async (id, updates) => {
    try {
      const { data, error } = await updateTool(id, updates);
      
      if (error) {
        setError(error.message);
        return { error };
      }
      
      // Actualizar la lista de herramientas
      setTools(tools.map(tool => 
        tool.id === id ? { ...tool, ...updates } : tool
      ));
      
      return { data };
    } catch (err) {
      setError(err.message);
      return { error: err };
    }
  };

  // Valor del contexto
  const value = {
    tools,
    loading,
    error,
    loadTools,
    getToolById,
    updateToolStatus,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};