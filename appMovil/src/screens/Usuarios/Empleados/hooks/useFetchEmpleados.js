import { useState, useEffect, useCallback } from 'react';

// URL de producción para la API
const API_BASE_URL = 'https://diunsolorentacar.onrender.com/api';

// Función helper para manejar timeout en fetch
const fetchWithTimeout = (url, options = {}, timeout = 15000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]);
};

export const useFetchEmpleados = () => {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función para obtener todos los empleados
  const fetchEmpleados = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchWithTimeout(`${API_BASE_URL}/employees`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }, 15000);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      // El backend devuelve { message, data, count }
      if (result.data && Array.isArray(result.data)) {
        const validEmpleados = result.data.filter(empleado => {
          return empleado._id && empleado.name && empleado.email;
        });

        // Transformar los datos para que coincidan con el formato esperado por el frontend
        const transformedEmpleados = validEmpleados.map(empleado => ({
          id: empleado._id,
          nombre: empleado.name, // Backend usa 'name', frontend usa 'nombre'
          email: empleado.email,
          contrasena: '••••••••••••', // No mostrar contraseña real
          dui: empleado.dui || '',
          telefono: empleado.phone || '', // Backend usa 'phone', frontend usa 'telefono'
          rol: empleado.rol || 'Empleado',
          foto: empleado.photo || '', // Backend usa 'photo', frontend usa 'foto'
          activo: true, // Asumir activo si no viene del backend
        }));

        setEmpleados(transformedEmpleados);
      } else {
        throw new Error('Formato de respuesta inesperado del servidor');
      }
    } catch (err) {
      let errorMessage = 'Error desconocido';
      
      if (err.message.includes('Network request failed') || err.message.includes('fetch')) {
        errorMessage = 'No se puede conectar al servidor. Verifica que el backend esté ejecutándose en ' + API_BASE_URL;
      } else if (err.message.includes('Request timeout')) {
        errorMessage = 'Tiempo de espera agotado. El servidor tardó demasiado en responder.';
      } else if (err.message.includes('JSON')) {
        errorMessage = 'Error al procesar la respuesta del servidor.';
      } else if (err.message.includes('404')) {
        errorMessage = 'Endpoint no encontrado. Verifica que la ruta /api/employees esté disponible.';
      } else {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setEmpleados([]);
      console.error('Error en fetchEmpleados:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para refrescar empleados
  const refreshEmpleados = useCallback(async () => {
    await fetchEmpleados();
  }, [fetchEmpleados]);

  // Función para crear un nuevo empleado
  const createEmpleado = useCallback(async (empleadoData) => {
    try {
      setError(null);

      // Crear FormData para enviar archivo de imagen
      const formData = new FormData();
      formData.append('name', empleadoData.nombre); // Frontend usa 'nombre', backend usa 'name'
      formData.append('email', empleadoData.email);
      formData.append('password', empleadoData.contrasena);
      formData.append('dui', empleadoData.dui);
      formData.append('phone', empleadoData.telefono); // Frontend usa 'telefono', backend usa 'phone'
      formData.append('rol', empleadoData.rol);
      
      if (empleadoData.foto) {
        // Si es una URI local de imagen, crear un objeto File
        const imageUri = empleadoData.foto;
        const filename = imageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image';
        
        formData.append('photo', {
          uri: imageUri,
          name: filename,
          type: type,
        });
      }

      const response = await fetchWithTimeout(`${API_BASE_URL}/employees`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      }, 15000);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al crear empleado');
      }

      // Refrescar la lista después de crear
      await fetchEmpleados();
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Error en createEmpleado:', err);
      throw err;
    }
  }, [fetchEmpleados]);

  // Función para eliminar un empleado
  const deleteEmpleado = useCallback(async (id) => {
    try {
      setError(null);

      const response = await fetchWithTimeout(`${API_BASE_URL}/employees/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }, 15000);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al eliminar empleado');
      }

      // Actualizar la lista local
      setEmpleados(prev => 
        prev.filter(empleado => empleado.id !== id)
      );
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Error en deleteEmpleado:', err);
      throw err;
    }
  }, []);

  // Función para actualizar un empleado
  const updateEmpleado = useCallback(async (id, empleadoData) => {
    try {
      setError(null);

      // Crear FormData para enviar archivo de imagen
      const formData = new FormData();
      
      if (empleadoData.nombre) {
        formData.append('name', empleadoData.nombre);
      }
      
      if (empleadoData.email) {
        formData.append('email', empleadoData.email);
      }
      
      if (empleadoData.contrasena && empleadoData.contrasena !== '••••••••••••') {
        formData.append('password', empleadoData.contrasena);
      }
      
      if (empleadoData.dui) {
        formData.append('dui', empleadoData.dui);
      }
      
      if (empleadoData.telefono) {
        formData.append('phone', empleadoData.telefono);
      }
      
      if (empleadoData.rol) {
        formData.append('rol', empleadoData.rol);
      }
      
      if (empleadoData.foto && empleadoData.foto !== empleados.find(e => e.id === id)?.foto) {
        // Solo añadir foto si es diferente a la actual
        const imageUri = empleadoData.foto;
        const filename = imageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image';
        
        formData.append('photo', {
          uri: imageUri,
          name: filename,
          type: type,
        });
      }

      const response = await fetchWithTimeout(`${API_BASE_URL}/employees/${id}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      }, 15000);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al actualizar empleado');
      }

      // Refrescar la lista después de actualizar
      await fetchEmpleados();
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Error en updateEmpleado:', err);
      throw err;
    }
  }, [empleados, fetchEmpleados]);

  // Función para buscar empleados por nombre
  const searchEmpleados = useCallback((query) => {
    if (!query) return empleados;
    
    return empleados.filter(empleado =>
      empleado.nombre.toLowerCase().includes(query.toLowerCase()) ||
      empleado.email.toLowerCase().includes(query.toLowerCase()) ||
      (empleado.rol && empleado.rol.toLowerCase().includes(query.toLowerCase()))
    );
  }, [empleados]);

  // Función para obtener empleado por ID
  const getEmpleadoById = useCallback((id) => {
    return empleados.find(empleado => empleado.id === id);
  }, [empleados]);

  // Cargar empleados al inicializar el hook
  useEffect(() => {
    fetchEmpleados();
  }, [fetchEmpleados]);

  return {
    // Estados
    empleados,
    loading,
    error,

    // Funciones principales
    fetchEmpleados,
    refreshEmpleados,
    addEmpleado: createEmpleado, // Mantener compatibilidad con el nombre actual
    updateEmpleado,
    deleteEmpleado,
    searchEmpleados,
    getEmpleadoById,
  };
};