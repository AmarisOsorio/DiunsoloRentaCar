import { useState, useCallback, useEffect } from 'react';
import { uploadImageToCloudinary } from '../../services/cloudinaryService';

export const useVehicleForm = (initialData = null, onSuccess = () => {}) => {
  const [formData, setFormData] = useState({
    nombreVehiculo: initialData?.nombreVehiculo || '',
    idMarca: initialData?.idMarca || initialData?.marca || '', // Changed from 'marca' to 'idMarca'
    modelo: initialData?.modelo || '',
    clase: initialData?.clase || '',
    anio: initialData?.anio ? String(initialData.anio) : '',
    placa: initialData?.placa || '',
    color: initialData?.color || '',
    capacidad: initialData?.capacidad ? String(initialData.capacidad) : '',
    numeroMotor: initialData?.numeroMotor || '',
    numeroChasisGrabado: initialData?.numeroChasisGrabado || '',
    numeroVinChasis: initialData?.numeroVinChasis || '',
    precioPorDia: initialData?.precioPorDia ? String(initialData.precioPorDia) : '',
    estado: initialData?.estado || 'Disponible',
    imagenes: initialData?.imagenes || [],
    imagenVista3_4: initialData?.imagenVista3_4 || null,
    imagenLateral: initialData?.imagenLateral || null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Efecto para actualizar el formulario cuando cambien los datos iniciales
  useEffect(() => {
    console.log('useVehicleForm - initialData changed:', initialData);
    if (initialData && initialData._id) {
      console.log('Updating form with initial data:', initialData);
      const newFormData = {
        nombreVehiculo: initialData?.nombreVehiculo || '',
        idMarca: initialData?.idMarca || initialData?.marca || '',
        modelo: initialData?.modelo || '',
        clase: initialData?.clase || '',
        anio: initialData?.anio ? String(initialData.anio) : '',
        placa: initialData?.placa || '',
        color: initialData?.color || '',
        capacidad: initialData?.capacidad ? String(initialData.capacidad) : '',
        numeroMotor: initialData?.numeroMotor || '',
        numeroChasisGrabado: initialData?.numeroChasisGrabado || '',
        numeroVinChasis: initialData?.numeroVinChasis || '',
        precioPorDia: initialData?.precioPorDia ? String(initialData.precioPorDia) : '',
        estado: initialData?.estado || 'Disponible',
        imagenes: initialData?.imagenes || [],
        imagenVista3_4: initialData?.imagenVista3_4 || null,
        imagenLateral: initialData?.imagenLateral || null
      };
      console.log('Setting new form data:', newFormData);
      setFormData(newFormData);
      // Limpiar errores cuando se cargan nuevos datos
      setError(null);
    } else if (!initialData) {
      // Si no hay initialData (crear nuevo), resetear formulario
      console.log('No initial data - resetting form');
      setFormData({
        nombreVehiculo: '',
        idMarca: '',
        modelo: '',
        clase: '',
        anio: '',
        placa: '',
        color: '',
        capacidad: '',
        numeroMotor: '',
        numeroChasisGrabado: '',
        numeroVinChasis: '',
        precioPorDia: '',
        estado: 'Disponible',
        imagenes: [],
        imagenVista3_4: null,
        imagenLateral: null
      });
      setError(null);
    }
  }, [initialData]); // Reaccionar a cualquier cambio en initialData

  // Log para debug del formData
  useEffect(() => {
    console.log('Form data updated:', formData);
  }, [formData]);

  // Función para subir imagen a Cloudinary automáticamente
  const uploadImageToCloudinaryAuto = useCallback(async (file) => {
    try {
      setUploadingImages(true);
      const result = await uploadImageToCloudinary(file, 'vehiculos');
      
      if (result.success) {
        return {
          url: result.url,
          public_id: result.public_id,
          isNew: false, // Ya está subida
          file: null
        };
      } else {
        throw new Error(result.error || 'Error al subir imagen');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setError(`Error al subir imagen: ${error.message}`);
      return null;
    } finally {
      setUploadingImages(false);
    }
  }, []);

  const handleInputChange = useCallback((field, value) => {
    // Validación especial para campos numéricos
    if (field === 'anio') {
      // Limpiar cualquier carácter no numérico
      value = value.replace(/[^0-9]/g, '');
      
      // Limitar a 4 dígitos máximo
      if (value.length > 4) {
        value = value.substring(0, 4);
      }
    } else if (field === 'capacidad') {
      // Solo números para capacidad
      value = value.replace(/[^0-9]/g, '');
      
      // Limitar a 2 dígitos máximo (hasta 99 personas)
      if (value.length > 2) {
        value = value.substring(0, 2);
      }
    } else if (field === 'precioPorDia') {
      // Permitir números y punto decimal para precio
      // Solo limpiar caracteres que no sean números o punto
      value = value.replace(/[^0-9.]/g, '');
      
      // Asegurar que solo haya un punto decimal
      const parts = value.split('.');
      if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
      }
      
      // Limitar decimales a 2 dígitos máximo
      if (parts.length === 2 && parts[1].length > 2) {
        value = parts[0] + '.' + parts[1].substring(0, 2);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (error) setError(null);
  }, [error]);

  const handleImageUpload = useCallback(async (files) => {
    try {
      setUploadingImages(true);
      const fileArray = Array.from(files);
      
      // Subir cada imagen a Cloudinary de forma secuencial para evitar problemas de concurrencia
      const uploadedImages = [];
      for (const file of fileArray) {
        const uploadedImage = await uploadImageToCloudinaryAuto(file);
        if (uploadedImage) {
          uploadedImages.push(uploadedImage);
        }
      }
      
      if (uploadedImages.length > 0) {
        setFormData(prev => ({
          ...prev,
          imagenes: [...prev.imagenes, ...uploadedImages]
        }));
      }
    } catch (error) {
      console.error('Error uploading gallery images:', error);
      setError(`Error al subir imágenes: ${error.message}`);
    } finally {
      setUploadingImages(false);
    }
  }, [uploadImageToCloudinaryAuto]);

  const removeImage = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== index)
    }));
  }, []);

  // Funciones para manejar imágenes principales
  const handleImageVista3_4 = useCallback(async (file) => {
    if (file) {
      const uploadedImage = await uploadImageToCloudinaryAuto(file);
      if (uploadedImage) {
        setFormData(prev => ({
          ...prev,
          imagenVista3_4: uploadedImage
        }));
      }
    }
  }, [uploadImageToCloudinaryAuto]);

  const handleImageLateral = useCallback(async (file) => {
    if (file) {
      const uploadedImage = await uploadImageToCloudinaryAuto(file);
      if (uploadedImage) {
        setFormData(prev => ({
          ...prev,
          imagenLateral: uploadedImage
        }));
      }
    }
  }, [uploadImageToCloudinaryAuto]);

  const removeImageVista3_4 = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      imagenVista3_4: null
    }));
  }, []);

  const removeImageLateral = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      imagenLateral: null
    }));
  }, []);

  const validateForm = useCallback(() => {
    const requiredFields = [
      'nombreVehiculo', 'idMarca', 'modelo', 'clase', 'anio', 'placa', 
      'color', 'capacidad', 'numeroMotor', 'numeroChasisGrabado', 
      'numeroVinChasis', 'precioPorDia'
    ];
    
    for (const field of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === '') {
        const fieldNames = {
          nombreVehiculo: 'Nombre del Vehículo',
          idMarca: 'Marca',
          modelo: 'Modelo',
          clase: 'Clase',
          anio: 'Año',
          placa: 'Placa',
          color: 'Color',
          capacidad: 'Capacidad',
          numeroMotor: 'Número de Motor',
          numeroChasisGrabado: 'Número de Chasis Grabado',
          numeroVinChasis: 'Número VIN/Chasis',
          precioPorDia: 'Precio por Día'
        };
        setError(`El campo "${fieldNames[field] || field}" es requerido`);
        return false;
      }
    }

    // Validar que las imágenes requeridas estén presentes
    if (!formData.imagenVista3_4) {
      setError('La imagen vista 3/4 es requerida');
      return false;
    }

    if (!formData.imagenLateral) {
      setError('La imagen lateral es requerida');
      return false;
    }

    // Verificar que las imágenes sean válidas (ahora con URLs de Cloudinary)
    if (formData.imagenVista3_4 && 
        typeof formData.imagenVista3_4 !== 'string' && 
        !formData.imagenVista3_4.url) {
      setError('La imagen vista 3/4 no es válida');
      return false;
    }

    if (formData.imagenLateral && 
        typeof formData.imagenLateral !== 'string' && 
        !formData.imagenLateral.url) {
      setError('La imagen lateral no es válida');
      return false;
    }

    // Validación de formato de placa
    const placaRegex = /^[A-Za-z0-9]{6,8}$/;
    if (!placaRegex.test(formData.placa)) {
      setError('La placa debe tener entre 6 y 8 caracteres alfanuméricos');
      return false;
    }

    // Validación específica para el año
    const anioStr = String(formData.anio).trim();
    const anioNum = parseInt(anioStr);
    
    console.log('Validating año:', { 
      original: formData.anio, 
      asString: anioStr, 
      length: anioStr.length, 
      asNumber: anioNum 
    });
    
    // Validar que el año tenga exactamente 4 dígitos
    if (anioStr.length !== 4 || !/^\d{4}$/.test(anioStr)) {
      setError('El año debe tener exactamente 4 dígitos');
      return false;
    }
    
    if (isNaN(anioNum) || anioNum < 1900 || anioNum > new Date().getFullYear() + 1) {
      setError(`El año debe ser un número válido entre 1900 y ${new Date().getFullYear() + 1}`);
      return false;
    }

    if (formData.capacidad < 1 || formData.capacidad > 50) {
      setError('La capacidad debe ser entre 1 y 50 personas');
      return false;
    }

    // Validación específica para el precio
    const precioNum = parseFloat(formData.precioPorDia);
    if (isNaN(precioNum) || precioNum <= 0) {
      setError('El precio diario debe ser un número válido mayor a 0');
      return false;
    }
    
    // Validar que el precio no sea excesivamente alto
    if (precioNum > 9999.99) {
      setError('El precio diario no puede exceder $9,999.99');
      return false;
    }

    return true;
  }, [formData]);

  const submitForm = useCallback(async () => {
    if (!validateForm()) return { success: false };

    try {
      setLoading(true);
      setError(null);

      const formDataToSend = new FormData();
      
      // Debug: Log the form data being sent
      console.log('Form data being sent:', formData);
      
      Object.keys(formData).forEach(key => {
        if (key !== 'imagenes' && key !== 'imagenVista3_4' && key !== 'imagenLateral') {
          formDataToSend.append(key, formData[key]);
          console.log(`Appending ${key}:`, formData[key]);
        }
      });

      // Manejar imagen vista 3/4 - ahora solo URLs de Cloudinary
      if (formData.imagenVista3_4) {
        if (typeof formData.imagenVista3_4 === 'string') {
          // URL existente: enviar como string
          formDataToSend.append('imagenVista3_4', formData.imagenVista3_4);
          console.log('Appending imagenVista3_4 as string:', formData.imagenVista3_4);
        } else if (formData.imagenVista3_4.url) {
          // Objeto con URL de Cloudinary: enviar la URL
          formDataToSend.append('imagenVista3_4', formData.imagenVista3_4.url);
          console.log('Appending imagenVista3_4 as object URL:', formData.imagenVista3_4.url);
        }
      } else {
        console.log('imagenVista3_4 is missing:', formData.imagenVista3_4);
      }

      // Manejar imagen lateral - ahora solo URLs de Cloudinary
      if (formData.imagenLateral) {
        if (typeof formData.imagenLateral === 'string') {
          // URL existente: enviar como string
          formDataToSend.append('imagenLateral', formData.imagenLateral);
          console.log('Appending imagenLateral as string:', formData.imagenLateral);
        } else if (formData.imagenLateral.url) {
          // Objeto con URL de Cloudinary: enviar la URL
          formDataToSend.append('imagenLateral', formData.imagenLateral.url);
          console.log('Appending imagenLateral as object URL:', formData.imagenLateral.url);
        }
      } else {
        console.log('imagenLateral is missing:', formData.imagenLateral);
      }

      // Manejar galería de imágenes - ahora solo URLs de Cloudinary
      const existingImages = [];
      formData.imagenes.forEach((img, index) => {
        if (typeof img === 'string') {
          // URL existente
          existingImages.push(img);
        } else if (img.url) {
          // Objeto con URL de Cloudinary
          existingImages.push(img.url);
        }
      });
      
      // Enviar todas las URLs como JSON string
      if (existingImages.length > 0) {
        formDataToSend.append('imagenes', JSON.stringify(existingImages));
      }

      const endpoint = initialData 
        ? `/api/vehicles/${initialData._id}` 
        : '/api/vehicles';
      const method = initialData ? 'PUT' : 'POST';

      console.log('📤 Sending request:', { endpoint, method });
      console.log('📦 FormData contents:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`  ${key}:`, value);
      }

      const response = await fetch(endpoint, {
        method: method,
        credentials: 'include',
        body: formDataToSend
      });

      if (!response.ok) {
        // Intentar obtener el mensaje de error del servidor
        let errorData;
        try {
          errorData = await response.json();
          console.log('Server error response:', errorData);
        } catch (e) {
          throw new Error('Error al guardar el vehículo');
        }
        
        // Manejar errores específicos del servidor
        if (errorData.error && errorData.error.code === 11000) {
          // Error de duplicación de MongoDB
          if (errorData.error.keyPattern && errorData.error.keyPattern.placa) {
            throw new Error(`Ya existe un vehículo con la placa "${errorData.error.keyValue.placa}". Por favor, use una placa diferente.`);
          }
        }
        
        // Error genérico del servidor
        const serverMessage = errorData.message || errorData.error || 'Error al guardar el vehículo';
        throw new Error(serverMessage);
      }

      const result = await response.json();
      onSuccess(result.vehiculo);
      return { success: true, data: result.vehiculo };
    } catch (err) {
      console.error('Error saving vehicle:', err);
      const errorMessage = err.message || 'Error al guardar el vehículo';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [formData, initialData, onSuccess, validateForm]);

  const resetForm = useCallback(() => {
    setFormData({
      nombreVehiculo: '',
      idMarca: '', // Changed from 'marca' to 'idMarca'
      modelo: '',
      clase: '',
      anio: '',
      placa: '',
      color: '',
      capacidad: '',
      numeroMotor: '',
      numeroChasisGrabado: '',
      numeroVinChasis: '',
      precioPorDia: '',
      estado: 'Disponible',
      imagenes: [],
      imagenVista3_4: null,
      imagenLateral: null
    });
    setError(null);
  }, []);

  const setErrorCallback = useCallback((error) => {
    setError(error);
  }, []);

  return {
    formData,
    loading,
    error,
    uploadingImages,
    handleInputChange,
    handleImageUpload,
    removeImage,
    handleImageVista3_4,
    handleImageLateral,
    removeImageVista3_4,
    removeImageLateral,
    submitForm,
    resetForm,
    setError: setErrorCallback
  };
};
