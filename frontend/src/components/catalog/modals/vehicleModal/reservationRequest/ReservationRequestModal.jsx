import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import { FaCar, FaTimes, FaChevronLeft, FaChevronRight, FaImage } from 'react-icons/fa';
import './ReservationRequest.css';

const ReservationRequestModal = ({ 
  isOpen, 
  onClose, 
  vehicle, 
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
      vehiculoID: vehicle._id,
      fechaInicio: formData.fechaInicio,
      fechaDevolucion: formData.fechaDevolucion,
      comentarios: formData.comentarios,
      precioPorDia: vehicle.precioPorDia || 0,
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

  if (!isOpen || !vehicle) return null;

  // Obtener fecha mínima (hoy)
  const today = new Date().toISOString().split('T')[0];

  // Galería de imágenes (similar a VehiculoModal)
  const images = [vehicle.imagenVista3_4, vehicle.imagenLateral, ...(vehicle.imagenes || [])].filter(Boolean);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const hasImages = images.length > 0;
  const nextImage = () => {
    if (images.length > 1) setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };
  const prevImage = () => {
    if (images.length > 1) setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="vehicle-details-modal" onClick={e => e.stopPropagation()}>
        <div className="vehicle-details-header">
          <h2><FaCar /> Solicitud de reserva</h2>
          <button className="modal-close-btn" onClick={handleClose}><FaTimes /></button>
        </div>


        <div className="vehicle-details-content">
          {/* Galería de imágenes */}
          <div className="vehicle-gallery-section">
            {hasImages ? (
              <div className="unified-carousel-container">
                <img
                  src={images[currentImageIndex]}
                  alt={vehicle.marca + ' ' + vehicle.modelo}
                  className="view-gallery"
                />
                <div className="image-counter-badge">
                  {currentImageIndex + 1} / {images.length}
                </div>
                {images.length > 1 && (
                  <>
                    <button className="carousel-nav-btn prev" onClick={prevImage} aria-label="Imagen anterior"><FaChevronLeft /></button>
                    <button className="carousel-nav-btn next" onClick={nextImage} aria-label="Imagen siguiente"><FaChevronRight /></button>
                    <div className="carousel-indicators">
                      {images.map((_, idx) => (
                        <button
                          key={idx}
                          className={`indicator-dot ${idx === currentImageIndex ? 'active' : ''}`}
                          onClick={() => setCurrentImageIndex(idx)}
                          aria-label={`Ir a imagen ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="vehicle-no-image">
                <FaImage />
                <span>Sin imagen disponible</span>
              </div>
            )}
          </div>

          {/* Formulario de reserva */}
          <div className="vehicle-info-section">
            <div className="vehicle-title">
              <h3>{vehicle.marca} {vehicle.modelo}</h3>
              <span className={`status-badge ${vehicle.estado === 'Disponible' ? 'available' : 'unavailable'}`}>
                {vehicle.estado || 'Estado desconocido'}
              </span>
            </div>
            <div className="vehicle-details-grid">
              <div className="details-section full-width">
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
                    <div className="form-row">
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
                      <button type="button" onClick={handleClose} className="btn-secondary" disabled={loading}>Cancelar</button>
                      <button type="submit" className="btn-primary" disabled={loading || !isAuthenticated}>{loading ? 'Enviando...' : 'Enviar'}</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
          {/* Información del vehículo abajo */}
          <div className="vehicle-info-section vehicle-info-bottom">
            <div className="details-section">
              <h4><FaCar /> Información del vehículo</h4>
              <div className="details-list">
                <div className="detail-item">
                  <span className="detail-label">Marca:</span>
                  <span className="detail-value">{vehicle.marca}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Modelo:</span>
                  <span className="detail-value">{vehicle.modelo}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Año:</span>
                  <span className="detail-value">{vehicle.anio}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Color:</span>
                  <span className="detail-value">{vehicle.color}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Capacidad:</span>
                  <span className="detail-value">{vehicle.capacidad} personas</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="vehicle-details-footer enhanced-footer">
          <div className="footer-btn-group">
            <button className="btn-close enhanced-btn" onClick={handleClose}><FaTimes /> Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationRequestModal;