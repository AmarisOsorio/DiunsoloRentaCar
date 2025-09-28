import { useState, useEffect, useCallback } from 'react';

// URL de producción para la API
const API_BASE_URL = 'https://diunsolorentacar.onrender.com/api';


export const useFetchReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función auxiliar para manejar respuestas HTTP
  const handleResponse = async (response) => {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }
    return response.json();
  };

  // Función auxiliar para manejar errores
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

  // Obtener todas las reservas
  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/reservations`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const result = await handleResponse(response);

      if (result.success) {
        setReservations(result.data || []);
      } else {
        throw new Error(result.message || 'Error en la respuesta del servidor');
      }
    } catch (err) {
      const errorMsg = handleError(err);
      setError(errorMsg);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener reservas del usuario autenticado
  const fetchUserReservations = useCallback(async (token) => {
    try {
      setLoading(true);
      setError(null);

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/reservations/my-reservations`, {
        method: 'GET',
        headers,
      });

      const result = await handleResponse(response);

      if (result.success) {
        setReservations(result.data || []);
      } else {
        throw new Error(result.message || 'Error en la respuesta del servidor');
      }
    } catch (err) {
      const errorMsg = handleError(err);
      setError(errorMsg);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener reservas por vehículo
  const fetchReservationsByVehicle = useCallback(async (vehicleId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/reservations/vehicle/${vehicleId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const result = await handleResponse(response);

      if (result.success) {
        setReservations(result.data || []);
      } else {
        throw new Error(result.message || 'Error en la respuesta del servidor');
      }
    } catch (err) {
      const errorMsg = handleError(err);
      setError(errorMsg);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener reservas por estado
  const fetchReservationsByStatus = useCallback(async (status) => {
    try {
      setLoading(true);
      setError(null);
      
      // Validar estado antes de hacer la petición
      if (!['Pending', 'Active', 'Completed'].includes(status)) {
        throw new Error('Estado no válido. Debe ser: Pending, Active o Completed');
      }
      
      const response = await fetch(`${API_BASE_URL}/reservations/status/${status}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const result = await handleResponse(response);

      if (result.success) {
        setReservations(result.data || []);
      } else {
        throw new Error(result.message || 'Error en la respuesta del servidor');
      }
    } catch (err) {
      const errorMsg = handleError(err);
      setError(errorMsg);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener una reserva por ID
  const fetchReservationById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const result = await handleResponse(response);

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Error en la respuesta del servidor');
      }
    } catch (err) {
      const errorMsg = handleError(err);
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refrescar reservas
  const refreshReservations = useCallback(async () => {
    await fetchReservations();
  }, [fetchReservations]);

  // Crear una nueva reserva
  const createReservation = useCallback(async (reservationData) => {
    try {
      setError(null);

      const response = await fetch(`${API_BASE_URL}/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(reservationData),
      });

      const result = await handleResponse(response);

      if (result.success) {
        const newReservation = result.data;
        setReservations(prev => [newReservation, ...prev]);
        return newReservation;
      } else {
        throw new Error(result.message || 'Error en la respuesta del servidor');
      }
    } catch (err) {
      const errorMsg = handleError(err);
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  // Eliminar una reserva
  const deleteReservation = useCallback(async (id) => {
    try {
      setError(null);

      const response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const result = await handleResponse(response);

      if (result.success) {
        setReservations(prev => 
          prev.filter(reservation => reservation._id !== id)
        );
        return result.data;
      } else {
        throw new Error(result.message || 'Error en la respuesta del servidor');
      }
    } catch (err) {
      const errorMsg = handleError(err);
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  // Actualizar una reserva
  const updateReservation = useCallback(async (id, reservationData) => {
    try {
      setError(null);

      const response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(reservationData),
      });

      const result = await handleResponse(response);

      if (result.success) {
        const updatedReservation = result.data;
        setReservations(prev => 
          prev.map(reservation => 
            reservation._id === id ? updatedReservation : reservation
          )
        );
        return updatedReservation;
      } else {
        throw new Error(result.message || 'Error en la respuesta del servidor');
      }
    } catch (err) {
      const errorMsg = handleError(err);
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  // Obtener vehículos más rentados por marca
  const getMostRentedByBrand = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/reservations/most-rented-brands`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const result = await handleResponse(response);

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Error en la respuesta del servidor');
      }
    } catch (err) {
      const errorMsg = handleError(err);
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener vehículos más rentados por modelo
  const getMostRentedByModel = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/reservations/most-rented-models`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const result = await handleResponse(response);

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Error en la respuesta del servidor');
      }
    } catch (err) {
      const errorMsg = handleError(err);
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar reservas al inicializar el hook
  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  return {
    // Estados
    reservations,
    loading,
    error,

    // Funciones principales CRUD
    fetchReservations,
    refreshReservations,
    createReservation,
    deleteReservation,
    updateReservation,

    // Funciones específicas
    fetchReservationById,
    fetchUserReservations,
    fetchReservationsByVehicle,
    fetchReservationsByStatus,

    // Funciones de estadísticas
    getMostRentedByBrand,
    getMostRentedByModel,
  };
};