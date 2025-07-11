import React, { useState } from 'react';
import { FaTimes, FaCar, FaChevronLeft, FaChevronRight, FaCalendar, FaDollarSign, FaUsers, FaCog } from 'react-icons/fa';
import './styles/VehicleDetailsModal.css';

const VehicleDetailsModal = ({ 
  isOpen, 
  onClose, 
  vehicle 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!isOpen || !vehicle) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const nextImage = () => {
    if (vehicle.imagenes && vehicle.imagenes.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === vehicle.imagenes.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (vehicle.imagenes && vehicle.imagenes.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? vehicle.imagenes.length - 1 : prev - 1
      );
    }
  };

  const hasImages = vehicle.imagenes && vehicle.imagenes.length > 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="vehicle-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="vehicle-details-header">
          <h2>
            <FaCar />
            Detalles del Vehículo
          </h2>
          <button className="modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="vehicle-details-content">
          {/* Imagen principal */}
          <div className="vehicle-image-section">
            {hasImages ? (
              <div className="vehicle-image-container">
                <img 
                  src={vehicle.imagenes[currentImageIndex]} 
                  alt={vehicle.nombreVehiculo}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                {vehicle.imagenes.length > 1 && (
                  <>
                    <button className="image-nav-btn prev" onClick={prevImage}>
                      <FaChevronLeft />
                    </button>
                    <button className="image-nav-btn next" onClick={nextImage}>
                      <FaChevronRight />
                    </button>
                    <div className="image-indicators">
                      {vehicle.imagenes.map((_, index) => (
                        <button
                          key={index}
                          className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                          onClick={() => setCurrentImageIndex(index)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="vehicle-no-image">
                <FaCar />
                <span>Sin imágenes disponibles</span>
              </div>
            )}
          </div>

          {/* Información del vehículo */}
          <div className="vehicle-info-section">
            <div className="vehicle-title">
              <h3>{vehicle.nombreVehiculo}</h3>
              <span className={`status-badge ${vehicle.disponible ? 'available' : 'unavailable'}`}>
                {vehicle.disponible ? 'Disponible' : 'No disponible'}
              </span>
            </div>

            <div className="vehicle-details-grid">
              {/* Información básica */}
              <div className="details-section">
                <h4>
                  <FaCar />
                  Información Básica
                </h4>
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
                    <span className="detail-label">Placa:</span>
                    <span className="detail-value">{vehicle.placa}</span>
                  </div>
                </div>
              </div>

              {/* Capacidad y precio */}
              <div className="details-section">
                <h4>
                  <FaUsers />
                  Capacidad y Precio
                </h4>
                <div className="details-list">
                  <div className="detail-item">
                    <span className="detail-label">Capacidad:</span>
                    <span className="detail-value">{vehicle.capacidad} personas</span>
                  </div>
                  <div className="detail-item highlight">
                    <span className="detail-label">
                      <FaDollarSign />
                      Precio diario:
                    </span>
                    <span className="detail-value price">
                      {formatPrice(vehicle.precioDiario)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Información técnica */}
              {(vehicle.numeroMotor || vehicle.numeroChasisGrabado || vehicle.numeroVinChasis) && (
                <div className="details-section full-width">
                  <h4>
                    <FaCog />
                    Información Técnica
                  </h4>
                  <div className="details-list technical">
                    {vehicle.numeroMotor && (
                      <div className="detail-item">
                        <span className="detail-label">Número de Motor:</span>
                        <span className="detail-value">{vehicle.numeroMotor}</span>
                      </div>
                    )}
                    {vehicle.numeroChasisGrabado && (
                      <div className="detail-item">
                        <span className="detail-label">Número de Chasis Grabado:</span>
                        <span className="detail-value">{vehicle.numeroChasisGrabado}</span>
                      </div>
                    )}
                    {vehicle.numeroVinChasis && (
                      <div className="detail-item">
                        <span className="detail-label">Número VIN/Chasis:</span>
                        <span className="detail-value">{vehicle.numeroVinChasis}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Fechas */}
              <div className="details-section full-width">
                <h4>
                  <FaCalendar />
                  Información de Registro
                </h4>
                <div className="details-list">
                  {vehicle.fechaCreacion && (
                    <div className="detail-item">
                      <span className="detail-label">Fecha de registro:</span>
                      <span className="detail-value">
                        {new Date(vehicle.fechaCreacion).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                  {vehicle.fechaActualizacion && vehicle.fechaActualizacion !== vehicle.fechaCreacion && (
                    <div className="detail-item">
                      <span className="detail-label">Última actualización:</span>
                      <span className="detail-value">
                        {new Date(vehicle.fechaActualizacion).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Galería de miniaturas */}
            {hasImages && vehicle.imagenes.length > 1 && (
              <div className="vehicle-thumbnails">
                <h4>Galería</h4>
                <div className="thumbnails-grid">
                  {vehicle.imagenes.map((img, index) => (
                    <button
                      key={index}
                      className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <img src={img} alt={`${vehicle.nombreVehiculo} ${index + 1}`} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="vehicle-details-footer">
          <button className="btn-close" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailsModal;
