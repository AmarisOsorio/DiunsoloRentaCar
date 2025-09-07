import { useState, useEffect } from 'react';
import { useAuth } from '../../../../../../hooks/useAuth';
const useReservationRequestModal = ({ isOpen, onClose, vehicle }) => {
  // Obtener autenticación y datos de usuario
  const { isAuthenticated, userInfo, createReservation } = useAuth();
  // Estado para el nombre de la marca
  const [brandName, setBrandName] = useState('');

  // Estado local para los datos del formulario de reserva
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    clientName: '',
    clientPhone: '',
    clientEmail: ''
  });

  // Fecha mínima (hoy)
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
  const [loading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Autocompletar datos del usuario autenticado al abrir el modal
  useEffect(() => {
    if (isOpen) {
      setValidationErrors({});
      if (isAuthenticated && userInfo) {
        let fullName = '';
        if (userInfo.fullname) {
          fullName = userInfo.fullname.trim();
        } else if (userInfo.nombres && userInfo.apellidos) {
          fullName = `${userInfo.nombres} ${userInfo.apellidos}`.trim();
        }
        setFormData(prev => ({
          ...prev,
          clientName: fullName,
          clientPhone: userInfo.telefono || userInfo.phone || '',
          clientEmail: userInfo.correo || userInfo.email || '',
        }));
      }
    }
  }, [isOpen, isAuthenticated, userInfo]);

  // Manejar cambios en los campos del formulario
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

  // Validar el formulario y devolver errores en español
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

  // Restablecer el formulario
  const resetForm = () => {
    setFormData({
      startDate: '',
      endDate: '',
      clientName: '',
      clientPhone: '',
      clientEmail: ''
    });
    setValidationErrors({});
  };

  // Enviar la reserva (dummy, solo para mantener la estructura)
  const handleSubmit = (e) => {
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
    // Enviar la reserva al backend
    setError(null);
    setValidationErrors({});
    setSuccess(false);
    // Construir datos para el backend
    const reservaData = {
  clientId: userInfo?._id || userInfo?.id,
      vehicleId: vehicle?._id,
      startDate: formData.startDate,
      returnDate: formData.endDate,
      status: 'Pending',
  pricePerDay: vehicle?.dailyPrice || 0,
      client: [{
        name: formData.clientName,
        phone: formData.clientPhone,
        email: formData.clientEmail
      }]
    };
    // Llamar a createReservation del contexto
    createReservation(reservaData)
      .then(result => {
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
      })
      .catch(err => {
        setError('Error al crear la reserva.');
      });
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
  };
}

export default useReservationRequestModal;