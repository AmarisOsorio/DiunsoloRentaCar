import React, { useState } from 'react';
import { FaTimes, FaCar, FaChevronLeft, FaChevronRight, FaCalendar, FaDollarSign, FaUsers, FaCog, FaDownload } from 'react-icons/fa';
import './styles/VehicleDetailsModal.css';

const VehicleDetailsModal = ({ 
  isOpen, 
  onClose, 
  vehicle 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!isOpen || !vehicle) return null;

  // Crear array unificado de imágenes con las vistas específicas y la galería
  const createUnifiedImageArray = () => {
    const unifiedImages = [];
    const imageLabels = [];

    // Agregar vista 3/4 si existe
    if (vehicle.imagenVista3_4) {
      unifiedImages.push(vehicle.imagenVista3_4);
      imageLabels.push('Vista 3/4');
    }

    // Agregar vista lateral si existe
    if (vehicle.imagenLateral) {
      unifiedImages.push(vehicle.imagenLateral);
      imageLabels.push('Vista Lateral');
    }

    // Agregar imágenes de la galería si existen
    if (vehicle.imagenes && vehicle.imagenes.length > 0) {
      vehicle.imagenes.forEach((img, index) => {
        // Evitar duplicados comparando URLs
        if (!unifiedImages.includes(img)) {
          unifiedImages.push(img);
          imageLabels.push(`Galería ${unifiedImages.length - (vehicle.imagenVista3_4 ? 1 : 0) - (vehicle.imagenLateral ? 1 : 0) + 1}`);
        }
      });
    }

    return { images: unifiedImages, labels: imageLabels };
  };

  const { images: allImages, labels: imageLabels } = createUnifiedImageArray();
  const hasImages = allImages.length > 0;

  // Función para determinar la clase CSS de la imagen actual
  const getImageClass = (index) => {
    if (index === 0 && vehicle.imagenVista3_4) return 'view-threequarter';
    if ((index === 0 && !vehicle.imagenVista3_4 && vehicle.imagenLateral) || 
        (index === 1 && vehicle.imagenVista3_4 && vehicle.imagenLateral)) return 'view-lateral';
    return 'view-gallery';
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const nextImage = () => {
    if (allImages.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === allImages.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (allImages.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? allImages.length - 1 : prev - 1
      );
    }
  };

  const downloadContract = async () => {
    if (!vehicle.contratoArrendamientoPdf) {
      alert('No hay contrato disponible para este vehículo');
      return;
    }

    try {
      const url = vehicle.contratoArrendamientoPdf;
      const fileName = `contrato_${vehicle.nombreVehiculo?.replace(/\s+/g, '_') || 'vehiculo'}_${vehicle.placa || ''}.pdf`;
      
      if (url.startsWith('http')) {
        // URL de Cloudinary o externa - crear URL de descarga forzada
        let downloadUrl = url;
        
        // Si es una URL de Cloudinary, agregar transformación para forzar descarga
        if (url.includes('cloudinary.com')) {
          // Reemplazar /upload/ con /upload/fl_attachment/ para forzar descarga
          if (!url.includes('fl_attachment')) {
            downloadUrl = url.replace('/upload/', '/upload/fl_attachment/');
          }
        }
        
        console.log('Descargando desde:', downloadUrl);
        
        // Usar fetch para descargar el archivo
        const response = await fetch(downloadUrl);
        
        if (!response.ok) {
          throw new Error(`Error al descargar: ${response.status} ${response.statusText}`);
        }
        
        const blob = await response.blob();
        
        // Crear blob como PDF
        const pdfBlob = new Blob([blob], { type: 'application/pdf' });
        
        // Crear URL de descarga temporal
        const tempUrl = window.URL.createObjectURL(pdfBlob);
        
        // Crear enlace de descarga
        const link = document.createElement('a');
        link.href = tempUrl;
        link.download = fileName;
        link.style.display = 'none';
        
        // Agregar al DOM, hacer clic y remover
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Limpiar URL temporal
        setTimeout(() => {
          window.URL.revokeObjectURL(tempUrl);
        }, 100);
        
      } else {
        // Archivo local del servidor (fallback)
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const fileUrl = url.startsWith('/uploads/') ? `${apiUrl}${url}` : `${apiUrl}/uploads/${url}`;
        
        const response = await fetch(fileUrl);
        
        if (!response.ok) {
          throw new Error(`Error al descargar: ${response.status} ${response.statusText}`);
        }
        
        const blob = await response.blob();
        const pdfBlob = new Blob([blob], { type: 'application/pdf' });
        const tempUrl = window.URL.createObjectURL(pdfBlob);
        
        const link = document.createElement('a');
        link.href = tempUrl;
        link.download = fileName;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(() => {
          window.URL.revokeObjectURL(tempUrl);
        }, 100);
      }
      
    } catch (error) {
      console.error('Error al descargar el contrato:', error);
      alert('Error al descargar el contrato. Por favor, inténtelo de nuevo.');
    }
  };

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
          {/* Galería unificada con carrusel */}
          <div className="vehicle-gallery-section">
            {hasImages ? (
              <>
                {/* Carrusel principal unificado */}
                <div className="unified-carousel-container">
                  <img 
                    src={allImages[currentImageIndex]} 
                    alt={vehicle.nombreVehiculo}
                    className={getImageClass(currentImageIndex)}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  
                  {/* Controles de navegación */}
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
              <span className={`status-badge ${vehicle.estado === 'Disponible' ? 'available' : 'unavailable'}`}>
                {vehicle.estado || 'Estado desconocido'}
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
                      {formatPrice(vehicle.precioPorDia || vehicle.precioDiario || 0)}
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

              {/* Información del contrato */}
              <div className="details-section full-width">
                <h4>
                  <FaDownload />
                  Contrato de Arrendamiento
                </h4>
                <div className="details-list">
                  {vehicle.contratoArrendamientoPdf ? (
                    <div className="detail-item">
                      <span className="detail-label">Estado del contrato:</span>
                      <span className="detail-value contract-available">
                        ✓ Contrato disponible para descarga
                      </span>
                    </div>
                  ) : (
                    <div className="detail-item">
                      <span className="detail-label">Estado del contrato:</span>
                      <span className="detail-value contract-unavailable">
                        ✗ No hay contrato disponible
                      </span>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="detail-label">Tipo de documento:</span>
                    <span className="detail-value">PDF de Arrendamiento</span>
                  </div>
                  {vehicle.contratoArrendamientoPdf && (
                    <div className="detail-item">
                      <span className="detail-label">Archivo:</span>
                      <span className="detail-value">contrato_{vehicle.nombreVehiculo?.replace(/\s+/g, '_') || 'vehiculo'}_{vehicle.placa || ''}.pdf</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="vehicle-details-footer">
          {vehicle.contratoArrendamientoPdf && (
            <button 
              className="download-contract-btn"
              onClick={downloadContract}
              title="Descargar contrato de arrendamiento"
            >
              <FaDownload />
              Descargar Contrato
            </button>
          )}
          <button className="btn-close" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailsModal;
