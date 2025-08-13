// Importaciones principales de React y los íconos usados en el modal
import { useState } from 'react';
import { useAuth } from '../../../../hooks/useAuth';
import { FaTimes, FaCar, FaChevronLeft, FaChevronRight, FaCalendar } from 'react-icons/fa';
import './VehicleModal.css';


/**
 * Modal de detalles de vehículo.
 * Muestra información básica y galería de imágenes del vehículo.
 * Permite abrir el modal de solicitud de reserva.
 *
 * Props:
 *  - isOpen: boolean, controla la visibilidad del modal
 *  - onClose: función para cerrar el modal
 *  - vehicle: objeto con los datos del vehículo seleccionado
 *  - onOpenReservationRequest: función para abrir el modal de solicitud de reserva (opcional)
 */

// VehicleModal: Modal de detalles de vehículo
const VehicleModal = ({
  isOpen,
  onClose,
  vehicle,
  onOpenReservationRequest, // Función para abrir el modal de reserva
  onOpenLoginModal // Función para abrir el modal de login
}) => {
  // Estado para la imagen actual en el carrusel
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { isAuthenticated } = useAuth();

  // Si el modal no está abierto o no hay vehículo, no renderizar nada
  if (!isOpen || !vehicle) return null;

  // Unifica las imágenes del vehículo (mainViewImage, sideImage, galleryImages)
  const createUnifiedImageArray = () => {
    const unifiedImages = [];
    const imageLabels = [];

    // Agregar imagen principal si existe
    if (vehicle.mainViewImage) {
      unifiedImages.push(vehicle.mainViewImage);
      imageLabels.push('Vista principal');
    }
    // Agregar imagen lateral si existe
    if (vehicle.sideImage) {
      unifiedImages.push(vehicle.sideImage);
      imageLabels.push('Vista lateral');
    }
    // Agregar imágenes de galería si existen
    if (vehicle.galleryImages && vehicle.galleryImages.length > 0) {
      vehicle.galleryImages.forEach((img, index) => {
        if (!unifiedImages.includes(img)) {
          unifiedImages.push(img);
          imageLabels.push(`Galería ${unifiedImages.length - (vehicle.mainViewImage ? 1 : 0) - (vehicle.sideImage ? 1 : 0) + 1}`);
        }
      });
    }
    return { images: unifiedImages, labels: imageLabels };
  };

  // Obtener imágenes y etiquetas para el carrusel
  const { images: allImages, labels: imageLabels } = createUnifiedImageArray();
  const hasImages = allImages.length > 0;

  // Determina la clase CSS de la imagen actual para estilos específicos
  const getImageClass = (index) => {
    if (index === 0 && vehicle.mainViewImage) return 'view-main';
    if ((index === 0 && !vehicle.mainViewImage && vehicle.sideImage) ||
        (index === 1 && vehicle.mainViewImage && vehicle.sideImage)) return 'view-side';
    return 'view-gallery';
  };

  // Navega a la siguiente imagen del carrusel
  const nextImage = () => {
    if (allImages.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === allImages.length - 1 ? 0 : prev + 1
      );
    }
  };

  // Navega a la imagen anterior del carrusel
  const prevImage = () => {
    if (allImages.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? allImages.length - 1 : prev - 1
      );
    }
  };

  // Render principal del modal
  return (
    // Fondo oscuro del modal
    <div className="modal-overlay" onClick={onClose}>
      {/* Contenedor principal del modal */}
      <div className="vehicle-details-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header del modal con título y botón de cerrar */}
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
          {/* Galería de imágenes con carrusel */}
          <div className="vehicle-gallery-section">
            {hasImages ? (
              <>
                {/* Carrusel principal unificado */}
                <div className="unified-carousel-container">
                  {/* Imagen actual */}
                  <img
                    src={allImages[currentImageIndex]}
                    alt={vehicle.vehicleName}
                    className={getImageClass(currentImageIndex)}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  {/* Controles de navegación (prev/next) */}
                  {allImages.length > 1 && (
                    <>
                      <button className="carousel-nav-btn prev" onClick={prevImage}>
                        <FaChevronLeft />
                      </button>
                      <button className="carousel-nav-btn next" onClick={nextImage}>
                        <FaChevronRight />
                      </button>
                    </>
                  )}
                  {/* Contador de imágenes */}
                  <div className="image-counter-badge">
                    {currentImageIndex + 1} / {allImages.length}
                  </div>
                  {/* Indicadores circulares (dots) */}
                  {allImages.length > 1 && (
                    <div className="carousel-indicators">
                      {allImages.map((_, index) => (
                        <button
                          key={index}
                          className={`indicator-dot ${index === currentImageIndex ? 'active' : ''}`}
                          onClick={() => setCurrentImageIndex(index)}
                          aria-label={`Ir a ${imageLabels[index] || `imagen ${index + 1}`}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Si no hay imágenes disponibles
              <div className="vehicle-no-image">
                <FaCar />
                <span>Sin imágenes disponibles</span>
              </div>
            )}
          </div>

          {/* Información del vehículo */}
          <div className="vehicle-info-section">
            {/* Título y estado del vehículo */}
            <div className="vehicle-title">
              <h3>{vehicle.vehicleName}</h3>
              <span className={`status-badge ${vehicle.status === 'Disponible' || vehicle.status === 'Available' ? 'available' : 'unavailable'}`}>
                {vehicle.status || 'Estado desconocido'}
              </span>
            </div>

            <div className="vehicle-details-grid">
              {/* Información básica (incluye capacidad) */}
              <div className="details-section">
                <h4>
                  <FaCar />
                  Información Básica
                </h4>
                <div className="details-list">
                  {/* Marca */}
                  <div className="detail-item">
                    <span className="detail-label">Marca:</span>
                    <span className="detail-value">{vehicle.brandId?.nombreMarca}</span>
                  </div>
                  {/* Modelo */}
                  <div className="detail-item">
                    <span className="detail-label">Modelo:</span>
                    <span className="detail-value">{vehicle.model}</span>
                  </div>
                  {/* Año */}
                  <div className="detail-item">
                    <span className="detail-label">Año:</span>
                    <span className="detail-value">{vehicle.year}</span>
                  </div>
                  {/* Color */}
                  <div className="detail-item">
                    <span className="detail-label">Color:</span>
                    <span className="detail-value">{vehicle.color}</span>
                  </div>
                  {/* Capacidad */}
                  <div className="detail-item">
                    <span className="detail-label">Capacidad:</span>
                    <span className="detail-value">{vehicle.capacity} personas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer del modal con acciones */}
        <div className="vehicle-details-footer">
          {/* Botón para abrir el modal de solicitud de reserva o login */}
          {isAuthenticated ? (
            <button
              className="request-reservation-btn"
              onClick={typeof onOpenReservationRequest === 'function' ? () => onOpenReservationRequest(vehicle) : undefined}
              title="Request Reservation"
            >
              <FaCalendar />
              Solicitar Reserva
            </button>
          ) : (
            <button
              className="login-required-btn"
              onClick={() => {
                if (typeof onOpenLoginModal === 'function') {
                  onOpenLoginModal();
                }
              }}
              title="Inicia sesión para reservar"
            >
              <FaCalendar />
              Inicia sesión para reservar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleModal;

