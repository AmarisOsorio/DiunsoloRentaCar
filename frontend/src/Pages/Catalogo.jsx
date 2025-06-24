import React, { useEffect, useState } from 'react';
import './styles/Catalogo.css';
import { useAuth } from '../context/AuthContext.jsx';
import catalogBG from '../assets/catalogBG.png';
import useCatalogo from '../hooks/Catalogo';

const Catalogo = () => {
  const { vehiculos, loading } = useCatalogo();

  if (loading) return <div className="marcas-loading">Cargando vehículos...</div>;

  return (
    <>
      <div
        className="catalogo-header"
        style={{ backgroundImage: `url(${catalogBG})` }}
      >
        <div className="catalogo-header-overlay">
          <h1>Catálogo</h1>
          <p>Explora nuestra variedad de autos disponibles para renta.</p>
        </div>
      </div>
      <section style={{ padding: '2rem' }}>
        <h2>Vehículos</h2>
        <div className="vehiculos-grid">
          {Array.isArray(vehiculos) && vehiculos.length > 0 ? (
            vehiculos.map(vehiculo => (
              <div className="vehiculo-card" key={vehiculo._id}>
                <img
                  src={vehiculo.imagenes && vehiculo.imagenes.length > 0 ? vehiculo.imagenes[0] : '/no-image.png'}
                  alt={vehiculo.nombreVehiculo || 'Vehículo'}
                  className="vehiculo-img"
                />
                <div className="vehiculo-card-body">
                  <div className="vehiculo-nombre">{vehiculo.nombreVehiculo}</div>
                  <div className="vehiculo-clase-anio">{vehiculo.clase} {vehiculo.anio}</div>
                  <div className={`vehiculo-estado ${vehiculo.estado === 'Disponible' ? 'disponible' : vehiculo.estado === 'Reservado' ? 'reservado' : 'mantenimiento'}`}>
                    <span className="estado-dot"></span>
                    {vehiculo.estado}
                  </div>
                  <button className="vehiculo-vermas">Ver más</button>
                </div>
              </div>
            ))
          ) : (
            <div>No hay vehículos disponibles.</div>
          )}
        </div>
      </section>
    </>
  );
};

export default Catalogo;
