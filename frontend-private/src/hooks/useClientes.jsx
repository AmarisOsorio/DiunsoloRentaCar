// hooks/useClientes.js
import { useState, useEffect, useCallback } from 'react';
import ClientesAPI from '../services/clientesAPI';

export const useClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar clientes
  const fetchClientes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ClientesAPI.getClientes();
      setClientes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar clientes:', err);
      setError(err.message || 'Error al cargar clientes');
      setClientes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear cliente
  const createCliente = async (clienteData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ClientesAPI.createCliente(clienteData);
      console.log('Cliente creado:', response);
      await fetchClientes(); // Recargar lista
      return { success: true, data: response };
    } catch (err) {
      console.error('Error al crear cliente:', err);
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
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }

    setLoading(true);
    setError(null);
    try {
      const response = await ClientesAPI.updateCliente(id, clienteData);
      console.log('Cliente actualizado:', response);
      await fetchClientes(); // Recargar lista
      return { success: true, data: response };
    } catch (err) {
      console.error('Error al actualizar cliente:', err);
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
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }

    setLoading(true);
    setError(null);
    try {
      const response = await ClientesAPI.deleteCliente(id);
      console.log('Cliente eliminado:', response);
      await fetchClientes(); // Recargar lista
      return { success: true, data: response };
    } catch (err) {
      console.error('Error al eliminar cliente:', err);
      const errorMessage = err.message || 'Error al eliminar cliente';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Verificar email
  const checkEmailExists = async (email) => {
    try {
      const response = await ClientesAPI.checkEmailExists(email);
      return response.exists;
    } catch (err) {
      console.error('Error al verificar email:', err);
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
    checkEmailExists,
    refreshClientes: fetchClientes,
    clearError
  };
};