  // Importaciones de librerías y componentes necesarios para el catálogo
  import React from 'react';
  import { useState } from 'react';
  import './Catalog.css';
  import VehicleCard from '../../components/catalog/VehicleCard/VehicleCard.jsx';
  import VehicleModal from '../../components/catalog/modals/vehicleModal/VehicleModal.jsx';
  import ReservationRequestModal from '../../components/catalog/modals/vehicleModal/reservationRequest/ReservationRequestModal.jsx';
  import CatalogFilters from '../../components/catalog/filters/filters.jsx';
  import catalogBG from '../../assets/bannerCatalog.webp';
  import useCatalog from './hooks/useCatalog.js';
  import useVehicleModal from '../../components/catalog/modals/vehicleModal/hooks/useVehicleModal.js';
  import { useFilteredVehicles } from '../../components/catalog/filters/hook/usefilters.js';


  // Componente principal del catálogo de vehículos
  const Catalog = () => {
    // Hook personalizado para obtener los vehículos y el estado de carga
    const { vehicles, loading } = useCatalog();
    // Estado para los filtros seleccionados
    const [filters, setFilters] = useState({
      brands: [],
      types: [],
    });
    // Estado para mostrar u ocultar el panel de filtros
    const [showFilters, setShowFilters] = useState(true);

    // Estado y handlers para el modal de reserva
    // - showReservationModal: controla la visibilidad del modal de reserva
    // - reservationVehicle: almacena el vehículo a reservar
    const [showReservationModal, setShowReservationModal] = useState(false);
    const [reservationVehicle, setReservationVehicle] = useState(null);

    // Función para abrir el modal de reserva para un vehículo específico
    const handleOpenReservationModal = (vehicle) => {
      setReservationVehicle(vehicle);
      setShowReservationModal(true);
    };

    // Función para cerrar el modal de reserva y limpiar el vehículo seleccionado
    const handleCloseReservationModal = () => {
      setShowReservationModal(false);
      setReservationVehicle(null);
    };

    // Actualiza el estado de los filtros cuando el usuario selecciona nuevas opciones en el panel de filtros
    const handleFilterChange = (newFilters) => {
      setFilters(newFilters);
    };

    // Desestructura los estados y funciones necesarios para controlar el modal de detalles del vehículo
    const {
      isOpen,
      selectedVehicle,
      currentImage,
      setCurrentImage,
      openModal,
      closeModal,
      getStateClass,
      changeImage,
      handleBackdropClick
      } = useVehicleModal();

    // Obtiene la lista de vehículos filtrados según los filtros seleccionados
    const filteredVehicles = useFilteredVehicles(vehicles, filters);

    // Muestra un mensaje de carga mientras se obtienen los vehículos del backend
    if (loading) return <div className="brands-loading">Cargando vehículos...</div>;

    return (
      <>
        {/* Encabezado del catálogo con imagen de fondo */}
        <div
          className="catalog-header"
          style={{ backgroundImage: `url(${catalogBG})` }}
        >
          <div className="catalog-header-overlay">
            <h1>Descubre tu próximo viaje sobre ruedas</h1>
            <p>Explora nuestra flota, conoce cada detalle y reserva el vehículo perfecto en solo unos clics.</p>
          </div>
        </div>

        {/* Cuerpo principal del catálogo */}
        <section className="catalog-content">
          <main className="catalog-main">
            {/* Cabecera de la sección de resultados y filtros */}
            <div className="catalog-header-info">
              <div className="catalog-header-title-group">
                <h2 className="catalog-header-title">Catálogo</h2>
                <span className="catalog-header-subtitle">Con amplia variedad en vehículos</span>
              </div>
              {/* Fila de filtros: botón para mostrar/ocultar y contador de resultados */}
              <div className="filters-row">
                <button
                  className={`btn-filters-toggle${showFilters ? ' active' : ''}`}
                  onClick={() => setShowFilters((prev) => !prev)}
                >
                  <span className="btn-filters-toggle-content">
                    <svg width="22" height="22" fill="#fff" className="btn-filters-toggle-icon" viewBox="0 0 24 24"><path d="M3 5h18v2H3V5zm2 7h14v2H5v-2zm4 7h6v2H9v-2z"/></svg>
                    {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                  </span>
                </button>
                <p className="results-count">
                  {filteredVehicles.length} vehículo{filteredVehicles.length !== 1 ? 's' : ''} encontrado{filteredVehicles.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="catalog-header-separator" />
            </div>
            
            {/* Layout de filtros a la izquierda y grid a la derecha */}
            <div className="catalog-layout">
              {/* Panel de filtros a la izquierda */}
              {showFilters && (
                <aside className="filters-container">
                  <CatalogFilters
                    vehicles={vehicles}
                    onFilterChange={handleFilterChange}
                    onClose={() => setShowFilters(false)}
                    ordenFiltros={['brands', 'types', 'estados']}
                  />
                </aside>
              )}
              {/* Grid de tarjetas de vehículos a la derecha */}
              <div className="vehicles-grid">
                {Array.isArray(filteredVehicles) && filteredVehicles.length > 0 ? (
                  filteredVehicles.map((vehicle) => (
                    <VehicleCard
                      key={vehicle._id}
                      vehicle={vehicle}
                      variant="catalog"
                      showPrice={false}
                      onClick={() => openModal(vehicle)}
                      onReserve={handleOpenReservationModal}
                    />
                  ))
                ) : (
                  <div className="no-vehicles">
                    <p>No se encontraron vehículos que coincidan con los filtros seleccionados.</p>
                    <p>Intenta ajustar los filtros para ver más opciones.</p>
                  </div>
                )}
              </div>
            </div>
          </main>
        </section>

        {/* Modal de detalles del vehículo */}
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

        {/* Modal de reserva de vehículo */}
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

  // Exporta el componente principal del catálogo
  export default Catalog;