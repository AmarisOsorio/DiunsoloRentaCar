// Importaciones principales de React y los íconos usados en el modal
import { useState, useEffect } from 'react';
import { useAuth } from '../../../../hooks/useAuth';
import { useLocation } from 'react-router-dom';
import { FaTimes, FaCar, FaChevronLeft, FaChevronRight, FaCalendar, FaExchangeAlt } from 'react-icons/fa';
import './VehicleModal.css';

/**
 * Modal de detalles de vehículo.
 * Muestra información básica y galería de imágenes del vehículo.
 * Detecta si está en modo edición y cambia el comportamiento del botón.
 */

const VehicleModal = ({
  isOpen,
  onClose,
  vehicle,
  onOpenReservationRequest,
  onOpenLoginModal
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  // Detectar si estamos en modo edición
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [editingReservationData, setEditingReservationData] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const editingReservation = urlParams.get('editingReservation') === 'true';
    
    if (editingReservation) {
      setIsEditingMode(true);
      setEditingReservationData({
        reservationId: urlParams.get('reservationId'),
        startDate: urlParams.get('startDate'),
        returnDate: urlParams.get('returnDate'),
        clientName: urlParams.get('clientName')
      });
    } else {
      setIsEditingMode(false);
      setEditingReservationData(null);
    }
  }, [location.search]);

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

  // Manejar click del botón principal
  const handleMainButtonClick = () => {
    if (isEditingMode) {
      // En modo edición, cerrar este modal y redirigir al perfil con parámetros para abrir modal de edición
      onClose();
      
      const params = new URLSearchParams({
        openEditModal: 'true',
        reservationId: editingReservationData.reservationId,
        selectedVehicleId: vehicle._id,
        selectedVehicleName: vehicle.vehicleName || vehicle.brand || 'Vehículo',
        startDate: editingReservationData.startDate,
        returnDate: editingReservationData.returnDate,
        clientName: editingReservationData.clientName
      }).toString();
      
      window.location.href = `/perfil?${params}`;
    } else {
      // En modo normal, comportamiento estándar
      onOpenReservationRequest(vehicle);
    }
  };

  return (
    // Fondo oscuro del modal
    <div className="modal-overlay" onClick={onClose}>
      {/* Contenedor principal del modal */}
      <div className="vehicle-details-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header del modal con título y botón de cerrar */}
        <div className="vehicle-details-header">
          <h2>
            <FaCar />
            {isEditingMode ? 'Cambiar a este vehículo' : 'Detalles del Vehículo'}
          </h2>
          <button className="modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Mensaje informativo en modo edición */}
        {isEditingMode && (
          <div style={{
            background: '#e3f2fd',
            border: '1px solid #1976d2',
            padding: '12px 24px',
            color: '#1976d2',
            fontWeight: '500',
            fontSize: '0.95rem'
          }}>
            🔄 Selecciona este vehículo para reemplazar el actual en tu reserva
          </div>
        )}

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
                    <span className="detail-value">{vehicle.brandId?.brandName}</span>
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
          {/* Botón cambia según el modo */}
          {isAuthenticated ? (
            <button
              className="request-reservation-btn"
              onClick={handleMainButtonClick}
              title={isEditingMode ? "Cambiar a este vehículo" : "Solicitar Reserva"}
              style={isEditingMode ? {
                background: '#ff9800',
                borderColor: '#ff9800'
              } : {}}
              onMouseOver={(e) => {
                if (isEditingMode) {
                  e.target.style.background = '#f57c00';
                }
              }}
              onMouseOut={(e) => {
                if (isEditingMode) {
                  e.target.style.background = '#ff9800';
                }
              }}
            >
              {isEditingMode ? (
                <>
                  <FaExchangeAlt />
                  Cambiar a este Auto
                </>
              ) : (
                <>
                  <FaCalendar />
                  Solicitar Reserva
                </>
              )}
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