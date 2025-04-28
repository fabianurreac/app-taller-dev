import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { supabase } from '../supabaseClient';

// Crear el contexto
const AuthContext = createContext();

// Hook personalizado para usar el contexto
export const useAuth = () => {
  return useContext(AuthContext);
};

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  
  // Usar useRef para prevenir actualizaciones infinitas
  const authListenerRef = useRef();

  // Comprobar el estado de autenticación cuando se monta el componente
  useEffect(() => {
    if (authInitialized) return;
    
    // Función para inicializar la autenticación
    const initializeAuth = async () => {
      try {
        // Obtener la sesión actual
        const { data } = await supabase.auth.getSession();
        setUser(data?.session?.user || null);
        
        // Configurar el listener para cambios de autenticación
        const { data: authListener } = supabase.auth.onAuthStateChange(
          (event, session) => {
            setUser(session?.user || null);
          }
        );
        
        // Guardar referencia del listener
        authListenerRef.current = authListener;
        setAuthInitialized(true);
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Limpiar el listener cuando se desmonte el componente
    return () => {
      if (authListenerRef.current?.subscription) {
        authListenerRef.current.subscription.unsubscribe();
      }
    };
  }, [authInitialized]);

  // Función para iniciar sesión
  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  // Función para cerrar sesión
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (err) {
      return { error: err };
    }
  };

  // Valor del contexto
  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;