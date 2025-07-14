import React, { useState } from 'react';
import { FaEye, FaCar, FaUsers, FaCalendarAlt, FaDollarSign, FaInfoCircle } from 'react-icons/fa';
import './styles/VehiculoCatalogCard.css';

const VehiculoCatalogCard = ({ vehiculo, onClick }) => {
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

  const getStatusInfo = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'disponible':
        return { 
          color: '#047857', // Verde oscuro
          bgColor: '#d1fae5', // Verde claro
          text: 'Disponible'
        };
      case 'reservado':
        return { 
          color: '#1e40af', // Azul oscuro
          bgColor: '#dbeafe', // Azul claro
          text: 'Reservado'
        };
      case 'mantenimiento':
        return { 
          color: '#d97706', // Naranja/amarillo oscuro
          bgColor: '#fef3c7', // Naranja/amarillo claro
          text: 'Mantenimiento'
        };
      default:
        return { 
          color: '#047857',
          bgColor: '#d1fae5',
          text: 'Disponible'
        };
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const imageUrl = getImageUrl(vehiculo);
  const statusInfo = getStatusInfo(vehiculo.estado);
  const isDisponible = vehiculo.estado?.toLowerCase() === 'disponible';

  return (
    <div className={`vehiculo-catalog-card ${!isDisponible ? 'unavailable' : ''}`}>
      <div className="vehiculo-catalog-image">
        {imageUrl && !imageError ? (
          <img 
            src={imageUrl} 
            alt={vehiculo.nombreVehiculo}
            onError={handleImageError}
          />
        ) : (
          <div className="vehiculo-catalog-placeholder">
            <FaCar />
            <span>Sin imagen</span>
          </div>
        )}
        <div className="vehiculo-catalog-status">
          <span 
            className="status-badge"
            style={{ 
              backgroundColor: statusInfo.bgColor,
              color: statusInfo.color,
              border: `1px solid ${statusInfo.color}`
            }}
          >
            {statusInfo.text}
          </span>
        </div>
        <div className="vehiculo-catalog-overlay">
          <button 
            className="btn-ver-detalles"
            onClick={() => onClick(vehiculo)}
          >
            <FaEye /> Ver Detalles
          </button>
        </div>
      </div>

      <div className="vehiculo-catalog-content">
        <h3 className="vehiculo-catalog-title">{vehiculo.nombreVehiculo}</h3>
        
        <div className="vehiculo-catalog-details">
          {/* Marca y Modelo */}
          <div className="detail-row">
            <div className="detail-item detail-full">
              <span className="detail-label">Marca:</span>
              <span className="detail-value">{vehiculo.idMarca?.nombreMarca || vehiculo.marca || 'Sin marca'}</span>
            </div>
          </div>
          
          <div className="detail-row">
            <div className="detail-item detail-full">
              <span className="detail-label">Modelo:</span>
              <span className="detail-value">{vehiculo.modelo}</span>
            </div>
          </div>
          
          {/* Año y Capacidad */}
          <div className="detail-row detail-compact">
            <div className="detail-item detail-half">
              <FaCalendarAlt className="detail-icon" />
              <span className="detail-value">{vehiculo.anio}</span>
            </div>
            <div className="detail-item detail-half">
              <FaUsers className="detail-icon" />
              <span className="detail-value">{vehiculo.capacidad} personas</span>
            </div>
          </div>
          
          {/* Clase */}
          <div className="detail-row">
            <div className="detail-item detail-full">
              <span className="detail-label">Clase:</span>
              <span className="detail-value class-highlight">{vehiculo.clase}</span>
            </div>
          </div>
          
          {/* Precio */}
          <div className="detail-price-row">
            <FaDollarSign className="price-icon" />
            <span className="price-value">
              {formatPrice(vehiculo.precioPorDia || vehiculo.precioDiario || 0)}
            </span>
            <span className="price-label">/día</span>
          </div>
        </div>

        <div className="vehiculo-catalog-actions">
          <button 
            className={`btn-primary ${!isDisponible ? 'disabled' : ''}`}
            onClick={() => onClick(vehiculo)}
            disabled={!isDisponible}
          >
            <FaInfoCircle />
            {isDisponible ? 'Ver Información' : 'No Disponible'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehiculoCatalogCard;
