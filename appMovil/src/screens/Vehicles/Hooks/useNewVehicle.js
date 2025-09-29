import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // 👈

const BASE_URL = 'https://diunsolorentacar.onrender.com';
const BRANDS_API_URL = `${BASE_URL}/api/brands`;
const STORAGE_KEY = '@NewVehicleForm';

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

  // Cargar datos guardados
  useEffect(() => {
    const loadFormState = async () => {
      try {
        const storedData = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedData !== null) {
          const data = JSON.parse(storedData);
          setVehicleName(data.vehicleName || '');
          setDailyPrice(data.dailyPrice || '');
          setPlate(data.plate || '');
          setBrandId(data.brandId || brands[0]?.value || '');
          setVehicleClass(data.vehicleClass || vehicleTypes[0]?.value || '');
          setColor(data.color || '');
          setYear(data.year || '');
          setCapacity(data.capacity || '');
          setModel(data.model || '');
          setEngineNumber(data.engineNumber || '');
          setChassisNumber(data.chassisNumber || '');
          setVinNumber(data.vinNumber || '');
          setStatus(data.status || statusOptions[0]?.value || '');
          setMainViewImage(data.mainViewImage || null);
          setSideImage(data.sideImage || null);
          setGalleryImages(data.galleryImages || []);
        }
      } catch (e) {
        console.log('Fallo al cargar el estado del formulario:', e);
      }
    };
    if (brands.length > 0) {
      loadFormState();
    }
  }, [brands.length]);

  // Guardar datos cada vez que cambian
  useEffect(() => {
    const saveFormState = async () => {
      const dataToSave = {
        vehicleName, dailyPrice, plate, brandId, vehicleClass, color, year, capacity, model, engineNumber, chassisNumber, vinNumber, status,
        mainViewImage: (typeof mainViewImage === 'object' && mainViewImage?.uri) ? mainViewImage.uri : mainViewImage,
        sideImage: (typeof sideImage === 'object' && sideImage?.uri) ? sideImage.uri : sideImage,
        galleryImages: galleryImages.map(img => (typeof img === 'object' && img?.uri) ? img.uri : img),
      };
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      } catch (e) {
        console.log('Fallo al guardar el estado del formulario:', e);
      }
    };
    const timeoutId = setTimeout(saveFormState, 500);
    return () => clearTimeout(timeoutId);
  }, [
    vehicleName, dailyPrice, plate, brandId, vehicleClass, color, year, capacity, model, engineNumber, chassisNumber, vinNumber, status,
    mainViewImage, sideImage, galleryImages.length
  ]);

  // Limpiar formulario tras éxito
  const clearForm = async () => {
    setVehicleName('');
    setDailyPrice('');
    setPlate('');
    setBrandId('');
    setVehicleClass(vehicleTypes[0]?.value || '');
    setColor('');
    setYear('');
    setCapacity('');
    setModel('');
    setEngineNumber('');
    setChassisNumber('');
    setVinNumber('');
    setStatus(statusOptions[0]?.value || '');
    setMainViewImage(null);
    setSideImage(null);
    setGalleryImages([]);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.log('Fallo al limpiar AsyncStorage:', e);
    }
  };

  // Fetch brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch(BRANDS_API_URL);
        const data = await response.json();
        setBrands(data.map(b => ({ label: b.brandName, value: b._id })));
      } catch (err) {
        setBrands([]);
      }
    };
    fetchBrands();
  }, []);

  // Image picker
  const pickImage = async (setter, allowsMultiple = false) => {
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
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const setImageUrl = (setter, url) => {
    if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
      setter(url);
      return true;
    } else {
      Alert.alert('Error', 'Por favor ingresa una URL válida (debe comenzar con http:// o https://)');
      return false;
    }
  };

  // Submit vehicle (mejor manejo de error)
  const handleSubmit = async () => {
    // ...validaciones...
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
    try {
      setLoading(true);
      setError(null);
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
      // Añadir imágenes
      const appendImage = (key, image) => {
        if (typeof image === 'string') {
          formData.append(key, image);
        } else if (image && image.uri) {
          const fileType = image.type || (image.uri.split('.').pop() === 'png' ? 'image/png' : 'image/jpeg');
          const fileName = image.fileName || `${key}.${fileType.split('/')[1]}`;
          formData.append(key, {
            uri: image.uri,
            type: fileType,
            name: fileName,
          });
        }
      };
      appendImage('mainViewImage', mainViewImage);
      appendImage('sideImage', sideImage);
      if (galleryImages.length > 0) {
        galleryImages.forEach((image, index) => {
          if (typeof image === 'string') {
            formData.append('galleryImages', image);
          } else if (image && image.uri) {
            const fileType = image.type || (image.uri.split('.').pop() === 'png' ? 'image/png' : 'image/jpeg');
            const fileName = image.fileName || `gallery${index}.${fileType.split('/')[1]}`;
            formData.append('galleryImages', {
              uri: image.uri,
              type: fileType,
              name: fileName,
            });
          }
        });
      }
      const apiUrl = 'https://diunsolorentacar.onrender.com/api'; // Siempre usar Render
      const response = await axios.post(`${apiUrl}/vehicles`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess(true);
      setResponse(response.data);
      clearForm();
    } catch (error) {
      console.error('Error al crear vehículo:', error);
      let errorMessage = 'Error al crear el vehículo';
      if (axios.isAxiosError(error)) {
        if (error.response) {
          errorMessage = error.response.data?.message || `Error del servidor: ${error.response.status}`;
        } else if (error.request) {
          errorMessage = 'Error de red: La API no está disponible o la conexión falló. Verifica el estado de la API.';
        } else {
          errorMessage = error.message || 'Error desconocido al enviar la petición.';
        }
      }
      setError(errorMessage);
      Alert.alert('ERROR', errorMessage);
    } finally {
      setLoading(false);
    }
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
    response,
    pickImage,
    setImageUrl,
    handleSubmit,
    clearForm,
  };
};

export default useNewVehicle;