import { useState, useEffect } from 'react';
import { useAuth } from '../../../../../../hooks/useAuth';

const useReservationRequestModal = ({ isOpen, onClose, vehicle, editingReservationData = null }) => {
  const { isAuthenticated, userInfo, createReservation, updateReservation } = useAuth();
  const [brandName, setBrandName] = useState('');

  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    clientName: '',
    clientPhone: '',
    clientEmail: ''
  });

  const today = new Date().toISOString().split('T')[0];

  // Galería de imágenes del vehículo
  const createUnifiedImageArray = () => {
    const unifiedImages = [];
    if (vehicle) {
      if (vehicle.mainViewImage || vehicle.imagenVista3_4) {
        unifiedImages.push(vehicle.mainViewImage || vehicle.imagenVista3_4);
      }
      if (vehicle.sideImage || vehicle.imagenLateral) {
        const sideImg = vehicle.sideImage || vehicle.imagenLateral;
        if (!unifiedImages.includes(sideImg)) {
          unifiedImages.push(sideImg);
        }
      }
      const galleryArr = vehicle.galleryImages || vehicle.imagenes || [];
      if (galleryArr.length > 0) {
        galleryArr.forEach((img) => {
          if (img && !unifiedImages.includes(img)) {
            unifiedImages.push(img);
          }
        });
      }
    }
    return { images: unifiedImages };
  };

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { images } = createUnifiedImageArray();
  const hasImages = images.length > 0;
  const nextImage = () => {
    if (images.length > 1) setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };
  const prevImage = () => {
    if (images.length > 1) setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Determinar si estamos editando una reserva
  const isEditingMode = editingReservationData && editingReservationData.reservationId;

  // Autocompletar datos al abrir el modal
  useEffect(() => {
    if (isOpen) {
      setValidationErrors({});
<<<<<<< HEAD
      if (isAuthenticated && userInfo) {
        let fullName = '';
        if (userInfo.fullname) {
          fullName = userInfo.fullname.trim();
        } else if (userInfo.nombres && userInfo.apellidos) {
          fullName = `${userInfo.nombres} ${userInfo.apellidos}`.trim();
=======
      setError(null);
      
      if (isEditingMode) {
        // Modo edición: usar datos de la reserva existente
        setFormData({
          startDate: editingReservationData.startDate || '',
          endDate: editingReservationData.returnDate || '',
          clientName: editingReservationData.clientName || '',
          clientPhone: '', // Se auto-completa del usuario
          clientEmail: '' // Se auto-completa del usuario
        });
        
        // Completar datos del usuario autenticado
        if (isAuthenticated && userInfo) {
          setFormData(prev => ({
            ...prev,
            clientPhone: userInfo.telefono || userInfo.phone || '',
            clientEmail: userInfo.correo || userInfo.email || '',
          }));
        }
      } else {
        // Modo creación: usar datos del usuario autenticado
        if (isAuthenticated && userInfo) {
          let fullName = '';
          if (userInfo.nombres && userInfo.apellidos) {
            fullName = `${userInfo.nombres} ${userInfo.apellidos}`.trim();
          } else if (userInfo.name && userInfo.lastName) {
            fullName = `${userInfo.name} ${userInfo.lastName}`.trim();
          }
          
          setFormData(prev => ({
            ...prev,
            clientName: fullName,
            clientPhone: userInfo.telefono || userInfo.phone || '',
            clientEmail: userInfo.correo || userInfo.email || '',
          }));
>>>>>>> 40349ca4f3c8c6305971b210111fa3fe3b4178f3
        }
      }
    }
  }, [isOpen, isAuthenticated, userInfo, editingReservationData, isEditingMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.startDate) {
      errors.startDate = 'La fecha de inicio es requerida';
    }
    if (!formData.endDate) {
      errors.endDate = 'La fecha de devolución es requerida';
    }
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (endDate <= startDate) {
        errors.endDate = 'La fecha de devolución debe ser posterior a la fecha de inicio';
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (startDate < today) {
        errors.startDate = 'La fecha de inicio no puede ser en el pasado';
      }
    }
    if (!formData.clientName.trim()) {
      errors.clientName = 'El nombre del cliente es requerido';
    }
    if (!formData.clientPhone.trim()) {
      errors.clientPhone = 'El teléfono del cliente es requerido';
    } else {
      const phoneDigits = formData.clientPhone.replace(/\D/g, '');
      if (!/^\d{8}$/.test(phoneDigits)) {
        errors.clientPhone = 'Completa el teléfono con 8 dígitos numéricos';
      }
    }
    if (!formData.clientEmail.trim()) {
      errors.clientEmail = 'El correo electrónico del cliente es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.clientEmail)) {
      errors.clientEmail = 'El correo electrónico no es válido';
    }
    return errors;
  };

  const resetForm = () => {
    setFormData({
      startDate: '',
      endDate: '',
      clientName: '',
      clientPhone: '',
      clientEmail: ''
    });
    setValidationErrors({});
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('Usuario no autenticado al intentar enviar reserva');
      return;
    }
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setLoading(true);
    setError(null);
    setValidationErrors({});
    setSuccess(false);

    try {
      if (isEditingMode) {
        // Actualizar reserva existente (solo cambiar vehículo)
        const updateData = {
          clientId: userInfo?._id || userInfo?.id,
          vehicleId: vehicle?._id,
          startDate: formData.startDate,
          returnDate: formData.endDate,
          status: 'Pending',
          pricePerDay: vehicle?.dailyPrice || 0
        };

        const result = await updateReservation(editingReservationData.reservationId, updateData);
        
        if (result.success) {
          setSuccess(true);
          setTimeout(() => {
            setSuccess(false);
            resetForm();
            if (onClose) onClose();
            // Redirigir al perfil después de actualizar
            window.location.href = '/perfil';
          }, 1800);
        } else {
          setError(result.message || 'No se pudo actualizar la reserva.');
        }
      } else {
        // Crear nueva reserva
        const reservaData = {
          clientId: userInfo?._id || userInfo?.id,
          vehicleId: vehicle?._id,
          startDate: formData.startDate,
          returnDate: formData.endDate,
          status: 'Pending',
          pricePerDay: vehicle?.dailyPrice || 0
        };

        const result = await createReservation(reservaData);
        
        if (result.success || result.reservaId) {
          setSuccess(true);
          setTimeout(() => {
            setSuccess(false);
            resetForm();
            if (onClose) onClose();
          }, 1800);
        } else {
          setError(result.message || 'No se pudo crear la reserva.');
        }
      }
    } catch (err) {
      setError(`Error al ${isEditingMode ? 'actualizar' : 'crear'} la reserva.`);
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    validationErrors,
    setValidationErrors,
    loading,
    error,
    success,
    handleSubmit,
    handleInputChange,
    resetForm,
    isAuthenticated,
    today,
    images,
    hasImages,
    currentImageIndex,
    setCurrentImageIndex,
    nextImage,
    prevImage,
    isEditingMode
  };
};

export default useReservationRequestModal;