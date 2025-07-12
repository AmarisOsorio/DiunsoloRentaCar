import React, { useState } from 'react';
import { FaEdit, FaTrash, FaEye, FaToggleOn, FaToggleOff, FaCar, FaWrench, FaClock } from 'react-icons/fa';
import './styles/VehicleCard.css';

const VehicleCard = ({ 
  vehicle, 
  onEdit, 
  onDelete, 
  onView, 
  onToggleStatus,
  loading = false,
  loadingEdit = false
}) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const getImageUrl = (vehicle) => {
    // Prioridad: imagenVista3_4, luego imagenes[0], luego imagenLateral
    if (vehicle.imagenVista3_4) {
      return vehicle.imagenVista3_4;
    }
    if (vehicle.imagenes && vehicle.imagenes.length > 0) {
      return vehicle.imagenes[0];
    }
    if (vehicle.imagenLateral) {
      return vehicle.imagenLateral;
    }
    return null;
  };

  const isVehicleAvailable = (vehicle) => {
    // El backend usa 'estado' con valores: "Disponible", "Reservado", "Mantenimiento"
    return vehicle.estado === "Disponible";
  };

  const getStatusInfo = (estado) => {
    switch (estado) {
      case 'Disponible':
        return { 
          icon: <FaToggleOn />, 
          color: '#047857', // Verde oscuro
          bgColor: '#d1fae5', // Verde claro
          text: 'Disponible',
          next: 'Mantenimiento',
          nextColor: '#d97706'
        };
      case 'Reservado':
        return { 
          icon: <FaClock />, 
          color: '#1e40af', // Azul oscuro
          bgColor: '#dbeafe', // Azul claro
          text: 'Reservado',
          next: 'Disponible',
          nextColor: '#047857'
        };
      case 'Mantenimiento':
        return { 
          icon: <FaWrench />, 
          color: '#d97706', // Naranja/amarillo oscuro
          bgColor: '#fef3c7', // Naranja/amarillo claro
          text: 'Mantenimiento',
          next: 'Disponible',
          nextColor: '#047857'
        };
      default:
        return { 
          icon: <FaToggleOff />, 
          color: '#4b5563', // Gris más oscuro
          bgColor: '#f3f4f6', // Gris claro
          text: 'Desconocido',
          next: 'Disponible',
          nextColor: '#047857'
        };
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const imageUrl = getImageUrl(vehicle);
  const isAvailable = isVehicleAvailable(vehicle);
  const statusInfo = getStatusInfo(vehicle.estado);

  return (
    <div className={`vehicle-card ${!isAvailable ? 'unavailable' : ''}`}>
      <div className="vehicle-card-image">
        {imageUrl && !imageError ? (
          <img 
            src={imageUrl} 
            alt={vehicle.nombreVehiculo}
            onError={handleImageError}
          />
        ) : (
          <div className="vehicle-card-placeholder">
            <FaCar />
            <span>Sin imagen</span>
          </div>
        )}
        <div className="vehicle-card-status">
          <span 
            className={`status-badge`}
            style={{ 
              backgroundColor: statusInfo.bgColor,
              color: statusInfo.color,
              border: `1px solid ${statusInfo.color}`,
              fontWeight: '600'
            }}
          >
            {statusInfo.icon} {statusInfo.text}
          </span>
        </div>
      </div>

      <div className="vehicle-card-content">
        <h3 className="vehicle-card-title">{vehicle.nombreVehiculo}</h3>
        
        <div className="vehicle-card-details">
          <div className="vehicle-details-compact">
            {/* Fila 1: Marca (campo largo) - fila completa */}
            <div className="detail-row detail-row-full">
              <div className="detail-item detail-item-full">
                <span className="detail-label">Marca:</span>
                <span className="detail-value">{vehicle.marca}</span>
              </div>
            </div>
            
            {/* Fila 2: Modelo (campo largo) - fila completa */}
            <div className="detail-row detail-row-full">
              <div className="detail-item detail-item-full">
                <span className="detail-label">Modelo:</span>
                <span className="detail-value">{vehicle.modelo}</span>
              </div>
            </div>
            
            {/* Fila 3: Placa (campo largo) - fila completa */}
            <div className="detail-row detail-row-full">
              <div className="detail-item detail-item-full">
                <span className="detail-label">Placa:</span>
                <span className="detail-value">{vehicle.placa}</span>
              </div>
            </div>
            
            {/* Fila 4: Año y Capacidad (campos cortos) - dos en una fila */}
            <div className="detail-row detail-row-compact">
              <div className="detail-item detail-item-compact">
                <span className="detail-label">Año:</span>
                <span className="detail-value">{vehicle.anio}</span>
              </div>
              <div className="detail-item detail-item-compact">
                <span className="detail-label">Capacidad:</span>
                <span className="detail-value">{vehicle.capacidad}</span>
              </div>
            </div>
            
            {/* Fila 5: Precio (separada con borde superior) */}
            <div className="detail-price-row">
              <span className="detail-label">Precio:</span>
              <span className="detail-value price-highlight">
                {formatPrice(vehicle.precioPorDia || vehicle.precioDiario || 0)}/día
              </span>
            </div>
          </div>
        </div>

        <div className="vehicle-card-actions">
          <button 
            className="btn-action btn-view"
            onClick={() => onView(vehicle)}
            title="Ver detalles"
          >
            <FaEye />
          </button>
          <button 
            className={`btn-action btn-edit ${loadingEdit ? 'loading' : ''}`}
            onClick={() => onEdit(vehicle)}
            title="Editar vehículo"
            disabled={loadingEdit}
          >
            {loadingEdit ? <div className="spinner-small"></div> : <FaEdit />}
          </button>
          <button 
            className="btn-action btn-toggle"
            onClick={() => onToggleStatus(vehicle._id, statusInfo.next)}
            disabled={loading}
            title={`Cambiar de "${statusInfo.text}" a "${statusInfo.next}"`}
            style={{ 
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? (
              <div className="spinner-small"></div>
            ) : (
              statusInfo.icon
            )}
          </button>
          <button 
            className="btn-action btn-delete"
            onClick={() => onDelete(vehicle)}
            title="Eliminar vehículo"
          >
            <FaTrash />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
