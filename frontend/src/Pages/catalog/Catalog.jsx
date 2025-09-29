// Importaciones de librerías y componentes necesarios para el catálogo
import React from 'react';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
  const location = useLocation();
  
  // Hook personalizado para obtener los vehículos y el estado de carga
  const { vehicles, loading } = useCatalog();
  
  // Estado para los filtros seleccionados
  const [filters, setFilters] = useState({
    brands: [],
    types: [],
  });
  
  // Estado para mostrar u ocultar el panel de filtros
  const [showFilters, setShowFilters] = useState(true);

  // Estados para el modal de reserva
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [reservationVehicle, setReservationVehicle] = useState(null);
  
  // Estado para datos de reserva en edición
  const [editingReservationData, setEditingReservationData] = useState(null);
  // Estado para vehículo temporalmente seleccionado
  const [tempSelectedVehicle, setTempSelectedVehicle] = useState(null);

  // Detectar si venimos de una edición de reserva
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const isEditing = urlParams.get('editingReservation') === 'true';
    
    if (isEditing) {
      const reservationData = {
        reservationId: urlParams.get('reservationId'),
        startDate: urlParams.get('startDate'),
        returnDate: urlParams.get('returnDate'),
        clientName: urlParams.get('clientName')
      };
      
      setEditingReservationData(reservationData);
      
      // Mostrar mensaje informativo
      console.log('📝 Modo edición de reserva activado:', reservationData);
    }
  }, [location.search]);

  // Función para abrir el modal de reserva
  const handleOpenReservationModal = (vehicle, editData = null) => {
    setReservationVehicle(vehicle);
    setShowReservationModal(true);
  };

  // Función para cerrar el modal de reserva
  const handleCloseReservationModal = () => {
    setShowReservationModal(false);
    setReservationVehicle(null);
    // Si estamos editando, limpiar los parámetros URL
    if (editingReservationData) {
      window.history.replaceState({}, '', '/catalogo');
      setEditingReservationData(null);
    }
  };

  // Actualizar filtros
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Hook para el modal de vehículo
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

  // Obtener vehículos filtrados
  const filteredVehicles = useFilteredVehicles(vehicles, filters);

  if (loading) return <div className="brands-loading">Cargando vehículos...</div>;

  return (
    <>
      {/* Encabezado del catálogo */}
      <div
        className="catalog-header"
        style={{ backgroundImage: `url(${catalogBG})` }}
      >
        <div className="catalog-header-overlay">
          <h1>
            {editingReservationData ? 'Cambiar vehículo de tu reserva' : 'Descubre tu próximo viaje sobre ruedas'}
          </h1>
          <p>
            {editingReservationData 
              ? 'Selecciona un nuevo vehículo para tu reserva. Las fechas y datos del cliente se mantendrán.'
              : 'Explora nuestra flota, conoce cada detalle y reserva el vehículo perfecto en solo unos clics.'
            }
          </p>
        </div>
      </div>

      {/* Mensaje informativo si está editando */}
      {editingReservationData && (
        <div style={{
          background: '#e3f2fd',
          border: '1px solid #1976d2',
          borderRadius: '8px',
          padding: '12px 16px',
          margin: '1rem 2rem 0 2rem',
          color: '#1976d2',
          fontWeight: '500'
        }}>
          🔄 Cambiando vehículo de reserva • Fechas: {editingReservationData.startDate} → {editingReservationData.returnDate}
        </div>
      )}

      {/* Cuerpo principal del catálogo */}
      <section className="catalog-content">
        <main className="catalog-main">
          <div className="catalog-header-info">
            <div className="catalog-header-title-group">
              <h2 className="catalog-header-title">Catálogo</h2>
              <span className="catalog-header-subtitle">Con amplia variedad en vehículos</span>
            </div>
            
            <div className="filters-row">
              <button
                className={`btn-filters-toggle${showFilters ? ' active' : ''}`}
                onClick={() => setShowFilters((prev) => !prev)}
              >
                <span className="btn-filters-toggle-content">
                  <svg width="22" height="22" fill="#fff" className="btn-filters-toggle-icon" viewBox="0 0 24 24">
                    <path d="M3 5h18v2H3V5zm2 7h14v2H5v-2zm4 7h6v2H9v-2z"/>
                  </svg>
                  {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                </span>
              </button>
              <p className="results-count">
                {filteredVehicles.length} vehículo{filteredVehicles.length !== 1 ? 's' : ''} encontrado{filteredVehicles.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="catalog-header-separator" />
          </div>
          
          {/* Layout de filtros y grid */}
          <div className="catalog-layout">
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
            
            {/* Grid de vehículos */}
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

      {/* Modal de reserva con soporte para edición */}
      {showReservationModal && (
        <ReservationRequestModal
          isOpen={showReservationModal}
          onClose={handleCloseReservationModal}
          vehicle={reservationVehicle}
          editingReservationData={editingReservationData}
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