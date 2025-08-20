import { useState, useEffect, useCallback } from 'react';

// Para emulador Android usa 10.0.2.2 en lugar de localhost
const API_BASE_URL = 'http://10.0.2.2:4000/api';

// Función helper para manejar timeout en fetch
const fetchWithTimeout = (url, options = {}, timeout = 15000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]);
};

export const useFetchClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función para obtener todos los clientes
  const fetchClientes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchWithTimeout(`${API_BASE_URL}/clients`, {
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

      // El backend devuelve directamente el array de clientes
      if (Array.isArray(result)) {
        const validClientes = result.filter(cliente => {
          return cliente._id && cliente.name && cliente.lastName && cliente.email;
        });

        // Transformar los datos para que coincidan con el formato esperado por el frontend
        const transformedClientes = validClientes.map(cliente => ({
          id: cliente._id,
          name: cliente.name,
          lastName: cliente.lastName,
          email: cliente.email,
          password: '••••••••••••', // No mostrar contraseña real
          phone: cliente.phone || '',
          birthDate: cliente.birthDate || '',
          licenseFront: cliente.licenseFront || '',
          licenseBack: cliente.licenseBack || '',
          passportFront: cliente.passportFront || '',
          passportBack: cliente.passportBack || '',
          foto: cliente.photo || '', // Si el backend tiene un campo photo para clientes
          activo: true, // Asumir activo si no viene del backend
          fechaRegistro: cliente.createdAt ? cliente.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
        }));

        setClientes(transformedClientes);
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
        errorMessage = 'Endpoint no encontrado. Verifica que la ruta /api/clients esté disponible.';
      } else {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setClientes([]);
      console.error('Error en fetchClientes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para refrescar clientes
  const refreshClientes = useCallback(async () => {
    await fetchClientes();
  }, [fetchClientes]);

  // Función para crear un nuevo cliente (registro)
  const createCliente = useCallback(async (clienteData) => {
    try {
      setError(null);

      // Crear FormData para enviar archivos de imágenes
      const formData = new FormData();
      formData.append('name', clienteData.name);
      formData.append('lastName', clienteData.lastName);
      formData.append('email', clienteData.email);
      formData.append('password', clienteData.password);
      
      // Formatear teléfono para el backend (formato salvadoreño)
      let phoneFormatted = clienteData.phone.replace(/\s/g, '');
      if (phoneFormatted.length === 8 && !phoneFormatted.includes('-')) {
        phoneFormatted = phoneFormatted.substring(0, 4) + '-' + phoneFormatted.substring(4);
      }
      formData.append('phone', phoneFormatted);
      
      // Convertir fecha a formato ISO si es un objeto Date
      if (clienteData.birthDate instanceof Date) {
        formData.append('birthDate', clienteData.birthDate.toISOString().split('T')[0]);
      } else if (clienteData.birthDate && clienteData.birthDate.includes('/')) {
        // Convertir DD/MM/AAAA a YYYY-MM-DD
        const [day, month, year] = clienteData.birthDate.split('/');
        formData.append('birthDate', `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
      } else {
        formData.append('birthDate', clienteData.birthDate || new Date().toISOString().split('T')[0]);
      }
      
      // Agregar imágenes de documentos si existen
      const imageFields = ['licenseFront', 'licenseBack', 'passportFront', 'passportBack'];
      
      imageFields.forEach(field => {
        if (clienteData[field]) {
          const imageUri = clienteData[field];
          const filename = imageUri.split('/').pop();
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : 'image';
          
          formData.append(field, {
            uri: imageUri,
            name: filename,
            type: type,
          });
        }
      });

      // Agregar foto de perfil si existe
      if (clienteData.foto) {
        const imageUri = clienteData.foto;
        const filename = imageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image';
        
        formData.append('photo', {
          uri: imageUri,
          name: filename,
          type: type,
        });
      }

      const response = await fetchWithTimeout(`${API_BASE_URL}/registerClients`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      }, 15000);

      const result = await response.json();

      if (!response.ok) {
        // Manejar errores específicos del backend
        if (result.message && result.message.includes('correo ya está registrado')) {
          throw new Error('Este email ya está registrado');
        } else if (result.message && result.message.includes('teléfono')) {
          throw new Error('Formato de teléfono inválido. Use el formato 2XXX-XXXX, 6XXX-XXXX o 7XXX-XXXX');
        } else if (result.message && result.message.includes('mayor de 18')) {
          throw new Error('Debe ser mayor de 18 años para registrarse');
        } else {
          throw new Error(result.message || 'Error al crear cliente');
        }
      }

      // Refrescar la lista después de crear
      await fetchClientes();
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Error en createCliente:', err);
      throw err;
    }
  }, [fetchClientes]);

  // Función para eliminar un cliente
  const deleteCliente = useCallback(async (id) => {
    try {
      setError(null);

      const response = await fetchWithTimeout(`${API_BASE_URL}/clients/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }, 15000);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al eliminar cliente');
      }

      // Actualizar la lista local
      setClientes(prev => 
        prev.filter(cliente => cliente.id !== id)
      );
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Error en deleteCliente:', err);
      throw err;
    }
  }, []);

  // Función para actualizar un cliente
  const updateCliente = useCallback(async (id, clienteData) => {
    try {
      setError(null);

      // Crear FormData para enviar archivos de imágenes
      const formData = new FormData();
      
      const textFields = ['name', 'lastName', 'email', 'password'];
      textFields.forEach(field => {
        if (clienteData[field] && clienteData[field] !== '••••••••••••') {
          formData.append(field, clienteData[field]);
        }
      });

      // Formatear teléfono para el backend
      if (clienteData.phone) {
        let phoneFormatted = clienteData.phone.replace(/\s/g, '');
        if (phoneFormatted.length === 8 && !phoneFormatted.includes('-')) {
          phoneFormatted = phoneFormatted.substring(0, 4) + '-' + phoneFormatted.substring(4);
        }
        formData.append('phone', phoneFormatted);
      }
      
      if (clienteData.birthDate) {
        if (clienteData.birthDate instanceof Date) {
          formData.append('birthDate', clienteData.birthDate.toISOString().split('T')[0]);
        } else if (clienteData.birthDate.includes('/')) {
          // Convertir DD/MM/AAAA a YYYY-MM-DD
          const [day, month, year] = clienteData.birthDate.split('/');
          formData.append('birthDate', `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
        } else {
          formData.append('birthDate', clienteData.birthDate);
        }
      }
      
      // Solo añadir imágenes si son diferentes a las actuales
      const currentCliente = clientes.find(c => c.id === id);
      const imageFields = ['licenseFront', 'licenseBack', 'passportFront', 'passportBack'];
      
      imageFields.forEach(field => {
        if (clienteData[field] && clienteData[field] !== currentCliente?.[field]) {
          const imageUri = clienteData[field];
          const filename = imageUri.split('/').pop();
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : 'image';
          
          formData.append(field, {
            uri: imageUri,
            name: filename,
            type: type,
          });
        }
      });

      // Manejar foto por separado
      if (clienteData.foto && clienteData.foto !== currentCliente?.foto) {
        const imageUri = clienteData.foto;
        const filename = imageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image';
        
        formData.append('photo', {
          uri: imageUri,
          name: filename,
          type: type,
        });
      }

      const response = await fetchWithTimeout(`${API_BASE_URL}/clients/${id}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      }, 15000);

      const result = await response.json();

      if (!response.ok) {
        // Manejar errores específicos del backend
        if (result.message && result.message.includes('correo ya está en uso')) {
          throw new Error('Este email ya está en uso por otro cliente');
        } else if (result.message && result.message.includes('teléfono')) {
          throw new Error('Formato de teléfono inválido. Use el formato 2XXX-XXXX, 6XXX-XXXX o 7XXX-XXXX');
        } else {
          throw new Error(result.message || 'Error al actualizar cliente');
        }
      }

      // Refrescar la lista después de actualizar
      await fetchClientes();
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Error en updateCliente:', err);
      throw err;
    }
  }, [clientes, fetchClientes]);

  // Función para buscar clientes por nombre
  const searchClientes = useCallback((query) => {
    if (!query) return clientes;
    
    return clientes.filter(cliente =>
      cliente.name?.toLowerCase().includes(query.toLowerCase()) ||
      cliente.lastName?.toLowerCase().includes(query.toLowerCase()) ||
      cliente.email?.toLowerCase().includes(query.toLowerCase())
    );
  }, [clientes]);

  // Función para obtener cliente por ID
  const getClienteById = useCallback((id) => {
    return clientes.find(cliente => cliente.id === id);
  }, [clientes]);

  // Función para limpiar errores
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cargar clientes al inicializar el hook
  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  return {
    // Estados
    clientes,
    loading,
    error,

    // Funciones principales
    fetchClientes,
    refreshClientes,
    addCliente: createCliente, // Mantener compatibilidad con el nombre actual
    updateCliente,
    deleteCliente,
    searchClientes,
    getClienteById,
    setError: clearError, // Para limpiar errores desde el componente
  };
};