import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const { width, height } = Dimensions.get('window');

export default function AddClientModal({ visible, onClose, onConfirm }) {
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    birthDate: '',
    licenseFront: '',
    licenseBack: '',
    passportFront: '',
    passportBack: '',
    foto: '',
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState({ day: '', month: '', year: '' });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const showDatePickerModal = () => {
    // Inicializar con fecha actual o la fecha existente
    if (formData.birthDate && formData.birthDate.includes('/')) {
      const [day, month, year] = formData.birthDate.split('/');
      setTempDate({ day, month, year });
    } else {
      const today = new Date();
      setTempDate({ 
        day: '', 
        month: '', 
        year: (today.getFullYear() - 25).toString() 
      });
    }
    setShowDatePicker(true);
  };

  const handleDateConfirm = () => {
    const { day, month, year } = tempDate;
    
    if (!day || !month || !year) {
      Alert.alert('Error', 'Por favor completa todos los campos de fecha');
      return;
    }

    // Validaciones básicas
    const dayNum = parseInt(day);
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (dayNum < 1 || dayNum > 31) {
      Alert.alert('Error', 'El día debe estar entre 1 y 31');
      return;
    }

    if (monthNum < 1 || monthNum > 12) {
      Alert.alert('Error', 'El mes debe estar entre 1 y 12');
      return;
    }

    if (yearNum < 1900 || yearNum > new Date().getFullYear()) {
      Alert.alert('Error', 'El año debe estar entre 1900 y el año actual');
      return;
    }

    // Verificar que la fecha sea válida
    const date = new Date(yearNum, monthNum - 1, dayNum);
    if (date.getFullYear() !== yearNum || date.getMonth() !== monthNum - 1 || date.getDate() !== dayNum) {
      Alert.alert('Error', 'La fecha ingresada no es válida');
      return;
    }

    // Verificar edad mínima
    const today = new Date();
    let age = today.getFullYear() - yearNum;
    const monthDiff = today.getMonth() - (monthNum - 1);
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dayNum)) {
      age--;
    }
    
    if (age < 18) {
      Alert.alert('Error', 'El cliente debe ser mayor de 18 años');
      return;
    }

    // Formatear fecha
    const formattedDate = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    handleInputChange('birthDate', formattedDate);
    setShowDatePicker(false);
  };

  const pickImage = async (field) => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permisos necesarios', 'Se necesitan permisos para acceder a la galería de fotos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['image'],
        allowsEditing: true,
        aspect: field === 'foto' ? [1, 1] : [4, 3],
        quality: 0.7,
      });

      if (!result.canceled) {
        handleInputChange(field, result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const takePhoto = async (field) => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permisos necesarios', 'Se necesitan permisos para acceder a la cámara.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: field === 'foto' ? [1, 1] : [4, 3],
        quality: 0.7,
      });

      if (!result.canceled) {
        handleInputChange(field, result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error al tomar foto:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  const showImageOptions = (field) => {
    Alert.alert(
      'Seleccionar imagen',
      'Elige una opción',
      [
        {
          text: 'Cámara',
          onPress: () => takePhoto(field),
        },
        {
          text: 'Galería',
          onPress: () => pickImage(field),
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.lastName.trim() || !formData.email.trim() || 
        !formData.password.trim() || !formData.phone.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios (nombre, apellido, email, contraseña y teléfono)');
      return;
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    // Validación de teléfono (formato salvadoreño)
    const phoneRegex = /^[267]\d{3}[-\s]?\d{4}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      Alert.alert('Error', 'El teléfono debe tener el formato 2XXX-XXXX, 6XXX-XXXX o 7XXX-XXXX');
      return;
    }

    // Validación de contraseña mínima
    if (formData.password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // Validación de fecha de nacimiento si se proporciona
    if (formData.birthDate && formData.birthDate.includes('/')) {
      const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
      if (!dateRegex.test(formData.birthDate)) {
        Alert.alert('Error', 'La fecha debe tener el formato DD/MM/AAAA');
        return;
      }
      
      // Validar que la fecha sea válida
      const [day, month, year] = formData.birthDate.split('/');
      const date = new Date(year, month - 1, day);
      const today = new Date();
      
      if (date.getFullYear() != year || date.getMonth() != month - 1 || date.getDate() != day) {
        Alert.alert('Error', 'Por favor ingresa una fecha válida');
        return;
      }
      
      if (date > today) {
        Alert.alert('Error', 'La fecha de nacimiento no puede ser futura');
        return;
      }
      
      // Verificar edad mínima (18 años)
      const age = today.getFullYear() - date.getFullYear();
      const monthDiff = today.getMonth() - date.getMonth();
      if (age < 18 || (age === 18 && monthDiff < 0) || (age === 18 && monthDiff === 0 && today.getDate() < date.getDate())) {
        Alert.alert('Error', 'El cliente debe ser mayor de 18 años');
        return;
      }
    }

    setIsLoading(true);

    try {
      // Convertir fecha si está en formato DD/MM/AAAA
      let birthDateFormatted = formData.birthDate;
      if (formData.birthDate && formData.birthDate.includes('/')) {
        const [day, month, year] = formData.birthDate.split('/');
        birthDateFormatted = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }

      const clientDataToSend = {
        ...formData,
        birthDate: birthDateFormatted || new Date().toISOString().split('T')[0],
      };

      await onConfirm(clientDataToSend);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      
      // Manejar diferentes tipos de errores
      let errorMessage = 'Error desconocido al guardar el cliente';
      
      if (error.message) {
        if (error.message.includes('email')) {
          errorMessage = 'El email ya está en uso o es inválido';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Error de conexión. Verifica tu internet e inténtalo de nuevo';
        } else if (error.message.includes('400')) {
          errorMessage = 'Datos inválidos. Verifica la información ingresada';
        } else if (error.message.includes('500')) {
          errorMessage = 'Error del servidor. Inténtalo más tarde';
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert(
        'Error al guardar', 
        errorMessage,
        [
          {
            text: 'Entendido',
            style: 'default'
          }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    setFormData({
      name: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      birthDate: '',
      licenseFront: '',
      licenseBack: '',
      passportFront: '',
      passportBack: '',
      foto: '',
    });
    onClose();
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        name: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        birthDate: '',
        licenseFront: '',
        licenseBack: '',
        passportFront: '',
        passportBack: '',
        foto: '',
      });
      onClose();
    }
  };

  // Modal de selector de fecha personalizado
  if (showDatePicker) {
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.datePickerContainer}>
            <Text style={styles.datePickerTitle}>Fecha de nacimiento</Text>
            
            <View style={styles.dateInputsContainer}>
              <View style={styles.dateInputGroup}>
                <Text style={styles.dateInputLabel}>Día</Text>
                <TextInput
                  style={styles.dateInputField}
                  value={tempDate.day}
                  onChangeText={(value) => setTempDate(prev => ({ ...prev, day: value }))}
                  placeholder="DD"
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>
              
              <View style={styles.dateInputGroup}>
                <Text style={styles.dateInputLabel}>Mes</Text>
                <TextInput
                  style={styles.dateInputField}
                  value={tempDate.month}
                  onChangeText={(value) => setTempDate(prev => ({ ...prev, month: value }))}
                  placeholder="MM"
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>
              
              <View style={styles.dateInputGroup}>
                <Text style={styles.dateInputLabel}>Año</Text>
                <TextInput
                  style={styles.dateInputField}
                  value={tempDate.year}
                  onChangeText={(value) => setTempDate(prev => ({ ...prev, year: value }))}
                  placeholder="AAAA"
                  keyboardType="numeric"
                  maxLength={4}
                />
              </View>
            </View>
            
            <View style={styles.datePickerButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={handleDateConfirm}
              >
                <Text style={styles.confirmButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  // Modal de éxito
  if (showSuccessModal) {
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleSuccessClose}
      >
        <View style={styles.overlay}>
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={32} color="white" />
            </View>
            <Text style={styles.successTitle}>¡Cliente guardado!</Text>
            <Text style={styles.successMessage}>El cliente se ha guardado satisfactoriamente</Text>
            <TouchableOpacity
              style={styles.okButton}
              onPress={handleSuccessClose}
            >
              <Text style={styles.okButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.modalContainer}>
            <View style={styles.header}>
              <TouchableOpacity onPress={handleClose} disabled={isLoading}>
                <Ionicons name="chevron-back" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.title}>Añadir cliente</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              <View style={styles.iconContainer}>
                <TouchableOpacity 
                  style={styles.photoUploadButton}
                  onPress={() => showImageOptions('foto')}
                  disabled={isLoading}
                >
                  {formData.foto ? (
                    <Image source={{ uri: formData.foto }} style={styles.photoPreview} />
                  ) : (
                    <Ionicons name="camera" size={32} color="#5B9BD5" />
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.formContainer}>
                <View style={styles.row}>
                  <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.label}>Nombre *</Text>
                    <TextInput
                      style={[styles.input, isLoading && styles.disabledInput]}
                      placeholder="María"
                      value={formData.name}
                      onChangeText={(value) => handleInputChange('name', value)}
                      autoCapitalize="words"
                      editable={!isLoading}
                    />
                  </View>

                  <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.label}>Apellido *</Text>
                    <TextInput
                      style={[styles.input, isLoading && styles.disabledInput]}
                      placeholder="González"
                      value={formData.lastName}
                      onChangeText={(value) => handleInputChange('lastName', value)}
                      autoCapitalize="words"
                      editable={!isLoading}
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Correo electrónico *</Text>
                  <TextInput
                    style={[styles.input, isLoading && styles.disabledInput]}
                    placeholder="maria.gonzalez@email.com"
                    value={formData.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Contraseña *</Text>
                  <TextInput
                    style={[styles.input, isLoading && styles.disabledInput]}
                    placeholder="••••••••••••"
                    value={formData.password}
                    onChangeText={(value) => handleInputChange('password', value)}
                    secureTextEntry={true}
                    editable={!isLoading}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Teléfono *</Text>
                  <TextInput
                    style={[styles.input, isLoading && styles.disabledInput]}
                    placeholder="2345-6789"
                    value={formData.phone}
                    onChangeText={(value) => handleInputChange('phone', value)}
                    keyboardType="phone-pad"
                    editable={!isLoading}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Fecha de nacimiento</Text>
                  <TouchableOpacity
                    style={[styles.dateInput, isLoading && styles.disabledInput]}
                    onPress={showDatePickerModal}
                    disabled={isLoading}
                  >
                    <Text style={[styles.dateText, !formData.birthDate && styles.placeholderText]}>
                      {formData.birthDate || 'DD/MM/AAAA'}
                    </Text>
                    <Ionicons name="calendar" size={20} color="#666" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>Documentos (Opcional)</Text>

                <View style={styles.row}>
                  <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.label}>Licencia (Frente)</Text>
                    {formData.licenseFront ? (
                      <View style={styles.documentImageContainer}>
                        <Image source={{ uri: formData.licenseFront }} style={styles.documentImage} />
                        <TouchableOpacity 
                          style={styles.changeImageButton}
                          onPress={() => showImageOptions('licenseFront')}
                          disabled={isLoading}
                        >
                          <Ionicons name="camera" size={16} color="white" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity 
                        style={[styles.documentButton, isLoading && styles.disabledButton]}
                        onPress={() => showImageOptions('licenseFront')}
                        disabled={isLoading}
                      >
                        <Ionicons name="camera" size={20} color="#5B9BD5" />
                        <Text style={styles.documentButtonText}>Subir foto</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.label}>Licencia (Reverso)</Text>
                    {formData.licenseBack ? (
                      <View style={styles.documentImageContainer}>
                        <Image source={{ uri: formData.licenseBack }} style={styles.documentImage} />
                        <TouchableOpacity 
                          style={styles.changeImageButton}
                          onPress={() => showImageOptions('licenseBack')}
                          disabled={isLoading}
                        >
                          <Ionicons name="camera" size={16} color="white" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity 
                        style={[styles.documentButton, isLoading && styles.disabledButton]}
                        onPress={() => showImageOptions('licenseBack')}
                        disabled={isLoading}
                      >
                        <Ionicons name="camera" size={20} color="#5B9BD5" />
                        <Text style={styles.documentButtonText}>Subir foto</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.label}>Pasaporte (Frente)</Text>
                    {formData.passportFront ? (
                      <View style={styles.documentImageContainer}>
                        <Image source={{ uri: formData.passportFront }} style={styles.documentImage} />
                        <TouchableOpacity 
                          style={styles.changeImageButton}
                          onPress={() => showImageOptions('passportFront')}
                          disabled={isLoading}
                        >
                          <Ionicons name="camera" size={16} color="white" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity 
                        style={[styles.documentButton, isLoading && styles.disabledButton]}
                        onPress={() => showImageOptions('passportFront')}
                        disabled={isLoading}
                      >
                        <Ionicons name="camera" size={20} color="#5B9BD5" />
                        <Text style={styles.documentButtonText}>Subir foto</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.label}>Pasaporte (Reverso)</Text>
                    {formData.passportBack ? (
                      <View style={styles.documentImageContainer}>
                        <Image source={{ uri: formData.passportBack }} style={styles.documentImage} />
                        <TouchableOpacity 
                          style={styles.changeImageButton}
                          onPress={() => showImageOptions('passportBack')}
                          disabled={isLoading}
                        >
                          <Ionicons name="camera" size={16} color="white" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity 
                        style={[styles.documentButton, isLoading && styles.disabledButton]}
                        onPress={() => showImageOptions('passportBack')}
                        disabled={isLoading}
                      >
                        <Ionicons name="camera" size={20} color="#5B9BD5" />
                        <Text style={styles.documentButtonText}>Subir foto</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton, isLoading && styles.disabledButton]}
                onPress={handleClose}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.saveButton, isLoading && styles.disabledButton]}
                onPress={handleSave}
                disabled={isLoading}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="white" />
                    <Text style={styles.saveButtonText}>Guardando...</Text>
                  </View>
                ) : (
                  <Text style={styles.saveButtonText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    width: '100%',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.9,
    minHeight: height * 0.7,
  },
  header: {
    backgroundColor: '#5B9BD5',
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  photoUploadButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F8FF',
    borderWidth: 2,
    borderColor: '#5B9BD5',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoPreview: {
    width: 76,
    height: 76,
    borderRadius: 38,
    resizeMode: 'cover',
  },
  formContainer: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  disabledInput: {
    backgroundColor: '#F5F5F5',
    color: '#999',
  },
  row: {
    flexDirection: 'row',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 16,
  },
  documentButton: {
    borderWidth: 1,
    borderColor: '#5B9BD5',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F0F8FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 80,
  },
  documentButtonText: {
    color: '#5B9BD5',
    fontSize: 14,
    fontWeight: '500',
  },
  documentImageContainer: {
    position: 'relative',
    width: '100%',
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
  },
  documentImage: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  changeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#B22222',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#27AE60',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // Success Modal Styles
  successContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 32,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#27AE60',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  okButton: {
    backgroundColor: '#27AE60',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  okButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Date Picker Styles
  datePickerContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 32,
    width: width - 64,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  dateInputsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  dateInputGroup: {
    flex: 1,
  },
  dateInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  dateInputField: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    textAlign: 'center',
  },
  datePickerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmButton: {
    backgroundColor: '#5B9BD5',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});