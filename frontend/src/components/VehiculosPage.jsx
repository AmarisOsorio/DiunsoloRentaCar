import React from 'react';
import VehiculoCard from './VehiculoCard';
import VehiculoModal from './modals/VehiculoModal';
import ReservationRequestModal from './modals/ReservationRequestModal';
import { useVehicleModalContext } from '../context/VehicleModalContext';

const VehiculosPage = ({ vehiculos, onSubmitReserva, loading, error, success }) => {
  const {
    isOpen: isVehiculoModalOpen,
    selectedVehiculo,
    imagenActual,
    setImagenActual,
    openModal,
    closeModal
  } = useVehicleModalContext();

  // getEstadoClass y cambiarImagen pueden ser funciones locales si se necesitan
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
  const cambiarImagen = (direccion) => {
    if (selectedVehiculo?.imagenes && selectedVehiculo.imagenes.length > 1) {
      if (direccion === 'next') {
        setImagenActual((prev) =>
          prev === selectedVehiculo.imagenes.length - 1 ? 0 : prev + 1
        );
      } else {
        setImagenActual((prev) =>
          prev === 0 ? selectedVehiculo.imagenes.length - 1 : prev - 1
        );
      }
    }
  };
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  // Modal de reserva
  const [showReservationModal, setShowReservationModal] = React.useState(false);
  const [vehiculoReserva, setVehiculoReserva] = React.useState(null);

  const handleOpenReservationModal = (vehiculo) => {
    setVehiculoReserva(vehiculo);
    setShowReservationModal(true);
    // No cerrar el modal de detalles aquí, para evitar conflictos de estado
  };

  const handleCloseReservationModal = () => {
    setShowReservationModal(false);
    setVehiculoReserva(null);
  };

  return (
    <div>
      {vehiculos.map(vehiculo => (
        <VehiculoCard
          key={vehiculo._id}
          vehiculo={vehiculo}
          onClick={() => openModal(vehiculo)}
          onReservar={handleOpenReservationModal}
        />
      ))}

      {/* Modal de detalles */}
      <VehiculoModal
        vehiculo={selectedVehiculo}
        isOpen={isVehiculoModalOpen}
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
          onSubmit={onSubmitReserva}
          loading={loading}
          error={error}
          success={success}
        />
      )}
    </div>
  );
};

export default VehiculosPage;
