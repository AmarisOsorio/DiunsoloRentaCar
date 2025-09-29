import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import useVehicles from './Hooks/useVehicles';

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

function EditVehicle({ route, navigation }) {
  const { vehicleId } = route.params;
  const { updateVehicle } = useVehicles();

  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Datos del vehículo
  const [vehicleName, setVehicleName] = useState('');
  const [dailyPrice, setDailyPrice] = useState('');
  const [plate, setPlate] = useState('');
  const [brandId, setBrandId] = useState('');
  const [vehicleClass, setVehicleClass] = useState('');
  const [color, setColor] = useState('');
  const [year, setYear] = useState('');
  const [capacity, setCapacity] = useState('');
  const [model, setModel] = useState('');
  const [engineNumber, setEngineNumber] = useState('');
  const [chassisNumber, setChassisNumber] = useState('');
  const [vinNumber, setVinNumber] = useState('');
  const [status, setStatus] = useState('Disponible');

  // Imágenes (mantenemos las URLs originales)
  const [mainViewImage, setMainViewImage] = useState('');
  const [sideImage, setSideImage] = useState('');
  const [galleryImages, setGalleryImages] = useState([]);

  useEffect(() => {
    loadVehicleData();
    loadBrands();
  }, [vehicleId]);

  const loadVehicleData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar vehículo');
      }

      const vehicle = await response.json();

      setVehicleName(vehicle.vehicleName || '');
      setDailyPrice(vehicle.dailyPrice?.toString() || '');
      setPlate(vehicle.plate || '');
      setBrandId(vehicle.brandId?._id || vehicle.brandId || '');
      setVehicleClass(vehicle.vehicleClass || '');
      setColor(vehicle.color || '');
      setYear(vehicle.year?.toString() || '');
      setCapacity(vehicle.capacity?.toString() || '');
      setModel(vehicle.model || '');
      setEngineNumber(vehicle.engineNumber || '');
      setChassisNumber(vehicle.chassisNumber || '');
      setVinNumber(vehicle.vinNumber || '');
      setStatus(vehicle.status || 'Disponible');
      setMainViewImage(vehicle.mainViewImage || '');
      setSideImage(vehicle.sideImage || '');
      setGalleryImages(vehicle.galleryImages || []);
    } catch (error) {
      console.error('Error al cargar vehículo:', error);
      Alert.alert('Error', 'No se pudo cargar el vehículo');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const loadBrands = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/brands`);
      const data = await response.json();
      setBrands(data);
    } catch (error) {
      console.error('Error al cargar marcas:', error);
    }
  };

  const pickImage = async (setter) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería');
        return;
      }
      
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });
      
      if (!result.canceled && result.assets && result.assets[0]) {
        setter(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
    }
  };

  const handleSave = async () => {
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

    try {
      setSaving(true);

      const updateData = {
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
        mainViewImage,
        sideImage,
        galleryImages,
      };

      await updateVehicle(vehicleId, updateData);
      
      Alert.alert('Éxito', 'Vehículo actualizado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error al actualizar:', error);
      Alert.alert('Error', 'No se pudo actualizar el vehículo');
    } finally {
      setSaving(false);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
        <View style={styles.headerContainer}>
          <View style={styles.headerCurve}>
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
              <Ionicons name="chevron-back" size={28} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Editar Vehículo</Text>
            </View>
          </View>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={{ marginTop: 16, color: '#6B7280' }}>Cargando datos...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
      <View style={styles.headerContainer}>
        <View style={styles.headerCurve}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Editar Vehículo</Text>
            <Text style={styles.headerSubtitle}>Modifica la información</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* Sección de imágenes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="images" size={24} color="#4A90E2" />
            <Text style={styles.sectionTitle}>Imágenes del vehículo</Text>
          </View>
          
          <View style={styles.imageBox}>
            <View style={styles.mainImagesRow}>
              <TouchableOpacity 
                onPress={() => pickImage(setMainViewImage)} 
                style={styles.imagePickerCard}
              >
                {mainViewImage ? (
                  <Image 
                    source={{ uri: mainViewImage }} 
                    style={styles.mainImage} 
                    resizeMode="cover" 
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="camera" size={40} color="#CBD5E1" />
                    <Text style={styles.imagePlaceholderText}>Vista Principal</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => pickImage(setSideImage)} 
                style={styles.imagePickerCard}
              >
                {sideImage ? (
                  <Image 
                    source={{ uri: sideImage }} 
                    style={styles.mainImage} 
                    resizeMode="cover" 
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="camera" size={40} color="#CBD5E1" />
                    <Text style={styles.imagePlaceholderText}>Vista Lateral</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.imageNote}>
              <Ionicons name="information-circle" size={16} color="#6B7280" />
              {' '}Toca las imágenes para cambiarlas
            </Text>
          </View>
        </View>

        {/* Información básica */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={24} color="#4A90E2" />
            <Text style={styles.sectionTitle}>Información básica</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nombre del vehículo</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Ej: Toyota Corolla 2024" 
              placeholderTextColor="#94A3B8" 
              value={vehicleName} 
              onChangeText={setVehicleName} 
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Precio por día ($)</Text>
            <TextInput 
              style={styles.input} 
              placeholder="0.00" 
              placeholderTextColor="#94A3B8" 
              value={dailyPrice} 
              onChangeText={setDailyPrice} 
              keyboardType="numeric" 
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Placa</Text>
            <TextInput 
              style={styles.input} 
              placeholder="ABC-123" 
              placeholderTextColor="#94A3B8" 
              value={plate} 
              onChangeText={setPlate} 
            />
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Marca</Text>
              <View style={styles.pickerContainer}>
                <Picker 
                  selectedValue={brandId} 
                  onValueChange={setBrandId} 
                  style={styles.picker}
                >
                  <Picker.Item label="Selecciona..." value="" />
                  {brands.map(b => (
                    <Picker.Item key={b._id} label={b.brandName} value={b._id} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Tipo</Text>
              <View style={styles.pickerContainer}>
                <Picker 
                  selectedValue={vehicleClass} 
                  onValueChange={setVehicleClass} 
                  style={styles.picker}
                >
                  <Picker.Item label="Selecciona..." value="" />
                  {vehicleTypes.map(t => (
                    <Picker.Item key={t.value} label={t.label} value={t.value} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>
        </View>

        {/* Especificaciones */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="car-sport" size={24} color="#4A90E2" />
            <Text style={styles.sectionTitle}>Especificaciones</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Modelo</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Ej: Corolla XLE" 
              placeholderTextColor="#94A3B8" 
              value={model} 
              onChangeText={setModel} 
            />
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Año</Text>
              <TextInput 
                style={styles.input} 
                placeholder="2024" 
                placeholderTextColor="#94A3B8" 
                value={year} 
                onChangeText={setYear} 
                keyboardType="numeric" 
              />
            </View>

            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Color</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Blanco" 
                placeholderTextColor="#94A3B8" 
                value={color} 
                onChangeText={setColor} 
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Capacidad (personas)</Text>
              <TextInput 
                style={styles.input} 
                placeholder="5" 
                placeholderTextColor="#94A3B8" 
                value={capacity} 
                onChangeText={setCapacity} 
                keyboardType="numeric" 
              />
            </View>

            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Estado</Text>
              <View style={styles.pickerContainer}>
                <Picker 
                  selectedValue={status} 
                  onValueChange={setStatus} 
                  style={styles.picker}
                >
                  {statusOptions.map(opt => (
                    <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>
        </View>

        {/* Información técnica */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="settings" size={24} color="#4A90E2" />
            <Text style={styles.sectionTitle}>Información técnica</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Número de motor</Text>
            <TextInput 
              style={styles.input} 
              placeholder="123456789" 
              placeholderTextColor="#94A3B8" 
              value={engineNumber} 
              onChangeText={setEngineNumber} 
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Número de chasis</Text>
            <TextInput 
              style={styles.input} 
              placeholder="987654321" 
              placeholderTextColor="#94A3B8" 
              value={chassisNumber} 
              onChangeText={setChassisNumber} 
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>VIN</Text>
            <TextInput 
              style={styles.input} 
              placeholder="1HGBH41JXMN109186" 
              placeholderTextColor="#94A3B8" 
              value={vinNumber} 
              onChangeText={setVinNumber} 
            />
          </View>
        </View>

        {/* Botones de acción */}
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.cancelBtn} 
            onPress={handleGoBack}
            disabled={saving}
          >
            <Text style={styles.cancelBtnText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]} 
            onPress={handleSave} 
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                <Text style={styles.saveBtnText}>Guardar cambios</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

export default EditVehicle;

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: 'transparent',
  },
  headerCurve: {
    backgroundColor: '#4A90E2',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginTop: 4,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 12,
  },
  imageBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  mainImagesRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  imagePickerCard: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: 8,
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
  },
  imageNote: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  halfInput: {
    flex: 1,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#1F2937',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#6B7280',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  saveBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
});