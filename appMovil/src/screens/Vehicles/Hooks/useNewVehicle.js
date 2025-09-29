import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

const API_BASE_URL = 'http://10.0.2.2:4000/api';

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
  const navigation = useNavigation();

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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [response, setResponse] = useState(null);

  const submitVehicle = async (data, mainViewImage, sideImage, galleryImages = []) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    setResponse(null);
    
    try {
      console.log('=== INICIANDO ENVÍO DE VEHÍCULO ===');
      console.log('URL:', `${API_BASE_URL}/vehicles`);
      
      const formData = new FormData();
      
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });
      
      if (mainViewImage) {
        const mainImageFile = {
          uri: mainViewImage.uri,
          type: 'image/jpeg',
          name: 'main.jpg',
        };
        formData.append('mainViewImage', mainImageFile);
      }
      
      if (sideImage) {
        const sideImageFile = {
          uri: sideImage.uri,
          type: 'image/jpeg',
          name: 'side.jpg',
        };
        formData.append('sideImage', sideImageFile);
      }
      
      if (galleryImages && galleryImages.length > 0) {
        galleryImages.forEach((img, idx) => {
          const galleryImageFile = {
            uri: img.uri,
            type: 'image/jpeg',
            name: `gallery${idx}.jpg`,
          };
          formData.append('galleryImages', galleryImageFile);
        });
      }
      
      const res = await fetch(`${API_BASE_URL}/vehicles`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      });
      
      console.log('Respuesta recibida:', res.status);
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ message: 'Error al crear vehículo' }));
        throw new Error(errData?.message || `Error ${res.status}`);
      }
      
      const resData = await res.json();
      console.log('Vehículo creado exitosamente');
      
      setSuccess(true);
      setResponse(resData);
      
      setTimeout(() => {
        setSuccess(false);
      }, 2000);
      
      return resData;
    } catch (err) {
      console.error('Error completo:', err);
      const errorMessage = err?.message || 'Error de conexión con el servidor';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/brands`);
        
        if (!response.ok) {
          throw new Error('Error al cargar marcas');
        }
        
        const data = await response.json();
        setBrands(data.map(b => ({ label: b.brandName, value: b._id })));
      } catch (err) {
        console.error('Error al cargar marcas:', err);
        setBrands([]);
        Alert.alert('Advertencia', 'No se pudieron cargar las marcas');
      }
    };
    fetchBrands();
  }, []);

  const pickImage = async (setter, allowsMultiple = false) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería');
        return;
      }
      
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

  const handleSubmit = async () => {
    if (!mainViewImage || !sideImage) {
      Alert.alert('Error', 'Debes seleccionar la imagen principal y lateral.');
      return;
    }
    
    if (!vehicleName || !dailyPrice || !plate || !brandId || !vehicleClass || 
        !color || !year || !capacity || !model || !engineNumber || 
        !chassisNumber || !vinNumber) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios.');
      return;
    }
    
    const priceNum = parseFloat(dailyPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Error', 'El precio debe ser un número mayor a 0');
      return;
    }
    
    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 1) {
      Alert.alert('Error', 'Ingresa un año válido');
      return;
    }
    
    const capacityNum = parseInt(capacity);
    if (isNaN(capacityNum) || capacityNum <= 0) {
      Alert.alert('Error', 'La capacidad debe ser un número mayor a 0');
      return;
    }
    
    const data = {
      vehicleName,
      dailyPrice: priceNum,
      plate: plate.toUpperCase(),
      brandId,
      vehicleClass,
      color,
      year: yearNum,
      capacity: capacityNum,
      model,
      engineNumber,
      chassisNumber,
      vinNumber,
      status,
    };
    
    const result = await submitVehicle(data, mainViewImage, sideImage, galleryImages);
    
    if (result) {
      setTimeout(() => {
        setMainViewImage(null);
        setSideImage(null);
        setGalleryImages([]);
        setVehicleName('');
        setDailyPrice('');
        setPlate('');
        setBrandId('');
        setVehicleClass('');
        setColor('');
        setYear('');
        setCapacity('');
        setModel('');
        setEngineNumber('');
        setChassisNumber('');
        setVinNumber('');
        setStatus(statusOptions[0].value);
        
        navigation.navigate('MainTabs', { screen: 'Vehicles' });
      }, 2500);
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
    handleSubmit,
  };
};

export default useNewVehicle;