// Ejemplo de componente de Card para autos en el catálogo
import React, { useState } from 'react';
import './VehicleCard.css';

// Componente de tarjeta de vehículo para mostrar información básica
const VehicleCard = ({ vehicle, onClick, onReserve }) => {
  const [imageError, setImageError] = useState(false);

  // Maneja el error de carga de imagen
  const handleImageError = () => {
    setImageError(true);
  };

  // Obtiene la URL de la imagen del vehículo (prioridad: mainViewImage, luego galleryImages[0], luego sideImage)
  const getImageUrl = (vehicle) => {
    if (vehicle.mainViewImage) {
      return vehicle.mainViewImage;
    }
    if (vehicle.galleryImages && vehicle.galleryImages.length > 0) {
      return vehicle.galleryImages[0];
    }
    if (vehicle.sideImage) {
      return vehicle.sideImage;
    }
    return null;
  };

  // Devuelve la clase CSS según el estado del vehículo
  const getStatusClass = (status) => {
    switch (status) {
      case 'Disponible':
      case 'Available':
        return 'status-available';
      case 'Reservado':
      case 'Reserved':
        return 'status-reserved';
      case 'Mantenimiento':
      case 'Maintenance':
        return 'status-maintenance';
      default:
        return 'status-unavailable';
    }
  };

  // Formatea el precio en moneda local
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: 'HNL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const imageUrl = getImageUrl(vehicle);
  // Determina si la imagen es la principal
  const isMainView = imageUrl === vehicle.mainViewImage;

  return (
    <div className="vehicle-card">
      <div className="vehicle-card-image-container">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={`${vehicle.brandId?.nombreMarca} ${vehicle.model}`}
            className={`vehicle-card-image${isMainView ? ' mainview' : ''}`}
            onError={handleImageError}
          />
        ) : (
          <div className="vehicle-card-no-image">
            <div className="no-image-icon">🚗</div>
            <span>Sin imagen</span>
          </div>
        )}
        <div className={`vehicle-card-status ${getStatusClass(vehicle.status)}`}> 
          {vehicle.status}
        </div>
      </div>

      <div className="vehicle-card-content">
        <div className="vehicle-card-header">
          <h3 className="vehicle-card-title" title={vehicle.vehicleName || `${vehicle.brandId?.nombreMarca} ${vehicle.model}`}>
            {/* Mostrar el nombre del vehículo si existe, si no, marca y modelo */}
            {vehicle.vehicleName || `${vehicle.brandId?.nombreMarca} ${vehicle.model}`}
          </h3>
          <span className="vehicle-card-year">{vehicle.year}</span>
        </div>

        <div className="vehicle-card-details">
          {/* Información pública del vehículo */}
          <div className="vehicle-detail">
            <span className="detail-label">Marca:</span>
            <span className="detail-value">{vehicle.brandId?.nombreMarca}</span>
          </div>
          <div className="vehicle-detail">
            <span className="detail-label">Clase:</span>
            <span className="detail-value">{vehicle.vehicleClass}</span>
          </div>
        </div>

        {/* Botón para ver detalles del vehículo */}
        <button
          className="vehicle-card-button"
          type="button"
          onClick={() => {
            if (onClick) onClick(vehicle);
          }}
        >
          Ver detalles
        </button>
      </div>
    </div>
  );
};

export default VehicleCard;

