import React, { useState, useMemo, useEffect } from 'react';
import './styles/Catalogo.css';
import VehiculoCard from '../components/VehiculoCard';
import VehiculoModal from '../components/modals/VehiculoModal';
import FiltrosCatalogo from '../components/FiltrosCatalogo';
import catalogBG from '../assets/bannerCatalogo3.webp';
import useCatalogo from '../hooks/pages/useCatalogo';
import useVehicleModal from '../hooks/components/modals/useVehicleModal';
import ReservationRequestModal from '../components/modals/ReservationRequestModal';

const Catalogo = () => {
  const { vehiculos, loading } = useCatalogo();
  const [filtros, setFiltros] = useState({
    marcas: [],
    tipos: [],
  });
  const [showFiltros, setShowFiltros] = useState(false);
  // Solo mostrar el botón en móvil y actualizar en tiempo real
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );

  // Estado y handlers para el modal de reserva
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [vehiculoReserva, setVehiculoReserva] = useState(null);

  const handleOpenReservationModal = (vehiculo) => {
    setVehiculoReserva(vehiculo);
    setShowReservationModal(true);
  };

  const handleCloseReservationModal = () => {
    setShowReservationModal(false);
    setVehiculoReserva(null);
  };
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Filtro por marca (usando la propiedad v.marca que es el nombre de la marca)
  if (filtros.marcas.length > 0) {
    vehiculosFiltered = vehiculosFiltered.filter(v => {
      const nombreMarca = v.marca?.trim();
      if (!nombreMarca || typeof nombreMarca !== 'string') return false;
      return filtros.marcas.includes(nombreMarca);
    });
  }

  // Filtro por clase
  if (filtros.tipos.length > 0) {
    vehiculosFiltered = vehiculosFiltered.filter(v => {
      const clase = v.clase;
      if (!clase || typeof clase !== 'string') return false;
      return filtros.tipos.includes(clase.trim().toLowerCase());
    });
  }

  // Filtro por estado
  if (filtros.estados && filtros.estados.length > 0) {
    vehiculosFiltered = vehiculosFiltered.filter(v => {
      const estado = v.estado;
      if (!estado || typeof estado !== 'string') return false;
      return filtros.estados.includes(estado);
    });
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
        <main className="catalogo-main">
          <div className="catalogo-header-info">
            <h2>Vehículos</h2>
            <div className="resultados-filtros-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              {!isMobile && (
                <p className="resultados-count" style={{ margin: 0, order: 2 }}>
                  {vehiculosFiltrados.length} vehículo
                  {vehiculosFiltrados.length !== 1 ? 's' : ''} encontrado
                  {vehiculosFiltrados.length !== 1 ? 's' : ''}
                </p>
              )}
              <button
                className={`btn-filtros-toggle${showFiltros ? ' active' : ''}`}
                onClick={() => setShowFiltros((prev) => !prev)}
                style={!isMobile ? { order: 1, marginLeft: 0, minWidth: '180px', justifyContent: 'center', fontSize: '1.08rem', padding: '0.6rem 1.2rem', display: 'inline-flex' } : {}}
              >
                <span className="btn-filtros-toggle-content">
                  <svg width="22" height="22" fill="#fff" className="btn-filtros-toggle-icon" viewBox="0 0 24 24"><path d="M3 5h18v2H3V5zm2 7h14v2H5v-2zm4 7h6v2H9v-2z"/></svg>
                  {showFiltros ? 'Ocultar filtros' : 'Mostrar filtros'}
                </span>
              </button>
              {isMobile && (
                <p className="resultados-count" style={{ margin: 0, order: 2 }}>
                  {vehiculosFiltrados.length} vehículo
                  {vehiculosFiltrados.length !== 1 ? 's' : ''} encontrado
                  {vehiculosFiltrados.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
          {/* Panel de filtros debajo del header-info cuando está activo */}
          {showFiltros && (
            <div
              className={`filtros-container anim-filtros-in${!isMobile ? ' filtros-container-desktop' : ' filtros-container-mobile'}`}
            >
              <FiltrosCatalogo
                vehiculos={vehiculos}
                onFilterChange={handleFilterChange}
                onClose={() => setShowFiltros(false)}
                isMobile={isMobile}
                ordenFiltros={['marcas', 'tipos', 'estados']}
              />
            </div>
          )}
          <div className="vehiculos-grid">
            {Array.isArray(vehiculosFiltrados) && vehiculosFiltrados.length > 0 ? (
              vehiculosFiltrados.map((vehiculo) => (
                <VehiculoCard
                  key={vehiculo._id}
                  vehiculo={vehiculo}
                  variant="catalogo"
                  showPrice={false}
                  onClick={() => openModal(vehiculo)}
                  onReservar={handleOpenReservationModal}
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
        onSolicitarReserva={handleOpenReservationModal}
      />

      {/* Modal de reserva */}
      {showReservationModal && (
        <ReservationRequestModal
          isOpen={showReservationModal}
          onClose={handleCloseReservationModal}
          vehiculo={vehiculoReserva}
          onSubmit={() => {}}
          loading={false}
          error={null}
          success={false}
        />
      )}
    </>
  );
};

export default Catalogo;