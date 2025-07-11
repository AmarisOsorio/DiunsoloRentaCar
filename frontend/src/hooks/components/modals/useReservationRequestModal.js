import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';

const useReservationRequestModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const { userInfo, invalidateReservations, isAuthenticated, getProfile } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

  const openModal = () => {
    setIsOpen(true);
    setError(null);
    setSuccess(false);
  };

  const closeModal = () => {
    setIsOpen(false);
    setError(null);
    setSuccess(false);
  };

  const submitReservation = async (reservationData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Verificar autenticación
      if (!isAuthenticated) {
        throw new Error('Debes iniciar sesión para hacer una reserva');
      }

      console.log('Estado de autenticación:', { isAuthenticated, userInfo });

      // Inicializar con userInfo del contexto si está disponible
      let currentUserInfo = userInfo;
      console.log('UserInfo inicial del contexto:', currentUserInfo);
      
      // Si no hay userInfo en el contexto, intentar obtener el perfil
      if (!currentUserInfo || !currentUserInfo._id) {
        try {
          console.log('Obteniendo perfil del usuario...');
          const profileResult = await getProfile();
          console.log('Resultado del perfil:', profileResult);
          
          if (profileResult && profileResult.success && profileResult.user && profileResult.user._id) {
            currentUserInfo = profileResult.user;
            console.log('Perfil obtenido exitosamente:', currentUserInfo);
          } else {
            console.log('Error al obtener perfil o perfil no válido:', profileResult);
          }
        } catch (profileError) {
          console.error('Error al obtener perfil:', profileError);
        }
      }

      // Verificar que tenemos el ID del usuario
      console.log('Verificando currentUserInfo:', currentUserInfo);
      console.log('currentUserInfo._id:', currentUserInfo?._id);
      console.log('Tipo de _id:', typeof currentUserInfo?._id);
      
      if (!currentUserInfo) {
        console.error('currentUserInfo es null o undefined');
        throw new Error('No se pudo obtener la información del usuario. Por favor, inicia sesión nuevamente.');
      }
      
      if (!currentUserInfo._id && !currentUserInfo.id) {
        console.error('UserInfo sin _id ni id válido:', currentUserInfo);
        console.error('Propiedades disponibles:', Object.keys(currentUserInfo));
        throw new Error('Información de usuario incompleta. Por favor, inicia sesión nuevamente.');
      }

      // Usar _id o id como fallback
      const userId = currentUserInfo._id || currentUserInfo.id;
      console.log('ID del usuario a usar:', userId);

      // Validar datos de reserva
      if (!reservationData.vehiculoID) {
        throw new Error('ID del vehículo no válido');
      }

      if (!reservationData.fechaInicio || !reservationData.fechaDevolucion) {
        throw new Error('Las fechas de inicio y devolución son requeridas');
      }

      // Validar que la fecha de devolución sea posterior a la fecha de inicio
      const fechaInicio = new Date(reservationData.fechaInicio);
      const fechaDevolucion = new Date(reservationData.fechaDevolucion);
      
      if (fechaDevolucion <= fechaInicio) {
        throw new Error('La fecha de devolución debe ser posterior a la fecha de inicio');
      }

      // Validar que las fechas no sean en el pasado
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      if (fechaInicio < hoy) {
        throw new Error('La fecha de inicio no puede ser en el pasado');
      }

      // Validar datos del cliente de la reserva
      if (!reservationData.clienteReserva || 
          !reservationData.clienteReserva.nombre || 
          !reservationData.clienteReserva.telefono || 
          !reservationData.clienteReserva.correoElectronico) {
        throw new Error('Todos los datos del cliente son requeridos');
      }

      console.log('UserInfo válido:', currentUserInfo);
      console.log('ReservationData:', reservationData);

      console.log('=== DATOS DE LA RESERVA ===');
      console.log('Usuario autenticado (quien hace la reserva):', {
        id: userId,
        nombre: currentUserInfo.nombre || currentUserInfo.nombres,
        correo: currentUserInfo.correo || currentUserInfo.email
      });
      console.log('Cliente beneficiario (datos del formulario):', reservationData.clienteReserva);
      console.log('================================');

      // Enviar los datos del cliente beneficiario en el array 'cliente'
      const dataToSend = {
        clientID: userId, // ID del usuario autenticado que hace la reserva
        vehiculoID: reservationData.vehiculoID,
        fechaInicio: reservationData.fechaInicio,
        fechaDevolucion: reservationData.fechaDevolucion,
        comentarios: reservationData.comentarios || '',
        estado: 'Pendiente',
        precioPorDia: reservationData.precioPorDia || 0,
        // Array cliente con los datos del formulario (cliente beneficiario)
        cliente: [{
          nombre: reservationData.clienteReserva.nombre,
          telefono: reservationData.clienteReserva.telefono,
          correoElectronico: reservationData.clienteReserva.correoElectronico
        }]
      };

      console.log('=== ESTRUCTURA ENVIADA AL BACKEND ===');
      console.log('clientID (usuario autenticado):', dataToSend.clientID);
      console.log('cliente (array con datos del formulario):', dataToSend.cliente);
      console.log('RESULTADO: clientID = usuario autenticado, cliente = datos del formulario');
      console.log('=====================================');

      console.log('Datos a enviar:', dataToSend);
      console.log('URL de la API:', `${API_URL}/reservas`);

      const response = await fetch(`${API_URL}/reservas`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      const result = await response.json();
      console.log('Respuesta del servidor:', result);

      if (!response.ok) {
        // Manejar diferentes tipos de errores
        if (response.status === 401) {
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        } else if (response.status === 400) {
          throw new Error(result.message || 'Datos de reserva inválidos');
        } else if (response.status === 409) {
          throw new Error('El vehículo ya está reservado para esas fechas');
        } else {
          throw new Error(result.message || 'Error al enviar la solicitud');
        }
      }

      // Verificar si el backend retorna success o si el mensaje indica éxito
      if (result.message && result.message.includes('saved')) {
        console.log('Reserva creada exitosamente:', result);
        setSuccess(true);
        
        // Invalidar las reservas para que se recarguen
        if (invalidateReservations) {
          invalidateReservations();
        }
        
        // Cerrar modal después de 2 segundos
        setTimeout(() => {
          closeModal();
        }, 2000);
        
        return result;
      } else {
        throw new Error(result.message || 'Error al procesar la reserva');
      }
      
    } catch (err) {
      console.error('Error en submitReservation:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkExistingReservations = async (vehiculoId) => {
    try {
      console.log('Verificando reservas existentes...');
      const response = await fetch(`${API_URL}/reservas/mis-reservas`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.reservas) {
          // Verificar si hay reservas pendientes o activas para este vehículo
          const reservaExistente = result.reservas.find(reserva => 
            reserva.vehiculoID._id === vehiculoId && 
            (reserva.estado === 'Pendiente' || reserva.estado === 'Activa')
          );
          
          if (reservaExistente) {
            console.log('Reserva existente encontrada:', reservaExistente);
            return {
              hasExisting: true,
              reserva: reservaExistente
            };
          }
        }
      }
      
      return { hasExisting: false };
    } catch (error) {
      console.error('Error verificando reservas:', error);
      return { hasExisting: false }; // En caso de error, permitir continuar
    }
  };

  return {
    isOpen,
    loading,
    error,
    success,
    openModal,
    closeModal,
    submitReservation,
    checkExistingReservations
  };
};

export default useReservationRequestModal;