import React from 'react';
import './styles/Catalogo.css';
import VehiculoCard from '../components/VehiculoCard';
import catalogBG from '../assets/catalogBG.png';
import useCatalogo from '../hooks/pages/useCatalogo';

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
              <VehiculoCard 
                key={vehiculo._id} 
                vehiculo={vehiculo} 
                variant="catalogo"
                showPrice={false}
              />
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