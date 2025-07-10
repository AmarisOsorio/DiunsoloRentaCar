import { useState } from 'react';

const useVehicleModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVehiculo, setSelectedVehiculo] = useState(null);
  const [imagenActual, setImagenActual] = useState(0);

  const openModal = (vehiculo) => {
    setSelectedVehiculo(vehiculo);
    setImagenActual(0);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedVehiculo(null);
    setImagenActual(0);
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

  return {
    isOpen,
    selectedVehiculo,
    imagenActual,
    setImagenActual,
    openModal,
    closeModal,
    getEstadoClass,
    cambiarImagen,
    handleBackdropClick
  };
};

export default useVehicleModal;