import { useState, useEffect, useRef } from 'react';
import { Dimensions, View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, Platform, StatusBar, KeyboardAvoidingView } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Picker } from '@react-native-picker/picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import SuccessVehicle from './Components/SuccessVehicle';
import useNewVehicle from './Hooks/useNewVehicle';


export default function NewVehicle({ navigation, route }) {
  //el useFocusEffect en Vehicles se encarga del refresh
  
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
    }
  };

  const handleGoBack = () => {

    if (navigation && navigation.goBack) navigation.goBack();
  };

  // Altura estimada del header fijo
  const HEADER_OFFSET_HEIGHT = Platform.select({
    ios: 110,
    android: 95,
    default: 105,
  });

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F2F2F2' }}>
        {/* StatusBar */}
        <StatusBar 
          barStyle="light-content" 
          backgroundColor="#3D83D2" 
          translucent={false} 
        />
        {/* Encabezado */}
        <StatusBar 
          backgroundColor="#3D83D2" 
          barStyle="light-content" 
          translucent={false}
          animated={true}
        />
        <View style={styles.headerContainer}>
          <View style={styles.headerBg}>
            <View style={styles.headerContent}>
              <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
                <Ionicons name="chevron-back" size={28} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Nuevo Vehículo</Text>
            </View>
            <View style={[styles.headerCurveContainer, { width: '100%' }]} pointerEvents="none">
              <Svg height="50" width="100%" viewBox="0 0 400 50" preserveAspectRatio="none">
                <Path d="M0,0 H400 V50 H0 Z" fill="#3D83D2" />
                <Path d="M0,40 Q200,0 400,40 L400,50 L0,50 Z" fill="#F2F2F2" />
              </Svg>
            </View>
          </View>
        </View>
        {/* ScrollView con paddingTop ajustado para dejar espacio al header fijo */}
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: HEADER_OFFSET_HEIGHT }
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        {/* Sección de imágenes */}
        <View style={styles.imageBox}>
          <Text style={{ color: '#3D83D2', fontSize: 13, marginBottom: 8, textAlign: 'center', fontWeight: 'bold' }}>
            Recomendado: 800x600px (rectangular)
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            {/* Imagen principal */}
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 12 }} ref={mainViewImageBoxRef}>
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
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 12 }} ref={sideImageBoxRef}>
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
            <View style={[styles.pickerContainer, fieldErrors.brandId && styles.inputError]}>
              <Picker
                ref={refs.brandId}
                selectedValue={brandId}
                onValueChange={value => {
                  setBrandId(value);
                  if (fieldErrors.brandId) setFieldErrors(prev => ({ ...prev, brandId: undefined }));
                }}
                style={styles.pickerInner}
                dropdownIconColor="#3D83D2"
              >
                <Picker.Item label="Selecciona una marca..." value="" />
                {brands.map(b => (
                  <Picker.Item key={b.value} label={b.label} value={b.value} />
                ))}
              </Picker>
            </View>
            {fieldErrors.brandId && (
              <View style={[styles.errorBox, { marginTop: 6 }]}> 
                <Ionicons name="alert-circle" size={16} color="#e74c3c" style={{ marginRight: 6 }} />
                <Text style={styles.errorText}>{fieldErrors.brandId}</Text>
              </View>
            )}
          </View>
          <View style={{ flex: 1, marginLeft: 6 }} ref={refs.vehicleClass}>
            <Text style={styles.label}>Tipo</Text>
            <View style={[styles.pickerContainer, fieldErrors.vehicleClass && styles.inputError]}>
              <Picker
                ref={refs.vehicleClass}
                selectedValue={vehicleClass}
                onValueChange={value => {
                  setVehicleClass(value);
                  if (fieldErrors.vehicleClass) setFieldErrors(prev => ({ ...prev, vehicleClass: undefined }));
                }}
                style={styles.pickerInner}
                dropdownIconColor="#3D83D2"
              >
                <Picker.Item label="Selecciona un tipo..." value="" />
                {vehicleTypes.map(t => (
                  <Picker.Item key={t.value} label={t.label} value={t.value} />
                ))}
              </Picker>
            </View>
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
            {error ? (
              <View style={[styles.errorBox, styles.globalErrorBox]}>
                <Ionicons name="warning-outline" size={20} color="#e74c3c" style={{ marginRight: 8 }} />
                <Text style={styles.errorText}>Error al enviar: {error}</Text>
              </View>
            ) : null}
            <View style={{ height: 100 }} />
          </ScrollView>
        <SuccessVehicle visible={showSuccess} message="¡Vehículo agregado exitosamente!" />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  globalErrorBox: {
    backgroundColor: '#fdebeb',
    borderColor: '#e74c3c',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
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
    marginTop: -8,
    marginBottom: 15,
    marginLeft: 2,
    borderWidth: 0,
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
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
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
  scrollContent: {
    padding: 18,
    paddingTop: 20,
    paddingBottom: 40,
  },
  imageBox: {
    backgroundColor: '#f8fbfd',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
    padding: 20,
    minHeight: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
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
    paddingTop: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imageLabel: {
    color: '#7bb0f6',
    fontWeight: '600',
    fontSize: 14,
    marginTop: 4,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 13,
    fontSize: 16,
    color: '#2561a7',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
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
    color: '#555555',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 6,
    marginLeft: 2,
  },
  picker: {
    backgroundColor: '#FFFFFF',
    color: '#2561a7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: 48,
    width: '100%',
    marginBottom: 15,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
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
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 15,
    height: 48,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  pickerInner: {
    backgroundColor: 'transparent',
    color: '#2561a7',
    width: '100%',
  },
});
