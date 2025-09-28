import React from 'react';
import useReservationRequestModal from './hooks/useReservationRequestModal';
import { FaCar, FaTimes, FaChevronLeft, FaChevronRight, FaImage, FaUser } from 'react-icons/fa';
import SuccessCheckAnimation from '../../../../interactions/SuccessCheck/SuccessCheckAnimation';
import { useNavigate } from 'react-router-dom';
import './ReservationRequest.css';

// Componente de alerta personalizada
const CustomAlertModal = ({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  title = "Editar información personal",
  message = "¿Quieres editar tus datos personales? Serás redirigido a tu perfil.",
  confirmText = "Ir al perfil",
  cancelText = "Cancelar"
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div 
      className="custom-alert-overlay" 
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div 
        className="custom-alert-modal" 
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
          maxWidth: '420px',
          width: '90%',
          margin: '20px',
          overflow: 'hidden',
          animation: 'scaleIn 0.3s ease-out',
          position: 'relative'
        }}
      >
        <div 
          className="custom-alert-header"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '24px 24px 16px 24px',
            borderBottom: '1px solid #f0f0f0',
            position: 'relative'
          }}
        >
          <button 
            className="custom-alert-close" 
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '14px',
              position: 'absolute',
              top: '16px',
              right: '16px'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#f5f5f5';
              e.target.style.color = '#333';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#666';
            }}
          >
            <FaTimes />
          </button>
          <div 
            className="custom-alert-icon"
            style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #1565c0, #1976d2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '20px',
              boxShadow: '0 4px 12px rgba(21, 101, 192, 0.25)',
              marginTop: '8px'
            }}
          >
            <FaUser />
          </div>
        </div>
        
        <div 
          className="custom-alert-content"
          style={{
            padding: '16px 24px 24px 24px',
            textAlign: 'center'
          }}
        >
          <h3 
            className="custom-alert-title"
            style={{
              margin: '0 0 12px 0',
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#333',
              lineHeight: '1.4'
            }}
          >
            {title}
          </h3>
          <p 
            className="custom-alert-message"
            style={{
              margin: '0',
              color: '#666',
              fontSize: '1rem',
              lineHeight: '1.5'
            }}
          >
            {message}
          </p>
        </div>
        
        <div 
          className="custom-alert-actions"
          style={{
            display: 'flex',
            gap: '12px',
            padding: '0 24px 24px 24px',
            justifyContent: 'center'
          }}
        >
          <button 
            className="custom-alert-btn custom-alert-btn-secondary" 
            onClick={onCancel}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              border: '1px solid #e9ecef',
              minWidth: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f8f9fa',
              color: '#666'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#e9ecef';
              e.target.style.borderColor = '#dee2e6';
              e.target.style.color = '#495057';
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#f8f9fa';
              e.target.style.borderColor = '#e9ecef';
              e.target.style.color = '#666';
            }}
          >
            {cancelText}
          </button>
          <button 
            className="custom-alert-btn custom-alert-btn-primary" 
            onClick={onConfirm}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              border: 'none',
              minWidth: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #1565c0, #1976d2)',
              color: 'white',
              boxShadow: '0 2px 8px rgba(21, 101, 192, 0.15)'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #0d47a1, #1565c0)';
              e.target.style.boxShadow = '0 4px 12px rgba(21, 101, 192, 0.25)';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #1565c0, #1976d2)';
              e.target.style.boxShadow = '0 2px 8px rgba(21, 101, 192, 0.15)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { 
            opacity: 0; 
            transform: scale(0.9) translateY(-20px); 
          }
          to { 
            opacity: 1; 
            transform: scale(1) translateY(0); 
          }
        }
      `}</style>
    </div>
  );
};

// Definición del componente modal para solicitud de reserva
const ReservationRequestModal = ({ 
  isOpen,
  onClose,
  vehicle,
  editingReservationData = null,
  onSuccess
}) => {
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = React.useState(false);
  
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
    prevImage,
    isEditingMode
  } = useReservationRequestModal({ isOpen, onClose, vehicle, editingReservationData });

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

  // Manejar click en campos bloqueados (solo en modo creación)
  const handleReadOnlyFieldClick = () => {
    if (!isEditingMode) {
      setShowAlert(true);
    }
  };

  // Confirmar navegación al perfil
  const handleConfirmNavigation = () => {
    setShowAlert(false);
    onClose();
    navigate('/perfil');
  };

  // Cancelar navegación
  const handleCancelNavigation = () => {
    setShowAlert(false);
  };

  if (!isOpen || !vehicle) return null;
  
  // Si la reserva fue exitosa, mostrar animación de éxito
  if (success) {
    return (
      <div className="modal-overlay">
        <div className="vehicle-details-modal success-modal">
          <SuccessCheckAnimation 
            text={isEditingMode ? "¡Vehículo cambiado exitosamente!" : "¡Reserva creada exitosamente!"} 
          />
        </div>
      </div>
    );
  }
  
  return (
    <>
      <div className="modal-overlay" onClick={handleBackdropClick}>
        <div className="vehicle-details-modal" onClick={e => e.stopPropagation()}>
          <div className="vehicle-details-header">
            <h2>
              <FaCar /> 
              {isEditingMode ? 'Cambiar vehículo de reserva' : 'Solicitud de reserva'}
            </h2>
            <button className="modal-close-btn" onClick={handleClose}><FaTimes /></button>
          </div>
          
          {/* Mensaje informativo en modo edición */}
          {isEditingMode && (
            <div style={{
              background: '#e8f5e8',
              border: '1px solid #4caf50',
              padding: '12px 24px',
              color: '#2e7d32',
              fontWeight: '500',
              fontSize: '0.95rem'
            }}>
              🔄 Cambiando el vehículo de tu reserva. Las fechas se mantendrán como están configuradas.
            </div>
          )}
          
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
                        readOnly={!isEditingMode}
                        onClick={handleReadOnlyFieldClick}
                        className={`form-input ${!isEditingMode ? 'readonly' : ''} ${validationErrors.clientName ? 'error' : ''}`}
                        placeholder="Nombre completo del cliente"
                        title={!isEditingMode ? "Haz clic para editar en tu perfil" : ""}
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
                        readOnly={!isEditingMode}
                        onClick={handleReadOnlyFieldClick}
                        className={`form-input ${!isEditingMode ? 'readonly' : ''} ${validationErrors.clientPhone ? 'error' : ''}`}
                        placeholder="Número de teléfono"
                        title={!isEditingMode ? "Haz clic para editar en tu perfil" : ""}
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
                      readOnly={!isEditingMode}
                      onClick={handleReadOnlyFieldClick}
                      className={`form-input ${!isEditingMode ? 'readonly' : ''} ${validationErrors.clientEmail ? 'error' : ''}`}
                      placeholder="correo@ejemplo.com"
                      title={!isEditingMode ? "Haz clic para editar en tu perfil" : ""}
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
                    <button type="button" onClick={handleClose} className="btn-secondary" disabled={loading}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn-primary" disabled={loading || !isAuthenticated}>
                      {loading ? 'Procesando...' : (isEditingMode ? 'Cambiar Vehículo' : 'Enviar')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Alerta personalizada para editar perfil (solo en modo creación) */}
      {!isEditingMode && (
        <CustomAlertModal
          isOpen={showAlert}
          onConfirm={handleConfirmNavigation}
          onCancel={handleCancelNavigation}
          title="Editar información personal"
          message="¿Quieres editar tus datos personales? Serás redirigido a tu perfil donde podrás actualizar tu información."
          confirmText="Ir al perfil"
          cancelText="Cancelar"
        />
      )}
    </>
  );
};

export default ReservationRequestModal;