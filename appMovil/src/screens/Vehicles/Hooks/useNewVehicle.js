import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

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
  const [vehicleClass, setVehicleClass] = useState('');
  const [color, setColor] = useState('');
  const [year, setYear] = useState('');
  const [capacity, setCapacity] = useState('');
  const [model, setModel] = useState('');
  const [engineNumber, setEngineNumber] = useState('');
  const [chassisNumber, setChassisNumber] = useState('');
  const [vinNumber, setVinNumber] = useState('');
  const [status, setStatus] = useState(statusOptions[0].value);


  // Estado para la lógica de envío
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
      // Construir FormData
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });
      if (mainViewImage) {
        formData.append('mainViewImage', {
          uri: mainViewImage.uri || mainViewImage,
          name: mainViewImage.fileName || 'main.jpg',
          type: mainViewImage.type || 'image/jpeg',
        });
      }
      if (sideImage) {
        formData.append('sideImage', {
          uri: sideImage.uri || sideImage,
          name: sideImage.fileName || 'side.jpg',
          type: sideImage.type || 'image/jpeg',
        });
      }
      if (galleryImages && galleryImages.length > 0) {
        galleryImages.forEach((img, idx) => {
          formData.append('galleryImages', {
            uri: img.uri || img,
            name: img.fileName || `gallery${idx}.jpg`,
            type: img.type || 'image/jpeg',
          });
        });
      }
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
    } catch (err) {
      setError(err?.message || 'Error desconocido');
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
      }
    }
  };

  // Form submit
  const handleSubmit = async () => {
    if (!mainViewImage || !sideImage) {
      Alert.alert('Error', 'Debes seleccionar la imagen principal y lateral.');
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
    handleSubmit,
  };
};

export default useNewVehicle;
