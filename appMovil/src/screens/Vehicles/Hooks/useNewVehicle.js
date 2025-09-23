import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

<<<<<<< HEAD
const BASE_URL = 'https://diunsolorentacar.onrender.com';
const BRANDS_API_URL = `${BASE_URL}/api/brands`;

=======
const BRANDS_API_URL = 'https://diunsolorentacar.onrender.com/api/brands';
>>>>>>> 2c830f7d0232ead70791aff6968a0e95ce850767
const vehicleTypes = [
  { label: 'Pick up', value: 'Pick up' },
  { label: 'SUV', value: 'SUV' },
  { label: 'Sedán', value: 'Sedán' },
  { label: 'Camión', value: 'Camión' },
  { label: 'Van', value: 'Van' },
];
const statusOptions = [
  { label: 'Disponible', value: 'Disponible' },
  { label: 'Reservado', value: 'Reservado' },
  { label: 'Mantenimiento', value: 'Mantenimiento' },
];

// Form state
const useNewVehicle = () => {
  
  const [mainViewImage, setMainViewImage] = useState(null);
  const [sideImage, setSideImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [vehicleName, setVehicleName] = useState('');
  const [dailyPrice, setDailyPrice] = useState('');
  const [plate, setPlate] = useState('');
  const [brands, setBrands] = useState([]);
  const [brandId, setBrandId] = useState('');
  const [vehicleClass, setVehicleClass] = useState(vehicleTypes[0]?.value || '');
  const [color, setColor] = useState('');
  const [year, setYear] = useState('');
  const [capacity, setCapacity] = useState('');
  const [model, setModel] = useState('');
  const [engineNumber, setEngineNumber] = useState('');
  const [chassisNumber, setChassisNumber] = useState('');
  const [vinNumber, setVinNumber] = useState('');
  const [status, setStatus] = useState(statusOptions[0]?.value || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [response, setResponse] = useState(null);

  // Envía el formulario de vehículo al backend
  const submitVehicle = async (data, mainViewImage, sideImage, galleryImages = []) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    setResponse(null);
    try {
      // Determinar si todas las imágenes son URLs
      const mainIsUrl = typeof mainViewImage === 'string' && (mainViewImage.startsWith('http://') || mainViewImage.startsWith('https://'));
      const sideIsUrl = typeof sideImage === 'string' && (sideImage.startsWith('http://') || sideImage.startsWith('https://'));
      const galleryAreUrls = galleryImages.every(img => typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://')));
      
      const allAreUrls = mainIsUrl && sideIsUrl && (galleryImages.length === 0 || galleryAreUrls);
      
      if (allAreUrls) {
        // Si todas son URLs, enviar como JSON
        const jsonData = {
          ...data,
          mainViewImage,
          sideImage,
          galleryImages: galleryImages.length > 0 ? galleryImages : []
        };
        
        const apiUrl = 'https://diunsolorentacar.onrender.com/api';
        
        const res = await axios.post(`${apiUrl}/vehicles`, jsonData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        setSuccess(true);
        setResponse(res.data);
        
        return res.data;
      } else {
        // Si hay archivos, usar FormData (código existente)
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          formData.append(key, value);
        });

        // Helper para normalizar archivos (React Native) y URLs
        const normalizeImage = (img, fallbackName) => {
          // Si es una URL string, devolverla tal como está
          if (typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://'))) {
            return { isUrl: true, url: img };
          }
          
          // Si es un objeto con URI (archivo local o data URI)
          if (!img || typeof img === 'string') return null;
          
          const uri = img.uri || img;
          const name = img.fileName || img.name || fallbackName;
          const type = img.mimeType || img.type || 'image/jpeg';
          
          if (!uri || !name || !type) return null;
          
          // Manejar tanto file:// como data: URIs
          return { uri, type, name, isUrl: false };
        };

        // Helper para crear Blob desde data URI (para web)
        const dataURIToBlob = (dataURI, type) => {
          const byteString = atob(dataURI.split(',')[1]);
          const arrayBuffer = new ArrayBuffer(byteString.length);
          const uint8Array = new Uint8Array(arrayBuffer);
          for (let i = 0; i < byteString.length; i++) {
            uint8Array[i] = byteString.charCodeAt(i);
          }
          return new Blob([arrayBuffer], { type });
        };

        // Procesar mainViewImage y sideImage
        const mainFile = normalizeImage(mainViewImage, 'main.jpg');
        if (mainFile) {
          if (mainFile.isUrl) {
            // Si es una URL, agregarla directamente al FormData como string
            formData.append('mainViewImage', mainFile.url);
          } else {
            // Si es un archivo local o data URI
            if (mainFile.uri.startsWith('data:')) {
              // Para data URI, crear blob (compatible con web)
              const blob = dataURIToBlob(mainFile.uri, mainFile.type);
              formData.append('mainViewImage', blob, mainFile.name);
            } else {
              // Para file URI, usar el formato de React Native
              formData.append('mainViewImage', {
                uri: mainFile.uri,
                type: mainFile.type,
                name: mainFile.name
              });
            }
          }
        }
        
        const sideFile = normalizeImage(sideImage, 'side.jpg');
        if (sideFile) {
          if (sideFile.isUrl) {
            // Si es una URL, agregarla directamente al FormData como string
            formData.append('sideImage', sideFile.url);
          } else {
            // Si es un archivo local o data URI
            if (sideFile.uri.startsWith('data:')) {
              // Para data URI, crear blob (compatible con web)
              const blob = dataURIToBlob(sideFile.uri, sideFile.type);
              formData.append('sideImage', blob, sideFile.name);
            } else {
              // Para file URI, usar el formato de React Native
              formData.append('sideImage', {
                uri: sideFile.uri,
                type: sideFile.type,
                name: sideFile.name
              });
            }
          }
        }
        // galleryImages: manejar tanto archivos como URLs
        if (galleryImages && galleryImages.length > 0) {
          const processedGallery = [];
          galleryImages.forEach((img, idx) => {
            const file = normalizeImage(img, `gallery${idx}.jpg`);
            if (file) {
              if (file.isUrl) {
                // Si es una URL, agregarla a un array que luego se enviará como JSON
                processedGallery.push(file.url);
              } else {
                // Si es un archivo local o data URI
                if (file.uri.startsWith('data:')) {
                  // Para data URI, crear blob (compatible con web)
                  const blob = dataURIToBlob(file.uri, file.type);
                  formData.append('galleryImages', blob, file.name);
                } else {
                  // Para file URI, usar el formato de React Native
                  formData.append('galleryImages', {
                    uri: file.uri,
                    type: file.type,
                    name: file.name
                  });
                }
              }
            }
          });
          
          // Si hay URLs en la galería, enviarlas como JSON
          if (processedGallery.length > 0) {
            formData.append('galleryImagesUrls', JSON.stringify(processedGallery));
          }
        }

        // Debug: log FormData contents
        if (__DEV__) {
          // Only works in development mode
          const entries = [];
          formData._parts?.forEach(([key, value]) => {
            entries.push({ key, value: typeof value === 'object' ? '[File Object]' : value });
          });
        }

        // Llamada al backend usando axios
        const apiUrl = 'https://diunsolorentacar.onrender.com/api';
        const res = await axios.post(`${apiUrl}/vehicles`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setSuccess(true);
        setResponse(res.data);
        
        return res.data;
      }
<<<<<<< HEAD
      // Llamada al backend
      const apiUrl = 'https://diunsolorentacar.onrender.com/api';
      const res = await fetch(`${apiUrl}/vehicles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData?.message || 'Error al crear vehículo');
      }
      const resData = await res.json();
      setSuccess(true);
      setResponse(resData);
      return resData;
=======
>>>>>>> 2c830f7d0232ead70791aff6968a0e95ce850767
    } catch (err) {
      // Mostrar mensaje de error detallado del backend si existe
      let backendMsg = '';
      if (err?.response?.data) {
        if (typeof err.response.data === 'string') {
          backendMsg = err.response.data;
        } else if (err.response.data.message) {
          backendMsg = err.response.data.message;
        } else if (err.response.data.mensaje) {
          backendMsg = err.response.data.mensaje;
        } else {
          backendMsg = JSON.stringify(err.response.data);
        }
      }
      setError(backendMsg || err?.message || 'Error desconocido');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Fetch brands from backend
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch(BRANDS_API_URL);
        const data = await response.json();
        setBrands(data.map(b => ({ label: b.brandName, value: b._id })));
        // No seleccionar marca por defecto
      } catch (err) {
        setBrands([]);
      }
    };
    fetchBrands();
  }, []);

  // Image pickers
  const pickImage = async (setter, allowsMultiple = false) => {
<<<<<<< HEAD
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['image'],
      allowsMultipleSelection: allowsMultiple,
      quality: 0.7,
    });
    if (!result.canceled) {
      if (allowsMultiple && result.assets) {
        setter(prev => [...prev, ...result.assets]);
      } else if (result.assets && result.assets[0]) {
        setter(result.assets[0]);
=======
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: allowsMultiple,
        quality: 0.7,
      });
      if (!result.canceled) {
        if (allowsMultiple && result.assets) {
          setter(prev => [...prev, ...result.assets]);
        } else if (result.assets && result.assets[0]) {
          setter(result.assets[0]);
        }
>>>>>>> 2c830f7d0232ead70791aff6968a0e95ce850767
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  // Función para establecer imagen por URL
  const setImageUrl = (setter, url) => {
    if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
      setter(url);
      return true;
    } else {
      Alert.alert('Error', 'Por favor ingresa una URL válida (debe comenzar con http:// o https://)');
      return false;
    }
  };

  // Form submit
  const handleSubmit = async () => {
    // Validar que existen imágenes principales (archivos o URLs)
    const hasMainImage = mainViewImage && (
      (typeof mainViewImage === 'string' && (mainViewImage.startsWith('http://') || mainViewImage.startsWith('https://'))) ||
      (typeof mainViewImage === 'object' && mainViewImage.uri)
    );
    
    const hasSideImage = sideImage && (
      (typeof sideImage === 'string' && (sideImage.startsWith('http://') || sideImage.startsWith('https://'))) ||
      (typeof sideImage === 'object' && sideImage.uri)
    );
    
    if (!hasMainImage || !hasSideImage) {
      Alert.alert('Error', 'Debes seleccionar la imagen principal y lateral (archivos o URLs válidas).');
      return;
    }
    
    if (!vehicleName || !dailyPrice || !plate || !brandId || !vehicleClass || !color || !year || !capacity || !model || !engineNumber || !chassisNumber || !vinNumber) {
      Alert.alert('Error', 'Por favor completa todos los campos.');
      return;
    }
    const data = {
      vehicleName,
      dailyPrice,
      plate,
      brandId,
      vehicleClass,
      color,
      year,
      capacity,
      model,
      engineNumber,
      chassisNumber,
      vinNumber,
      status,
    };
    await submitVehicle(data, mainViewImage, sideImage, galleryImages);
  };

  // Función de prueba para testear URLs
  const testSubmitWithUrls = async () => {
    console.log('🧪 Iniciando prueba con URLs...');
    const testData = {
      vehicleName: 'Honda Civic Test',
      dailyPrice: '75.50',
      plate: 'TEST123',
      brandId: brands.length > 0 ? brands[0].value : '688a60244920593d0fa11d3c',
      vehicleClass: 'Sedán',
      color: 'Blanco',
      year: '2023',
      capacity: '5',
      model: 'Civic',
      engineNumber: 'ENG123456',
      chassisNumber: 'CHA789012',
      vinNumber: 'VIN345678',
      status: 'Disponible',
    };
    
    const mainImage = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=600';
    const sideImg = 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600';
    
    await submitVehicle(testData, mainImage, sideImg, []);
  };

  return {
    brands,
    vehicleTypes,
    statusOptions,
    mainViewImage,
    setMainViewImage,
    sideImage,
    setSideImage,
    galleryImages,
    setGalleryImages,
    vehicleName,
    setVehicleName,
    dailyPrice,
    setDailyPrice,
    plate,
    setPlate,
    brandId,
    setBrandId,
    vehicleClass,
    setVehicleClass,
    color,
    setColor,
    year,
    setYear,
    capacity,
    setCapacity,
    model,
    setModel,
    engineNumber,
    setEngineNumber,
    chassisNumber,
    setChassisNumber,
    vinNumber,
    setVinNumber,
    status,
    setStatus,
    loading,
    error,
    success,
    pickImage,
    setImageUrl,
    handleSubmit,
    testSubmitWithUrls,
    loading,
    error,
    success,
    response,
    pickImage,
    setImageUrl,
    handleSubmit,
    testSubmitWithUrls
  };
};

export default useNewVehicle;
