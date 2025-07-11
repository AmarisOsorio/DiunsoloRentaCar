import React, { useState } from 'react';
import { FaEdit, FaTrash, FaEye, FaToggleOn, FaToggleOff, FaCar } from 'react-icons/fa';
import './styles/VehicleCard.css';

const VehicleCard = ({ 
  vehicle, 
  onEdit, 
  onDelete, 
  onView, 
  onToggleStatus,
  loading = false 
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const imageUrl = getImageUrl(vehicle);
  const isAvailable = isVehicleAvailable(vehicle);

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
          <span className={`status-badge ${isAvailable ? 'available' : 'unavailable'}`}>
            {vehicle.estado || 'Desconocido'}
          </span>
        </div>
      </div>

      <div className="vehicle-card-content">
        <h3 className="vehicle-card-title">{vehicle.nombreVehiculo}</h3>
        <div className="vehicle-card-details">
          <p><strong>Marca:</strong> {vehicle.marca}</p>
          <p><strong>Modelo:</strong> {vehicle.modelo}</p>
          <p><strong>Año:</strong> {vehicle.anio}</p>
          <p><strong>Placa:</strong> {vehicle.placa}</p>
          <p><strong>Capacidad:</strong> {vehicle.capacidad} personas</p>
          <p className="vehicle-card-price">
            <strong>Precio:</strong> {formatPrice(vehicle.precioPorDia || vehicle.precioDiario || 0)}/día
          </p>
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
            className="btn-action btn-edit"
            onClick={() => onEdit(vehicle)}
            title="Editar vehículo"
          >
            <FaEdit />
          </button>
          <button 
            className="btn-action btn-toggle"
            onClick={() => onToggleStatus(vehicle._id, isAvailable ? 'Reservado' : 'Disponible')}
            disabled={loading}
            title={isAvailable ? 'Marcar como no disponible' : 'Marcar como disponible'}
          >
            {isAvailable ? <FaToggleOn /> : <FaToggleOff />}
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
