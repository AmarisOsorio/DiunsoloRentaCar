import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../src/context/AuthContext';
import '../styles/modals/ReservationRequest.css';

const ReservationRequestModal = ({ 
  isOpen, 
  onClose, 
  vehiculo, 
  onSubmit, 
  loading, 
  error, 
  success 
}) => {
  const { isAuthenticated, userInfo } = useAuth();
  const [formData, setFormData] = useState({
    // Datos de la reserva
    fechaInicio: '',
    fechaDevolucion: '',
    comentarios: '',
    // Datos del cliente de la reserva
    nombreCliente: '',
    telefonoCliente: '',
    correoElectronicoCliente: ''
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Resetear errores de validación cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setValidationErrors({});
      // Verificar autenticación cuando se abre el modal
      if (!isAuthenticated) {
        console.warn('Usuario no autenticado al abrir modal de reserva');
      } else {
        console.log('Usuario autenticado:', { isAuthenticated, userInfo });
      }
    }
  }, [isOpen, isAuthenticated, userInfo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error de validación cuando el usuario comience a escribir
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Validaciones de fechas
    if (!formData.fechaInicio) {
      errors.fechaInicio = 'La fecha de inicio es requerida';
    }
    
    if (!formData.fechaDevolucion) {
      errors.fechaDevolucion = 'La fecha de devolución es requerida';
    }
    
    if (formData.fechaInicio && formData.fechaDevolucion) {
      const fechaInicio = new Date(formData.fechaInicio);
      const fechaDevolucion = new Date(formData.fechaDevolucion);
      
      if (fechaDevolucion <= fechaInicio) {
        errors.fechaDevolucion = 'La fecha de devolución debe ser posterior a la fecha de inicio';
      }
      
      // Validar que las fechas no sean en el pasado
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      if (fechaInicio < hoy) {
        errors.fechaInicio = 'La fecha de inicio no puede ser en el pasado';
      }
    }

    // Validaciones de datos del cliente
    if (!formData.nombreCliente.trim()) {
      errors.nombreCliente = 'El nombre del cliente es requerido';
    }
    
    if (!formData.telefonoCliente.trim()) {
      errors.telefonoCliente = 'El teléfono del cliente es requerido';
    }
    
    if (!formData.correoElectronicoCliente.trim()) {
      errors.correoElectronicoCliente = 'El correo electrónico del cliente es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.correoElectronicoCliente)) {
      errors.correoElectronicoCliente = 'El correo electrónico no es válido';
    }
    
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Verificar autenticación antes de validar el formulario
    if (!isAuthenticated) {
      console.error('Usuario no autenticado al intentar enviar reserva');
      return;
    }
    
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    const reservationData = {
      vehiculoID: vehiculo._id,
      fechaInicio: formData.fechaInicio,
      fechaDevolucion: formData.fechaDevolucion,
      comentarios: formData.comentarios,
      precioPorDia: vehiculo.precioPorDia || 0,
      // Datos del cliente de la reserva
      clienteReserva: {
        nombre: formData.nombreCliente.trim(),
        telefono: formData.telefonoCliente.trim(),
        correoElectronico: formData.correoElectronicoCliente.trim()
      }
    };

    onSubmit(reservationData);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const resetForm = () => {
    setFormData({
      fechaInicio: '',
      fechaDevolucion: '',
      comentarios: '',
      nombreCliente: '',
      telefonoCliente: '',
      correoElectronicoCliente: ''
    });
    setValidationErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen || !vehiculo) return null;

  // Obtener fecha mínima (hoy)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="reservation-modal-backdrop" onClick={handleBackdropClick}>
      <div className="reservation-modal-container">
        <button className="reservation-modal-close" onClick={handleClose}>×</button>
        
        <div className="reservation-modal-content">
          {/* Header */}
          <div className="reservation-modal-header">
            <h2 className="reservation-title">Solicitud de reserva</h2>
            <div className="vehiculo-info">
              <img 
                src={vehiculo.imagenes?.[0] || '/default-car.jpg'} 
                alt={vehiculo.nombreVehiculo}
                className="vehiculo-thumbnail"
              />
              <div className="vehiculo-details">
                <h3>{vehiculo.nombreVehiculo}</h3>
                <p>{vehiculo.modelo} - {vehiculo.color}</p>
                <p className="vehiculo-capacity">👥 {vehiculo.capacidad} personas</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="reservation-modal-body">
            {!isAuthenticated ? (
              <div className="error-message">
                <span className="error-icon">⚠</span>
                Debes iniciar sesión para realizar una reserva.
              </div>
            ) : success ? (
              <div className="success-message">
                <div className="success-icon">✓</div>
                <h3>¡Solicitud enviada exitosamente!</h3>
                <p>Tu solicitud de reserva ha sido enviada y está pendiente de aprobación.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="reservation-form">
                {/* Sección de datos del cliente */}
                <div className="form-section">
                  <h3 className="section-title">Datos del cliente beneficiario</h3>
                  <p className="section-description">
                    Ingresa los datos de la persona que usará el vehículo. 
                    La reserva se asociará a tu cuenta, pero estos datos aparecerán en el contrato.
                  </p>
                  
                  <div className="form-group">
                    <label htmlFor="nombreCliente">Nombre completo</label>
                    <input
                      type="text"
                      id="nombreCliente"
                      name="nombreCliente"
                      value={formData.nombreCliente}
                      onChange={handleInputChange}
                      required
                      className={`form-input ${validationErrors.nombreCliente ? 'error' : ''}`}
                      placeholder="Nombre completo del cliente"
                    />
                    {validationErrors.nombreCliente && (
                      <div className="field-error">{validationErrors.nombreCliente}</div>
                    )}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="telefonoCliente">Teléfono</label>
                      <input
                        type="tel"
                        id="telefonoCliente"
                        name="telefonoCliente"
                        value={formData.telefonoCliente}
                        onChange={handleInputChange}
                        required
                        className={`form-input ${validationErrors.telefonoCliente ? 'error' : ''}`}
                        placeholder="Número de teléfono"
                      />
                      {validationErrors.telefonoCliente && (
                        <div className="field-error">{validationErrors.telefonoCliente}</div>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="correoElectronicoCliente">Correo electrónico</label>
                      <input
                        type="email"
                        id="correoElectronicoCliente"
                        name="correoElectronicoCliente"
                        value={formData.correoElectronicoCliente}
                        onChange={handleInputChange}
                        required
                        className={`form-input ${validationErrors.correoElectronicoCliente ? 'error' : ''}`}
                        placeholder="correo@ejemplo.com"
                      />
                      {validationErrors.correoElectronicoCliente && (
                        <div className="field-error">{validationErrors.correoElectronicoCliente}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sección de fechas de reserva */}
                <div className="form-section">
                  <h3 className="section-title">Fechas de la reserva</h3>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="fechaInicio">Fecha de inicio</label>
                      <input
                        type="date"
                        id="fechaInicio"
                        name="fechaInicio"
                        value={formData.fechaInicio}
                        onChange={handleInputChange}
                        min={today}
                        required
                        className={`form-input ${validationErrors.fechaInicio ? 'error' : ''}`}
                      />
                      {validationErrors.fechaInicio && (
                        <div className="field-error">{validationErrors.fechaInicio}</div>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="fechaDevolucion">Fecha de finalización</label>
                      <input
                        type="date"
                        id="fechaDevolucion"
                        name="fechaDevolucion"
                        value={formData.fechaDevolucion}
                        onChange={handleInputChange}
                        min={formData.fechaInicio || today}
                        required
                        className={`form-input ${validationErrors.fechaDevolucion ? 'error' : ''}`}
                      />
                      {validationErrors.fechaDevolucion && (
                        <div className="field-error">{validationErrors.fechaDevolucion}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Comentarios adicionales */}
                <div className="form-group">
                  <label htmlFor="comentarios">Comentarios adicionales (opcional)</label>
                  <textarea
                    id="comentarios"
                    name="comentarios"
                    value={formData.comentarios}
                    onChange={handleInputChange}
                    rows="3"
                    className="form-textarea"
                    placeholder="Agrega cualquier comentario o solicitud especial..."
                  />
                </div>

                {error && (
                  <div className="error-message">
                    <span className="error-icon">⚠</span>
                    {error}
                  </div>
                )}

                <div className="form-actions">
                  <button 
                    type="button" 
                    onClick={handleClose}
                    className="btn-secondary"
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={loading || !isAuthenticated}
                  >
                    {loading ? 'Enviando...' : 'Enviar'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationRequestModal;