import React, { useState } from 'react';
import { FaTimes, FaCar, FaChevronLeft, FaChevronRight, FaCalendar, FaUsers, FaCog, FaImage } from 'react-icons/fa';
import './styles/VehiculoModal.css';

const VehiculoModal = ({
  vehiculo,
  isOpen,
  onClose,
  imagenActual,
  setImagenActual,
  getEstadoClass,
  cambiarImagen,
  handleBackdropClick,
  onSolicitarReserva
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(imagenActual || 0);
  if (!isOpen || !vehiculo) return null;

  // Crear array unificado de imágenes con las vistas específicas y la galería
  const createUnifiedImageArray = () => {
    const unifiedImages = [];
    const imageLabels = [];
    if (vehiculo.imagenVista3_4) {
      unifiedImages.push(vehiculo.imagenVista3_4);
      imageLabels.push('Vista 3/4');
    }
    if (vehiculo.imagenLateral) {
      unifiedImages.push(vehiculo.imagenLateral);
      imageLabels.push('Vista Lateral');
    }
    if (vehiculo.imagenes && vehiculo.imagenes.length > 0) {
      vehiculo.imagenes.forEach((img, index) => {
        if (!unifiedImages.includes(img)) {
          unifiedImages.push(img);
          imageLabels.push(`Galería ${unifiedImages.length - (vehiculo.imagenVista3_4 ? 1 : 0) - (vehiculo.imagenLateral ? 1 : 0) + 1}`);
        }
      });
    }
    return { images: unifiedImages, labels: imageLabels };
  };

  const { images: allImages, labels: imageLabels } = createUnifiedImageArray();
  const hasImages = allImages.length > 0;

  // Función para determinar la clase CSS de la imagen actual
  const getImageClass = (index) => {
    if (index === 0 && vehiculo.imagenVista3_4) return 'view-threequarter';
    if ((index === 0 && !vehiculo.imagenVista3_4 && vehiculo.imagenLateral) ||
        (index === 1 && vehiculo.imagenVista3_4 && vehiculo.imagenLateral)) return 'view-lateral';
    return 'view-gallery';
  };

  // Carrusel navegación
  const nextImage = () => {
    if (allImages.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === allImages.length - 1 ? 0 : prev + 1
      );
      setImagenActual && setImagenActual(currentImageIndex === allImages.length - 1 ? 0 : currentImageIndex + 1);
    }
  };
  const prevImage = () => {
    if (allImages.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? allImages.length - 1 : prev - 1
      );
      setImagenActual && setImagenActual(currentImageIndex === 0 ? allImages.length - 1 : currentImageIndex - 1);
    }
  };

  // Estado visual
  const getStatusInfo = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'disponible':
        return {
          color: '#047857',
          bgColor: '#d1fae5',
          text: 'Disponible'
        };
      case 'reservado':
        return {
          color: '#1e40af',
          bgColor: '#dbeafe',
          text: 'Reservado'
        };
      case 'mantenimiento':
        return {
          color: '#d97706',
          bgColor: '#fef3c7',
          text: 'Mantenimiento'
        };
      default:
        return {
          color: '#6b7280',
          bgColor: '#f3f4f6',
          text: 'No disponible'
        };
    }
  };
  const statusInfo = getStatusInfo(vehiculo.estado);

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="vehicle-details-modal" onClick={e => e.stopPropagation()}>
        <div className="vehicle-details-header">
          <h2>
            <FaCar /> Detalles del Vehículo
          </h2>
          <button className="modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="vehicle-details-content">
          <div className="vehicle-gallery-section">
            {hasImages ? (
              <div className="unified-carousel-container">
                <img
                  src={allImages[currentImageIndex]}
                  alt={vehiculo.marca + ' ' + vehiculo.modelo}
                  className={getImageClass(currentImageIndex)}
                />
                {/* Contador de imágenes */}
                <div className="image-counter-badge">
                  {currentImageIndex + 1} / {allImages.length}
                </div>
                {/* Navegación carrusel */}
                {allImages.length > 1 && (
                  <>
                    <button
                      className="carousel-nav-btn prev"
                      onClick={prevImage}
                      aria-label="Imagen anterior"
                    >
                      <FaChevronLeft />
                    </button>
                    <button
                      className="carousel-nav-btn next"
                      onClick={nextImage}
                      aria-label="Imagen siguiente"
                    >
                      <FaChevronRight />
                    </button>
                    {/* Indicadores tipo dots */}
                    <div className="carousel-indicators">
                      {allImages.map((_, idx) => (
                        <button
                          key={idx}
                          className={`indicator-dot ${idx === currentImageIndex ? 'active' : ''}`}
                          onClick={() => { setCurrentImageIndex(idx); setImagenActual && setImagenActual(idx); }}
                          aria-label={`Ir a ${imageLabels[idx] || `imagen ${idx + 1}`}`}
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

          <div className="vehicle-info-section">
            <div className="vehicle-title">
              <h3>{vehiculo.marca} {vehiculo.modelo}</h3>
              <span className={`status-badge ${vehiculo.estado === 'Disponible' ? 'available' : 'unavailable'}`}>
                {vehiculo.estado || 'Estado desconocido'}
              </span>
            </div>

            <div className="vehicle-details-grid">

              <div className="details-section">
                <h4>
                  <FaCar /> Información Básica
                </h4>
                <div className="details-list">
                  <div className="detail-item">
                    <span className="detail-label">Marca:</span>
                    <span className="detail-value">{vehiculo.marca}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Modelo:</span>
                    <span className="detail-value">{vehiculo.modelo}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Año:</span>
                    <span className="detail-value">{vehiculo.anio}</span>
                  </div>
                  {vehiculo.clase && (
                    <div className="detail-item">
                      <span className="detail-label">Clase:</span>
                      <span className="detail-value">{vehiculo.clase}</span>
                    </div>
                  )}
                  {vehiculo.color && (
                    <div className="detail-item">
                      <span className="detail-label">Color:</span>
                      <span className="detail-value">{vehiculo.color}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="detail-label">Capacidad:</span>
                    <span className="detail-value">{vehiculo.capacidad} personas</span>
                  </div>
                  {vehiculo.motor && (
                    <div className="detail-item">
                      <span className="detail-label">Motor:</span>
                      <span className="detail-value">{vehiculo.motor}</span>
                    </div>
                  )}
                </div>
              </div>

              {vehiculo.descripcion && (
                <div className="details-section full-width">
                  <h4>
                    <FaCog /> Descripción
                  </h4>
                  <div className="details-list">
                    <div className="detail-item">
                      <span className="detail-label">Descripción:</span>
                      <span className="detail-value">{vehiculo.descripcion}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer con botón de cerrar y solicitar reserva */}
        <div className="vehicle-details-footer enhanced-footer">
          <div className="footer-btn-group">
            <button className="btn-close enhanced-btn" onClick={onClose}>
              <FaTimes /> Cerrar
            </button>
            {vehiculo.estado?.toLowerCase() === 'disponible' && (
              <button
                className="rent-button enhanced-btn"
                onClick={() => {
                  console.log('Botón Solicitar Reserva presionado');
                  if (typeof onSolicitarReserva === 'function') {
                    console.log('Solicitar reserva para vehículo:', vehiculo?._id, vehiculo);
                    onSolicitarReserva(vehiculo);
                    onClose(); 
                  } else {
                    console.warn('onSolicitarReserva no está definido');
                  }
                }}
                id="vehiculo-modal-solicitar-reserva"
                type="button"
              >
                <FaCar /> Solicitar Reserva
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehiculoModal;
