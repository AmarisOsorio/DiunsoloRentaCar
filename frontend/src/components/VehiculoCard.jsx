import React from 'react';

const VehiculoCardHome = ({ vehiculo }) => {
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

  return (
    <div className="vehiculo-card-home">
      <img 
        src={vehiculo.imagenes?.[0] || '/default-car.jpg'} 
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
        <p className="vehiculo-precio-home">${vehiculo.precioPorDia}/día</p>
        <button className="vehiculo-vermas-home">Ver más</button>
      </div>
    </div>
  );
};

export default VehiculoCardHome;