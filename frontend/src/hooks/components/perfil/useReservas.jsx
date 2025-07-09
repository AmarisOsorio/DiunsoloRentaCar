import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';

/**
 * Hook para la lógica de reservas del usuario
 * @param {boolean} shouldFetch - Indica si se deben cargar las reservas
 */

export const useReservas = (shouldFetch = false) => {
  const { getUserReservations, isAuthenticated, userInfo } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    console.log('🔄 useEffect ejecutado - shouldFetch:', shouldFetch, 'hasInitialized:', hasInitializedRef.current);
    console.log('🔄 Auth state - isAuthenticated:', isAuthenticated, 'userInfo:', userInfo ? 'exists' : 'null');
    
    // Si shouldFetch es false, no hacer nada
    if (!shouldFetch) {
      console.log('🔄 shouldFetch es false, no haciendo nada');
      return;
    }
    
    // Si ya se inicializó, no volver a cargar
    if (hasInitializedRef.current) {
      console.log('🔄 Ya inicializado, saltando carga');
      return;
    }
    
    // Verificar si el usuario está autenticado
    if (!isAuthenticated) {
      console.log('❌ Usuario no autenticado, no se pueden cargar reservas');
      setError('Usuario no autenticado');
      return;
    }
    
    console.log('🔄 Iniciando carga de reservas');
    hasInitializedRef.current = true;
    
    // Simular carga inmediata
    setLoading(true);
    setError(null);
    
    // Intentar cargar datos reales primero
    const loadReservas = async () => {
      try {
        console.log('🔄 Llamando a getUserReservations...');
        const result = await getUserReservations();
        console.log('🔄 Resultado de getUserReservations:', result);
        
        if (result.success && Array.isArray(result.reservas)) {
          console.log('✅ Reservas reales cargadas:', result.reservas.length);
          setReservas(result.reservas);
          setLoading(false);
          setError(null);
          return;
        }
      } catch (error) {
        console.log('❌ Error al cargar reservas reales:', error);
      }
      
      // Fallback: usar datos de prueba
      console.log('⚠️ Backend no disponible, usando datos de prueba');
      const testReservas = [
        {
          id: 1,
          vehiculoID: {
            nombreVehiculo: 'Toyota Corolla (Demo)',
            marca: 'Toyota',
            modelo: '2023',
            color: 'Blanco',
            imagenes: ['https://via.placeholder.com/300x200?text=Toyota+Corolla']
          },
          fechaInicio: '2025-01-15',
          fechaFin: '2025-01-20',
          estado: 'activa',
          precioTotal: 150000
        },
        {
          id: 2,
          vehiculoID: {
            nombreVehiculo: 'Honda Civic (Demo)',
            marca: 'Honda',
            modelo: '2023',
            color: 'Azul',
            imagenes: ['https://via.placeholder.com/300x200?text=Honda+Civic']
          },
          fechaInicio: '2025-02-01',
          fechaFin: '2025-02-05',
          estado: 'pendiente',
          precioTotal: 120000
        }
      ];
      
      setReservas(testReservas);
      setLoading(false);
      setError('🔧 Servidor backend no disponible - Mostrando datos de demostración');
    };
    
    loadReservas();
    
  }, [shouldFetch]); // Solo shouldFetch como dependencia

  // Función para forzar recarga de reservas (útil después de cambios)
  const reloadReservas = async () => {
    let isMounted = true;
    
    setLoading(true);
    setError(null);
    
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
        setError('La solicitud está tardando demasiado. Intenta de nuevo.');
      }
    }, 10000);

    try {
      const result = await getUserReservations();
      
      if (!isMounted) return;
      clearTimeout(timeoutId);
      
      if (result.success) {
        setReservas(Array.isArray(result.reservas) ? result.reservas : []);
      } else {
        setReservas([]);
        setError(result.message || 'Error al cargar reservas');
      }
    } catch (error) {
      if (isMounted) {
        clearTimeout(timeoutId);
        setReservas([]);
        setError('Error al cargar reservas');
      }
    } finally {
      if (isMounted) {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    }
  };

  return { 
    reservas: Array.isArray(reservas) ? reservas : [], 
    loading, 
    error, 
    reloadReservas 
  };
};
