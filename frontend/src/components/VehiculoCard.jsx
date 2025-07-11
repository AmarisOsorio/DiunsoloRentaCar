import React from 'react';
import '../components/styles/VehiculoCard.css';

const VehiculoCard = ({ vehiculo, variant, showPrice, onClick }) => {
  const getEstadoClass = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'disponible':
        return 'disponible';
      case 'reservado':
        return 'reservado';
      case 'mantenimiento':
        return 'mantenimiento';
      default:
        return 'disponible';
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick(vehiculo);
    }
  };

  return (
    <div className="vehiculo-card-home">
      <img 
        src={vehiculo.imagenVista3_4 || '/default-car.jpg'} 
        alt={vehiculo.nombreVehiculo}
        className="vehiculo-img-home"
      />
      <div className="vehiculo-card-body-home">
        <h3 className="vehiculo-nombre-home">{vehiculo.nombreVehiculo}</h3>
        <p className="vehiculo-clase-anio-home">{vehiculo.clase} - {vehiculo.anio}</p>
        <div className={`vehiculo-estado-home ${getEstadoClass(vehiculo.estado)}`}>
          <span className="estado-dot-home"></span>
          {vehiculo.estado}
        </div>
        <button 
          className="vehiculo-vermas-home"
          onClick={handleClick}
        >
          Ver más
        </button>
      </div>
    </div>
  );
};

export default VehiculoCard;