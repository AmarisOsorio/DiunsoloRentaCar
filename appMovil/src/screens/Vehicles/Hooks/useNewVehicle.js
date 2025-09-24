import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const BASE_URL = 'https://diunsolorentacar.onrender.com';
const BRANDS_API_URL = `${BASE_URL}/api/brands`;

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

  // Fetch brands from backend
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

  // Set image URL
  const setImageUrl = (setter, url) => {
    if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
      setter(url);
      return true;
    } else {
      Alert.alert('Error', 'Por favor ingresa una URL válida (debe comenzar con http:// o https://)');
      return false;
    }
  };

  // Submit vehicle
  const handleSubmit = async () => {
    // Validate main images
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
        formData.append(key, value);
      });

      // Add images to FormData
      if (typeof mainViewImage === 'string') {
        formData.append('mainViewImage', mainViewImage);
      } else {
        formData.append('mainViewImage', {
          uri: mainViewImage.uri,
          type: mainViewImage.type || 'image/jpeg',
          name: mainViewImage.fileName || 'main.jpg'
        });
      }

      if (typeof sideImage === 'string') {
        formData.append('sideImage', sideImage);
      } else {
        formData.append('sideImage', {
          uri: sideImage.uri,
          type: sideImage.type || 'image/jpeg',
          name: sideImage.fileName || 'side.jpg'
        });
      }

      if (galleryImages.length > 0) {
        galleryImages.forEach((image, index) => {
          if (typeof image === 'string') {
            formData.append('galleryImages', image);
          } else {
            formData.append('galleryImages', {
              uri: image.uri,
              type: image.type || 'image/jpeg',
              name: image.fileName || `gallery${index}.jpg`
            });
          }
        });
      }

      const apiUrl = 'https://diunsolorentacar.onrender.com/api';
      const response = await axios.post(`${apiUrl}/vehicles`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(true);
      setResponse(response.data);
    } catch (error) {
      console.error('Error al crear vehículo:', error);
      setError(error?.response?.data?.message || 'Error al crear el vehículo');
    } finally {
      setLoading(false);
    }
  };

  // Test function
  const testSubmitWithUrls = async () => {
    const testData = {
      vehicleName: 'Test Vehicle',
      dailyPrice: '100',
      plate: 'TEST123',
      brandId: brands[0]?.value || 'test_brand_id',
      vehicleClass: vehicleTypes[0].value,
      color: 'Red',
      year: '2023',
      capacity: '5',
      model: 'Test Model',
      engineNumber: 'TEST123',
      chassisNumber: 'TEST456',
      vinNumber: 'TEST789',
      status: statusOptions[0].value,
    };

    const mainImage = 'https://example.com/test-main.jpg';
    const sideImg = 'https://example.com/test-side.jpg';

    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      Object.entries(testData).forEach(([key, value]) => {
        formData.append(key, value);
      });
      
      formData.append('mainViewImage', mainImage);
      formData.append('sideImage', sideImg);

      const apiUrl = 'https://diunsolorentacar.onrender.com/api';
      const response = await axios.post(`${apiUrl}/vehicles`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(true);
      setResponse(response.data);
    } catch (error) {
      console.error('Error en test:', error);
      setError(error?.response?.data?.message || 'Error en prueba');
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
    testSubmitWithUrls
  };
};

export default useNewVehicle;