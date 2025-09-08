import { useState, useEffect, useCallback } from 'react';

// Para emulador Android usa 10.0.2.2 en lugar de localhost
const API_BASE_URL = 'http://10.0.2.2:4000/api';

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
        timeout: 15000,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      if (result.success) {
        const reservationsData = result.data || [];
        
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
        // Actualizar la lista local con populate
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
        // Actualizar la lista local
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

  // Cargar reservas al inicializar el hook
  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  return {
    // Estados
    reservations,
    loading,
    error,

    // Funciones principales
    fetchReservations,
    refreshReservations,
    createReservation,
    deleteReservation,
    updateReservation,
  };
};