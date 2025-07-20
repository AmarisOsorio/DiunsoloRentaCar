// hooks/useClientes.js
import { useState, useEffect, useCallback } from 'react';
import ClientesAPI from '../../services/admin/clientesAPI';

export const useClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar clientes
  const fetchClientes = useCallback(async () => {
    console.log('🔄 [useClientes] Cargando clientes...');
    setLoading(true);
    setError(null);
    try {
      const data = await ClientesAPI.getClientes();
      console.log('✅ [useClientes] Clientes cargados:', data.length);
      setClientes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ [useClientes] Error al cargar clientes:', err);
      setError(err.message || 'Error al cargar clientes');
      setClientes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear cliente
  const createCliente = async (clienteData) => {
    console.log('➕ [useClientes] Creando cliente...');
    setLoading(true);
    setError(null);
    try {
      const response = await ClientesAPI.createCliente(clienteData);
      console.log('✅ [useClientes] Cliente creado:', response);
      await fetchClientes(); // Recargar lista
      return { success: true, data: response };
    } catch (err) {
      console.error('❌ [useClientes] Error al crear cliente:', err);
      const errorMessage = err.message || 'Error al crear cliente';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Actualizar cliente
  const updateCliente = async (id, clienteData) => {
    if (!id) {
      const errorMessage = 'ID del cliente es requerido';
      console.error('❌ [useClientes] ' + errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }

    console.log('🔄 [useClientes] Actualizando cliente:', id);
    setLoading(true);
    setError(null);
    try {
      const response = await ClientesAPI.updateCliente(id, clienteData);
      console.log('✅ [useClientes] Cliente actualizado:', response);
      await fetchClientes(); // Recargar lista
      return { success: true, data: response };
    } catch (err) {
      console.error('❌ [useClientes] Error al actualizar cliente:', err);
      const errorMessage = err.message || 'Error al actualizar cliente';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Eliminar cliente
  const deleteCliente = async (id) => {
    if (!id) {
      const errorMessage = 'ID del cliente es requerido';
      console.error('❌ [useClientes] ' + errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }

    console.log('🗑️ [useClientes] Eliminando cliente:', id);
    setLoading(true);
    setError(null);
    try {
      const response = await ClientesAPI.deleteCliente(id);
      console.log('✅ [useClientes] Cliente eliminado:', response);
      await fetchClientes(); // Recargar lista
      return { success: true, data: response };
    } catch (err) {
      console.error('❌ [useClientes] Error al eliminar cliente:', err);
      const errorMessage = err.message || 'Error al eliminar cliente';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Obtener cliente por ID
  const getClienteById = async (id) => {
    if (!id) {
      console.error('❌ [useClientes] ID requerido para obtener cliente');
      return null;
    }

    console.log('🔍 [useClientes] Obteniendo cliente por ID:', id);
    try {
      const response = await ClientesAPI.getClienteById(id);
      console.log('✅ [useClientes] Cliente obtenido:', response);
      return response;
    } catch (err) {
      console.error('❌ [useClientes] Error al obtener cliente:', err);
      return null;
    }
  };

  // Verificar email
  const checkEmailExists = async (email) => {
    console.log('📧 [useClientes] Verificando email:', email);
    try {
      const response = await ClientesAPI.checkEmailExists(email);
      console.log('✅ [useClientes] Verificación de email completada:', response);
      return response.exists;
    } catch (err) {
      console.error('❌ [useClientes] Error al verificar email:', err);
      return false;
    }
  };

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Efecto para cargar clientes al montar el componente
  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  return {
    clientes,
    loading,
    error,
    createCliente,
    updateCliente,
    deleteCliente,
    getClienteById,
    checkEmailExists,
    refreshClientes: fetchClientes,
    clearError
  };
};
