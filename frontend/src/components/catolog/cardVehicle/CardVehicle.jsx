// Ejemplo de componente de Card para autos en el catálogo
import React from 'react';
import './CardVehicle.css';

const CardAuto = ({ nombre, imagen, descripcion, precio }) => (
  <div className="card-auto">
    <img src={imagen} alt={nombre} className="card-auto-img" />
    <div className="card-auto-body">
      <h3>{nombre}</h3>
      <p>{descripcion}</p>
      <span className="card-auto-precio">${precio}</span>
    </div>
  </div>
);

export default CardAuto;
