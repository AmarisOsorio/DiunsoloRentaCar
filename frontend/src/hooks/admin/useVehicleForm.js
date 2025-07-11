import { useState, useCallback } from 'react';

export const useVehicleForm = (initialData = null, onSuccess = () => {}) => {
  const [formData, setFormData] = useState({
    nombreVehiculo: initialData?.nombreVehiculo || '',
    marca: initialData?.marca || '',
    modelo: initialData?.modelo || '',
    clase: initialData?.clase || '',
    anio: initialData?.anio || '',
    placa: initialData?.placa || '',
    color: initialData?.color || '',
    capacidad: initialData?.capacidad || '',
    numeroMotor: initialData?.numeroMotor || '',
    numeroChasisGrabado: initialData?.numeroChasisGrabado || '',
    numeroVinChasis: initialData?.numeroVinChasis || '',
    precioPorDia: initialData?.precioPorDia || '',
    estado: initialData?.estado || 'Disponible',
    imagenes: initialData?.imagenes || [],
    imagenVista3_4: initialData?.imagenVista3_4 || null,
    imagenLateral: initialData?.imagenLateral || null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (error) setError(null);
  }, [error]);

  const handleImageUpload = useCallback((files) => {
    const newImages = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file),
      isNew: true
    }));
    setFormData(prev => ({
      ...prev,
      imagenes: [...prev.imagenes, ...newImages]
    }));
  }, []);

  const removeImage = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== index)
    }));
  }, []);

  const validateForm = useCallback(() => {
    const requiredFields = [
      'nombreVehiculo', 'marca', 'modelo', 'clase', 'anio', 'placa', 
      'color', 'capacidad', 'precioPorDia'
    ];
    
    for (const field of requiredFields) {
      if (!formData[field]) {
        setError(`El campo ${field} es requerido`);
        return false;
      }
    }

    // Validación de formato de placa
    const placaRegex = /^[A-Za-z0-9]{6,8}$/;
    if (!placaRegex.test(formData.placa)) {
      setError('La placa debe tener entre 6 y 8 caracteres alfanuméricos');
      return false;
    }

    if (formData.anio < 1900 || formData.anio > new Date().getFullYear() + 1) {
      setError('El año debe ser válido');
      return false;
    }

    if (formData.capacidad < 1 || formData.capacidad > 50) {
      setError('La capacidad debe ser entre 1 y 50 personas');
      return false;
    }

    if (formData.precioPorDia <= 0) {
      setError('El precio diario debe ser mayor a 0');
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
      
      Object.keys(formData).forEach(key => {
        if (key !== 'imagenes' && key !== 'imagenVista3_4' && key !== 'imagenLateral') {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Manejar imagen vista 3/4
      if (formData.imagenVista3_4 && formData.imagenVista3_4.isNew && formData.imagenVista3_4.file) {
        formDataToSend.append('imagenVista3_4', formData.imagenVista3_4.file);
      }

      // Manejar imagen lateral
      if (formData.imagenLateral && formData.imagenLateral.isNew && formData.imagenLateral.file) {
        formDataToSend.append('imagenLateral', formData.imagenLateral.file);
      }

      // Manejar galería de imágenes
      formData.imagenes.forEach((img, index) => {
        if (img.isNew && img.file) {
          formDataToSend.append('imagenes', img.file);
        }
      });

      const endpoint = initialData 
        ? `/api/vehicles/${initialData._id}` 
        : '/api/vehicles';
      const method = initialData ? 'PUT' : 'POST';

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
      marca: '',
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
    handleInputChange,
    handleImageUpload,
    removeImage,
    submitForm,
    resetForm,
    setError: setErrorCallback
  };
};
