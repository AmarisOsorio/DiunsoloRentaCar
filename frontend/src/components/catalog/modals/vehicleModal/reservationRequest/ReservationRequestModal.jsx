import React from 'react';
import useReservationRequestModal from './hooks/useReservationRequestModal';
import { FaCar, FaTimes, FaChevronLeft, FaChevronRight, FaImage } from 'react-icons/fa';
import SuccessCheckAnimation from '../../../../interactions/SuccessCheck/SuccessCheckAnimation';
import './ReservationRequest.css';

// Definición del componente modal para solicitud de reserva
const ReservationRequestModal = ({ 
  isOpen,
  onClose,
  vehicle,
  onSuccess // nueva prop para manejar éxito desde el padre
}) => {
  const {
    formData,
    setFormData,
    validationErrors,
    setValidationErrors,
    loading,
    error,
    success,
    handleSubmit,
    handleInputChange,
    resetForm,
    isAuthenticated,
    today,
    images,
    hasImages,
    currentImageIndex,
    setCurrentImageIndex,
    nextImage,
    prevImage
  } = useReservationRequestModal({ isOpen, onClose, vehicle });

  // Cierra el modal si el usuario hace clic en el fondo (backdrop) fuera del contenido del modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen || !vehicle) return null;
  // Si la reserva fue exitosa, mostrar animación de éxito
  if (success) {
    return (
      <div className="modal-overlay">
        <div className="vehicle-details-modal success-modal">
          <SuccessCheckAnimation text="¡Reserva creada exitosamente!" />
        </div>
      </div>
    );
  }
  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="vehicle-details-modal" onClick={e => e.stopPropagation()}>
        <div className="vehicle-details-header">
          <h2><FaCar /> Solicitud de reserva</h2>
          <button className="modal-close-btn" onClick={handleClose}><FaTimes /></button>
        </div>
        <div className="vehicle-details-content layout-flex">
          <div className="vehicle-gallery-info-wrapper">
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
            {/* Información del vehículo debajo de la galería */}
            <div className="vehicle-info-section">
              <div className="details-section">
                <h4><FaCar /> Información del vehículo</h4>
                <div className="details-list">
                <div className="detail-item">
                  <span className="detail-label">Vehiculo:</span>
                  <span className="detail-value">{vehicle.vehicleName}</span>
                </div>
                  <div className="detail-item">
                    <span className="detail-label">Marca:</span>
                    <span className="detail-value">{vehicle.brandId?.brandName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Modelo:</span>
                    <span className="detail-value">{vehicle.model}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Año:</span>
                    <span className="detail-value">{vehicle.year}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Color:</span>
                    <span className="detail-value">{vehicle.color}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Capacidad:</span>
                    <span className="detail-value">{vehicle.capacity} personas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Formulario de reserva ajustado a la derecha */}
          <div className="reservation-form-wrapper">
            {!isAuthenticated ? (
              <div className="error-message">
                <span className="error-icon">⚠</span>
                Debes iniciar sesión para realizar una reserva.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="reservation-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="clientName">Nombre completo</label>
                    <input
                      type="text"
                      id="clientName"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleInputChange}
                      required
                      className={`form-input ${validationErrors.clientName ? 'error' : ''}`}
                      placeholder="Nombre completo del cliente"
                    />
                    {validationErrors.clientName && (
                      <div className="field-error">{validationErrors.clientName}</div>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="clientPhone">Teléfono</label>
                    <input
                      type="tel"
                      id="clientPhone"
                      name="clientPhone"
                      value={formData.clientPhone}
                      onChange={handleInputChange}
                      required
                      className={`form-input ${validationErrors.clientPhone ? 'error' : ''}`}
                      placeholder="Número de teléfono"
                    />
                    {validationErrors.clientPhone && (
                      <div className="field-error">{validationErrors.clientPhone}</div>
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="clientEmail">Correo electrónico</label>
                  <input
                    type="email"
                    id="clientEmail"
                    name="clientEmail"
                    value={formData.clientEmail}
                    onChange={handleInputChange}
                    required
                    className={`form-input ${validationErrors.clientEmail ? 'error' : ''}`}
                    placeholder="correo@ejemplo.com"
                  />
                  {validationErrors.clientEmail && (
                    <div className="field-error">{validationErrors.clientEmail}</div>
                  )}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="startDate">Fecha de inicio</label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      min={today}
                      required
                      className={`form-input ${validationErrors.startDate ? 'error' : ''}`}
                    />
                    {validationErrors.startDate && (
                      <div className="field-error">{validationErrors.startDate}</div>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="endDate">Fecha de finalización</label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      min={formData.startDate || today}
                      required
                      className={`form-input ${validationErrors.endDate ? 'error' : ''}`}
                    />
                    {validationErrors.endDate && (
                      <div className="field-error">{validationErrors.endDate}</div>
                    )}
                  </div>
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
    </div>
  );
};

export default ReservationRequestModal;