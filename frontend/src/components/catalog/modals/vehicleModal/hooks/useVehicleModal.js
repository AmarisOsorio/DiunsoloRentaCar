import { useState } from 'react';

const useVehicleModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [imagenActual, setImagenActual] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const openModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setImagenActual(0);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedVehicle(null);
    setImagenActual(0);
  };

  const openLoginModal = () => {
    setShowLoginModal(true);
  };

  const closeLoginModal = () => {
    setShowLoginModal(false);
  };

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
    if (selectedVehicle?.imagenes && selectedVehicle.imagenes.length > 1) {
      if (direccion === 'next') {
        setImagenActual((prev) => 
          prev === selectedVehicle.imagenes.length - 1 ? 0 : prev + 1
        );
      } else {
        setImagenActual((prev) => 
          prev === 0 ? selectedVehicle.imagenes.length - 1 : prev - 1
        );
      }
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  return {
    isOpen,
    selectedVehicle,
    imagenActual,
    showLoginModal,
    setImagenActual,
    openModal,
    closeModal,
    openLoginModal,
    closeLoginModal,
    getEstadoClass,
    cambiarImagen,
    handleBackdropClick
  };
};

export default useVehicleModal;