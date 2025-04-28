import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

// Crear una instancia del cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ----- FUNCIONES DE AUTENTICACIÓN -----

// Iniciar sesión con email y contraseña
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  return { data, error };
};

// Registrar un nuevo usuario
export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });
  
  return { data, error };
};

// Enviar email para recuperar contraseña
export const resetPassword = async (email) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  
  return { data, error };
};

// Cerrar sesión
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// ----- FUNCIONES DE HERRAMIENTAS (TOOLS) -----

// Obtener todas las herramientas
export const fetchTools = async () => {
  const { data, error } = await supabase
    .from('tools')
    .select('*')
    .order('created_at', { ascending: false });
  
  return { data, error };
};

// Agregar estas funciones a supabaseClient.js

// Función para obtener el reporte de tiempo de uso por herramienta
export const fetchToolUsageReport = async (startDate = null, endDate = null) => {
  try {
    // Construimos la consulta base
    let query = supabase
      .from('reservations')
      .select(`
        id,
        tool_id,
        start_date,
        end_date,
        status,
        tools(name, description, image_url)
      `);
    
    // Aplicamos filtros de fechas si se proporcionan
    if (startDate) {
      query = query.gte('start_date', startDate);
    }
    
    if (endDate) {
      query = query.lte('end_date', endDate);
    }
    
    // Solo consideramos reservas completadas o activas
    query = query.in('status', ['completada', 'activa']);
    
    // Ejecutamos la consulta
    const { data: reservations, error } = await query;
    
    if (error) {
      throw error;
    }
    
    // Procesamos los datos para calcular tiempo de uso
    const toolUsageMap = {};
    const currentDate = new Date();
    
    reservations.forEach(reservation => {
      const toolId = reservation.tool_id;
      const tool = reservation.tools || {};
      
      // Calculamos la duración en días
      const startDate = new Date(reservation.start_date);
      // Para reservas activas, usamos la fecha actual como fecha fin
      const endDate = reservation.status === 'activa' 
        ? currentDate 
        : new Date(reservation.end_date);
      
      const durationMs = endDate - startDate;
      const durationDays = Math.max(Math.ceil(durationMs / (1000 * 60 * 60 * 24)), 1);
      
      if (!toolUsageMap[toolId]) {
        toolUsageMap[toolId] = {
          tool_id: toolId,
          name: tool.name || 'Herramienta sin nombre',
          description: tool.description || 'Sin descripción',
          image_url: tool.image_url,
          totalDays: 0,
          reservationCount: 0
        };
      }
      
      toolUsageMap[toolId].totalDays += durationDays;
      toolUsageMap[toolId].reservationCount += 1;
    });
    
    // Convertimos a array y ordenamos por tiempo total
    const result = Object.values(toolUsageMap).sort((a, b) => b.totalDays - a.totalDays);
    
    return { data: result, error: null };
  } catch (err) {
    console.error('Error en el reporte de uso de herramientas:', err);
    return { data: null, error: err };
  }
};

// Función para obtener el reporte de uso por usuario
export const fetchUserUsageReport = async (startDate = null, endDate = null) => {
  try {
    // Construimos la consulta base
    let query = supabase
      .from('reservations')
      .select(`
        id,
        user_id,
        start_date,
        end_date,
        status,
        users:profiles(name, email)
      `);
    
    // Aplicamos filtros de fechas si se proporcionan
    if (startDate) {
      query = query.gte('start_date', startDate);
    }
    
    if (endDate) {
      query = query.lte('end_date', endDate);
    }
    
    // Solo consideramos reservas completadas o activas
    query = query.in('status', ['completada', 'activa']);
    
    // Ejecutamos la consulta
    const { data: reservations, error } = await query;
    
    if (error) {
      throw error;
    }
    
    // Procesamos los datos para calcular uso por usuario
    const userUsageMap = {};
    const currentDate = new Date();
    
    reservations.forEach(reservation => {
      const userId = reservation.user_id;
      const user = reservation.users || {};
      
      // Calculamos la duración en días
      const startDate = new Date(reservation.start_date);
      // Para reservas activas, usamos la fecha actual como fecha fin
      const endDate = reservation.status === 'activa' 
        ? currentDate 
        : new Date(reservation.end_date);
      
      const durationMs = endDate - startDate;
      const durationDays = Math.max(Math.ceil(durationMs / (1000 * 60 * 60 * 24)), 1);
      
      if (!userUsageMap[userId]) {
        userUsageMap[userId] = {
          user_id: userId,
          name: user.name || 'Usuario desconocido',
          email: user.email || 'Sin email',
          totalDays: 0,
          reservationCount: 0
        };
      }
      
      userUsageMap[userId].totalDays += durationDays;
      userUsageMap[userId].reservationCount += 1;
    });
    
    // Convertimos a array y ordenamos por tiempo total
    const result = Object.values(userUsageMap).sort((a, b) => b.totalDays - a.totalDays);
    
    return { data: result, error: null };
  } catch (err) {
    console.error('Error en el reporte de uso por usuario:', err);
    return { data: null, error: err };
  }
};

// Obtener una herramienta por ID
export const fetchToolById = async (id) => {
  const { data, error } = await supabase
    .from('tools')
    .select('*')
    .eq('id', id)
    .single();
  
  return { data, error };
};

// Actualizar una herramienta
export const updateTool = async (id, updates) => {
  const { data, error } = await supabase
    .from('tools')
    .update(updates)
    .eq('id', id);
  
  return { data, error };
};

// Crear una nueva herramienta
export const createTool = async (toolData) => {
  const { data, error } = await supabase
    .from('tools')
    .insert([toolData]);
  
  return { data, error };
};

// ----- FUNCIONES DE RESERVAS (RESERVATIONS) -----

// Obtener todas las reservas
export const fetchReservations = async () => {
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      tools (*),
      users:profiles (*)
    `)
    .order('created_at', { ascending: false });
  
  return { data, error };
};

// Crear una nueva reserva
export const createReservation = async (reservation) => {
  const { data, error } = await supabase
    .from('reservations')
    .insert([reservation]);
  
  return { data, error };
};

// Actualizar una reserva
export const updateReservation = async (id, updates) => {
  const { data, error } = await supabase
    .from('reservations')
    .update(updates)
    .eq('id', id);
  
  return { data, error };
};

// ----- FUNCIONES DE ALERTAS (ALERTS) -----

// Obtener todas las alertas
export const fetchAlerts = async () => {
  const { data, error } = await supabase
    .from('alerts')
    .select(`
      *,
      tools (*)
    `)
    .order('created_at', { ascending: false });
  
  return { data, error };
};

// Crear una nueva alerta
export const createAlert = async (alert) => {
  const { data, error } = await supabase
    .from('alerts')
    .insert([alert]);
  
  return { data, error };
};

// Actualizar una alerta
export const updateAlert = async (id, updates) => {
  const { data, error } = await supabase
    .from('alerts')
    .update(updates)
    .eq('id', id);
  
  return { data, error };
};

// ----- FUNCIONES DE CALIFICACIONES (RATINGS) -----

// Obtener todas las calificaciones
export const fetchRatings = async () => {
  const { data, error } = await supabase
    .from('ratings')
    .select(`
      *,
      tools (*),
      users:user_id (*),
      reservations (*),
      admins:rated_by (*)
    `)
    .order('created_at', { ascending: false });
  
  return { data, error };
};

// Crear una nueva calificación
export const createRating = async (rating) => {
  const { data, error } = await supabase
    .from('ratings')
    .insert([rating]);
  
  return { data, error };
};

// ----- FUNCIONES DE REPORTES (REPORTS) -----

// Obtener reporte de usuarios que más solicitan herramientas
export const fetchUserReport = async () => {
  try {
    // Obtenemos todas las reservas con información de usuarios
    const { data: reservations, error } = await supabase
      .from('reservations')
      .select(`
        id,
        user_id,
        users:profiles(name, email)
      `);
    
    if (error) {
      return { data: null, error };
    }
    
    // Procesamos los datos en el cliente para hacer el conteo
    const userMap = {};
    
    reservations.forEach(reservation => {
      const userId = reservation.user_id;
      const user = reservation.users || {};
      
      if (!userMap[userId]) {
        userMap[userId] = {
          user_id: userId,
          users: {
            name: user.name || 'Usuario sin nombre',
            email: user.email || 'Sin email'
          },
          count: 0
        };
      }
      
      userMap[userId].count += 1;
    });
    
    // Convertimos a array y ordenamos por número de reservas
    const result = Object.values(userMap).sort((a, b) => b.count - a.count);
    
    return { data: result, error: null };
  } catch (err) {
    console.error('Error en el reporte de usuarios:', err);
    return { data: null, error: err };
  }
};

// Obtener reporte de herramientas más utilizadas
export const fetchToolReport = async () => {
  try {
    // Obtenemos todas las reservas con información de herramientas
    const { data: reservations, error } = await supabase
      .from('reservations')
      .select(`
        id,
        tool_id,
        tools(name, description)
      `);
    
    if (error) {
      return { data: null, error };
    }
    
    // Procesamos los datos en el cliente para hacer el conteo
    const toolMap = {};
    
    reservations.forEach(reservation => {
      const toolId = reservation.tool_id;
      const tool = reservation.tools || {};
      
      if (!toolMap[toolId]) {
        toolMap[toolId] = {
          tool_id: toolId,
          tools: {
            name: tool.name || 'Herramienta sin nombre',
            description: tool.description || 'Sin descripción'
          },
          count: 0
        };
      }
      
      toolMap[toolId].count += 1;
    });
    
    // Convertimos a array y ordenamos por número de reservas
    const result = Object.values(toolMap).sort((a, b) => b.count - a.count);
    
    return { data: result, error: null };
  } catch (err) {
    console.error('Error en el reporte de herramientas:', err);
    return { data: null, error: err };
  }
};