import { useState, useEffect, useCallback } from 'react';

// Para emulador Android usa 10.0.2.2 en lugar de localhost
const API_BASE_URL = 'http://10.0.2.2:4000/api';

export const useFetchMaintenances = () => {
  const [maintenances, setMaintenances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función para obtener todos los mantenimientos
  const fetchMaintenances = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/maintenances`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 15000,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      if (result.success) {
        const maintenancesData = result.data || [];
        
        const validMaintenances = maintenancesData.filter(maintenance => {
          return maintenance._id && 
                 maintenance.maintenanceType && 
                 maintenance.startDate && 
                 maintenance.returnDate;
        });

        setMaintenances(validMaintenances);
      } else {
        throw new Error(result.message || 'Error en la respuesta del servidor');
      }
    } catch (err) {
      let errorMessage = 'Error desconocido';
      
      if (err.message.includes('Network request failed') || err.message.includes('fetch')) {
        errorMessage = 'No se puede conectar al servidor. Verifica que el backend esté ejecutándose en ' + API_BASE_URL;
      } else if (err.message.includes('timeout')) {
        errorMessage = 'Tiempo de espera agotado. El servidor tardó demasiado en responder.';
      } else if (err.message.includes('JSON')) {
        errorMessage = 'Error al procesar la respuesta del servidor.';
      } else if (err.message.includes('404')) {
        errorMessage = 'Endpoint no encontrado. Verifica que la ruta /api/maintenances esté disponible.';
      } else {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setMaintenances([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para refrescar mantenimientos
  const refreshMaintenances = useCallback(async () => {
    await fetchMaintenances();
  }, [fetchMaintenances]);

  // Función para crear un nuevo mantenimiento
  const createMaintenance = useCallback(async (maintenanceData) => {
    try {
      setError(null);

      const response = await fetch(`${API_BASE_URL}/maintenances`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(maintenanceData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al crear mantenimiento');
      }

      if (result.success) {
        // Actualizar la lista local con populate
        const newMaintenance = result.data;
        setMaintenances(prev => [newMaintenance, ...prev]);
        return newMaintenance;
      } else {
        throw new Error(result.message || 'Error en la respuesta del servidor');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Función para eliminar un mantenimiento
  const deleteMaintenance = useCallback(async (id) => {
    try {
      setError(null);

      const response = await fetch(`${API_BASE_URL}/maintenances/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al eliminar mantenimiento');
      }

      if (result.success) {
        // Actualizar la lista local
        setMaintenances(prev => 
          prev.filter(maintenance => maintenance._id !== id)
        );
        return result.data;
      } else {
        throw new Error(result.message || 'Error en la respuesta del servidor');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Función para actualizar un mantenimiento
  const updateMaintenance = useCallback(async (id, maintenanceData) => {
    try {
      setError(null);

      const response = await fetch(`${API_BASE_URL}/maintenances/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(maintenanceData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al actualizar mantenimiento');
      }

      if (result.success) {
        // Actualizar la lista local
        const updatedMaintenance = result.data;
        setMaintenances(prev => 
          prev.map(maintenance => 
            maintenance._id === id ? updatedMaintenance : maintenance
          )
        );
        return updatedMaintenance;
      } else {
        throw new Error(result.message || 'Error en la respuesta del servidor');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Cargar mantenimientos al inicializar el hook
  useEffect(() => {
    fetchMaintenances();
  }, [fetchMaintenances]);

  return {
    // Estados
    maintenances,
    loading,
    error,

    // Funciones principales
    fetchMaintenances,
    refreshMaintenances,
    createMaintenance,
    deleteMaintenance,
    updateMaintenance,
  };
};