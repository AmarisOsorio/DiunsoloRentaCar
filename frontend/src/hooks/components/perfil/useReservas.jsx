import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';

/**
 * Hook para la lógica de reservas del usuario
 */
export const useReservas = () => {
  const { getUserReservations } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReservas = async () => {
      setLoading(true);
      try {
        const result = await getUserReservations();
        if (result.success) {
          setReservas(result.reservas);
        } else {
          setError(result.message || 'Error al cargar reservas');
        }
      } catch (err) {
        setError('Error al cargar reservas');
      } finally {
        setLoading(false);
      }
    };
    fetchReservas();
  }, [getUserReservations]);

  return { reservas, loading, error };
};
