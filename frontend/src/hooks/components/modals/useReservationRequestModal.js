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

      // Intentar obtener userInfo si no está disponible
      let currentUserInfo = userInfo;
      if (!currentUserInfo) {
        console.log('UserInfo no disponible, intentando obtenerlo...');
        
        // Intentar múltiples veces con delay
        let attempts = 0;
        const maxAttempts = 3;
        
        while (!currentUserInfo && attempts < maxAttempts) {
          attempts++;
          console.log(`Intento ${attempts} de ${maxAttempts} para obtener perfil`);
          
          const profileResult = await getProfile();
          console.log('Resultado del perfil:', profileResult);
          
          if (profileResult.success && profileResult.user) {
            currentUserInfo = profileResult.user;
            console.log('Perfil obtenido exitosamente:', currentUserInfo);
            break;
          } else {
            console.log('Error al obtener perfil:', profileResult.message);
            if (attempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
        }
        
        if (!currentUserInfo) {
          throw new Error('No se pudo obtener la información del usuario después de varios intentos. Por favor, cierra sesión y vuelve a iniciar sesión.');
        }
      }

      // Verificar que tenemos el ID del usuario
      if (!currentUserInfo || !currentUserInfo._id) {
        console.error('UserInfo no válido:', currentUserInfo);
        throw new Error('No se pudo obtener la información del usuario. Por favor, inicia sesión nuevamente.');
      }

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

      console.log('UserInfo válido:', currentUserInfo);
      console.log('ReservationData:', reservationData);

      // Preparar datos para enviar
      const dataToSend = {
        clientID: currentUserInfo._id,
        vehiculoID: reservationData.vehiculoID,
        fechaInicio: reservationData.fechaInicio,
        fechaDevolucion: reservationData.fechaDevolucion,
        comentarios: reservationData.comentarios || '',
        estado: 'Pendiente',
        precioPorDia: reservationData.precioPorDia || 0
      };

      // Agregar información del cliente si está disponible
      const nombre = currentUserInfo.nombre || currentUserInfo.name || currentUserInfo.fullName;
      const telefono = currentUserInfo.telefono || currentUserInfo.phone || currentUserInfo.phoneNumber;
      const correoElectronico = currentUserInfo.correoElectronico || currentUserInfo.email || currentUserInfo.correo;
      
      if (nombre && telefono && correoElectronico) {
        dataToSend.cliente = [{
          nombre: nombre,
          telefono: telefono,
          correoElectronico: correoElectronico
        }];
        console.log('Información del cliente incluida:', dataToSend.cliente);
      } else {
        console.warn('Información del cliente incompleta, enviando solo datos básicos');
        console.warn('Campos disponibles en userInfo:', Object.keys(currentUserInfo));
      }

      console.log('Datos a enviar:', dataToSend);

      const response = await fetch(`${API_URL}/reservas`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

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

      if (!result.success) {
        throw new Error(result.message || 'Error al procesar la reserva');
      }

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
      
    } catch (err) {
      console.error('Error en submitReservation:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    isOpen,
    loading,
    error,
    success,
    openModal,
    closeModal,
    submitReservation
  };
};

export default useReservationRequestModal;