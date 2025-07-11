import React from 'react';
import './styles/Catalogo.css';
import VehiculoCard from '../components/VehiculoCard';
import VehiculoModal from '../components/modals/VehiculoModal';
import catalogBG from '../assets/bannerCatalogo3.webp';
import useCatalogo from '../hooks/pages/useCatalogo';
import useVehicleModal from '../hooks/components/modals/useVehicleModal';

const Catalogo = () => {
  const { vehiculos, loading } = useCatalogo();
  const { 
    isOpen, 
    selectedVehiculo, 
    imagenActual, 
    setImagenActual, 
    openModal, 
    closeModal, 
    getEstadoClass, 
    cambiarImagen, 
    handleBackdropClick 
  } = useVehicleModal();

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
                onClick={() => openModal(vehiculo)}
              />
            ))
          ) : (
            <div>No hay vehículos disponibles.</div>
          )}
        </div>
      </section>
      
      <VehiculoModal
        vehiculo={selectedVehiculo}
        isOpen={isOpen}
        onClose={closeModal}
        imagenActual={imagenActual}
        setImagenActual={setImagenActual}
        getEstadoClass={getEstadoClass}
        cambiarImagen={cambiarImagen}
        handleBackdropClick={handleBackdropClick}
      />
    </>
  );
};

export default Catalogo;