import React, { useState } from 'react';
import { FaEye } from 'react-icons/fa';
import './styles/VehiculoCard.css';

const VehiculoCard = ({ vehiculo, onClick, onReservar }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const getImageUrl = (vehiculo) => {
    // Prioridad: imagenVista3_4, luego imagenes[0], luego imagenLateral
    if (vehiculo.imagenVista3_4) {
      return vehiculo.imagenVista3_4;
    }
    if (vehiculo.imagenes && vehiculo.imagenes.length > 0) {
      return vehiculo.imagenes[0];
    }
    if (vehiculo.imagenLateral) {
      return vehiculo.imagenLateral;
    }
    return null;
  };

  const getEstadoClass = (estado) => {
    switch (estado) {
      case 'Disponible':
        return 'estado-disponible';
      case 'Reservado':
        return 'estado-reservado';
      case 'Mantenimiento':
        return 'estado-mantenimiento';
      default:
        return 'estado-no-disponible';
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: 'HNL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const imageUrl = getImageUrl(vehiculo);
  // Determinar si la imagen es la 3/4
  const isThreeQuarter = imageUrl === vehiculo.imagenVista3_4;

  return (
    <div className="vehiculo-card">
      <div className="vehiculo-card-image-container">
        <div className="ver-detalles-icono" onClick={() => onClick && onClick()} title="Ver detalles">
          <FaEye size={24} color="#1C318C" style={{ cursor: 'pointer' }} />
        </div>
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={`${vehiculo.marca} ${vehiculo.modelo}`}
            className={`vehiculo-card-image${isThreeQuarter ? ' threequarter' : ''}`}
            onError={handleImageError}
          />
        ) : (
          <div className="vehiculo-card-no-image">
            <div className="no-image-icon">🚗</div>
            <span>Sin imagen</span>
          </div>
        )}
        <div className={`vehiculo-card-status ${getEstadoClass(vehiculo.estado)}`}> 
          {vehiculo.estado}
        </div>
      </div>

      <div className="vehiculo-card-content">
        <div className="vehiculo-card-header">
          <h3 className="vehiculo-card-title" title={`${vehiculo.marca} ${vehiculo.modelo}`}>
            {vehiculo.marca} {vehiculo.modelo}
          </h3>
          <span className="vehiculo-card-year">{vehiculo.anio}</span>
        </div>

        <div className="vehiculo-card-details">
          {/* Información pública del vehículo */}
          <div className="vehiculo-detail">
            <span className="detail-label">Marca:</span>
            <span className="detail-value">{vehiculo.marca}</span>
          </div>
          <div className="vehiculo-detail">
            <span className="detail-label">Clase:</span>
            <span className="detail-value">{vehiculo.clase}</span>
          </div>
          <div className="vehiculo-detail">
            <span className="detail-label">Modelo:</span>
            <span className="detail-value">{vehiculo.modelo}</span>
          </div>
          <div className="vehiculo-detail">
            <span className="detail-label">Color:</span>
            <span className="detail-value">{vehiculo.color}</span>
          </div>
          <div className="vehiculo-detail">
            <span className="detail-label">Capacidad:</span>
            <span className="detail-value">{vehiculo.capacidad} personas</span>
          </div>
        </div>

        {/* Ícono movido a la imagen */}
      </div>
      <button
        className="vehiculo-card-button reservar"
        onClick={() => onReservar && onReservar(vehiculo)}
      >
        Solicitar reserva
      </button>
    </div>
  );
};

export default VehiculoCard;
