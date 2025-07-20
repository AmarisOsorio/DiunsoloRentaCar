import { useState, useEffect, useCallback } from 'react';

export const useMarcas = () => {
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMarcas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/marcas', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar las marcas');
      }
      
      const data = await response.json();
      setMarcas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching marcas:', err);
      setError('Error al cargar las marcas');
      setMarcas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarcas();
  }, [fetchMarcas]);

  return {
    marcas,
    loading,
    error,
    refetch: fetchMarcas
  };
};