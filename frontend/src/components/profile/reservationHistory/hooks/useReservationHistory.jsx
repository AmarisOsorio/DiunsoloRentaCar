import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../../hooks/useAuth';

/**
 * Hook para la lógica de reservas del usuario
 * @param {boolean} shouldFetch - Indica si se deben cargar las reservas
 */

export const useReservas = (shouldFetch = false) => {
  const { 
    getUserReservations, 
    updateReservation, 
    deleteReservation, 
    isAuthenticated, 
    userInfo,
    reservasInvalidated,
    markReservationsAsValid
  } = useAuth();
  
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingReservation, setEditingReservation] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState(null);
  const hasInitializedRef = useRef(false);

  // Función para cargar reservas
  const loadReservas = async () => {
    console.log('🔄 loadReservas iniciado');
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Llamando a getUserReservations...');
      const result = await getUserReservations();
      console.log('🔄 Resultado de getUserReservations:', result);
      
      if (result.success && Array.isArray(result.reservas)) {
        console.log('✅ Reservas reales cargadas:', result.reservas.length);
        setReservas(result.reservas);
        setError(null);
        markReservationsAsValid();
        setLoading(false);
        return;
      } else {
        // El servidor respondió pero con error o sin datos
        console.log('⚠️ getUserReservations falló:', result.message);
        throw new Error(result.message || 'Error al obtener reservas');
      }
    } catch (error) {
      console.log('❌ Error al cargar reservas reales:', error.message);
    }
    
    // Fallback: usar datos de prueba
    console.log('⚠️ Backend no disponible, usando datos de prueba');
    const testReservas = [
      {
        _id: '1',
        clientId: 'test-client-id',
        vehicleId: {
          _id: 'test-vehicle-1',
          vehicleName: 'Toyota Corolla (Demo)',
          brand: 'Toyota',
          model: '2023',
          color: 'Blanco',
          sideImage: 'https://via.placeholder.com/300x200?text=Toyota+Corolla'
        },
        startDate: '2025-01-15T10:00:00.000Z',
        returnDate: '2025-01-20T10:00:00.000Z',
        status: 'Pending',
        pricePerDay: 30000,
        client: [{
          name: 'Usuario Demo',
          phone: '1234567890',
          email: 'demo@example.com'
        }]
      },
      {
        _id: '2',
        clientId: 'test-client-id',
        vehicleId: {
          _id: 'test-vehicle-2',
          vehicleName: 'Honda Civic (Demo)',
          brand: 'Honda',
          model: '2023',
          color: 'Azul',
          sideImage: 'https://via.placeholder.com/300x200?text=Honda+Civic'
        },
        startDate: '2025-02-01T09:00:00.000Z',
        returnDate: '2025-02-05T09:00:00.000Z',
        status: 'Active',
        pricePerDay: 25000,
        client: [{
          name: 'Usuario Demo',
          phone: '1234567890',
          email: 'demo@example.com'
        }]
      }
    ];
    
    setReservas(testReservas);
    setError('🔧 Servidor backend no disponible - Mostrando datos de demostración');
    markReservationsAsValid();
    setLoading(false);
  };

  useEffect(() => {
    console.log('🔄 useEffect ejecutado - shouldFetch:', shouldFetch, 'hasInitialized:', hasInitializedRef.current);
    console.log('🔄 Auth state - isAuthenticated:', isAuthenticated, 'userInfo:', userInfo ? 'exists' : 'null');
    console.log('🔄 reservasInvalidated:', reservasInvalidated);
    
    // Si shouldFetch es false, no hacer nada
    if (!shouldFetch) {
      console.log('🔄 shouldFetch es false, no haciendo nada');
      return;
    }
    
    // Verificar si el usuario está autenticado
    if (!isAuthenticated) {
      console.log('❌ Usuario no autenticado, no se pueden cargar reservas');
      setError('Usuario no autenticado');
      return;
    }
    
    // Si las reservas están invalidadas o es la primera vez, cargar
    if (reservasInvalidated || !hasInitializedRef.current) {
      console.log('🔄 Iniciando carga de reservas');
      hasInitializedRef.current = true;
      loadReservas();
    }
    
  }, [shouldFetch, reservasInvalidated]); // Agregamos reservasInvalidated como dependencia

  // Función para forzar recarga de reservas (útil después de cambios)
  const reloadReservas = async () => {
    await loadReservas();
  };

  // Función para abrir modal de edición
  const handleEditReservation = (reserva) => {
    console.log('✏️ Editando reserva:', reserva);
    // Solo permitir editar si está pendiente
    if (reserva.estado?.toLowerCase() !== 'pendiente') {
      setError('Solo se pueden editar reservas con estado "Pendiente"');
      return;
    }
    setEditingReservation(reserva);
    setShowEditModal(true);
  };

  // Función para guardar cambios de edición
  const handleSaveEdit = async (updatedData) => {
    if (!editingReservation) return;
    
    setLoading(true);
    try {
      const result = await updateReservation(editingReservation._id, updatedData);
      
      if (result.success) {
        console.log('✅ Reserva actualizada correctamente');
        setShowEditModal(false);
        setEditingReservation(null);
        setError(null);
        // Las reservas se recargarán automáticamente debido a invalidateReservations
      } else {
        setError(result.message || 'Error al actualizar la reserva');
      }
    } catch (error) {
      console.error('Error al actualizar reserva:', error);
      setError('Error al actualizar la reserva');
    } finally {
      setLoading(false);
    }
  };

  // Función para cancelar edición
  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingReservation(null);
  };

  // Función para abrir modal de confirmación de eliminación
  const handleDeleteReservation = (reserva) => {
    console.log('🗑️ Intentando eliminar reserva:', reserva);
    // Solo permitir eliminar si está pendiente
    if (reserva.estado?.toLowerCase() !== 'pendiente') {
      setError('Solo se pueden eliminar reservas con estado "Pendiente"');
      return;
    }
    setReservationToDelete(reserva);
    setShowDeleteModal(true);
  };

  // Función para confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!reservationToDelete) return;
    
    setLoading(true);
    try {
      const result = await deleteReservation(reservationToDelete._id);
      
      if (result.success) {
        console.log('✅ Reserva eliminada correctamente');
        setShowDeleteModal(false);
        setReservationToDelete(null);
        setError(null);
        // Las reservas se recargarán automáticamente debido a invalidateReservations
      } else {
        setError(result.message || 'Error al eliminar la reserva');
      }
    } catch (error) {
      console.error('Error al eliminar reserva:', error);
      setError('Error al eliminar la reserva');
    } finally {
      setLoading(false);
    }
  };

  // Función para cancelar eliminación
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setReservationToDelete(null);
  };

  return { 
    reservas: Array.isArray(reservas) ? reservas : [], 
    loading, 
    error, 
    reloadReservas,
    editingReservation,
    showEditModal,
    showDeleteModal,
    reservationToDelete,
    handleEditReservation,
    handleSaveEdit,
    handleCancelEdit,
    handleDeleteReservation,
    handleConfirmDelete,
    handleCancelDelete,
    setError
  };
};