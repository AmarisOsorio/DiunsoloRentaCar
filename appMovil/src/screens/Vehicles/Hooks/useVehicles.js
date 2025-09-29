import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = 'http://10.0.2.2:4000/api';

export default function useVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleResponse = async (response) => {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }
    return response.json();
  };

  const handleError = (err) => {
    let errorMessage = 'Error desconocido';
    
    if (err.message.includes('Network request failed') || err.message.includes('fetch')) {
      errorMessage = `No se puede conectar al servidor. Verifica que el backend esté en ${API_BASE_URL}`;
    } else if (err.message.includes('timeout')) {
      errorMessage = 'Tiempo de espera agotado. El servidor tardó demasiado en responder.';
    } else if (err.message.includes('JSON')) {
      errorMessage = 'Error al procesar la respuesta del servidor.';
    } else if (err.message.includes('404')) {
      errorMessage = 'Endpoint no encontrado. Verifica que la ruta esté disponible.';
    } else {
      errorMessage = err.message;
    }
    
    return errorMessage;
  };

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/vehicles`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const data = await handleResponse(response);
      setVehicles(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMsg = handleError(err);
      setError(errorMsg);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBrands = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/brands`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const data = await handleResponse(response);
      setBrands(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching brands:', err);
      setBrands([]);
    }
  }, []);

  const refreshVehicles = useCallback(async () => {
    await Promise.all([fetchVehicles(), fetchBrands()]);
  }, [fetchVehicles, fetchBrands]);

  const deleteVehicle = useCallback(async (id) => {
    try {
      setError(null);

      const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      await handleResponse(response);
      setVehicles(prev => prev.filter(vehicle => vehicle._id !== id));
    } catch (err) {
      const errorMsg = handleError(err);
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  const updateVehicle = useCallback(async (id, vehicleData) => {
    try {
      setError(null);

      const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(vehicleData),
      });

      const result = await handleResponse(response);
      const updatedVehicle = result.vehicle || result;
      
      setVehicles(prev => 
        prev.map(vehicle => 
          vehicle._id === id ? updatedVehicle : vehicle
        )
      );
      
      return updatedVehicle;
    } catch (err) {
      const errorMsg = handleError(err);
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  useEffect(() => {
    refreshVehicles();
  }, []);

  return {
    vehicles,
    brands,
    loading,
    error,
    fetchVehicles,
    refreshVehicles,
    deleteVehicle,
    updateVehicle,
  };
}