import React, { useMemo, useEffect, useState } from 'react';
import { FaCalendarAlt, FaEdit, FaTrash, FaTimes, FaDollarSign, FaExclamationTriangle } from 'react-icons/fa';
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
    // Información del cliente
    nombreCliente: '',
    telefonoCliente: '',
    correoCliente: '',
    // Fechas
    fechaInicio: '',
    fechaDevolucion: '',
    // Vehículo (solo para mostrar, no editable por ahora)
    vehiculoID: ''
  });
  const [errors, setErrors] = useState({});

  // Cargar datos de la reserva cuando se abre el modal
  useEffect(() => {
    if (reservation && show) {
      // Fechas
      const fechaInicioRaw = reservation.fechaInicio || reservation.startDate || reservation.inicio || '';
      const fechaDevolucionRaw = reservation.fechaDevolucion || reservation.returnDate || reservation.fin || '';
      const fechaInicio = fechaInicioRaw ? new Date(fechaInicioRaw).toISOString().slice(0, 16) : '';
      const fechaDevolucion = fechaDevolucionRaw ? new Date(fechaDevolucionRaw).toISOString().slice(0, 16) : '';

      // Cliente
      const cliente = (reservation.cliente && reservation.cliente[0]) || (reservation.client && reservation.client[0]) || {};
      const nombreCliente = cliente.nombre || cliente.name || '';
      const telefonoCliente = cliente.telefono || cliente.phone || '';
      const correoCliente = cliente.correoElectronico || cliente.email || '';

      // Vehículo
      const vehiculo = reservation.vehiculoID || reservation.vehiculoId || reservation.vehicleId || {};
      const vehiculoID = vehiculo._id || reservation.vehiculoID || reservation.vehiculoId || reservation.vehicleId || '';

      setFormData({
        nombreCliente,
        telefonoCliente,
        correoCliente,
        fechaInicio,
        fechaDevolucion,
        vehiculoID
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
    const fechaInicio = new Date(formData.fechaInicio);
    const fechaDevolucion = new Date(formData.fechaDevolucion);

    // Validaciones del cliente
    if (!formData.nombreCliente.trim()) {
      newErrors.nombreCliente = 'El nombre del cliente es requerido';
    }

    if (!formData.telefonoCliente.trim()) {
      newErrors.telefonoCliente = 'El teléfono del cliente es requerido';
    }

    if (!formData.correoCliente.trim()) {
      newErrors.correoCliente = 'El correo electrónico del cliente es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.correoCliente)) {
      newErrors.correoCliente = 'El correo electrónico no es válido';
    }

    // Validaciones de fechas
    if (!formData.fechaInicio) {
      newErrors.fechaInicio = 'La fecha de inicio es requerida';
    } else if (fechaInicio < now) {
      newErrors.fechaInicio = 'La fecha de inicio no puede ser en el pasado';
    }

    if (!formData.fechaDevolucion) {
      newErrors.fechaDevolucion = 'La fecha de devolución es requerida';
    } else if (fechaDevolucion <= fechaInicio) {
      newErrors.fechaDevolucion = 'La fecha de devolución debe ser posterior a la fecha de inicio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Preparar datos para enviar al backend
    const updatedData = {
      clientID: reservation.clientID,
      cliente: [{
        nombre: formData.nombreCliente.trim(),
        telefono: formData.telefonoCliente.trim(),
        correoElectronico: formData.correoCliente.trim()
      }],
      vehiculoID: formData.vehiculoID,
      fechaInicio: formData.fechaInicio,
      fechaDevolucion: formData.fechaDevolucion,
      estado: reservation.estado,
      precioPorDia: reservation.precioPorDia // Mantener el precio original
    };

    onSave(updatedData);
  };

  if (!show) return null;

  // Vehículo robusto
  const vehiculo = reservation?.vehiculoID || reservation?.vehiculoId || reservation?.vehicleId || {};
  const nombreVehiculo = vehiculo.nombreVehiculo || vehiculo.vehicleName || vehiculo.marca || vehiculo.brand || 'Vehículo';
  const modelo = vehiculo.modelo || vehiculo.model || '';
  const color = vehiculo.color || '';
  const anio = vehiculo.anio || vehiculo.year || vehiculo.año || '';
  const imagenVehiculo = vehiculo.imagenLateral || vehiculo.sideImage || vehiculo.mainViewImage || '';

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
            <h4>Vehículo: {nombreVehiculo}</h4>
            {modelo && <p>Modelo: {modelo}</p>}
            {color && <p>Color: {color}</p>}
            {anio && <p>Año: {anio}</p>}
            {imagenVehiculo && (
              <div style={{marginTop: 8}}>
                <img src={imagenVehiculo} alt={nombreVehiculo} style={{maxWidth: 180, borderRadius: 8}} />
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="edit-form">
            {/* Información del Cliente */}
            <div className="form-section">
              <h5 className="form-section-title">Información del Cliente</h5>
              
              <div className="form-group">
                <label htmlFor="nombreCliente">
                  Nombre del Cliente
                </label>
                <input
                  type="text"
                  id="nombreCliente"
                  name="nombreCliente"
                  value={formData.nombreCliente}
                  onChange={handleInputChange}
                  className={errors.nombreCliente ? 'error' : ''}
                  placeholder="Nombre completo del cliente"
                />
                {errors.nombreCliente && <span className="error-text">{errors.nombreCliente}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="telefonoCliente">
                  Teléfono del Cliente
                </label>
                <input
                  type="tel"
                  id="telefonoCliente"
                  name="telefonoCliente"
                  value={formData.telefonoCliente}
                  onChange={handleInputChange}
                  className={errors.telefonoCliente ? 'error' : ''}
                  placeholder="Número de teléfono"
                />
                {errors.telefonoCliente && <span className="error-text">{errors.telefonoCliente}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="correoCliente">
                  Correo Electrónico del Cliente
                </label>
                <input
                  type="email"
                  id="correoCliente"
                  name="correoCliente"
                  value={formData.correoCliente}
                  onChange={handleInputChange}
                  className={errors.correoCliente ? 'error' : ''}
                  placeholder="correo@ejemplo.com"
                />
                {errors.correoCliente && <span className="error-text">{errors.correoCliente}</span>}
              </div>
            </div>

            {/* Fechas de la Reserva */}
            <div className="form-section">
              <h5 className="form-section-title">Fechas de la Reserva</h5>
              
              <div className="form-group">
                <label htmlFor="fechaInicio">
                  <FaCalendarAlt className="form-icon" />
                  Fecha de Inicio
                </label>
                <input
                  type="datetime-local"
                  id="fechaInicio"
                  name="fechaInicio"
                  value={formData.fechaInicio}
                  onChange={handleInputChange}
                  className={errors.fechaInicio ? 'error' : ''}
                />
                {errors.fechaInicio && <span className="error-text">{errors.fechaInicio}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="fechaDevolucion">
                  <FaCalendarAlt className="form-icon" />
                  Fecha de Devolución
                </label>
                <input
                  type="datetime-local"
                  id="fechaDevolucion"
                  name="fechaDevolucion"
                  value={formData.fechaDevolucion}
                  onChange={handleInputChange}
                  className={errors.fechaDevolucion ? 'error' : ''}
                />
                {errors.fechaDevolucion && <span className="error-text">{errors.fechaDevolucion}</span>}
              </div>
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

    const vehiculo = reservation?.vehiculoID || reservation?.vehiculoId || reservation?.vehicleId || {};
    const nombreVehiculo = vehiculo.nombreVehiculo || vehiculo.vehicleName || vehiculo.marca || vehiculo.brand || 'Vehículo';
    const fechaInicioRaw = reservation?.fechaInicio || reservation?.startDate || reservation?.inicio || '';
    const fechaDevolucionRaw = reservation?.fechaDevolucion || reservation?.returnDate || reservation?.fin || '';
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
              <li><strong>Estado:</strong> {reservation?.estado || 'N/A'}</li>
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
    activa: { label: 'Activa', className: 'reserva-status-activa' },
    pendiente: { label: 'Pendiente', className: 'reserva-status-pendiente' },
    finalizada: { label: 'Finalizada', className: 'reserva-status-finalizada' },
  };

  const status = statusMap[reserva.estado?.toLowerCase()] || { label: reserva.estado, className: '' };
  const isPendiente = reserva.estado?.toLowerCase() === 'pendiente';
  
  // Info del auto desde vehiculoID

  // Vehículo: usar el primer campo disponible
  const vehiculo = reserva.vehiculoID || reserva.vehiculoId || reserva.vehicleId || {};
  const marca = vehiculo.marca || vehiculo.brand || vehiculo.idMarca || '';
  const nombreVehiculo = vehiculo.nombreVehiculo || vehiculo.vehicleName || '';
  const modelo = vehiculo.modelo || vehiculo.model || '';
  const color = vehiculo.color || '';
  const anio = vehiculo.anio || vehiculo.year || vehiculo.año || '';
  const capacidad = vehiculo.capacidad || vehiculo.capacity || '';
  const clase = vehiculo.clase || vehiculo.vehicleClass || '';
  const placa = vehiculo.placa || vehiculo.plate || '';
  const imagenVehiculo = vehiculo.imagenLateral || vehiculo.sideImage || reserva.imagenVehiculo || vehiculo.mainViewImage || '';

  // Info del usuario desde cliente[0]
  const cliente = (reserva.cliente && reserva.cliente[0]) || (reserva.client && reserva.client[0]) || {};
  const nombreCliente = cliente.nombre || cliente.name || reserva.nombreCliente || reserva.nombre || '';
  const emailCliente = cliente.correoElectronico || cliente.email || reserva.emailCliente || reserva.email || '';
  const telefonoCliente = cliente.telefono || cliente.phone || reserva.telefonoCliente || reserva.telefono || reserva.celular || '';

  // Fechas
  const fechaInicio = reserva.fechaInicio || reserva.startDate || reserva.inicio || null;
  const fechaDevolucion = reserva.fechaDevolucion || reserva.returnDate || reserva.fin || null;
  const fechaFin = fechaDevolucion ? new Date(fechaDevolucion) : (reserva.fechaFin ? new Date(reserva.fechaFin) : null);
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
            {clase && <span className="reserva-clase"> - {clase}</span>}
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