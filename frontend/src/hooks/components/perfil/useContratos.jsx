import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';

/**
 * Hook para la lógica de contratos del usuario
 */
export const useContratos = () => {
  const { getUserContracts } = useAuth();
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContratos = async () => {
      setLoading(true);
      try {
        const result = await getUserContracts();
        if (result.success) {
          setContratos(result.contratos);
        } else {
          setError(result.message || 'Error al cargar contratos');
        }
      } catch (err) {
        setError('Error al cargar contratos');
      } finally {
        setLoading(false);
      }
    };
    fetchContratos();
  }, [getUserContracts]);

  return { contratos, loading, error };
};
