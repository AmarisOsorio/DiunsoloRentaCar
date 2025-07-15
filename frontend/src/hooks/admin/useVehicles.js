import { useState, useEffect } from 'react';

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVehicles = async () => {
    try {
      console.log('fetchVehicles - Starting...');
      setLoading(true);
      setError(null);
      const response = await fetch('/api/vehicles', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('fetchVehicles - Response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Error al cargar los vehículos');
      }
      
      const data = await response.json();
      console.log('fetchVehicles - Data received:', data);
      setVehicles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError('Error al cargar los vehículos');
    } finally {
      setLoading(false);
    }
  };

  const deleteVehicle = async (id) => {
    try {
      const response = await fetch(`/api/vehicles/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Error al eliminar el vehículo');
      }
      
      setVehicles(prev => prev.filter(vehicle => vehicle._id !== id));
      return { success: true };
    } catch (err) {
      console.error('Error deleting vehicle:', err);
      return { success: false, error: 'Error al eliminar el vehículo' };
    }
  };

  const updateVehicleStatus = async (id, disponible) => {
    try {
      const response = await fetch(`/api/vehicles/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ disponible })
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar el estado del vehículo');
      }
      
      setVehicles(prev => prev.map(vehicle => 
        vehicle._id === id ? { ...vehicle, disponible } : vehicle
      ));
      return { success: true };
    } catch (err) {
      console.error('Error updating vehicle status:', err);
      return { success: false, error: 'Error al actualizar el estado del vehículo' };
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return {
    vehicles,
    loading,
    error,
    fetchVehicles,
    deleteVehicle,
    updateVehicleStatus
  };
};