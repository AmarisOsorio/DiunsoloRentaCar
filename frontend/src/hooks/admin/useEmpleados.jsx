// hooks/useEmpleados.js
import { useState, useEffect, useCallback } from 'react';
import EmpleadosAPI from '../../services/admin/empleadosAPI';

export const useEmpleados = () => {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar empleados
  const fetchEmpleados = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await EmpleadosAPI.getEmpleados();
      setEmpleados(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar empleados:', err);
      setError(err.message || 'Error al cargar empleados');
      setEmpleados([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear empleado
  const createEmpleado = async (empleadoData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await EmpleadosAPI.createEmpleado(empleadoData);
      console.log('Empleado creado:', response);
      await fetchEmpleados(); // Recargar lista
      return { success: true, data: response };
    } catch (err) {
      console.error('Error al crear empleado:', err);
      const errorMessage = err.message || 'Error al crear empleado';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Actualizar empleado
  const updateEmpleado = async (id, empleadoData) => {
    if (!id) {
      const errorMessage = 'ID del empleado es requerido';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }

    setLoading(true);
    setError(null);
    try {
      const response = await EmpleadosAPI.updateEmpleado(id, empleadoData);
      console.log('Empleado actualizado:', response);
      await fetchEmpleados(); // Recargar lista
      return { success: true, data: response };
    } catch (err) {
      console.error('Error al actualizar empleado:', err);
      const errorMessage = err.message || 'Error al actualizar empleado';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Eliminar empleado
  const deleteEmpleado = async (id) => {
    if (!id) {
      const errorMessage = 'ID del empleado es requerido';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }

    setLoading(true);
    setError(null);
    try {
      const response = await EmpleadosAPI.deleteEmpleado(id);
      console.log('Empleado eliminado:', response);
      await fetchEmpleados(); // Recargar lista
      return { success: true, data: response };
    } catch (err) {
      console.error('Error al eliminar empleado:', err);
      const errorMessage = err.message || 'Error al eliminar empleado';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Efecto para cargar empleados al montar el componente
  useEffect(() => {
    fetchEmpleados();
  }, [fetchEmpleados]);

  return {
    empleados,
    loading,
    error,
    createEmpleado,
    updateEmpleado,
    deleteEmpleado,
    refreshEmpleados: fetchEmpleados,
    clearError
  };
};
