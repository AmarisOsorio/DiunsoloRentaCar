import React, { useMemo, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FaCalendarAlt, FaEdit, FaTrash, FaTimes, FaDollarSign, FaExclamationTriangle, FaCar } from 'react-icons/fa';
import { FaCircle } from 'react-icons/fa';
import { useReservas } from './hooks/useReservationHistory';
import { useAuth } from '../../../hooks/useAuth'; // Importar useAuth
import './ReservationHistory.css';

/**
 * Modal para editar reserva
 */
const EditReservationModal = ({ 
  show, 
  reservation, 
  onSave, 
  onCancel 
}) => {
  const { userInfo } = useAuth(); // Obtener información del usuario
  const [formData, setFormData] = useState({
    // Solo fechas - campos editables
    startDate: '',
    returnDate: ''
  });
  const [errors, setErrors] = useState({});

  // Cargar datos de la reserva cuando se abre el modal
  useEffect(() => {
    if (reservation && show) {
      console.log('📅 Cargando datos de reserva en modal:', reservation);
      
      // Fechas - CORRECCIÓN: usar las fechas reales de la reserva
      const startDateRaw = reservation.startDate || reservation.fechaInicio || '';
      const returnDateRaw = reservation.returnDate || reservation.fechaDevolucion || '';
      
      console.log('📅 Fechas raw:', { startDateRaw, returnDateRaw });
      
      // Formatear fechas para datetime-local (YYYY-MM-DDTHH:MM)
      let startDate = '';
      let returnDate = '';
      
      if (startDateRaw) {
        try {
          const startDateObj = new Date(startDateRaw);
          // Convertir a formato datetime-local
          startDate = startDateObj.toISOString().slice(0, 16);
          console.log('📅 Fecha inicio formateada:', startDate);
        } catch (error) {
          console.error('Error formateando fecha inicio:', error);
        }
      }
      
      if (returnDateRaw) {
        try {
          const returnDateObj = new Date(returnDateRaw);
          // Convertir a formato datetime-local
          returnDate = returnDateObj.toISOString().slice(0, 16);
          console.log('📅 Fecha devolución formateada:', returnDate);
        } catch (error) {
          console.error('Error formateando fecha devolución:', error);
        }
      }

      setFormData({
        startDate: startDate,
        returnDate: returnDate
      });
      setErrors({});
      
      console.log('📅 Datos cargados en formData:', { startDate, returnDate });
    }
  }, [reservation, show]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const now = new Date();
    const startDate = new Date(formData.startDate);
    const returnDate = new Date(formData.returnDate);

    // Validaciones de fechas - CORREGIDAS para permitir edición
    if (!formData.startDate) {
      newErrors.startDate = 'La fecha de inicio es requerida';
    }
    // REMOVED: Validación que impedía fechas en el pasado para reservas existentes
    // Para reservas existentes, permitir cualquier fecha válida

    if (!formData.returnDate) {
      newErrors.returnDate = 'La fecha de devolución es requerida';
    } else if (returnDate <= startDate) {
      newErrors.returnDate = 'La fecha de devolución debe ser posterior a la fecha de inicio';
    }

    // Validación adicional: fechas deben ser válidas
    if (formData.startDate && isNaN(startDate.getTime())) {
      newErrors.startDate = 'Fecha de inicio no válida';
    }
    
    if (formData.returnDate && isNaN(returnDate.getTime())) {
      newErrors.returnDate = 'Fecha de devolución no válida';
    }

    console.log('📅 Validación de formulario:', { 
      formData, 
      errors: newErrors,
      startDate: startDate.toISOString(),
      returnDate: returnDate.toISOString()
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // CORRECCIÓN: Asegurar que clientId esté disponible
    let clientId = null;
    
    // Prioridad 1: Del reservation.clientId
    if (reservation.clientId) {
      clientId = typeof reservation.clientId === 'object' ? reservation.clientId._id : reservation.clientId;
    }
    // Prioridad 2: Del usuario autenticado
    else if (userInfo) {
      clientId = userInfo._id || userInfo.id;
    }

    // Determinar vehicleId
    let vehicleId = null;
    
    // Si hay un vehículo temporal (nuevo seleccionado), usarlo
    if (reservation.tempVehicle) {
      vehicleId = reservation.tempVehicle._id;
    }
    // Si no, usar el original
    else if (reservation.vehicleId) {
      vehicleId = typeof reservation.vehicleId === 'object' ? reservation.vehicleId._id : reservation.vehicleId;
    }
    else if (reservation.vehiculoID) {
      vehicleId = typeof reservation.vehiculoID === 'object' ? reservation.vehiculoID._id : reservation.vehiculoID;
    }

    // Determinar precio por día - CORREGIDO
    let pricePerDay = 0;
    
    // Si hay vehículo temporal, usar su precio
    if (reservation.tempVehicle && reservation.tempVehicle.dailyPrice) {
      pricePerDay = reservation.tempVehicle.dailyPrice;
    }
    // Si no, usar el precio de la reserva original
    else if (reservation.pricePerDay && reservation.pricePerDay > 0) {
      pricePerDay = reservation.pricePerDay;
    }
    else if (reservation.precioPorDia && reservation.precioPorDia > 0) {
      pricePerDay = reservation.precioPorDia;
    }
    // Si el vehículo original tiene precio, usarlo
    else if (currentVehicle.dailyPrice && currentVehicle.dailyPrice > 0) {
      pricePerDay = currentVehicle.dailyPrice;
    }
    // Precio mínimo por defecto
    else {
      pricePerDay = 25000; // Precio mínimo por defecto
    }

    // Preparar datos para enviar al backend
    const updatedData = {
      clientId: clientId,
      vehicleId: vehicleId,
      startDate: formData.startDate,
      returnDate: formData.returnDate,
      status: reservation.status || reservation.estado || 'Pending',
      pricePerDay: pricePerDay
    };

    console.log('📤 Datos preparados para actualización:', updatedData);
    onSave(updatedData);
  };

  const handleChangeVehicle = () => {
    // Preparar datos de la reserva para el catálogo
    const reservationData = {
      reservationId: reservation._id,
      startDate: formData.startDate,
      returnDate: formData.returnDate,
      clientName: nombreCliente,
      editingReservation: 'true'
    };
    
    // Codificar datos como parámetros URL
    const params = new URLSearchParams(reservationData).toString();
    
    // Cerrar modal y redirigir al catálogo con parámetros
    onCancel();
    window.location.href = `/catalogo?${params}`;
  };

  if (!show) return null;

  // Información del vehículo - usar vehículo temporal si existe - CORREGIDO
  const currentVehicle = reservation?.tempVehicle || reservation?.vehicleId || reservation?.vehiculoID || {};
  const isUsingTempVehicle = !!reservation?.tempVehicle;
  
  // Mapeo más robusto de campos del vehículo
  const nombreVehiculo = currentVehicle.vehicleName || 
                         currentVehicle.nombreVehiculo || 
                         currentVehicle.brand || 
                         currentVehicle.marca || 
                         'Vehículo';
  
  const modelo = currentVehicle.model || 
                 currentVehicle.modelo || 
                 currentVehicle.year || 
                 currentVehicle.anio || 
                 '';
  
  const marca = currentVehicle.brandId?.brandName || 
                currentVehicle.brand || 
                currentVehicle.marca || 
                '';
                
  const color = currentVehicle.color || '';
  const anio = currentVehicle.year || currentVehicle.anio || '';
  const capacidad = currentVehicle.capacity || currentVehicle.capacidad || '';
  const imagenVehiculo = currentVehicle.mainViewImage || 
                        currentVehicle.sideImage || 
                        currentVehicle.imagenLateral || 
                        currentVehicle.imagenVista3_4 || 
                        '';

  // Información del cliente - CORREGIDA
  let nombreCliente = 'Cliente';
  
  if (reservation?.clientId) {
    const cliente = reservation.clientId;
    nombreCliente = cliente.name || cliente.nombres || cliente.nombre || 'Cliente';
  } else if (userInfo) {
    // Usar información del usuario autenticado si no hay cliente en la reserva
    if (userInfo.nombres && userInfo.apellidos) {
      nombreCliente = `${userInfo.nombres} ${userInfo.apellidos}`;
    } else if (userInfo.name && userInfo.lastName) {
      nombreCliente = `${userInfo.name} ${userInfo.lastName}`;
    } else {
      nombreCliente = userInfo.name || userInfo.nombres || 'Cliente';
    }
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            <FaEdit className="modal-icon" />
            Editar Reserva
          </h3>
          <button className="modal-close-btn" onClick={onCancel}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          <div className="vehicle-info">
            <h4>
              Vehículo: {nombreVehiculo}
              {isUsingTempVehicle && (
                <span style={{
                  marginLeft: '8px',
                  padding: '4px 8px',
                  background: '#fff3e0',
                  color: '#f57c00',
                  fontSize: '0.8rem',
                  borderRadius: '4px',
                  fontWeight: 'normal'
                }}>
                  🔄 Nuevo vehículo seleccionado
                </span>
              )}
            </h4>
            {marca && <p><strong>Marca:</strong> {marca}</p>}
            {modelo && <p><strong>Modelo:</strong> {modelo}</p>}
            {color && <p><strong>Color:</strong> {color}</p>}
            {anio && <p><strong>Año:</strong> {anio}</p>}
            {capacidad && <p><strong>Capacidad:</strong> {capacidad} personas</p>}
            <p><strong>Cliente:</strong> {nombreCliente}</p>
            {imagenVehiculo && (
              <div style={{marginTop: 8}}>
                <img 
                  src={imagenVehiculo} 
                  alt={nombreVehiculo} 
                  style={{maxWidth: 180, borderRadius: 8, border: '1px solid #ddd'}}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
            
            {/* Botón para cambiar vehículo */}
            <div style={{marginTop: 16}}>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={handleChangeVehicle}
                style={{
                  background: '#e3f2fd',
                  color: '#1976d2',
                  border: '1px solid #1976d2',
                  fontSize: '0.9rem',
                  padding: '8px 16px'
                }}
              >
                <FaCar className="btn-icon" />
                {isUsingTempVehicle ? 'Seleccionar otro vehículo' : 'Cambiar Vehículo'}
              </button>
              <p style={{
                fontSize: '0.85rem', 
                color: '#666', 
                marginTop: '4px',
                fontStyle: 'italic'
              }}>
                {isUsingTempVehicle 
                  ? 'Puedes seleccionar otro vehículo o confirmar este cambio'
                  : 'Te llevará al catálogo para seleccionar otro vehículo'
                }
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="edit-form">
            {/* Solo Fechas - Lo único editable */}
            <div className="form-group">
              <label htmlFor="startDate">
                <FaCalendarAlt className="form-icon" />
                Fecha de Inicio
              </label>
              <input
                type="datetime-local"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className={errors.startDate ? 'error' : ''}
                style={{ 
                  cursor: 'text',
                  backgroundColor: '#fff',
                  opacity: 1
                }}
              />
              {errors.startDate && <span className="error-text">{errors.startDate}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="returnDate">
                <FaCalendarAlt className="form-icon" />
                Fecha de Devolución
              </label>
              <input
                type="datetime-local"
                id="returnDate"
                name="returnDate"
                value={formData.returnDate}
                onChange={handleInputChange}
                className={errors.returnDate ? 'error' : ''}
                style={{ 
                  cursor: 'text',
                  backgroundColor: '#fff',
                  opacity: 1
                }}
              />
              {errors.returnDate && <span className="error-text">{errors.returnDate}</span>}
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={onCancel}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

/**
 * Modal para confirmar eliminación de reserva
 */
const DeleteConfirmationModal = ({ 
  show, 
  reservation, 
  onConfirm, 
  onCancel 
}) => {
  if (!show) return null;

  const vehiculo = reservation?.vehicleId || reservation?.vehiculoID || {};
  const nombreVehiculo = vehiculo.vehicleName || vehiculo.nombreVehiculo || vehiculo.brand || 'Vehículo';
  const fechaInicioRaw = reservation?.startDate || reservation?.fechaInicio || '';
  const fechaDevolucionRaw = reservation?.returnDate || reservation?.fechaDevolucion || '';
  const fechaInicio = fechaInicioRaw ? new Date(fechaInicioRaw).toLocaleDateString() : '';
  const fechaDevolucion = fechaDevolucionRaw ? new Date(fechaDevolucionRaw).toLocaleDateString() : '';

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-container modal-container-small" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            <FaTrash className="modal-icon" />
            Eliminar Reserva
          </h3>
          <button className="modal-close-btn" onClick={onCancel}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          <div className="warning-section">
            <FaExclamationTriangle className="warning-icon" />
            <p className="warning-text">
              ¿Estás seguro de que deseas eliminar esta reserva? Esta acción no se puede deshacer.
            </p>
          </div>

          <div className="reservation-summary">
            <h4>Detalles de la reserva:</h4>
            <ul>
              <li><strong>Vehículo:</strong> {nombreVehiculo}</li>
              {fechaInicio && <li><strong>Fecha de inicio:</strong> {fechaInicio}</li>}
              {fechaDevolucion && <li><strong>Fecha de devolución:</strong> {fechaDevolucion}</li>}
              <li><strong>Estado:</strong> {reservation?.status || reservation?.estado || 'N/A'}</li>
            </ul>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancelar
            </button>
            <button type="button" className="btn btn-danger" onClick={onConfirm}>
              <FaTrash className="btn-icon" />
              Eliminar Reserva
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Componente para mostrar una tarjeta de reserva individual
 */
const ReservaCard = React.memo(({ 
  reserva, 
  onEdit, 
  onDelete 
}) => {
  const { userInfo } = useAuth(); // Obtener información del usuario
  
  const statusMap = {
    pending: { label: 'Pendiente', className: 'reserva-status-pendiente' },
    active: { label: 'Activa', className: 'reserva-status-activa' },
    completed: { label: 'Completada', className: 'reserva-status-finalizada' },
  };

  const currentStatus = (reserva.status || reserva.estado || '').toLowerCase();
  const status = statusMap[currentStatus] || { label: reserva.status || reserva.estado, className: '' };
  const isPendiente = currentStatus === 'pending';
  
  // Información del vehículo - DATOS REALES DE LA BASE DE DATOS
  const vehiculo = reserva.vehicleId || reserva.vehiculoID || {};
  const marca = vehiculo.brandId?.brandName || vehiculo.brand || vehiculo.marca || '';
  const nombreVehiculo = vehiculo.vehicleName || vehiculo.nombreVehiculo || '';
  const modelo = vehiculo.model || vehiculo.modelo || '';
  const color = vehiculo.color || '';
  const anio = vehiculo.year || vehiculo.anio || '';
  const capacidad = vehiculo.capacity || vehiculo.capacidad || '';
  const placa = vehiculo.plate || vehiculo.placa || '';
  const imagenVehiculo = vehiculo.mainViewImage || vehiculo.sideImage || vehiculo.imagenLateral || reserva.imagenVehiculo || '';

  // Información del cliente - DATOS REALES
  let nombreCliente = 'Cliente';
  let emailCliente = '';
  let telefonoCliente = '';
  
  if (reserva.clientId && typeof reserva.clientId === 'object') {
    const cliente = reserva.clientId;
    nombreCliente = cliente.name || cliente.nombres || cliente.nombre || 'Cliente';
    emailCliente = cliente.email || cliente.correo || '';
    telefonoCliente = cliente.phone || cliente.telefono || '';
  } else if (userInfo) {
    // Usar información del usuario autenticado si no hay cliente en la reserva
    if (userInfo.nombres && userInfo.apellidos) {
      nombreCliente = `${userInfo.nombres} ${userInfo.apellidos}`;
    } else if (userInfo.name && userInfo.lastName) {
      nombreCliente = `${userInfo.name} ${userInfo.lastName}`;
    } else {
      nombreCliente = userInfo.name || userInfo.nombres || 'Cliente';
    }
    emailCliente = userInfo.email || userInfo.correo || '';
    telefonoCliente = userInfo.phone || userInfo.telefono || '';
  }

  // Fechas - DATOS REALES DE LA BASE DE DATOS
  const fechaInicio = reserva.startDate || reserva.fechaInicio || null;
  const fechaDevolucion = reserva.returnDate || reserva.fechaDevolucion || null;
  
  // Formatear fechas correctamente
  const formatFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';
    try {
      const fechaObj = new Date(fecha);
      return fechaObj.toLocaleString('es-CR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return 'Fecha inválida';
    }
  };
  
  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(reserva);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(reserva);
  };

  return (
    <div className="reserva-card">
      <div className="reserva-card-header">
        {status.label && (
          <span className={`reserva-status ${status.className}`}>
            <FaCircle style={{ fontSize: '0.7em', marginRight: 6, color: status.className === 'reserva-status-activa' ? '#1bb76e' : status.className === 'reserva-status-pendiente' ? '#e6a100' : '#1976d2' }} />
            {status.label}
          </span>
        )}
        {isPendiente && (
          <div className="reserva-acciones-header">
            <button 
              className="reserva-btn editar"
              onClick={handleEdit}
              title="Editar reserva"
            >
              <FaEdit className="btn-icon" />
              Editar
            </button>
            <button 
              className="reserva-btn eliminar"
              onClick={handleDelete}
              title="Eliminar reserva"
            >
              <FaTrash className="btn-icon" />
              Eliminar
            </button>
          </div>
        )}
      </div>
      <div className="reserva-card-body body-flex-row">
        <div className="reserva-card-info">
          {/* Info cliente */}
          <div className="reserva-cliente">
            <span className="reserva-cliente-nombre">{nombreCliente}</span>
            {emailCliente && <span className="reserva-cliente-email"> | {emailCliente}</span>}
            {telefonoCliente && <span className="reserva-cliente-tel"> | {telefonoCliente}</span>}
          </div>
          {/* Info vehículo */}
          <div className="reserva-vehiculo">
            {marca && <span className="reserva-marca">{marca}</span>}
            {nombreVehiculo && <span className="reserva-modelo"> {nombreVehiculo}</span>}
            {modelo && <span className="reserva-modelo"> {modelo}</span>}
            {anio && <span className="reserva-anio"> ({anio})</span>}
            {color && <span className="reserva-color"> - {color}</span>}
            {capacidad && <span className="reserva-capacidad"> - {capacidad} pasajeros</span>}
            {placa && <span className="reserva-placa"> - Placa: {placa}</span>}
          </div>
          <div className="reserva-fechas-group">
            <div className="reserva-fecha">
              <FaCalendarAlt className="reserva-icon" />
              <span>Inicio: {formatFecha(fechaInicio)}</span>
            </div>
            <div className="reserva-fecha">
              <FaCalendarAlt className="reserva-icon" />
              <span>Devolución: {formatFecha(fechaDevolucion)}</span>
            </div>
          </div>
        </div>
        {imagenVehiculo && (
          <div className="reserva-vehiculo-img-side">
            <img 
              className="reserva-vehiculo-img ajustada" 
              src={imagenVehiculo} 
              alt={nombreVehiculo || 'Vehículo'} 
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
});

ReservaCard.displayName = 'ReservaCard';

/**
 * Componente para mostrar las reservas del usuario
 * @param {boolean} shouldFetch - Indica si se deben cargar las reservas
 */
const Reservas = ({ shouldFetch = false }) => {
  const { 
    reservas, 
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
  } = useReservas(shouldFetch);
  
  // Estado para el vehículo temporalmente seleccionado
  const [tempSelectedVehicle, setTempSelectedVehicle] = useState(null);
  const location = useLocation();
  const { userInfo } = useAuth(); // Obtener información del usuario autenticado

  // Detectar si regresa del catálogo con un vehículo seleccionado para abrir modal de edición
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const openEditModal = urlParams.get('openEditModal') === 'true';
    const selectedVehicleId = urlParams.get('selectedVehicleId');
    const selectedVehicleName = urlParams.get('selectedVehicleName');
    const reservationId = urlParams.get('reservationId');
    const startDate = urlParams.get('startDate');
    const returnDate = urlParams.get('returnDate');
    const clientName = urlParams.get('clientName');

    // CORRECCIÓN: Obtener información completa del vehículo de los parámetros URL
    const selectedVehicleBrand = urlParams.get('selectedVehicleBrand');
    const selectedVehicleModel = urlParams.get('selectedVehicleModel');
    const selectedVehicleYear = urlParams.get('selectedVehicleYear');
    const selectedVehicleColor = urlParams.get('selectedVehicleColor');
    const selectedVehicleCapacity = urlParams.get('selectedVehicleCapacity');
    const selectedVehiclePrice = urlParams.get('selectedVehiclePrice');
    const selectedVehicleMainImage = urlParams.get('selectedVehicleMainImage');

    if (openEditModal && selectedVehicleId && reservationId) {
      // Crear objeto de vehículo temporal con la información completa disponible
      const tempVehicle = {
        _id: selectedVehicleId,
        vehicleName: selectedVehicleName,
        brand: selectedVehicleBrand,
        model: selectedVehicleModel,
        year: selectedVehicleYear,
        color: selectedVehicleColor,
        capacity: selectedVehicleCapacity,
        dailyPrice: selectedVehiclePrice ? parseInt(selectedVehiclePrice) : 25000,
        mainViewImage: selectedVehicleMainImage,
        sideImage: selectedVehicleMainImage,
        // Mapeo adicional para compatibilidad
        brandId: { brandName: selectedVehicleBrand },
        anio: selectedVehicleYear,
        capacidad: selectedVehicleCapacity,
        imagenLateral: selectedVehicleMainImage,
        imagenVista3_4: selectedVehicleMainImage
      };
      
      // CORRECCIÓN: Crear reserva temporal con toda la información necesaria incluyendo cliente
      const tempReservation = {
        _id: reservationId,
        startDate: startDate,
        returnDate: returnDate,
        // Asegurar que clientId esté disponible
        clientId: userInfo ? {
          _id: userInfo._id || userInfo.id,
          name: clientName || (userInfo.nombres && userInfo.apellidos ? `${userInfo.nombres} ${userInfo.apellidos}` : userInfo.name || 'Cliente'),
          email: userInfo.email || userInfo.correo || '',
          phone: userInfo.phone || userInfo.telefono || ''
        } : {
          _id: 'temp-client-id',
          name: clientName || 'Cliente'
        },
        tempVehicle: tempVehicle,
        status: 'Pending',
        pricePerDay: tempVehicle.dailyPrice
      };
      
      setTempSelectedVehicle(tempVehicle);
      // Abrir el modal de edición directamente con el nuevo vehículo
      handleEditReservation(tempReservation);
      
      // Limpiar la URL inmediatamente para evitar loops
      window.history.replaceState({}, '', '/perfil');
    }
  }, [location.search, userInfo, handleEditReservation]);
  
  // Solo log cuando cambien los valores importantes
  useEffect(() => {
    console.log('📊 Reservas state update - reservas:', reservas.length, 'loading:', loading, 'error:', error);
  }, [reservas.length, loading, error]);

  // Memorizar las reservas para evitar re-renders innecesarios
  const memoizedReservas = useMemo(() => reservas, [reservas]);

  // Función para limpiar errores después de un tiempo
  useEffect(() => {
    if (error && !error.includes('demostración')) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, setError]);

  return (
    <div className="perfil-content">
      <div className="perfil-section">
        <h2 className="perfil-section-title">
          <FaCalendarAlt className="perfil-section-icon" />
          Reservas
        </h2>
        
        {loading && (
          <span className="perfil-loading-text">Cargando reservas
            <span className="perfil-loading-dots">
              <span className="dot">.</span>
              <span className="dot">.</span>
              <span className="dot">.</span>
            </span>
          </span>
        )}
        
        {error && (
          <div className={`perfil-error ${error.includes('demostración') ? 'perfil-warning' : ''}`}>
            {error}
          </div>
        )}
        
        {/* NUEVO: Mensaje de éxito cuando se actualiza una reserva */}
        {updateSuccess && updateMessage && (
          <div className="perfil-success">
            <span className="success-icon">✅</span>
            {updateMessage}
          </div>
        )}
        
        {!loading && !error && memoizedReservas.length === 0 && (
          <div className="perfil-coming-soon">
            <div className="invitacion-icono">
              <FaCalendarAlt size={38} />
            </div>
            <h3 className="invitacion-titulo">¡Aún no tienes reservas!</h3>
            <p className="invitacion-texto">
              Descubre nuestra variedad de vehículos y realiza tu primera reserva en solo minutos.
            </p>
            <a href="/catalogo" className="catalogo-link invitacion-boton">Ver catálogo</a>
          </div>
        )}
        
        <div className="reservas-list">
          {memoizedReservas.map((reserva, idx) => (
            <ReservaCard 
              key={reserva._id || reserva.id || idx} 
              reserva={reserva} 
              onEdit={handleEditReservation}
              onDelete={handleDeleteReservation}
            />
          ))}
        </div>
      </div>

      {/* Modal de edición */}
      <EditReservationModal
        show={showEditModal}
        reservation={editingReservation}
        onSave={handleSaveEdit}
        onCancel={handleCancelEdit}
      />

      {/* Modal de confirmación de eliminación */}
      <DeleteConfirmationModal
        show={showDeleteModal}
        reservation={reservationToDelete}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default Reservas;