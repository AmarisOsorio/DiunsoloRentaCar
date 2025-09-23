import React, { useMemo, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FaCalendarAlt, FaEdit, FaTrash, FaTimes, FaDollarSign, FaExclamationTriangle, FaCar } from 'react-icons/fa';
import { FaCircle } from 'react-icons/fa';
import { useReservas } from './hooks/useReservationHistory';
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
  const [formData, setFormData] = useState({
    // Solo fechas - campos editables
    startDate: '',
    returnDate: ''
  });
  const [errors, setErrors] = useState({});

  // Cargar datos de la reserva cuando se abre el modal
  useEffect(() => {
    if (reservation && show) {
      // Fechas
      const startDateRaw = reservation.startDate || reservation.fechaInicio || '';
      const returnDateRaw = reservation.returnDate || reservation.fechaDevolucion || '';
      const startDate = startDateRaw ? new Date(startDateRaw).toISOString().slice(0, 16) : '';
      const returnDate = returnDateRaw ? new Date(returnDateRaw).toISOString().slice(0, 16) : '';

      setFormData({
        startDate,
        returnDate
      });
      setErrors({});
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

    // Validaciones de fechas
    if (!formData.startDate) {
      newErrors.startDate = 'La fecha de inicio es requerida';
    } else if (startDate < now) {
      newErrors.startDate = 'La fecha de inicio no puede ser en el pasado';
    }

    if (!formData.returnDate) {
      newErrors.returnDate = 'La fecha de devolución es requerida';
    } else if (returnDate <= startDate) {
      newErrors.returnDate = 'La fecha de devolución debe ser posterior a la fecha de inicio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Preparar datos para enviar al backend (solo fechas, mantener todo lo demás)
    const updatedData = {
      clientId: reservation.clientId?._id || reservation.clientId,
      vehicleId: reservation.vehicleId?._id || reservation.vehiculoID?._id,
      startDate: formData.startDate,
      returnDate: formData.returnDate,
      status: reservation.status || reservation.estado,
      pricePerDay: reservation.pricePerDay || reservation.precioPorDia
    };

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

  // Información del vehículo - usar vehículo temporal si existe
  const currentVehicle = reservation?.tempVehicle || reservation?.vehicleId || reservation?.vehiculoID || {};
  const isUsingTempVehicle = !!reservation?.tempVehicle;
  
  const nombreVehiculo = currentVehicle.vehicleName || currentVehicle.nombreVehiculo || currentVehicle.brand || 'Vehículo';
  const modelo = currentVehicle.model || currentVehicle.modelo || '';
  const color = currentVehicle.color || '';
  const anio = currentVehicle.year || currentVehicle.anio || '';
  const imagenVehiculo = currentVehicle.sideImage || currentVehicle.imagenLateral || currentVehicle.mainViewImage || '';

  // Información del cliente
  const cliente = reservation?.clientId || {};
  const nombreCliente = cliente.name || cliente.nombres || cliente.nombre || 'Cliente';

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
            {modelo && <p>Modelo: {modelo}</p>}
            {color && <p>Color: {color}</p>}
            {anio && <p>Año: {anio}</p>}
            <p>Cliente: {nombreCliente}</p>
            {imagenVehiculo && (
              <div style={{marginTop: 8}}>
                <img src={imagenVehiculo} alt={nombreVehiculo} style={{maxWidth: 180, borderRadius: 8}} />
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
  const statusMap = {
    pending: { label: 'Pendiente', className: 'reserva-status-pendiente' },
    active: { label: 'Activa', className: 'reserva-status-activa' },
    completed: { label: 'Completada', className: 'reserva-status-finalizada' },
  };

  const currentStatus = (reserva.status || reserva.estado || '').toLowerCase();
  const status = statusMap[currentStatus] || { label: reserva.status || reserva.estado, className: '' };
  const isPendiente = currentStatus === 'pending';
  
  // Información del vehículo
  const vehiculo = reserva.vehicleId || reserva.vehiculoID || {};
  const marca = vehiculo.brand || vehiculo.marca || '';
  const nombreVehiculo = vehiculo.vehicleName || vehiculo.nombreVehiculo || '';
  const modelo = vehiculo.model || vehiculo.modelo || '';
  const color = vehiculo.color || '';
  const anio = vehiculo.year || vehiculo.anio || '';
  const capacidad = vehiculo.capacity || vehiculo.capacidad || '';
  const placa = vehiculo.plate || vehiculo.placa || '';
  const imagenVehiculo = vehiculo.sideImage || vehiculo.imagenLateral || reserva.imagenVehiculo || vehiculo.mainViewImage || '';

  // Información del cliente (ahora desde clientId populate)
  const cliente = reserva.clientId || {};
  const nombreCliente = cliente.name || cliente.nombres || cliente.nombre || '';
  const emailCliente = cliente.email || cliente.correo || '';
  const telefonoCliente = cliente.phone || cliente.telefono || '';

  // Fechas
  const fechaInicio = reserva.startDate || reserva.fechaInicio || null;
  const fechaDevolucion = reserva.returnDate || reserva.fechaDevolucion || null;
  const fechaFin = fechaDevolucion ? new Date(fechaDevolucion) : null;
  const fechaInicioObj = fechaInicio ? new Date(fechaInicio) : null;
  
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
              <span>Inicio: {fechaInicioObj ? fechaInicioObj.toLocaleString() : 'Sin fecha'}</span>
            </div>
            <div className="reserva-fecha">
              <FaCalendarAlt className="reserva-icon" />
              <span>Devolución: {fechaFin ? fechaFin.toLocaleString() : 'Sin fecha'}</span>
            </div>
          </div>
        </div>
        {imagenVehiculo && (
          <div className="reserva-vehiculo-img-side">
            <img className="reserva-vehiculo-img ajustada" src={imagenVehiculo} alt={nombreVehiculo || 'Vehículo'} />
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
    setError
  } = useReservas(shouldFetch);
  
  // Estado para el vehículo temporalmente seleccionado
  const [tempSelectedVehicle, setTempSelectedVehicle] = useState(null);
  const location = useLocation();

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

    if (openEditModal && selectedVehicleId && reservationId) {
      // Crear objeto de vehículo temporal con la información disponible
      const tempVehicle = {
        _id: selectedVehicleId,
        vehicleName: selectedVehicleName
      };
      
      // Crear reserva temporal para el modal de edición
      const tempReservation = {
        _id: reservationId,
        startDate: startDate,
        returnDate: returnDate,
        clientId: { name: clientName },
        tempVehicle: tempVehicle,
        status: 'Pending'
      };
      
      setTempSelectedVehicle(tempVehicle);
      // Abrir el modal de edición directamente con el nuevo vehículo
      handleEditReservation(tempReservation);
      
      // Limpiar la URL
      window.history.replaceState({}, '', '/perfil');
    }
  }, [location.search, handleEditReservation]);
  
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