import { useState, useEffect, useCallback } from 'react';

// URL de producción para la API
const API_BASE_URL = 'https://diunsolorentacar.onrender.com/api';

export const useFetchReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función para obtener todas las reservas
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

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      if (result.success) {
        const reservationsData = result.data || [];
        
        // Validar que las reservas tengan la estructura correcta
        const validReservations = reservationsData.filter(reservation => {
          return reservation._id && 
                 reservation.startDate && 
                 reservation.returnDate &&
                 reservation.status;
        });

        setReservations(validReservations);
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
        errorMessage = 'Endpoint no encontrado. Verifica que la ruta /api/reservations esté disponible.';
      } else {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para obtener reservas del usuario autenticado
  const fetchUserReservations = useCallback(async (token) => {
    try {
      setLoading(true);
      setError(null);

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      // Agregar token si se proporciona
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/reservations/my-reservations`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      if (result.success) {
        const reservationsData = result.data || [];
        setReservations(reservationsData);
      } else {
        throw new Error(result.message || 'Error en la respuesta del servidor');
      }
    } catch (err) {
      setError(err.message);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para obtener reservas por vehículo
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

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      if (result.success) {
        const reservationsData = result.data || [];
        setReservations(reservationsData);
      } else {
        throw new Error(result.message || 'Error en la respuesta del servidor');
      }
    } catch (err) {
      setError(err.message);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para obtener reservas por estado
  const fetchReservationsByStatus = useCallback(async (status) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/reservations/status/${status}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      if (result.success) {
        const reservationsData = result.data || [];
        setReservations(reservationsData);
      } else {
        throw new Error(result.message || 'Error en la respuesta del servidor');
      }
    } catch (err) {
      setError(err.message);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para obtener una reserva por ID
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

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Error en la respuesta del servidor');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para refrescar reservas
  const refreshReservations = useCallback(async () => {
    await fetchReservations();
  }, [fetchReservations]);

  // Función para crear una nueva reserva
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

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al crear reserva');
      }

      if (result.success) {
        // Actualizar la lista local con la nueva reserva (ya viene populated del backend)
        const newReservation = result.data;
        setReservations(prev => [newReservation, ...prev]);
        return newReservation;
      } else {
        throw new Error(result.message || 'Error en la respuesta del servidor');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Función para eliminar una reserva
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

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al eliminar reserva');
      }

      if (result.success) {
        // Actualizar la lista local
        setReservations(prev => 
          prev.filter(reservation => reservation._id !== id)
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

  // Función para actualizar una reserva
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

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al actualizar reserva');
      }

      if (result.success) {
        // Actualizar la lista local con la reserva actualizada (ya viene populated del backend)
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
      setError(err.message);
      throw err;
    }
  }, []);

  // Función para obtener estadísticas de vehículos más rentados por marca
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

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Error en la respuesta del servidor');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para obtener estadísticas de vehículos más rentados por modelo
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

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Error en la respuesta del servidor');
      }
    } catch (err) {
      setError(err.message);
      throw err;
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