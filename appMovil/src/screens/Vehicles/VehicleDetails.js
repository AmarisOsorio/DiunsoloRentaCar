import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  Modal
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Svg, { Path } from 'react-native-svg';
import useVehicleDetails from './Hooks/useVehicleDetails';
import ConfirmModal from './Components/ConfirmModal';
import SuccessModal from './Components/SuccessModal';

const { width, height } = Dimensions.get('window');

export default function VehicleDetails({ navigation, route }) {
  const vehicleId = route?.params?.vehicleId;
  const scrollRef = useRef(null);
  
  const {
    vehicle,
    brands,
    loading,
    updating,
    deleting,
    error,
    success,
    editMode,
    formData,
    vehicleTypes,
    statusOptions,
    updateVehicle,
    deleteVehicle,
    downloadContract,
    updateFormField,
    toggleEditMode,
    clearSuccess,
  } = useVehicleDetails(vehicleId);

  const [showImageEditor, setShowImageEditor] = useState(false);
  const [editingImageType, setEditingImageType] = useState(null); // 'main', 'side', 'gallery'
  
  // Estados para el carrusel de imágenes - SIMPLIFICADO
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const carouselScrollRef = useRef(null);

  // Estados para modales
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalType, setConfirmModalType] = useState('update');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalType, setSuccessModalType] = useState('update');

  // Navegación
  const handleGoBack = () => {
    navigation.goBack();
  };

  const navigateToCalendar = () => {
    navigation.navigate('Calendario', { vehicleId, vehicleName: vehicle?.vehicleName });
  };

  // Manejo de confirmaciones
  const handleUpdateConfirm = () => {
    setConfirmModalType('update');
    setShowConfirmModal(true);
  };

  const handleDeleteConfirm = () => {
    setConfirmModalType('delete');
    setShowConfirmModal(true);
  };

  const handleDownloadConfirm = () => {
    setConfirmModalType('download');
    setShowConfirmModal(true);
  };

  // Ejecutar acciones
  const executeAction = async () => {
    setShowConfirmModal(false);
    
    switch (confirmModalType) {
      case 'update':
        await updateVehicle();
        if (!error) {
          setSuccessModalType('update');
          setShowSuccessModal(true);
        }
        break;
      case 'delete':
        const deleted = await deleteVehicle();
        if (deleted) {
          setSuccessModalType('delete');
          setShowSuccessModal(true);
          // Navegar hacia atrás después del éxito
          setTimeout(() => {
            navigation.goBack();
          }, 2500);
        }
        break;
      case 'download':
        const downloaded = await downloadContract();
        if (downloaded) {
          setSuccessModalType('download');
          setShowSuccessModal(true);
        }
        break;
    }
  };

  // Manejo de éxito
  const handleSuccessHide = () => {
    setShowSuccessModal(false);
    clearSuccess();
  };

  // Funciones para manejar edición de imágenes
  const handleEditImage = (imageType) => {
    setEditingImageType(imageType);
    setShowImageEditor(true);
  };

  const handleImageSelected = (imageUri) => {
    if (editingImageType === 'main') {
      updateFormField('mainViewImage', imageUri);
    } else if (editingImageType === 'side') {
      updateFormField('sideImage', imageUri);
    }
    setShowImageEditor(false);
    setEditingImageType(null);
  };

  // Funciones para el carrusel de imágenes - SIMPLIFICADO
  const getAllImages = () => {
    if (!vehicle) return [];
    
    const images = [];
    
    // Imagen principal
    if (vehicle.mainViewImage) {
      images.push({
        uri: vehicle.mainViewImage,
        type: 'main',
        label: 'Vista Principal',
        id: 'main'
      });
    }
    
    // Imagen lateral
    if (vehicle.sideImage) {
      images.push({
        uri: vehicle.sideImage,
        type: 'side',
        label: 'Vista Lateral',
        id: 'side'
      });
    }
    
    // Imágenes de galería
    if (vehicle.galleryImages && Array.isArray(vehicle.galleryImages) && vehicle.galleryImages.length > 0) {
      vehicle.galleryImages.forEach((img, index) => {
        if (img && typeof img === 'string') {
          images.push({
            uri: img,
            type: 'gallery',
            label: `Galería ${index + 1}`,
            id: `gallery-${index}`
          });
        }
      });
    }
    
    return images;
  };

  const allImages = getAllImages();

  // Navegar en el carrusel - SIMPLIFICADO
  const goToImage = (index) => {
    if (carouselScrollRef.current && allImages.length > 0 && index >= 0 && index < allImages.length) {
      const imageWidth = width;
      carouselScrollRef.current.scrollTo({
        x: index * imageWidth,
        animated: true
      });
      setCurrentImageIndex(index);
    }
  };

  // Imagen anterior
  const goToPreviousImage = () => {
    if (allImages.length <= 1) return;
    const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : allImages.length - 1;
    goToImage(newIndex);
  };

  // Imagen siguiente
  const goToNextImage = () => {
    if (allImages.length <= 1) return;
    const newIndex = currentImageIndex < allImages.length - 1 ? currentImageIndex + 1 : 0;
    goToImage(newIndex);
  };

  // Manejar scroll del carrusel - SIMPLIFICADO
  const handleCarouselScroll = (event) => {
    if (allImages.length <= 1) return;
    
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const imageWidth = width;
    const index = Math.round(scrollPosition / imageWidth);
    
    if (index >= 0 && index < allImages.length && index !== currentImageIndex) {
      setCurrentImageIndex(index);
    }
  };

  // Reset del índice cuando cambia el vehículo - SIMPLIFICADO
  React.useEffect(() => {
    if (vehicle) {
      setCurrentImageIndex(0);
    }
  }, [vehicleId]);

  // Validación simple
  const isFormValid = () => {
    return formData.vehicleName.trim() && 
           formData.dailyPrice && 
           formData.plate.trim() && 
           formData.brandId &&
           formData.vehicleClass &&
           formData.color.trim() &&
           formData.year &&
           formData.capacity &&
           formData.model.trim();
  };

  // Obtener nombre de marca
  const getBrandName = () => {
    if (!vehicle) return 'N/A';
    
    // Si la marca está poblada directamente
    if (vehicle.brandId?.name) return vehicle.brandId.name;
    
    // Si tenemos el ID de la marca, buscar en la lista de marcas
    if (vehicle.brandId && brands && brands.length > 0) {
      const brandIdToFind = typeof vehicle.brandId === 'string' ? vehicle.brandId : vehicle.brandId._id;
      const brand = brands.find(b => b._id === brandIdToFind);
      if (brand) return brand.name;
    }
    
    // Si no encontramos la marca pero tenemos el ID, mostrar el ID
    if (vehicle.brandId) {
      const brandId = typeof vehicle.brandId === 'string' ? vehicle.brandId : vehicle.brandId._id;
      return `ID: ${brandId}`;
    }
    
    return 'Sin marca';
  };

  // Mostrar errores
  React.useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3D83D2" />
        <Text style={styles.loadingText}>Cargando detalles...</Text>
      </View>
    );
  }

  if (!vehicle) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="car-outline" size={80} color="#bdc3c7" />
        <Text style={styles.errorTitle}>Vehículo no encontrado</Text>
        <Text style={styles.errorText}>No se pudo cargar la información del vehículo</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerBg}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
              <Ionicons name="chevron-back" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Detalles del vehículo</Text>
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
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Carrusel de imágenes del vehículo */}
        <View style={[styles.imageSection, { marginHorizontal: -18 }]}>
          {allImages.length > 0 ? (
            <View style={styles.carouselContainer}>
              {/* Carrusel principal */}
              <ScrollView
                ref={carouselScrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleCarouselScroll}
                scrollEventThrottle={16}
                style={styles.imageCarousel}
              >
                {allImages.map((image, index) => (
                  <View key={`${image.id}-${index}`} style={[
                    styles.imageSlide, 
                    { 
                      width: width,
                      height: Math.min(height * 0.4, 320)
                    }
                  ]}>
                    <Image 
                      source={{ uri: image.uri }} 
                      style={[styles.carouselImage, { borderRadius: 15 }]}
                      resizeMode="cover"
                    />
                    
                    {editMode && image.type !== 'gallery' && (
                      <TouchableOpacity 
                        style={styles.editImageButton}
                        onPress={() => handleEditImage(image.type)}
                      >
                        <Ionicons name="camera" size={20} color="#fff" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </ScrollView>

              {/* Controles de navegación */}
              {allImages.length > 1 && (
                <>
                  <TouchableOpacity 
                    style={[styles.carouselNavButton, styles.carouselNavLeft]}
                    onPress={goToPreviousImage}
                  >
                    <Ionicons name="chevron-back" size={24} color="#fff" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.carouselNavButton, styles.carouselNavRight]}
                    onPress={goToNextImage}
                  >
                    <Ionicons name="chevron-forward" size={24} color="#fff" />
                  </TouchableOpacity>
                </>
              )}

              {/* Indicadores de página */}
              {allImages.length > 1 && (
                <View style={styles.pageIndicatorContainer}>
                  {allImages.map((_, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.pageIndicator,
                        currentImageIndex === index && styles.activePageIndicator
                      ]}
                      onPress={() => goToImage(index)}
                    />
                  ))}
                </View>
              )}

              {/* Contador de imágenes */}
              {allImages.length > 1 && (
                <View style={styles.imageCounter}>
                  <Text style={styles.imageCounterText}>
                    {currentImageIndex + 1} de {allImages.length}
                  </Text>
                </View>
              )}

              {/* Miniaturas navegables */}
              {allImages.length > 1 && (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.thumbnailContainer}
                  contentContainerStyle={styles.thumbnailContent}
                >
                  {allImages.map((image, index) => (
                    <TouchableOpacity
                      key={`thumb-${image.id}-${index}`}
                      style={[
                        styles.thumbnail,
                        currentImageIndex === index && styles.activeThumbnail
                      ]}
                      onPress={() => goToImage(index)}
                    >
                      <Image 
                        source={{ uri: image.uri }} 
                        style={styles.thumbnailImage}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          ) : (
            <View style={styles.noImageContainer}>
              <Ionicons name="image-outline" size={60} color="#bdc3c7" />
              <Text style={styles.noImageText}>Sin imágenes disponibles</Text>
            </View>
          )}
        </View>

        {/* Botón de calendario de reservas */}
        <View style={styles.calendarButtonSection}>
          <TouchableOpacity style={styles.calendarButton} onPress={navigateToCalendar}>
            <Ionicons name="calendar" size={24} color="#fff" />
            <Text style={styles.calendarButtonText}>Calendario de reservas</Text>
          </TouchableOpacity>
        </View>

        {/* Información básica */}
        <View style={styles.infoSection}>
          <View style={styles.titleRow}>
            <Text style={styles.vehicleName}>{vehicle.vehicleName}</Text>
            <Text style={styles.vehicleYear}>{vehicle.year}</Text>
          </View>
          
          <Text style={styles.vehicleModel}>{vehicle.model} • {getBrandName()}</Text>
          
          <View style={styles.quickInfoRow}>
            <View style={styles.quickInfoItem}>
              <Ionicons name="people" size={20} color="#3D83D2" />
              <Text style={styles.quickInfoText}>{vehicle.capacity} personas</Text>
            </View>
            <View style={styles.quickInfoItem}>
              <Ionicons name="car-sport" size={20} color="#3D83D2" />
              <Text style={styles.quickInfoText}>{vehicle.vehicleClass}</Text>
            </View>
            <View style={styles.quickInfoItem}>
              <Ionicons name="color-palette" size={20} color="#3D83D2" />
              <Text style={styles.quickInfoText}>{vehicle.color}</Text>
            </View>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Precio por día</Text>
            <Text style={styles.priceValue}>${vehicle.dailyPrice?.toFixed(2)}</Text>
          </View>
        </View>

        {/* Botón de descarga de contrato */}
        <View style={styles.downloadButtonSection}>
          <TouchableOpacity style={styles.downloadButton} onPress={handleDownloadConfirm}>
            <Ionicons name="download" size={24} color="#27ae60" />
            <Text style={styles.downloadButtonText}>Descargar contrato</Text>
          </TouchableOpacity>
        </View>

        {/* Detalles técnicos */}
        <View style={styles.technicalSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="settings" size={24} color="#3D83D2" />
            <Text style={styles.sectionTitle}>Detalles técnicos</Text>
          </View>

          <View style={styles.detailsGrid}>
            {!editMode ? (
              // Modo vista
              <>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Placa</Text>
                  <Text style={styles.detailValue}>{vehicle.plate}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Número de motor</Text>
                  <Text style={styles.detailValue}>{vehicle.engineNumber}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Número de chasis</Text>
                  <Text style={styles.detailValue}>{vehicle.chassisNumber}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>VIN</Text>
                  <Text style={styles.detailValue}>{vehicle.vinNumber}</Text>
                </View>
              </>
            ) : (
              // Modo edición - Solo campos técnicos no editables en vista
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Placa</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.plate}
                    onChangeText={(text) => updateFormField('plate', text)}
                    placeholder="Placa del vehículo"
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Número de motor</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.engineNumber}
                    onChangeText={(text) => updateFormField('engineNumber', text)}
                    placeholder="Número de motor"
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Número de chasis</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.chassisNumber}
                    onChangeText={(text) => updateFormField('chassisNumber', text)}
                    placeholder="Número de chasis"
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>VIN</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.vinNumber}
                    onChangeText={(text) => updateFormField('vinNumber', text)}
                    placeholder="Número VIN"
                  />
                </View>
              </>
            )}
          </View>
        </View>

        {/* Sección de edición */}
        {editMode && (
          <View style={styles.editSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="create" size={24} color="#3D83D2" />
              <Text style={styles.sectionTitle}>Editar información</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Nombre del vehículo</Text>
                <TextInput
                  style={styles.input}
                  value={formData.vehicleName}
                  onChangeText={(text) => updateFormField('vehicleName', text)}
                  placeholder="Nombre del vehículo"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Modelo</Text>
                <TextInput
                  style={styles.input}
                  value={formData.model}
                  onChangeText={(text) => updateFormField('model', text)}
                  placeholder="Modelo"
                />
              </View>

              <View style={styles.rowContainer}>
                <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>Año</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.year}
                    onChangeText={(text) => updateFormField('year', text)}
                    placeholder="Año"
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.inputContainer, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Capacidad</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.capacity}
                    onChangeText={(text) => updateFormField('capacity', text)}
                    placeholder="Capacidad"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.rowContainer}>
                <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>Color</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.color}
                    onChangeText={(text) => updateFormField('color', text)}
                    placeholder="Color"
                  />
                </View>
                <View style={[styles.inputContainer, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Precio por día</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.dailyPrice}
                    onChangeText={(text) => updateFormField('dailyPrice', text)}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Marca</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.brandId}
                    onValueChange={(value) => updateFormField('brandId', value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Seleccionar marca..." value="" />
                    {brands.map(brand => (
                      <Picker.Item key={brand._id} label={brand.name} value={brand._id} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.rowContainer}>
                <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>Tipo de vehículo</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={formData.vehicleClass}
                      onValueChange={(value) => updateFormField('vehicleClass', value)}
                      style={styles.picker}
                    >
                      {vehicleTypes.map(type => (
                        <Picker.Item key={type.value} label={type.label} value={type.value} />
                      ))}
                    </Picker>
                  </View>
                </View>
                <View style={[styles.inputContainer, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Estado</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={formData.status}
                      onValueChange={(value) => updateFormField('status', value)}
                      style={styles.picker}
                    >
                      {statusOptions.map(status => (
                        <Picker.Item key={status.value} label={status.label} value={status.value} />
                      ))}
                    </Picker>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Botones de acción */}
        <View style={styles.actionSection}>
          {!editMode ? (
            <TouchableOpacity style={styles.editButton} onPress={toggleEditMode}>
              <Ionicons name="create" size={24} color="#fff" />
              <Text style={styles.editButtonText}>Editar vehículo</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.editActionsContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={toggleEditMode}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveButton, (!isFormValid() || updating) && styles.saveButtonDisabled]} 
                onPress={handleUpdateConfirm}
                disabled={!isFormValid() || updating}
              >
                {updating ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={24} color="#fff" />
                    <Text style={styles.saveButtonText}>Guardar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity 
            style={[styles.deleteButton, deleting && styles.deleteButtonDisabled]} 
            onPress={handleDeleteConfirm}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="trash" size={24} color="#fff" />
                <Text style={styles.deleteButtonText}>Eliminar vehículo</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modales */}
      <ConfirmModal
        visible={showConfirmModal}
        type={confirmModalType}
        title={
          confirmModalType === 'update' ? '¿Actualizar vehículo?' :
          confirmModalType === 'delete' ? '¿Eliminar vehículo?' :
          '¿Descargar contrato?'
        }
        message={
          confirmModalType === 'update' ? 'Se guardarán todos los cambios realizados' :
          confirmModalType === 'delete' ? 'Esta acción no se puede deshacer' :
          'Se descargará el contrato de arrendamiento'
        }
        onConfirm={executeAction}
        onClose={() => setShowConfirmModal(false)}
        loading={updating || deleting}
      />

      <SuccessModal
        visible={showSuccessModal}
        type={successModalType}
        onHide={handleSuccessHide}
      />

      {/* Modal de selección de imagen */}
      <Modal
        visible={showImageEditor}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowImageEditor(false)}
      >
        <View style={styles.imageModalTransparentContainer}>
          <View style={styles.imageModalContent}>
            <View style={styles.imageModalHeader}>
              <Text style={styles.imageModalTitle}>
                {editingImageType === 'main' ? 'Cambiar vista principal' :
                 editingImageType === 'side' ? 'Cambiar vista lateral' :
                 'Cambiar imagen de galería'}
              </Text>
              <TouchableOpacity 
                onPress={() => setShowImageEditor(false)}
                style={styles.imageModalCloseButton}
              >
                <Ionicons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>
            
          <View style={styles.imageModalOptions}>
            <TouchableOpacity 
              style={styles.imageOptionButton}
              onPress={() => {
                // Aquí implementarías la lógica para abrir la cámara
                Alert.alert('Funcionalidad pendiente', 'La función de cámara se implementará próximamente');
              }}
            >
              <Ionicons name="camera" size={32} color="#3D83D2" />
              <Text style={styles.imageOptionText}>Tomar foto</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.imageOptionButton}
              onPress={() => {
                // Aquí implementarías la lógica para seleccionar de galería
                Alert.alert('Funcionalidad pendiente', 'La función de galería se implementará próximamente');
              }}
            >
              <Ionicons name="images" size={32} color="#3D83D2" />
              <Text style={styles.imageOptionText}>Seleccionar de galería</Text>
            </TouchableOpacity>
          </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#3D83D2',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    padding: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#3D83D2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Header styles
  headerContainer: {
    backgroundColor: 'transparent',
    marginBottom: 8,
  },
  headerBg: {
    backgroundColor: '#3D83D2',
    height: 100,
    overflow: 'hidden',
    position: 'relative',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 28 : 12,
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
  scrollContent: {
    padding: 18,
    paddingTop: 0,
    paddingBottom: 40,
  },
  // Image section - Carrusel de imágenes mejorado
  imageSection: {
    backgroundColor: '#fff',
    marginBottom: 18,
    borderRadius: 0,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
    overflow: 'hidden',
  },
  carouselContainer: {
    position: 'relative',
  },
  imageCarousel: {
    height: Math.min(height * 0.4, 320), // Altura proporcional, máximo 320
  },
  imageSlide: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    position: 'relative',
    paddingHorizontal: 10,
  },
  carouselImage: {
    width: width - 20, // Ancho ajustado para compensar el padding
    height: Math.min(height * 0.3, 250), // Altura proporcional, máximo 250
    overflow: 'hidden', // Esto es importante para que el borderRadius funcione en las imágenes
  },
  imageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(248, 249, 250, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  imageTypeLabel: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
  },
  // Controles de navegación del carrusel
  carouselNavButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -25 }],
    backgroundColor: 'rgba(61,131,210,0.8)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  carouselNavLeft: {
    left: 16,
  },
  carouselNavRight: {
    right: 16,
  },
  // Indicadores de página
  pageIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  pageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(61,131,210,0.3)',
    marginHorizontal: 4,
  },
  activePageIndicator: {
    backgroundColor: '#3D83D2',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  // Contador de imágenes
  imageCounter: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
    zIndex: 15,
  },
  imageCounterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Miniaturas navegables
  thumbnailContainer: {
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  thumbnailContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  thumbnail: {
    width: 80,
    marginRight: 12,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeThumbnail: {
    borderColor: '#3D83D2',
  },
  thumbnailImage: {
    width: '100%',
    height: 60,
  },
  thumbnailLabel: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  thumbnailLabelText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  // Estado sin imágenes
  noImageContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  noImageText: {
    marginTop: 12,
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  // Botón de edición de imagen (actualizado)
  editImageButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(61,131,210,0.9)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  imageLabelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  mainImageContainer: {
    height: 250,
    position: 'relative',
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainImage: {
    width: '90%',
    height: '80%',
    borderRadius: 12,
  },
  imageLabel: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
  },
  imageLabelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
  },
  Disponible: {
    backgroundColor: 'rgba(46,204,113,0.9)',
  },
  Reservado: {
    backgroundColor: 'rgba(231,76,60,0.9)',
  },
  Mantenimiento: {
    backgroundColor: 'rgba(241,196,15,0.9)',
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  DisponibleText: {
    color: '#fff',
  },
  ReservadoText: {
    color: '#fff',
  },
  MantenimientoText: {
    color: '#fff',
  },
  // Info section
  infoSection: {
    backgroundColor: '#fff',
    marginHorizontal: 18,
    marginBottom: 18,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  vehicleName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  vehicleYear: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3D83D2',
  },
  vehicleModel: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 16,
  },
  quickInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  quickInfoText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#34495e',
  },
  priceContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  // Action buttons
  calendarButtonSection: {
    marginHorizontal: 18,
    marginBottom: 18,
  },
  downloadButtonSection: {
    marginHorizontal: 18,
    marginBottom: 18,
  },
  actionButtonsSection: {
    flexDirection: 'row',
    marginHorizontal: 18,
    marginBottom: 18,
    gap: 12,
  },
  calendarButton: {
    backgroundColor: '#3D83D2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#3D83D2',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  calendarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  downloadButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#27ae60',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  downloadButtonText: {
    color: '#27ae60',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Technical section
  technicalSection: {
    backgroundColor: '#fff',
    marginHorizontal: 18,
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
  detailsGrid: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  detailLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
  },
  // Edit section
  editSection: {
    backgroundColor: '#fff',
    marginHorizontal: 18,
    marginBottom: 18,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  formContainer: {
    gap: 16,
  },
  inputContainer: {
    marginBottom: 8,
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
  },
  pickerContainer: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
  },
  picker: {
    height: 50,
  },
  rowContainer: {
    flexDirection: 'row',
  },
  // Action section
  actionSection: {
    marginHorizontal: 18,
    marginBottom: 18,
    gap: 12,
  },
  editButton: {
    backgroundColor: '#3498db',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#3498db',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  editActionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#bdc3c7',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#7f8c8d',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
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
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#e74c3c',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  deleteButtonDisabled: {
    backgroundColor: '#bdc3c7',
    shadowOpacity: 0,
    elevation: 0,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Image modal styles
  imageModalTransparentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  imageModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  imageModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 15,
  },
  imageModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  imageModalCloseButton: {
    padding: 5,
  },
  imageModalOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  imageOptionButton: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    backgroundColor: '#f8f9fa',
    minWidth: 120,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  imageOptionText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
});
