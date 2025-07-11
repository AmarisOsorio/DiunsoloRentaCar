import React, { useState, useEffect } from 'react';
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
  const [formData, setFormData] = useState({
    fechaInicio: '',
    fechaDevolucion: '',
    comentarios: ''
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Resetear errores de validación cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setValidationErrors({});
    }
  }, [isOpen]);

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
    
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
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
      precioPorDia: vehiculo.precioPorDia || 0
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
      comentarios: ''
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
            <h2 className="reservation-title">Solicitar Reserva</h2>
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
            {success ? (
              <div className="success-message">
                <div className="success-icon">✓</div>
                <h3>¡Solicitud enviada exitosamente!</h3>
                <p>Tu solicitud de reserva ha sido enviada y está pendiente de aprobación.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="reservation-form">
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
                  <label htmlFor="fechaDevolucion">Fecha de devolución</label>
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
                    disabled={loading}
                  >
                    {loading ? 'Enviando...' : 'Enviar Solicitud'}
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