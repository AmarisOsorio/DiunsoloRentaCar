import React, { useState, useMemo } from 'react';
import './styles/Catalogo.css';
import VehiculoCard from '../components/VehiculoCard';
import VehiculoModal from '../components/modals/VehiculoModal';
import FiltrosCatalogo from '../components/FiltrosCatalogo';
import catalogBG from '../assets/bannerCatalogo3.webp';
import useCatalogo from '../hooks/pages/useCatalogo';
import useVehicleModal from '../hooks/components/modals/useVehicleModal';

const Catalogo = () => {
  const { vehiculos, loading } = useCatalogo();
  const [filtros, setFiltros] = useState({
    marcas: [],
    tipos: [],
  });

  const handleFilterChange = (nuevosFiltros) => {
    setFiltros(nuevosFiltros);
  };

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

  const vehiculosFiltrados = useMemo(() => {
  if (!vehiculos || !Array.isArray(vehiculos)) return [];

  let vehiculosFiltered = [...vehiculos];

  // Filtro por marca
  if (filtros.marcas.length > 0) {
    vehiculosFiltered = vehiculosFiltered.filter(v =>
      filtros.marcas.includes(v.idMarca?.nombreMarca.trim().toLowerCase())
    );
  }

  // Filtro por clase
  if (filtros.tipos.length > 0) {
    vehiculosFiltered = vehiculosFiltered.filter(v =>
      filtros.tipos.includes(v.clase?.trim().toLowerCase())
    );
  }

  return vehiculosFiltered;
}, [vehiculos, filtros]);

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

      <section className="catalogo-content">
        <div className="catalogo-layout">
          {/* Panel de filtros */}
          <aside className="catalogo-sidebar">
            <FiltrosCatalogo
              vehiculos={vehiculos}
              onFilterChange={handleFilterChange}
            />
          </aside>

          <main className="catalogo-main">
            <div className="catalogo-header-info">
              <h2>Vehículos</h2>
              <p className="resultados-count">
                {vehiculosFiltrados.length} vehículo
                {vehiculosFiltrados.length !== 1 ? 's' : ''} encontrado
                {vehiculosFiltrados.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="vehiculos-grid">
              {Array.isArray(vehiculosFiltrados) && vehiculosFiltrados.length > 0 ? (
                vehiculosFiltrados.map((vehiculo) => (
                  <VehiculoCard
                    key={vehiculo._id}
                    vehiculo={vehiculo}
                    variant="catalogo"
                    showPrice={false}
                    onClick={() => openModal(vehiculo)}
                  />
                ))
              ) : (
                <div className="no-vehiculos">
                  <p>No se encontraron vehículos que coincidan con los filtros seleccionados.</p>
                  <p>Intenta ajustar los filtros para ver más opciones.</p>
                </div>
              )}
            </div>
          </main>
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