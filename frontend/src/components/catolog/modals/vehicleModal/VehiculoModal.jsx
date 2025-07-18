import React, { useState } from 'react';
import './VehiculoModal.css';
import ReservationRequestModal from './reservationRequest/ReservationRequestModal';
import useReservationRequestModal from './reservationRequest/hooks/useReservationRequestModal';
import { useAuth } from '../../../../context/AuthContext';
import LoginModal from '../../../home/modals/login/LoginModal';

const VehiculoModal = ({ 
  vehiculo, 
  isOpen, 
  onClose, 
  imagenActual, 
  setImagenActual, 
  getEstadoClass, 
  cambiarImagen, 
  handleBackdropClick 
}) => {
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const {
    isOpen: isReservationOpen,
    loading: reservationLoading,
    error: reservationError,
    success: reservationSuccess,
    openModal: openReservationModal,
    closeModal: closeReservationModal,
    submitReservation
  } = useReservationRequestModal();

  const handleSolicitarReserva = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    openReservationModal();
  };

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
  };

  const handleReservationSubmit = async (reservationData) => {
    try {
      await submitReservation(reservationData);
      // La modal se cerrará automáticamente en caso de éxito
    } catch (error) {
      console.error('Error al enviar reserva:', error);
    }
  };

  if (!isOpen || !vehiculo) return null;

  return (
    <>
      <div className="modal-backdrop" onClick={handleBackdropClick}>
        <div className="modal-container">
          <button className="modal-close" onClick={onClose}>×</button>
          
          <div className="modal-content">
            {/* Header del modal */}
            <div className="modal-header">
              <h2 className="vehiculo-title">{vehiculo.nombreVehiculo}</h2>
              <div className={`vehiculo-estado-modal ${getEstadoClass(vehiculo.estado)}`}>
                <span className="estado-icon">
                  {getEstadoClass(vehiculo.estado) === 'disponible' ? '✓' :
                   getEstadoClass(vehiculo.estado) === 'reservado' ? '⏱' : '🔧'}
                </span>
                {vehiculo.estado}
              </div>
            </div>

            {/* Contenido principal */}
            <div className="modal-body">
              {/* Sección de imagen */}
              <div className="imagen-section">
                <div className="imagen-container">
                  {vehiculo.imagenes && vehiculo.imagenes.length > 1 && (
                    <button 
                      className="imagen-nav prev" 
                      onClick={() => cambiarImagen('prev')}
                    >
                      &#8249;
                    </button>
                  )}
                  
                  <img 
                    src={vehiculo.imagenes?.[imagenActual] || '/default-car.jpg'} 
                    alt={vehiculo.nombreVehiculo}
                    className="vehiculo-imagen-modal"
                  />
                  
                  {vehiculo.imagenes && vehiculo.imagenes.length > 1 && (
                    <button 
                      className="imagen-nav next" 
                      onClick={() => cambiarImagen('next')}
                    >
                      &#8250;
                    </button>
                  )}
                </div>
                
                {vehiculo.imagenes && vehiculo.imagenes.length > 1 && (
                  <div className="imagen-thumbnails">
                    {vehiculo.imagenes.map((imagen, index) => (
                      <img
                        key={index}
                        src={imagen}
                        alt={`${vehiculo.nombreVehiculo} ${index + 1}`}
                        className={`thumbnail ${index === imagenActual ? 'active' : ''}`}
                        onClick={() => setImagenActual(index)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Sección de información */}
              <div className="info-section">
                <div className="specs-grid">
                  <div className="spec-item">
                    <div className="spec-icon">👥</div>
                    <div>
                      <div className="spec-label">Capacidad para {vehiculo.capacidad} personas</div>
                    </div>
                  </div>
                </div>

                <div className="detalles-vehiculo">
                  <h3 className="detalles-title">Detalles del Vehículo</h3>
                  <div className="detalles-grid">
                    <div className="detalle-item">
                      <span className="detalle-label">Año:</span>
                      <span className="detalle-valor">{vehiculo.anio}</span>
                    </div>
                    <div className="detalle-item">
                      <span className="detalle-label">Clase:</span>
                      <span className="detalle-valor">{vehiculo.clase}</span>
                    </div>
                    <div className="detalle-item">
                      <span className="detalle-label">Modelo:</span>
                      <span className="detalle-valor">{vehiculo.modelo}</span>
                    </div>
                    <div className="detalle-item">
                      <span className="detalle-label">Color:</span>
                      <span className="detalle-valor">{vehiculo.color}</span>
                    </div>
                  </div>
                </div>

                <button 
                  className="solicitar-reserva-btn"
                  onClick={handleSolicitarReserva}
                  disabled={vehiculo.estado !== 'Disponible'}
                >
                  {vehiculo.estado === 'Disponible' ? 
                    (isAuthenticated ? 'Solicitar reserva' : 'Inicia sesión para reservar') : 
                    'No disponible'
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de solicitud de reserva */}
      <ReservationRequestModal
        isOpen={isReservationOpen}
        onClose={closeReservationModal}
        vehiculo={vehiculo}
        onSubmit={handleReservationSubmit}
        loading={reservationLoading}
        error={reservationError}
        success={reservationSuccess}
      />

      {/* Modal de login */}
      <LoginModal
        open={showLoginModal}
        onClose={handleCloseLoginModal}
        onOpenRegister={() => {
          // Puedes manejar la apertura del modal de registro aquí si es necesario
          console.log('Abrir modal de registro');
        }}
        onOpenForgot={() => {
          // Puedes manejar la apertura del modal de recuperación aquí si es necesario
          console.log('Abrir modal de recuperación');
        }}
      />
    </>
  );
};

export default VehiculoModal;