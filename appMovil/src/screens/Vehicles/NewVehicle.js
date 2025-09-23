<<<<<<< HEAD
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  ActivityIndicator, 
  Platform,
  Alert,
  Modal,
  Dimensions,
  KeyboardAvoidingView,
  StatusBar
} from 'react-native';
=======
import React, { useState, useEffect, useRef } from 'react';
import { Dimensions, View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, Platform, StatusBar } from 'react-native';
import Svg, { Path } from 'react-native-svg';
>>>>>>> 2c830f7d0232ead70791aff6968a0e95ce850767
import { Picker } from '@react-native-picker/picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import Svg, { Path } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import SuccessVehicle from './Components/SuccessVehicle';
<<<<<<< HEAD

const { width, height } = Dimensions.get('window');

export default function NewVehicle({ navigation }) {
  // Estados del formulario
  const [formData, setFormData] = useState({
    vehicleName: '',
    dailyPrice: '',
    plate: '',
    brandId: '',
    vehicleClass: '',
    color: '',
    year: '',
    capacity: '',
    model: '',
    engineNumber: '',
    chassisNumber: '',
    vinNumber: '',
    status: 'available'
  });

  // Estados para imágenes
  const [mainImage, setMainImage] = useState(null);
  const [sideImage, setSideImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);

  // Estados de UI
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [currentImageType, setCurrentImageType] = useState(null);
  const [errors, setErrors] = useState({});

  // Opciones de vehículos
  const vehicleTypes = [
    { label: 'Sedán', value: 'sedan' },
    { label: 'SUV', value: 'suv' },
    { label: 'Hatchback', value: 'hatchback' },
    { label: 'Pickup', value: 'pickup' },
    { label: 'Convertible', value: 'convertible' },
    { label: 'Coupé', value: 'coupe' }
  ];

  const statusOptions = [
    { label: 'Disponible', value: 'available' },
    { label: 'En mantenimiento', value: 'maintenance' },
    { label: 'No disponible', value: 'unavailable' }
  ];

  // Efectos
  useEffect(() => {
    loadBrands();
    requestPermissions();
  }, []);

  // Solicitar permisos de cámara y galería
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permisos requeridos', 'Se necesitan permisos para acceder a la galería de fotos.');
    }
  };

  // Cargar marcas desde la API
  const loadBrands = async () => {
    try {
      const response = await fetch('http://192.168.1.100:5000/api/brands');
      const data = await response.json();
      setBrands(data.brands || []);
    } catch (error) {
      console.error('Error loading brands:', error);
    }
  };

  // Actualizar campo del formulario
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error si existe
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.vehicleName.trim()) newErrors.vehicleName = 'Nombre requerido';
    if (!formData.dailyPrice.trim()) newErrors.dailyPrice = 'Precio requerido';
    if (!formData.plate.trim()) newErrors.plate = 'Placa requerida';
    if (!formData.brandId) newErrors.brandId = 'Marca requerida';
    if (!formData.vehicleClass) newErrors.vehicleClass = 'Tipo requerido';
    if (!formData.color.trim()) newErrors.color = 'Color requerido';
    if (!formData.year.trim()) newErrors.year = 'Año requerido';
    if (!formData.capacity.trim()) newErrors.capacity = 'Capacidad requerida';
    if (!formData.model.trim()) newErrors.model = 'Modelo requerido';
    if (!mainImage) newErrors.mainImage = 'Imagen principal requerida';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Seleccionar imagen
  const selectImage = async (type) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'gallery' ? undefined : [4, 3],
        quality: 0.8,
        allowsMultipleSelection: type === 'gallery',
      });

      if (!result.canceled) {
        if (type === 'main') {
          setMainImage(result.assets[0]);
        } else if (type === 'side') {
          setSideImage(result.assets[0]);
        } else if (type === 'gallery') {
          setGalleryImages(prev => [...prev, ...result.assets]);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
    setShowImagePicker(false);
  };

  // Abrir selector de imagen
  const openImagePicker = (type) => {
    setCurrentImageType(type);
    setShowImagePicker(true);
  };

  // Eliminar imagen de galería
  const removeGalleryImage = (index) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  // Enviar formulario
  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    
    try {
      const formDataToSend = new FormData();
      
      // Agregar datos del formulario
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      // Agregar imágenes
      if (mainImage) {
        formDataToSend.append('mainImage', {
          uri: mainImage.uri,
          type: 'image/jpeg',
          name: 'main.jpg',
        });
      }

      if (sideImage) {
        formDataToSend.append('sideImage', {
          uri: sideImage.uri,
          type: 'image/jpeg',
          name: 'side.jpg',
        });
      }

      galleryImages.forEach((image, index) => {
        formDataToSend.append('galleryImages', {
          uri: image.uri,
          type: 'image/jpeg',
          name: `gallery_${index}.jpg`,
        });
      });

      const response = await fetch('http://192.168.1.100:5000/api/vehicles', {
        method: 'POST',
        body: formDataToSend,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Error al crear el vehículo');
      }
    } catch (error) {
      Alert.alert('Error', 'Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
=======
import useNewVehicle from './Hooks/useNewVehicle';


function NewVehicle({ navigation, route }) {
  // Ya no necesitamos el callback de parámetros, el useFocusEffect en Vehicles se encarga del refresh
  
  const form = useNewVehicle();
  const {
    brands, vehicleTypes, statusOptions,
    mainViewImage, setMainViewImage,
    sideImage, setSideImage,
    galleryImages, setGalleryImages,
    vehicleName, setVehicleName,
    dailyPrice, setDailyPrice,
    plate, setPlate,
    brandId, setBrandId,
    vehicleClass, setVehicleClass,
    color, setColor,
    year, setYear,
    capacity, setCapacity,
    model, setModel,
    engineNumber, setEngineNumber,
    chassisNumber, setChassisNumber,
    vinNumber, setVinNumber,
    status, setStatus,
    loading, error, success,
    pickImage, handleSubmit: originalHandleSubmit
  } = form;

  // Estado para mostrar el overlay de éxito
  const [showSuccess, setShowSuccess] = useState(false);

  // Cuando success cambia a true, mostrar overlay y navegar tras delay
  useEffect(() => {
    if (success) {
      setShowSuccess(true);
      const timeout = setTimeout(() => {
        setShowSuccess(false);
        // Ya no necesitamos callback, el useFocusEffect en Vehicles se encarga del refresh
        if (navigation && navigation.goBack) {
          navigation.goBack();
        }
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [success, navigation]);

  // Validaciones
  const [fieldErrors, setFieldErrors] = useState({});
  const scrollRef = useRef(null);
  // Refs para cada campo, incluyendo imágenes
  const mainViewImageBoxRef = useRef(null);
  const sideImageBoxRef = useRef(null);
  const refs = {
    mainViewImage: mainViewImageBoxRef,
    sideImage: sideImageBoxRef,
    vehicleName: useRef(null),
    dailyPrice: useRef(null),
    plate: useRef(null),
    brandId: useRef(null),
    vehicleClass: useRef(null),
    model: useRef(null),
    capacity: useRef(null),
    year: useRef(null),
    color: useRef(null),
    engineNumber: useRef(null),
    chassisNumber: useRef(null),
    vinNumber: useRef(null),
  };

  // Validar campos
  const validateFields = () => {
    const errors = {};
    if (!mainViewImage) errors.mainViewImage = 'Debes seleccionar la imagen principal';
    if (!sideImage) errors.sideImage = 'Debes seleccionar la imagen lateral';
    if (!vehicleName || vehicleName.trim().length < 2) errors.vehicleName = 'El nombre es requerido (mínimo 2 letras)';
    if (!dailyPrice || isNaN(Number(dailyPrice)) || Number(dailyPrice) <= 0) errors.dailyPrice = 'Precio válido requerido';
    if (!plate || plate.length < 6) {
      errors.plate = 'Placa requerida (mínimo 6 caracteres)';
    }
    if (!brandId) errors.brandId = 'Selecciona una marca';
    if (!vehicleClass) errors.vehicleClass = 'Selecciona un tipo';
    if (!model || model.length < 2) errors.model = 'Modelo requerido';
    if (!capacity || isNaN(Number(capacity)) || Number(capacity) < 1) errors.capacity = 'Capacidad válida requerida';
    if (!year || year.length !== 4) errors.year = 'Año requerido (4 dígitos)';
    if (!color) errors.color = 'Color requerido';
    if (!engineNumber) errors.engineNumber = 'Motor requerido';
    if (!chassisNumber) errors.chassisNumber = 'Chasis requerido';
    if (!vinNumber) errors.vinNumber = 'VIN requerido';
    return errors;
  };
  // Scroll al primer errorBox 
  const scrollToFirstError = (errors) => {
    const order = [
      'mainViewImage', 'sideImage',
      'vehicleName', 'dailyPrice', 'plate', 'brandId', 'vehicleClass',
      'model', 'capacity', 'year', 'color', 'engineNumber', 'chassisNumber', 'vinNumber',
    ];
    setTimeout(() => {
      for (let key of order) {
        if (errors[key] && refs[key] && refs[key].current && scrollRef.current) {
          refs[key].current.measure && refs[key].current.measure((x, y, width, height, pageX, pageY) => {
            if (typeof y === 'number') {
              if (scrollRef.current.scrollTo) {
                scrollRef.current.scrollTo({ y: Math.max(y - 30, 0), animated: true });
              } else if (scrollRef.current.scrollToOffset) {
                scrollRef.current.scrollToOffset({ offset: Math.max(y - 30, 0), animated: true });
              }
            }
          });
          break;
        }
      }
    }, 10);
  };

  // Nuevo handleSubmit
  const handleSubmit = () => {
    const errors = validateFields();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setTimeout(() => scrollToFirstError(errors), 200);
      return;
    }
    setFieldErrors({});
    originalHandleSubmit();
  };

  // Tamaño de las imágenes
  const rectSize = {
    rectWidth: Math.min(Dimensions.get('window').width * 0.38, 160),
    rectHeight: Math.min(Dimensions.get('window').width * 0.28, 120),
  };

  // Carrusel galería
  const [galleryIndex, setGalleryIndex] = useState(0);
  const galleryScrollRef = useRef(null);

  useEffect(() => {
    if (galleryImages.length > 0) {
      setGalleryIndex(galleryImages.length - 1);
      if (galleryScrollRef.current) {
        setTimeout(() => {
          galleryScrollRef.current.scrollTo({ x: (galleryImages.length - 1) * (rectSize.rectWidth * 2), animated: true });
        }, 100);
      }
    }
  }, [galleryImages.length]);

  const goToGalleryImage = (idx) => {
    setGalleryIndex(idx);
    if (galleryScrollRef.current) {
      galleryScrollRef.current.scrollTo({ x: idx * (rectSize.rectWidth * 2), animated: true });
>>>>>>> 2c830f7d0232ead70791aff6968a0e95ce850767
    }
  };

  const handleGoBack = () => {
<<<<<<< HEAD
    navigation.goBack();
  };

  const handleSuccessClose = () => {
    setSuccess(false);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar 
        backgroundColor="#3D83D2" 
        barStyle="light-content" 
        translucent={false}
        animated={true}
      />
      
      {/* Header */}
=======
    if (navigation && navigation.goBack) navigation.goBack();
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F2F2F2' }}>
      {/* StatusBar */}
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#3D83D2" 
        translucent={false} 
      />
      {/* Encabezado */}
>>>>>>> 2c830f7d0232ead70791aff6968a0e95ce850767
      <View style={styles.headerContainer}>
        <View style={styles.headerBg}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
              <Ionicons name="chevron-back" size={28} color="#fff" />
            </TouchableOpacity>
<<<<<<< HEAD
            <Text style={styles.headerTitle}>Añadir Vehículo</Text>
          </View>
          <View style={[styles.headerCurveContainer, { width: '100%' }]} pointerEvents="none">
            <Svg height="50" width="100%" viewBox="0 0 400 50" preserveAspectRatio="none">
              <Path d="M0,0 H400 V50 H0 Z" fill="#3D83D2" />
              <Path d="M0,40 Q200,0 400,40 L400,50 L0,50 Z" fill="#F2F2F2" />
=======
            <Text style={styles.headerTitle}>Añadir vehículo</Text>
          </View>
          <View style={[styles.headerCurveContainer, { width: '100%' }]} pointerEvents="none">
            <Svg height="80" width="100%" viewBox="0 0 400 80" preserveAspectRatio="none">
              <Path d="M0,0 H400 V80 H0 Z" fill="#3D83D2" />
              <Path d="M0,60 Q200,10 400,60 L400,80 L0,80 Z" fill="#F2F2F2" />
>>>>>>> 2c830f7d0232ead70791aff6968a0e95ce850767
            </Svg>
          </View>
        </View>
      </View>
<<<<<<< HEAD

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Sección de Imágenes */}
        <View style={styles.imageSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="image" size={24} color="#3D83D2" />
            <Text style={styles.sectionTitle}>Imágenes del Vehículo</Text>
          </View>
          
          <View style={styles.imageContainer}>
            {/* Imagen Principal */}
            <TouchableOpacity 
              style={[styles.imageUploadBox, errors.mainImage && styles.imageUploadBoxError]} 
              onPress={() => openImagePicker('main')}
            >
              {mainImage ? (
                <Image source={{ uri: mainImage.uri }} style={styles.uploadedImage} />
              ) : (
                <View style={styles.imageUploadContent}>
                  <Ionicons name="camera" size={40} color="#3D83D2" />
                  <Text style={styles.imageUploadText}>Imagen Principal</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Imagen Lateral */}
            <TouchableOpacity 
              style={styles.imageUploadBox} 
              onPress={() => openImagePicker('side')}
            >
              {sideImage ? (
                <Image source={{ uri: sideImage.uri }} style={styles.uploadedImage} />
              ) : (
                <View style={styles.imageUploadContent}>
                  <Ionicons name="car-sport" size={40} color="#3D83D2" />
                  <Text style={styles.imageUploadText}>Imagen Lateral</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Galería de Imágenes */}
          <TouchableOpacity 
            style={styles.galleryUploadButton} 
            onPress={() => openImagePicker('gallery')}
          >
            <Ionicons name="images" size={20} color="#fff" />
            <Text style={styles.galleryUploadText}>Agregar a Galería</Text>
          </TouchableOpacity>

          {galleryImages.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryPreview}>
              {galleryImages.map((image, index) => (
                <View key={index} style={styles.galleryImageContainer}>
                  <Image source={{ uri: image.uri }} style={styles.galleryImage} />
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={() => removeGalleryImage(index)}
                  >
                    <Ionicons name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Sección de Información Básica */}
        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={24} color="#3D83D2" />
            <Text style={styles.sectionTitle}>Información Básica</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Nombre del Vehículo *</Text>
            <TextInput
              style={[styles.input, errors.vehicleName && styles.inputError]}
              placeholder="Ej: Toyota Corolla Premium"
              value={formData.vehicleName}
              onChangeText={(value) => updateField('vehicleName', value)}
            />
            {errors.vehicleName && <Text style={styles.errorText}>{errors.vehicleName}</Text>}
          </View>

          <View style={styles.rowContainer}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>Precio por Día *</Text>
              <TextInput
                style={[styles.input, errors.dailyPrice && styles.inputError]}
                placeholder="$0.00"
                value={formData.dailyPrice}
                onChangeText={(value) => updateField('dailyPrice', value)}
                keyboardType="numeric"
              />
              {errors.dailyPrice && <Text style={styles.errorText}>{errors.dailyPrice}</Text>}
            </View>

            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>Placa *</Text>
              <TextInput
                style={[styles.input, errors.plate && styles.inputError]}
                placeholder="ABC-1234"
                value={formData.plate}
                onChangeText={(value) => updateField('plate', value.toUpperCase())}
              />
              {errors.plate && <Text style={styles.errorText}>{errors.plate}</Text>}
            </View>
          </View>

          <View style={styles.rowContainer}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>Marca *</Text>
              <View style={[styles.pickerContainer, errors.brandId && styles.inputError]}>
                <Picker
                  selectedValue={formData.brandId}
                  onValueChange={(value) => updateField('brandId', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Seleccionar marca..." value="" />
                  {brands.map((brand) => (
                    <Picker.Item key={brand._id} label={brand.name} value={brand._id} />
                  ))}
                </Picker>
              </View>
              {errors.brandId && <Text style={styles.errorText}>{errors.brandId}</Text>}
            </View>

            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>Tipo *</Text>
              <View style={[styles.pickerContainer, errors.vehicleClass && styles.inputError]}>
                <Picker
                  selectedValue={formData.vehicleClass}
                  onValueChange={(value) => updateField('vehicleClass', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Seleccionar tipo..." value="" />
                  {vehicleTypes.map((type) => (
                    <Picker.Item key={type.value} label={type.label} value={type.value} />
                  ))}
                </Picker>
              </View>
              {errors.vehicleClass && <Text style={styles.errorText}>{errors.vehicleClass}</Text>}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Modelo *</Text>
            <TextInput
              style={[styles.input, errors.model && styles.inputError]}
              placeholder="Ej: Corolla"
              value={formData.model}
              onChangeText={(value) => updateField('model', value)}
            />
            {errors.model && <Text style={styles.errorText}>{errors.model}</Text>}
          </View>

          <View style={styles.rowContainer}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>Año *</Text>
              <TextInput
                style={[styles.input, errors.year && styles.inputError]}
                placeholder="2024"
                value={formData.year}
                onChangeText={(value) => updateField('year', value)}
                keyboardType="numeric"
                maxLength={4}
              />
              {errors.year && <Text style={styles.errorText}>{errors.year}</Text>}
            </View>

            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>Color *</Text>
              <TextInput
                style={[styles.input, errors.color && styles.inputError]}
                placeholder="Ej: Blanco"
                value={formData.color}
                onChangeText={(value) => updateField('color', value)}
              />
              {errors.color && <Text style={styles.errorText}>{errors.color}</Text>}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Capacidad *</Text>
            <TextInput
              style={[styles.input, errors.capacity && styles.inputError]}
              placeholder="5 personas"
              value={formData.capacity}
              onChangeText={(value) => updateField('capacity', value)}
            />
            {errors.capacity && <Text style={styles.errorText}>{errors.capacity}</Text>}
          </View>
        </View>

        {/* Sección de Información Técnica */}
        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="settings" size={24} color="#3D83D2" />
            <Text style={styles.sectionTitle}>Información Técnica</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Número de Motor</Text>
            <TextInput
              style={styles.input}
              placeholder="Opcional"
              value={formData.engineNumber}
              onChangeText={(value) => updateField('engineNumber', value)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Número de Chasis</Text>
            <TextInput
              style={styles.input}
              placeholder="Opcional"
              value={formData.chassisNumber}
              onChangeText={(value) => updateField('chassisNumber', value)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Número VIN</Text>
            <TextInput
              style={styles.input}
              placeholder="Opcional"
              value={formData.vinNumber}
              onChangeText={(value) => updateField('vinNumber', value)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Estado</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.status}
                onValueChange={(value) => updateField('status', value)}
                style={styles.picker}
              >
                {statusOptions.map((status) => (
                  <Picker.Item key={status.value} label={status.label} value={status.value} />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        {/* Botón de Guardar */}
        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Guardar Vehículo</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de Selector de Imagen */}
      <Modal
        visible={showImagePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowImagePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Imagen</Text>
              <TouchableOpacity onPress={() => setShowImagePicker(false)}>
                <Ionicons name="close" size={24} color="#7f8c8d" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalOptions}>
              <TouchableOpacity 
                style={styles.modalOption}
                onPress={() => selectImage(currentImageType)}
              >
                <Ionicons name="image" size={40} color="#3D83D2" />
                <Text style={styles.modalOptionText}>Galería</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Éxito */}
      <SuccessVehicle visible={success} onClose={handleSuccessClose} />
    </KeyboardAvoidingView>
=======
      <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Sección de imágenes */}
        <View style={styles.imageBox}>
          <Text style={{ color: '#3D83D2', fontSize: 13, marginBottom: 8, textAlign: 'center', fontWeight: 'bold' }}>
            Recomendado: 800x600px (rectangular)
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            {/* Imagen principal */}
            <View style={{ alignItems: 'center' }} ref={mainViewImageBoxRef}>
              <TouchableOpacity
                onPress={() => {
                  pickImage((img) => {
                    setMainViewImage(img);
                    if (img && fieldErrors.mainViewImage) setFieldErrors(prev => ({ ...prev, mainViewImage: undefined }));
                  });
                }}
                style={[
                  styles.imagePickerBtn,
                  fieldErrors.mainViewImage && styles.imagePickerBtnError
                ]}>
                {mainViewImage ? (
                  <Image source={{ uri: mainViewImage.uri || mainViewImage }}
                    style={[
                      styles.mainRectImage,
                      { width: rectSize.rectWidth, height: rectSize.rectHeight },
                      fieldErrors.mainViewImage && styles.mainRectImageError
                    ]}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={[
                    styles.mainRectImage,
                    { width: rectSize.rectWidth, height: rectSize.rectHeight, justifyContent: 'center', alignItems: 'center' },
                    fieldErrors.mainViewImage && styles.mainRectImageError
                  ]}>
                    <Ionicons name="image-outline" size={80} color={fieldErrors.mainViewImage ? '#e74c3c' : '#b3d6fa'} />
                  </View>
                )}
              </TouchableOpacity>
              <Text style={styles.imageLabel}>Principal</Text>
              {fieldErrors.mainViewImage && (
                <View style={styles.imageErrorBox}>
                  <Ionicons name="close-circle" size={18} color="#d35400" style={{ marginRight: 6 }} />
                  <Text style={styles.imageErrorText} numberOfLines={2} ellipsizeMode="tail">{fieldErrors.mainViewImage}</Text>
                </View>
              )}
            </View>
            {/* Imagen lateral */}
            <View style={{ alignItems: 'center' }} ref={sideImageBoxRef}>
              <TouchableOpacity
                onPress={() => {
                  pickImage((img) => {
                    setSideImage(img);
                    if (img && fieldErrors.sideImage) setFieldErrors(prev => ({ ...prev, sideImage: undefined }));
                  });
                }}
                style={[
                  styles.imagePickerBtn,
                  fieldErrors.sideImage && styles.imagePickerBtnError
                ]}>
                {sideImage ? (
                  <Image source={{ uri: sideImage.uri || sideImage }}
                    style={[
                      styles.mainRectImage,
                      { width: rectSize.rectWidth, height: rectSize.rectHeight },
                      fieldErrors.sideImage && styles.mainRectImageError
                    ]}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={[
                    styles.mainRectImage,
                    { width: rectSize.rectWidth, height: rectSize.rectHeight, justifyContent: 'center', alignItems: 'center' },
                    fieldErrors.sideImage && styles.mainRectImageError
                  ]}>
                    <Ionicons name="image-outline" size={80} color={fieldErrors.sideImage ? '#e74c3c' : '#b3d6fa'} />
                  </View>
                )}
              </TouchableOpacity>
              <Text style={styles.imageLabel}>Lateral</Text>
              {fieldErrors.sideImage && (
                <View style={styles.imageErrorBox}>
                  <Ionicons name="close-circle" size={18} color="#d35400" style={{ marginRight: 6 }} />
                  <Text style={styles.imageErrorText} numberOfLines={2} ellipsizeMode="tail">{fieldErrors.sideImage}</Text>
                </View>
              )}
            </View>
          </View>
          {/* Botón galería */}
          <TouchableOpacity style={styles.uploadBtn} onPress={() => pickImage(setGalleryImages, true)}>
            <Text style={styles.uploadBtnText}>Subir fotos galería</Text>
            <Ionicons name="add" size={20} color="#fff" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
          {/* Carrusel galería */}
          <View style={{ flexDirection: 'column', alignItems: 'center', marginTop: 8 }}>
            <Text style={{ color: '#3D83D2', fontWeight: 'bold', marginBottom: 4 }}>
              {galleryImages.length > 0 ? `${Math.min(galleryIndex + 1, galleryImages.length)} / ${galleryImages.length}` : '0 / 0'}
            </Text>
          </View>
          <View style={{ width: rectSize.rectWidth * 2, height: rectSize.rectWidth * 1.5, alignSelf: 'center', marginVertical: 8 }}>
            <View style={{ flex: 1, position: 'relative', justifyContent: 'center', alignItems: 'center' }}>
              {/* Flecha izquierda */}
              <TouchableOpacity
                onPress={() => goToGalleryImage(Math.max(galleryIndex - 1, 0))}
                disabled={galleryIndex === 0}
                style={{
                  position: 'absolute',
                  left: 0,
                  zIndex: 2,
                  backgroundColor: 'rgba(255,255,255,0.7)',
                  borderRadius: 20,
                  padding: 6,
                  opacity: galleryIndex === 0 ? 0.3 : 1,
                }}
              >
                <Ionicons name="chevron-back" size={32} color="#3D83D2" />
              </TouchableOpacity>
              {/* Carrusel */}
              <ScrollView
                ref={galleryScrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={event => {
                  const offsetX = event.nativeEvent.contentOffset.x;
                  const width = rectSize.rectWidth * 2;
                  const idx = Math.round(offsetX / width);
                  setGalleryIndex(idx);
                }}
                scrollEventThrottle={16}
                style={{ width: rectSize.rectWidth * 2, height: rectSize.rectWidth * 1.5, borderRadius: 16 }}
                contentContainerStyle={{ alignItems: 'center' }}
                snapToInterval={rectSize.rectWidth * 2}
                decelerationRate="fast"
              >
                {galleryImages.map((img, idx) => (
                  <View
                    key={idx}
                    style={{
                      width: rectSize.rectWidth * 2,
                      height: rectSize.rectWidth * 1.5,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginHorizontal: 0,
                      backgroundColor: '#fff',
                      borderRadius: 16,
                    }}
                  >
                    <Image
                      source={{ uri: img.uri || img }}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 16,
                        resizeMode: 'cover',
                        backgroundColor: '#fff',
                      }}
                    />
                    {/* Botón para borrar imagen */}
                    <TouchableOpacity
                      onPress={() => {
                        const newImages = galleryImages.filter((_, i) => i !== idx);
                        setGalleryImages(newImages);
                        // Ajustar el índice si es necesario
                        if (galleryIndex >= newImages.length) {
                          setGalleryIndex(Math.max(newImages.length - 1, 0));
                        }
                      }}
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: 'rgba(255,255,255,0.85)',
                        borderRadius: 16,
                        padding: 4,
                        zIndex: 3,
                      }}
                    >
                      <Ionicons name="close-circle" size={28} color="#e74c3c" />
                    </TouchableOpacity>
                  </View>
                ))}
                {/* Slot para agregar más imágenes */}
                <TouchableOpacity
                  onPress={() => pickImage(setGalleryImages, true)}
                  style={{
                    width: rectSize.rectWidth * 2,
                    height: rectSize.rectWidth * 1.5,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#eaf4ff',
                    borderRadius: 16,
                    borderWidth: 2,
                    borderColor: '#b3d6fa',
                    borderStyle: 'dashed',
                  }}
                >
                  <Ionicons name="image-outline" size={64} color="#b3d6fa" />
                  <Ionicons name="add-circle" size={32} color="#3D83D2" style={{ position: 'absolute', bottom: 18, right: 18 }} />
                </TouchableOpacity>
              </ScrollView>
              {/* Flecha derecha */}
              <TouchableOpacity
                onPress={() => goToGalleryImage(Math.min(galleryIndex + 1, galleryImages.length))}
                disabled={galleryIndex === galleryImages.length}
                style={{
                  position: 'absolute',
                  right: 0,
                  zIndex: 2,
                  backgroundColor: 'rgba(255,255,255,0.7)',
                  borderRadius: 20,
                  padding: 6,
                  opacity: galleryIndex === galleryImages.length ? 0.3 : 1,
                }}
              >
                <Ionicons name="chevron-forward" size={32} color="#3D83D2" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {/* --- Formulario de datos del vehículo --- */}
        {/* Nombre */}
        <View style={{ marginBottom: 8 }} ref={refs.vehicleName}>
          <Text style={styles.label}>Nombre del Vehículo</Text>
          <TextInput
            ref={refs.vehicleName}
            style={[styles.input, fieldErrors.vehicleName && styles.inputError]}
            placeholder="Nombre"
            placeholderTextColor="#7bb0f6"
            value={vehicleName}
            onChangeText={text => {
              let filtered = text.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9\s]/g, '');
              if (filtered.length > 0) {
                filtered = filtered[0].toUpperCase() + filtered.slice(1);
              }
              setVehicleName(filtered);
              if (fieldErrors.vehicleName) {
                setFieldErrors(prev => ({ ...prev, vehicleName: undefined }));
              }
            }}
          />
          {fieldErrors.vehicleName && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color="#e74c3c" style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{fieldErrors.vehicleName}</Text>
            </View>
          )}
        </View>
        <Text style={styles.sectionTitle}>Información del automóvil</Text>
        {/* Precio por día */}
        <View style={[styles.row, { alignItems: 'flex-start', marginBottom: 8 }]} ref={refs.dailyPrice}>
          <Text style={[styles.label, { marginTop: 15, marginRight: 10, minWidth: 90 }]}>Precio por día</Text>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 18, color: '#2561a7', marginRight: 4, fontWeight: 'bold' }}>$</Text>
              <TextInput
                ref={refs.dailyPrice}
                style={[styles.input, { flex: 1, marginBottom: 0, paddingLeft: 8 }, fieldErrors.dailyPrice && styles.inputError]}
                placeholder="0.00"
                placeholderTextColor="#7bb0f6"
                value={dailyPrice}
                onChangeText={text => {
                  let filtered = text.replace(/[^0-9.]/g, '');
                  filtered = filtered.replace(/(\..*)\./g, '$1');
                  if (filtered.includes('.')) {
                    const [intPart, decPart] = filtered.split('.');
                    filtered = intPart + '.' + (decPart ? decPart.slice(0,2) : '');
                  }
                  setDailyPrice(filtered);
                  if (fieldErrors.dailyPrice) {
                    setFieldErrors(prev => ({ ...prev, dailyPrice: undefined }));
                  }
                }}
                keyboardType="numeric"
                inputMode="decimal"
                maxLength={10}
              />
            </View>
            {fieldErrors.dailyPrice && (
              <View style={[styles.errorBox, { marginTop: 6 }]}> 
                <Ionicons name="alert-circle" size={16} color="#e74c3c" style={{ marginRight: 6 }} />
                <Text style={styles.errorText}>{fieldErrors.dailyPrice}</Text>
              </View>
            )}
          </View>
        </View>
        {/* Placa */}
        <View style={{ marginBottom: 8 }} ref={refs.plate}>
          <Text style={styles.label}>Placa</Text>
          <TextInput
            ref={refs.plate}
            style={[styles.input, fieldErrors.plate && styles.inputError]}
            placeholder="Ej: PABC1234"
            placeholderTextColor="#7bb0f6"
            value={plate}
            autoCapitalize="characters"
            maxLength={8}
            onChangeText={text => {
              let filtered = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
              if (filtered.length === 0) {
                setPlate('');
                if (fieldErrors.plate) setFieldErrors(prev => ({ ...prev, plate: undefined }));
                return;
              }
              if (!/[A-Z]/.test(filtered[0])) {
                setPlate('');
                if (fieldErrors.plate) setFieldErrors(prev => ({ ...prev, plate: undefined }));
                return;
              }
              setPlate(filtered.slice(0, 8));
              if (fieldErrors.plate) setFieldErrors(prev => ({ ...prev, plate: undefined }));
            }}
          />
          {fieldErrors.plate && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color="#e74c3c" style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{fieldErrors.plate}</Text>
            </View>
          )}
        </View>
        {/* Marca y Tipo */}
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 6 }} ref={refs.brandId}>
            <Text style={styles.label}>Marca</Text>
            <Picker
              ref={refs.brandId}
              selectedValue={brandId}
              onValueChange={value => {
                setBrandId(value);
                if (fieldErrors.brandId) setFieldErrors(prev => ({ ...prev, brandId: undefined }));
              }}
              style={[styles.picker, fieldErrors.brandId && styles.inputError]}
              dropdownIconColor="#3D83D2"
            >
              <Picker.Item label="Selecciona una marca..." value="" />
              {brands.map(b => (
                <Picker.Item key={b.value} label={b.label} value={b.value} />
              ))}
            </Picker>
            {fieldErrors.brandId && (
              <View style={[styles.errorBox, { marginTop: 6 }]}> 
                <Ionicons name="alert-circle" size={16} color="#e74c3c" style={{ marginRight: 6 }} />
                <Text style={styles.errorText}>{fieldErrors.brandId}</Text>
              </View>
            )}
          </View>
          <View style={{ flex: 1, marginLeft: 6 }} ref={refs.vehicleClass}>
            <Text style={styles.label}>Tipo</Text>
            <Picker
              ref={refs.vehicleClass}
              selectedValue={vehicleClass}
              onValueChange={value => {
                setVehicleClass(value);
                if (fieldErrors.vehicleClass) setFieldErrors(prev => ({ ...prev, vehicleClass: undefined }));
              }}
              style={[styles.picker, fieldErrors.vehicleClass && styles.inputError]}
              dropdownIconColor="#3D83D2"
            >
              <Picker.Item label="Selecciona un tipo..." value="" />
              {vehicleTypes.map(t => (
                <Picker.Item key={t.value} label={t.label} value={t.value} />
              ))}
            </Picker>
            {fieldErrors.vehicleClass && (
              <View style={[styles.errorBox, { marginTop: 6 }]}> 
                <Ionicons name="alert-circle" size={16} color="#e74c3c" style={{ marginRight: 6 }} />
                <Text style={styles.errorText}>{fieldErrors.vehicleClass}</Text>
              </View>
            )}
          </View>
        </View>
        {/* Modelo y Capacidad */}
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 6 }} ref={refs.model}>
            <Text style={styles.label}>Modelo</Text>
            <TextInput
              ref={refs.model}
              style={[styles.input, fieldErrors.model && styles.inputError]}
              placeholder="Modelo"
              placeholderTextColor="#7bb0f6"
              value={model}
              onChangeText={text => {
                let filtered = text.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9\s]/g, '');
                if (filtered.length > 0) {
                  filtered = filtered[0].toUpperCase() + filtered.slice(1);
                }
                setModel(filtered);
                if (fieldErrors.model) setFieldErrors(prev => ({ ...prev, model: undefined }));
              }}
            />
            {fieldErrors.model && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color="#e74c3c" style={{ marginRight: 6 }} />
                <Text style={styles.errorText}>{fieldErrors.model}</Text>
              </View>
            )}
          </View>
          <View style={{ flex: 1, marginLeft: 6 }} ref={refs.capacity}>
            <Text style={styles.label}>Capacidad</Text>
            <TextInput
              ref={refs.capacity}
              style={[styles.input, fieldErrors.capacity && styles.inputError]}
              placeholder="Capacidad"
              placeholderTextColor="#7bb0f6"
              value={capacity}
              onChangeText={text => {
                const filtered = text.replace(/[^0-9]/g, '').slice(0, 3);
                setCapacity(filtered);
                if (fieldErrors.capacity) setFieldErrors(prev => ({ ...prev, capacity: undefined }));
              }}
              keyboardType="number-pad"
              maxLength={3}
            />
            {fieldErrors.capacity && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color="#e74c3c" style={{ marginRight: 6 }} />
                <Text style={styles.errorText}>{fieldErrors.capacity}</Text>
              </View>
            )}
          </View>
        </View>
        {/* Año y Color */}
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 6 }} ref={refs.year}>
            <Text style={styles.label}>Año</Text>
            <TextInput
              ref={refs.year}
              style={[styles.input, fieldErrors.year && styles.inputError]}
              placeholder="Año"
              placeholderTextColor="#7bb0f6"
              value={year}
              onChangeText={text => {
                const filtered = text.replace(/[^0-9]/g, '').slice(0, 4);
                setYear(filtered);
                if (fieldErrors.year) setFieldErrors(prev => ({ ...prev, year: undefined }));
              }}
              keyboardType="number-pad"
              maxLength={4}
            />
            {fieldErrors.year && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color="#e74c3c" style={{ marginRight: 6 }} />
                <Text style={styles.errorText}>{fieldErrors.year}</Text>
              </View>
            )}
          </View>
          <View style={{ flex: 1, marginLeft: 6 }} ref={refs.color}>
            <Text style={styles.label}>Color</Text>
            <TextInput
              ref={refs.color}
              style={[styles.input, fieldErrors.color && styles.inputError]}
              placeholder="Color"
              placeholderTextColor="#7bb0f6"
              value={color}
              onChangeText={text => {
                let filtered = text.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, '');
                if (filtered.length > 0) {
                  filtered = filtered[0].toUpperCase() + filtered.slice(1);
                }
                setColor(filtered);
                if (fieldErrors.color) setFieldErrors(prev => ({ ...prev, color: undefined }));
              }}
            />
            {fieldErrors.color && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color="#e74c3c" style={{ marginRight: 6 }} />
                <Text style={styles.errorText}>{fieldErrors.color}</Text>
              </View>
            )}
          </View>
        </View>
        {/* Motor */}
        <View style={{ marginBottom: 8 }} ref={refs.engineNumber}>
          <Text style={styles.label}>Motor</Text>
          <TextInput
            ref={refs.engineNumber}
            style={[styles.input, fieldErrors.engineNumber && styles.inputError]}
            placeholder="Motor"
            placeholderTextColor="#7bb0f6"
            value={engineNumber}
            onChangeText={text => {
              let filtered = text.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
              setEngineNumber(filtered);
              if (fieldErrors.engineNumber) setFieldErrors(prev => ({ ...prev, engineNumber: undefined }));
            }}
          />
          {fieldErrors.engineNumber && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color="#e74c3c" style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{fieldErrors.engineNumber}</Text>
            </View>
          )}
        </View>
        {/* Chasis */}
        <View style={{ marginBottom: 8 }} ref={refs.chassisNumber}>
          <Text style={styles.label}>Chasis</Text>
          <TextInput
            ref={refs.chassisNumber}
            style={[styles.input, fieldErrors.chassisNumber && styles.inputError]}
            placeholder="Chasis"
            placeholderTextColor="#7bb0f6"
            value={chassisNumber}
            onChangeText={text => {
              let filtered = text.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
              setChassisNumber(filtered);
              if (fieldErrors.chassisNumber) setFieldErrors(prev => ({ ...prev, chassisNumber: undefined }));
            }}
          />
          {fieldErrors.chassisNumber && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color="#e74c3c" style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{fieldErrors.chassisNumber}</Text>
            </View>
          )}
        </View>
        {/* VIN */}
        <View style={{ marginBottom: 8 }} ref={refs.vinNumber}>
          <Text style={styles.label}>VIN</Text>
          <TextInput
            ref={refs.vinNumber}
            style={[styles.input, fieldErrors.vinNumber && styles.inputError]}
            placeholder="VIN"
            placeholderTextColor="#7bb0f6"
            value={vinNumber}
            onChangeText={text => {
              let filtered = text.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
              setVinNumber(filtered);
              if (fieldErrors.vinNumber) setFieldErrors(prev => ({ ...prev, vinNumber: undefined }));
            }}
          />
          {fieldErrors.vinNumber && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color="#e74c3c" style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{fieldErrors.vinNumber}</Text>
            </View>
          )}
        </View>
        {/* Botón para guardar */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Guardar vehículo</Text>}
        </TouchableOpacity>
        {/* Mensaje de error */}
  {error ? <Text style={{ color: 'red', textAlign: 'center', marginBottom: 10 }}>{error}</Text> : null}
      </ScrollView>
  <SuccessVehicle visible={showSuccess} message="¡Vehículo agregado exitosamente!" />
    </View>
>>>>>>> 2c830f7d0232ead70791aff6968a0e95ce850767
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    zIndex: 1000,
  },
  headerBg: {
    backgroundColor: '#3D83D2',
    height: 120,
=======
  inputError: {
    borderColor: '#e74c3c',
    backgroundColor: '#fff6f6',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fdeeee',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginTop: -6,
    marginBottom: 10,
    marginLeft: 2,
    borderWidth: 1,
    borderColor: '#f5c6cb',
    shadowColor: '#e74c3c',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
    elevation: 1,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    letterSpacing: 0.1,
  },
  imageErrorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff3e6',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginTop: 4,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#f5c6a5',
    shadowColor: '#d35400',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
    maxWidth: 170,
    alignSelf: 'center',
  },
  imageErrorText: {
    color: '#d35400',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    letterSpacing: 0.1,
    flexWrap: 'wrap',
    textAlign: 'left',
    maxWidth: 140,
  },
  imagePickerBtnError: {
    borderColor: '#e74c3c',
    borderWidth: 2.5,
    backgroundColor: '#fff6f6',
    borderRadius: 16,
  },
  mainRectImageError: {
    borderColor: '#e74c3c',
    borderWidth: 2.5,
    backgroundColor: '#fff6f6',
  },
  headerContainer: {
    backgroundColor: 'transparent',
    marginBottom: -19,
  },
  headerBg: {
    backgroundColor: '#3D83D2',
    height: 140, 
>>>>>>> 2c830f7d0232ead70791aff6968a0e95ce850767
    overflow: 'hidden',
    position: 'relative',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
<<<<<<< HEAD
    paddingTop: Platform.OS === 'ios' ? 50 : 35,
    paddingBottom: 8,
=======
    paddingTop: Platform.OS === 'ios' ? 55 : 35, 
    paddingBottom: 12,
>>>>>>> 2c830f7d0232ead70791aff6968a0e95ce850767
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textAlign: 'center',
    flex: 1,
  },
  headerCurveContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
<<<<<<< HEAD
    bottom: -1,
    height: 50,
=======
    bottom: -5,
    height: 80,
>>>>>>> 2c830f7d0232ead70791aff6968a0e95ce850767
    width: '100%',
    overflow: 'hidden',
    zIndex: 1,
  },
<<<<<<< HEAD
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 120, // Altura del header
    padding: 18,
    paddingBottom: 40,
  },
  formSection: {
    backgroundColor: '#fff',
    marginBottom: 18,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  imageSection: {
    backgroundColor: '#fff',
    marginBottom: 18,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 8,
  },
  imageContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  imageUploadBox: {
    flex: 1,
    height: 120,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  imageUploadBoxError: {
    borderColor: '#e74c3c',
  },
  imageUploadContent: {
    alignItems: 'center',
  },
  imageUploadText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3D83D2',
    marginTop: 8,
  },
  imageUploadSubtext: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  galleryUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3D83D2',
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  galleryUploadText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  galleryPreview: {
    marginTop: 8,
  },
  galleryImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  galleryImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 6,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#2c3e50',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  pickerContainer: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
  },
  picker: {
    height: 50,
    color: '#2c3e50',
  },
  rowContainer: {
    flexDirection: 'row',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 4,
  },
  actionSection: {
    marginBottom: 18,
  },
  saveButton: {
    backgroundColor: '#27ae60',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#27ae60',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonDisabled: {
    backgroundColor: '#bdc3c7',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 200,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  modalOptions: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  modalOption: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    backgroundColor: '#f8f9fa',
    minWidth: 120,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  modalOptionText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
});
=======
  scrollContent: {
    padding: 18,
    paddingTop: 20,
    paddingBottom: 40,
  },
  imageBox: {
    backgroundColor: '#eaf4ff',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    padding: 18,
    minHeight: 180,
  },
  imagePickerBtn: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  mainImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    marginBottom: 4,
    backgroundColor: '#fff',
  },
  mainRectImage: {
    borderRadius: 14,
    marginBottom: 4,
    backgroundColor: '#fff',
  },
  imageLabel: {
    color: '#3D83D2',
    fontWeight: 'bold',
    fontSize: 13,
    marginTop: 2,
  },
  galleryImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3D83D2',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginTop: 8,
  },
  uploadBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  input: {
    backgroundColor: '#f7fbff',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 13,
    fontSize: 16,
    color: '#2561a7',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#b3d6fa',
    shadowColor: '#3D83D2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#3D83D2',
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 8,
    textAlign: 'left',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    color: '#3D83D2',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
    marginLeft: 2,
  },
  picker: {
    backgroundColor: '#f7fbff',
    color: '#2561a7',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#b3d6fa',
    height: 46,
    width: '100%',
    marginBottom: 0,
    paddingHorizontal: 8,
    // iOS shadow
    shadowColor: '#3D83D2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    // Android elevation
    elevation: 2,
    justifyContent: 'center',
  },
  saveBtn: {
    backgroundColor: '#3D83D2',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  pickerAligned: {
    height: 48,
    marginBottom: 12,
    paddingVertical: 0,
  },
});
>>>>>>> 2c830f7d0232ead70791aff6968a0e95ce850767
