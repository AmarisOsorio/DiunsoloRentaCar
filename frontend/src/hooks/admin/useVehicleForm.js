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
  const [fieldErrors, setFieldErrors] = useState({});
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
      setFieldErrors({});
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
      setFieldErrors({}); // Limpiar errores de campo también
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
    
    // Limpiar error específico del campo cuando el usuario empiece a escribir
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
    
    // Si había un error general, limpiarlo también
    if (error) setError(null);
  }, [error, fieldErrors]);

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
    console.log('🔍 Starting form validation');
    console.log('📝 Current formData:', formData);
    console.log('📝 Is creating new vehicle:', !initialData);
    
    const errors = {};
    let hasErrors = false;
    
    const requiredFields = [
      'nombreVehiculo', 'idMarca', 'modelo', 'clase', 'anio', 'placa', 
      'color', 'capacidad', 'precioPorDia'
    ];
    
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
      precioPorDia: 'Precio por Día',
      imagenVista3_4: 'Imagen Vista 3/4',
      imagenLateral: 'Imagen Lateral',
      imagenes: 'Galería de Imágenes'
    };
    
    // Validar campos requeridos
    for (const field of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === '') {
        errors[field] = `${fieldNames[field]} es requerido`;
        hasErrors = true;
      }
    }

    // Validar placa (solo si tiene valor)
    if (formData.placa && formData.placa.trim() !== '') {
      const placaRegex = /^[A-Za-z0-9]{6,8}$/;
      if (!placaRegex.test(formData.placa)) {
        errors.placa = 'La placa debe tener entre 6 y 8 caracteres alfanuméricos';
        hasErrors = true;
      }
    }

    // Validar año (solo si tiene valor)
    if (formData.anio && formData.anio.toString().trim() !== '') {
      const anioStr = String(formData.anio).trim();
      const anioNum = parseInt(anioStr);
      
      if (anioStr.length !== 4 || !/^\d{4}$/.test(anioStr)) {
        errors.anio = 'El año debe tener exactamente 4 dígitos';
        hasErrors = true;
      } else if (isNaN(anioNum) || anioNum < 1900 || anioNum > new Date().getFullYear() + 1) {
        errors.anio = `El año debe ser entre 1900 y ${new Date().getFullYear() + 1}`;
        hasErrors = true;
      }
    }

    // Validar capacidad (solo si tiene valor)
    if (formData.capacidad && formData.capacidad.toString().trim() !== '') {
      const capacidadNum = parseInt(formData.capacidad);
      if (isNaN(capacidadNum) || capacidadNum < 1 || capacidadNum > 50) {
        errors.capacidad = 'La capacidad debe ser entre 1 y 50 personas';
        hasErrors = true;
      }
    }

    // Validar precio (solo si tiene valor)
    if (formData.precioPorDia && formData.precioPorDia.toString().trim() !== '') {
      const precioNum = parseFloat(formData.precioPorDia);
      if (isNaN(precioNum) || precioNum <= 0) {
        errors.precioPorDia = 'El precio debe ser un número válido mayor a 0';
        hasErrors = true;
      } else if (precioNum > 9999.99) {
        errors.precioPorDia = 'El precio diario no puede exceder $9,999.99';
        hasErrors = true;
      }
    }

    // Validar campos opcionales con formato específico
    if (formData.numeroMotor && formData.numeroMotor.trim() !== '' && formData.numeroMotor.trim().length < 3) {
      errors.numeroMotor = 'El número de motor debe tener al menos 3 caracteres';
      hasErrors = true;
    }

    if (formData.numeroChasisGrabado && formData.numeroChasisGrabado.trim() !== '' && formData.numeroChasisGrabado.trim().length < 3) {
      errors.numeroChasisGrabado = 'El número de chasis debe tener al menos 3 caracteres';
      hasErrors = true;
    }

    if (formData.numeroVinChasis && formData.numeroVinChasis.trim() !== '' && formData.numeroVinChasis.trim().length < 3) {
      errors.numeroVinChasis = 'El número VIN debe tener al menos 3 caracteres';
      hasErrors = true;
    }

    // Validar imágenes requeridas
    if (!formData.imagenVista3_4) {
      errors.imagenVista3_4 = 'La imagen vista 3/4 es requerida';
      hasErrors = true;
    }

    if (!formData.imagenLateral) {
      errors.imagenLateral = 'La imagen lateral es requerida';
      hasErrors = true;
    }

    // Verificar validez de imágenes (solo si existen)
    if (formData.imagenVista3_4 && 
        typeof formData.imagenVista3_4 !== 'string' && 
        !formData.imagenVista3_4.url) {
      errors.imagenVista3_4 = 'La imagen vista 3/4 no es válida';
      hasErrors = true;
    }

    if (formData.imagenLateral && 
        typeof formData.imagenLateral !== 'string' && 
        !formData.imagenLateral.url) {
      errors.imagenLateral = 'La imagen lateral no es válida';
      hasErrors = true;
    }

    // Validar galería de imágenes (opcional, pero si existe debe ser válida)
    if (formData.imagenes && formData.imagenes.length > 10) {
      errors.imagenes = 'Máximo 10 imágenes permitidas en la galería';
      hasErrors = true;
    }

    // Actualizar estados de error
    console.log('🔍 Validation errors found:', errors);
    console.log('🔍 Has errors:', hasErrors);
    
    setFieldErrors(errors);
    
    if (hasErrors) {
      // Ordenar los campos por orden de aparición en el formulario
      const fieldOrder = [
        'nombreVehiculo', 'idMarca', 'modelo', 'clase', 'anio', 'placa', 
        'color', 'capacidad', 'numeroMotor', 'numeroChasisGrabado', 
        'numeroVinChasis', 'precioPorDia', 'estado', 
        'imagenVista3_4', 'imagenLateral', 'imagenes'
      ];
      
      const firstErrorField = fieldOrder.find(field => errors[field]) || Object.keys(errors)[0];
      const firstError = errors[firstErrorField];
      const fieldDisplayName = fieldNames[firstErrorField] || firstErrorField;
      
      console.log('🚨 First error field:', firstErrorField);
      console.log('🚨 First error message:', firstError);
      
      setError(`Error en "${fieldDisplayName}": ${firstError}`);
      return { isValid: false, firstErrorField };
    }

    setError(null);
    return { isValid: true, firstErrorField: null };
  }, [formData]);

  const submitForm = useCallback(async () => {
    const validationResult = validateForm();
    if (!validationResult.isValid) {
      return { 
        success: false, 
        firstErrorField: validationResult.firstErrorField 
      };
    }

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
            const errorMsg = `Ya existe un vehículo con la placa "${errorData.error.keyValue.placa}". Por favor, use una placa diferente.`;
            console.log('🚨 Duplicate placa error detected:', errorMsg);
            
            // Marcar el campo placa con error
            setFieldErrors({ placa: 'Esta placa ya está registrada' });
            setError(errorMsg);
            
            return { 
              success: false, 
              error: errorMsg, 
              firstErrorField: 'placa',
              fieldError: true 
            };
          }
        }
        
        // Verificar si hay otros errores de campo específicos
        if (errorData.field) {
          console.log('🚨 Server field error detected:', errorData.field, errorData.message);
          setFieldErrors({ [errorData.field]: errorData.message });
          setError(errorData.message);
          return { 
            success: false, 
            error: errorData.message, 
            firstErrorField: errorData.field,
            fieldError: true 
          };
        }
        
        // Error genérico del servidor
        const serverMessage = errorData.message || errorData.error || 'Error al guardar el vehículo';
        throw new Error(serverMessage);
      }

      const result = await response.json();
      onSuccess(result.vehiculo);
      return { success: true, data: result.vehiculo };      } catch (err) {
        console.error('Error saving vehicle:', err);
        const errorMessage = err.message || 'Error al guardar el vehículo';
        
        // Verificar si el error contiene información sobre campos específicos
        const errorMessageLower = errorMessage.toLowerCase();
        
        // Detección especial para errores de placa duplicada
        if (errorMessageLower.includes('placa') && (
            errorMessageLower.includes('existe') || 
            errorMessageLower.includes('duplicado') || 
            errorMessageLower.includes('duplicate') ||
            errorMessageLower.includes('ya está')
        )) {
          console.log('🚨 Duplicate placa error detected in message:', errorMessage);
          setFieldErrors({ placa: 'Esta placa ya está registrada en el sistema' });
          setError(errorMessage);
          return { 
            success: false, 
            error: errorMessage, 
            firstErrorField: 'placa',
            fieldError: true 
          };
        }
        
        // Verificar otros campos comunes en mensajes de error
        const fieldChecks = [
          { field: 'nombreVehiculo', keywords: ['nombre'] },
          { field: 'modelo', keywords: ['modelo'] },
          { field: 'marca', keywords: ['marca'] },
          { field: 'idMarca', keywords: ['marca'] },
          { field: 'anio', keywords: ['año', 'anio'] },
          { field: 'color', keywords: ['color'] },
          { field: 'capacidad', keywords: ['capacidad'] },
          { field: 'precioPorDia', keywords: ['precio'] },
          { field: 'placa', keywords: ['placa'] }
        ];
        
        for (const check of fieldChecks) {
          if (check.keywords.some(keyword => errorMessage.toLowerCase().includes(keyword))) {
            console.log(`🚨 ${check.field} error detected in message:`, errorMessage);
            setFieldErrors({ [check.field]: `Error en ${check.field}` });
            setError(errorMessage);
            return { 
              success: false, 
              error: errorMessage, 
              firstErrorField: check.field,
              fieldError: true 
            };
          }
        }
        
        // Error genérico
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
    setFieldErrors({});
  }, []);

  const setErrorCallback = useCallback((error) => {
    setError(error);
  }, []);

  const scrollToField = useCallback((fieldName) => {
    console.log('🔄 scrollToField called with:', fieldName);
    
    // Usar setTimeout para asegurar que el DOM se haya actualizado
    setTimeout(() => {
      let element = null;
      let containerElement = null;
      
      // 1. Buscar primero por ID (para campos normales)
      element = document.getElementById(fieldName);
      if (element) {
        containerElement = element.closest('.form-group');
        console.log('✅ Found element by ID:', fieldName);
      }
      
      // 2. Si no se encuentra, buscar campos de imagen por data-field
      if (!element) {
        console.log('🔍 Searching by data-field for:', fieldName);
        const sectionElement = document.querySelector(`[data-field="${fieldName}"]`);
        if (sectionElement) {
          element = sectionElement;
          containerElement = sectionElement;
          console.log('✅ Found element by data-field:', fieldName);
        }
      }
      
      // 3. Búsqueda alternativa para campos de imagen específicos
      if (!element) {
        console.log('🔍 Alternative search for image fields:', fieldName);
        if (fieldName === 'imagenVista3_4') {
          element = document.querySelector('.vista-3-4-section h4') || 
                   document.querySelector('.vista-3-4-section') ||
                   document.querySelector('label[for="imagenVista3_4"]');
          containerElement = document.querySelector('.vista-3-4-section');
        } else if (fieldName === 'imagenLateral') {
          element = document.querySelector('.lateral-section h4') || 
                   document.querySelector('.lateral-section') ||
                   document.querySelector('label[for="imagenLateral"]');
          containerElement = document.querySelector('.lateral-section');
        } else if (fieldName === 'imagenes') {
          element = document.querySelector('.gallery-section h4') || 
                   document.querySelector('.gallery-section') ||
                   document.querySelector('label[for="images"]');
          containerElement = document.querySelector('.gallery-section');
        }
        
        if (element) {
          console.log('✅ Found element by alternative search:', fieldName);
        }
      }
      
      // 4. Búsqueda genérica como último recurso
      if (!element) {
        console.log('🔍 Generic search for:', fieldName);
        element = document.querySelector(`label[for="${fieldName}"]`) ||
                 document.querySelector(`[name="${fieldName}"]`) ||
                 document.querySelector(`.${fieldName}`);
        if (element) {
          containerElement = element.closest('.form-group');
          console.log('✅ Found element by generic search:', fieldName);
        }
      }
      
      if (!element) {
        console.error('❌ No se encontró el elemento para el campo:', fieldName);
        return;
      }
      
      console.log('📍 Element found:', element);
      console.log('📦 Container found:', containerElement);
      
      // Buscar el contenedor scrolleable del modal
      const modalContainer = document.querySelector('.vehicle-form-modal');
      const scrollContainer = document.querySelector('.vehicle-form');
      
      console.log('🏠 Modal container:', modalContainer);
      console.log('📜 Scroll container:', scrollContainer);
      
      if (scrollContainer && element) {
        try {
          // Calcular posiciones
          const elementRect = element.getBoundingClientRect();
          const containerRect = scrollContainer.getBoundingClientRect();
          const currentScrollTop = scrollContainer.scrollTop;
          
          // Calcular la posición del elemento relativa al inicio del scroll container
          const elementOffsetTop = element.offsetTop;
          
          // Calcular scroll target para centrar el elemento
          const containerHeight = containerRect.height;
          const targetScrollTop = elementOffsetTop - (containerHeight * 0.3); // 30% desde arriba
          
          console.log('📏 Scroll calculation:', {
            elementOffsetTop,
            containerHeight,
            currentScrollTop,
            targetScrollTop: Math.max(0, targetScrollTop)
          });
          
          // Hacer scroll suave
          scrollContainer.scrollTo({
            top: Math.max(0, targetScrollTop),
            behavior: 'smooth'
          });
          
          console.log('✅ Scroll ejecutado exitosamente');
          
        } catch (error) {
          console.error('❌ Error en cálculo de scroll:', error);
          // Fallback simple
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
        }
      } else {
        console.warn('⚠️ No se encontró scroll container, usando fallback');
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }
      
      // Añadir efecto visual de resaltado
      const targetElement = containerElement || element;
      if (targetElement) {
        console.log('✨ Añadiendo efecto de resaltado a:', targetElement);
        
        // Remover clase anterior si existe
        targetElement.classList.remove('scroll-highlight');
        
        // Forzar reflow y añadir clase
        setTimeout(() => {
          targetElement.classList.add('scroll-highlight');
          console.log('🎨 Clase scroll-highlight añadida');
          
          // Remover después de la animación
          setTimeout(() => {
            targetElement.classList.remove('scroll-highlight');
            console.log('🎨 Clase scroll-highlight removida');
          }, 2500);
        }, 50);
      }
      
      // Enfocar el campo si es un input/select/textarea
      if (element.tagName && ['INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName.toUpperCase())) {
        setTimeout(() => {
          console.log('🎯 Enfocando elemento:', element);
          try {
            element.focus();
            if ((element.type === 'text' || element.type === 'number') && element.select) {
              element.select();
            }
          } catch (error) {
            console.warn('⚠️ Error al enfocar elemento:', error);
          }
        }, 800); // Esperar a que termine el scroll
      }
      
    }, 300); // Delay inicial para asegurar que el DOM esté actualizado
  }, []);

  return {
    formData,
    loading,
    error,
    fieldErrors,
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
    setError: setErrorCallback,
    scrollToField
  };
};
