import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../../../hooks/useAuth';

/*
 * Hook para la lógica de reservas del usuario
 */

export const useReservas = () => {
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
  
  // NUEVO: Estados para manejar éxito de actualización
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  
  const hasInitializedRef = useRef(false);

  // Flag para controlar si se debe hacer fetch de reservas
  const shouldFetch = isAuthenticated && (reservasInvalidated || !hasInitializedRef.current);
  
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
        // Adaptar los campos a lo que espera el frontend - SOLO DATOS REALES
        const reservasAdaptadas = result.reservas.map((r) => {
          // VALIDAR que los datos sean reales y no hardcodeados
          const reservaAdaptada = {
            ...r,
            // Fechas - usar solo las fechas reales de la base de datos
            fechaInicio: r.startDate || r.fechaInicio || null,
            fechaDevolucion: r.returnDate || r.fechaDevolucion || null,
            // Vehículo - usar solo el vehículo real de la base de datos
            vehiculoID: r.vehicleId || r.vehiculoID || r.vehiculoId || null,
            // Estado - usar solo el estado real
            estado: r.status || r.estado || 'Pending',
            // Precio - usar solo el precio real
            precioPorDia: r.pricePerDay || r.precioPorDia || 0,
            // Cliente - usar solo el cliente real (debe venir del populate)
            clientId: r.clientId || null,
          };
          
          // Log para debugging - verificar datos reales
          console.log('📊 Reserva adaptada:', {
            id: reservaAdaptada._id,
            fechaInicio: reservaAdaptada.fechaInicio,
            fechaDevolucion: reservaAdaptada.fechaDevolucion,
            vehiculo: reservaAdaptada.vehiculoID?.vehicleName || reservaAdaptada.vehicleId?.vehicleName,
            cliente: reservaAdaptada.clientId?.name || 'Sin cliente',
            precio: reservaAdaptada.precioPorDia
          });
          
          return reservaAdaptada;
        });
        
        console.log('✅ Reservas reales cargadas:', reservasAdaptadas.length);
        setReservas(reservasAdaptadas);
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
      
      // IMPORTANTE: No usar datos de prueba, mostrar error real
      setReservas([]);
      setError(`Error al cargar reservas: ${error.message}. Verifica la conexión con la base de datos.`);
      setLoading(false);
    }
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
    
  }, [shouldFetch, reservasInvalidated]);

  // Función para forzar recarga de reservas (útil después de cambios)
  const reloadReservas = async () => {
    await loadReservas();
  };

  // Función para abrir modal de edición
  const handleEditReservation = useCallback((reserva) => {
    console.log('✏️ Editando reserva:', reserva);
    // Solo permitir editar si está pendiente
    if (reserva.estado?.toLowerCase() !== 'pending' && reserva.status?.toLowerCase() !== 'pending') {
      setError('Solo se pueden editar reservas con estado "Pendiente"');
      return;
    }
    setEditingReservation(reserva);
    setShowEditModal(true);
  }, [setError]);

  // Función para guardar cambios de edición - CORREGIDA
  const handleSaveEdit = async (updatedData) => {
    if (!editingReservation) return;
    
    setLoading(true);
    setError(null);
    setUpdateSuccess(false);
    
    try {
      // CORRECCIÓN: Asegurar que clientId siempre esté disponible
      let clientId = null;
      
      // Prioridad 1: Del updatedData
      if (updatedData.clientId) {
        clientId = typeof updatedData.clientId === 'object' ? updatedData.clientId._id : updatedData.clientId;
      }
      // Prioridad 2: De la reserva que se está editando
      else if (editingReservation.clientId) {
        clientId = typeof editingReservation.clientId === 'object' ? editingReservation.clientId._id : editingReservation.clientId;
      }
      // Prioridad 3: Del usuario autenticado actual
      else if (userInfo) {
        clientId = userInfo._id || userInfo.id;
      }

      // Si aún no tenemos clientId, usar datos de userInfo
      if (!clientId && userInfo) {
        clientId = userInfo._id || userInfo.id;
        console.log('🔧 Usando clientId del usuario autenticado:', clientId);
      }

      if (!clientId) {
        throw new Error('No se pudo determinar el ID del cliente');
      }

      // Determinar vehicleId
      let vehicleId = null;
      
      // Si hay un vehículo temporal (nuevo seleccionado), usarlo
      if (editingReservation.tempVehicle) {
        vehicleId = editingReservation.tempVehicle._id;
      }
      // Si no, usar el del updatedData o el original
      else if (updatedData.vehicleId) {
        vehicleId = typeof updatedData.vehicleId === 'object' ? updatedData.vehicleId._id : updatedData.vehicleId;
      }
      // Fallback al vehículo original
      else if (editingReservation.vehicleId) {
        vehicleId = typeof editingReservation.vehicleId === 'object' ? editingReservation.vehicleId._id : editingReservation.vehicleId;
      }
      else if (editingReservation.vehiculoID) {
        vehicleId = typeof editingReservation.vehiculoID === 'object' ? editingReservation.vehiculoID._id : editingReservation.vehiculoID;
      }

      if (!vehicleId) {
        throw new Error('No se pudo determinar el ID del vehículo');
      }

      // Determinar precio por día - CORREGIDO
      let pricePerDay = 0;
      
      // Si hay vehículo temporal, usar su precio
      if (editingReservation.tempVehicle && editingReservation.tempVehicle.dailyPrice) {
        pricePerDay = editingReservation.tempVehicle.dailyPrice;
      }
      // Si viene en updatedData
      else if (updatedData.pricePerDay && updatedData.pricePerDay > 0) {
        pricePerDay = updatedData.pricePerDay;
      }
      else if (updatedData.precioPorDia && updatedData.precioPorDia > 0) {
        pricePerDay = updatedData.precioPorDia;
      }
      // Si no, usar el precio de la reserva original
      else if (editingReservation.pricePerDay && editingReservation.pricePerDay > 0) {
        pricePerDay = editingReservation.pricePerDay;
      }
      else if (editingReservation.precioPorDia && editingReservation.precioPorDia > 0) {
        pricePerDay = editingReservation.precioPorDia;
      }
      // Precio mínimo por defecto
      else {
        pricePerDay = 25000; // Precio mínimo por defecto en colones
      }

      // Preparar datos para el backend
      const dataToSend = {
        clientId: clientId,
        vehicleId: vehicleId,
        startDate: updatedData.startDate || updatedData.fechaInicio || editingReservation.startDate || editingReservation.fechaInicio,
        returnDate: updatedData.returnDate || updatedData.fechaDevolucion || editingReservation.returnDate || editingReservation.fechaDevolucion,
        status: updatedData.status || updatedData.estado || editingReservation.status || editingReservation.estado || 'Pending',
        pricePerDay: pricePerDay
      };

      console.log('🔄 Datos finales para enviar:', dataToSend);
      console.log('🔧 Cliente ID utilizado:', clientId);
      console.log('🚗 Vehículo ID utilizado:', vehicleId);
      
      const result = await updateReservation(editingReservation._id, dataToSend);
      
      if (result.success) {
        console.log('✅ Reserva actualizada correctamente');
        
        // NUEVO: Mostrar mensaje de éxito y cerrar modal automáticamente
        setUpdateSuccess(true);
        setUpdateMessage('¡Reserva actualizada exitosamente!');
        setError(null);
        
        // Cerrar modal después de mostrar éxito
        setTimeout(() => {
          setShowEditModal(false);
          setEditingReservation(null);
          setUpdateSuccess(false);
          setUpdateMessage('');
        }, 2000); // 2 segundos para que el usuario vea el mensaje
        
        // Las reservas se recargarán automáticamente debido a invalidateReservations
      } else {
        setError(result.message || 'Error al actualizar la reserva');
      }
    } catch (error) {
      console.error('❌ Error al actualizar reserva:', error);
      setError(`Error al actualizar la reserva: ${error.message}`);
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
    if (reserva.estado?.toLowerCase() !== 'pending' && reserva.status?.toLowerCase() !== 'pending') {
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
    setError,
    // NUEVO: Estados para mensaje de éxito
    updateSuccess,
    updateMessage
  };
};