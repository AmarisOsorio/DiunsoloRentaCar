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
import { Picker } from '@react-native-picker/picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import Svg, { Path } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import SuccessVehicle from './Components/SuccessVehicle';

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
    }
  };

  const handleGoBack = () => {
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
      <View style={styles.headerContainer}>
        <View style={styles.headerBg}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
              <Ionicons name="chevron-back" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Añadir Vehículo</Text>
          </View>
          <View style={[styles.headerCurveContainer, { width: '100%' }]} pointerEvents="none">
            <Svg height="50" width="100%" viewBox="0 0 400 50" preserveAspectRatio="none">
              <Path d="M0,0 H400 V50 H0 Z" fill="#3D83D2" />
              <Path d="M0,40 Q200,0 400,40 L400,50 L0,50 Z" fill="#F2F2F2" />
            </Svg>
          </View>
        </View>
      </View>

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
  );
}

const styles = StyleSheet.create({
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
    overflow: 'hidden',
    position: 'relative',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 35,
    paddingBottom: 8,
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
    bottom: -1,
    height: 50,
    width: '100%',
    overflow: 'hidden',
    zIndex: 1,
  },
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
