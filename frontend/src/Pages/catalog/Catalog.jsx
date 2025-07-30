import { useState, useMemo } from 'react';
import './Catalog.css';
import VehicleCard from '../../components/catalog/VehicleCard/VehicleCard.jsx';
import VehicleModal from '../../components/catalog/modals/vehicleModal/VehicleModal.jsx';
import ReservationRequestModal from '../../components/catalog/modals/vehicleModal/reservationRequest/ReservationRequestModal.jsx';
import CatalogFilters from '../../components/catalog/filters/filters.jsx';
import catalogBG from '../../assets/bannerCatalog.webp';
import useCatalog from './hooks/useCatalog.js';
import useVehicleModal from '../../components/catalog/modals/vehicleModal/hooks/useVehicleModal.js';

const Catalog = () => {
  const { vehicles, loading } = useCatalog();
  const [filters, setFilters] = useState({
    brands: [],
    types: [],
  });
  const [showFilters, setShowFilters] = useState(false);

  // Estado y handlers para el modal de reserva
  // Estado del modal de reserva:
  // - showReservationModal: controla la visibilidad del modal de reserva
  // - reservationVehicle: almacena el vehículo a reservar
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [reservationVehicle, setReservationVehicle] = useState(null);

  // Abre el modal de reserva para un vehículo específico
  const handleOpenReservationModal = (vehicle) => {
    setReservationVehicle(vehicle);
    setShowReservationModal(true);
  };

  // Cierra el modal de reserva y limpia el vehículo seleccionado
  const handleCloseReservationModal = () => {
    setShowReservationModal(false);
    setReservationVehicle(null);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const {
    isOpen,
    selectedVehicle,
    currentImage,
    setCurrentImage,
    openModal,
    closeModal,
    getStateClass,
    changeImage,
    handleBackdropClick,
    setSelectedVehicle
  } = useVehicleModal();

  const filteredVehicles = useMemo(() => {
    if (!vehicles || !Array.isArray(vehicles)) return [];

    let vehiclesFiltered = [...vehicles];

    // Filter by brand (using v.marca as the brand name)
    if (filters.brands.length > 0) {
      vehiclesFiltered = vehiclesFiltered.filter(v => {
        const brandName = v.marca?.trim();
        if (!brandName || typeof brandName !== 'string') return false;
        return filters.brands.includes(brandName);
      });
    }

    // Filter by type/class
    if (filters.types.length > 0) {
      vehiclesFiltered = vehiclesFiltered.filter(v => {
        const type = v.clase;
        if (!type || typeof type !== 'string') return false;
        return filters.types.includes(type.trim().toLowerCase());
      });
    }

    // Filter by state
    if (filters.estados && filters.estados.length > 0) {
      vehiclesFiltered = vehiclesFiltered.filter(v => {
        const state = v.estado;
        if (!state || typeof state !== 'string') return false;
        return filters.estados.includes(state);
      });
    }

    return vehiclesFiltered;
  }, [vehicles, filters]);

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
              <p className="resultados-count" style={{ margin: 0, order: 2 }}>
                {filteredVehicles.length} vehículo
                {filteredVehicles.length !== 1 ? 's' : ''} encontrado
                {filteredVehicles.length !== 1 ? 's' : ''}
              </p>
              <button
                className={`btn-filtros-toggle${showFilters ? ' active' : ''}`}
                onClick={() => setShowFilters((prev) => !prev)}
                style={{ order: 1, marginLeft: 0, minWidth: '180px', justifyContent: 'center', fontSize: '1.08rem', padding: '0.6rem 1.2rem', display: 'inline-flex' }}
              >
                <span className="btn-filtros-toggle-content">
                  <svg width="22" height="22" fill="#fff" className="btn-filtros-toggle-icon" viewBox="0 0 24 24"><path d="M3 5h18v2H3V5zm2 7h14v2H5v-2zm4 7h6v2H9v-2z"/></svg>
                  {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
                </span>
              </button>
            </div>
          </div>
          {/* Panel de filtros debajo del header-info cuando está activo */}
          {showFilters && (
            <div className="filtros-container anim-filtros-in filtros-container-desktop">
              <CatalogFilters
                vehicles={vehicles}
                onFilterChange={handleFilterChange}
                onClose={() => setShowFilters(false)}
                ordenFiltros={['brands', 'types', 'estados']}
              />
            </div>
          )}
          <div className="vehiculos-grid">
            {Array.isArray(filteredVehicles) && filteredVehicles.length > 0 ? (
              filteredVehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle._id}
                  vehicle={vehicle}
                  variant="catalogo"
                  showPrice={false}
                  onClick={() => openModal(vehicle)}
                  onReserve={handleOpenReservationModal}
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

      <VehicleModal
        vehicle={selectedVehicle}
        isOpen={isOpen}
        onClose={closeModal}
        currentImage={currentImage}
        setCurrentImage={setCurrentImage}
        getStateClass={getStateClass}
        changeImage={changeImage}
        handleBackdropClick={handleBackdropClick}
        onOpenReservationRequest={handleOpenReservationModal}
      />

      {/* Modal de reserva */}
      {showReservationModal && (
        <ReservationRequestModal
          isOpen={showReservationModal}
          onClose={handleCloseReservationModal}
          vehicle={reservationVehicle}
          onSubmit={() => {}}
          loading={false}
          error={null}
          success={false}
        />
      )}
    </>
  );
};

export default Catalog;