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
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';

const { width, height } = Dimensions.get('window');

export default function AddEmployeeModal({ visible, onClose, onConfirm }) {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    contrasena: '',
    dui: '',
    telefono: '',
    rol: 'Empleado',
    foto: '',
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permisos necesarios', 'Se necesitan permisos para acceder a la galería de fotos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        handleInputChange('foto', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permisos necesarios', 'Se necesitan permisos para acceder a la cámara.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        handleInputChange('foto', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error al tomar foto:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Seleccionar imagen',
      'Elige una opción',
      [
        {
          text: 'Cámara',
          onPress: takePhoto,
        },
        {
          text: 'Galería',
          onPress: pickImage,
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!formData.nombre.trim() || !formData.email.trim()) {
      Alert.alert('Error', 'Por favor completa los campos obligatorios (nombre y email)');
      return;
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    // Validación de teléfono (formato salvadoreño)
    if (formData.telefono.trim()) {
      const phoneRegex = /^\d{4}[-\s]?\d{4}$/;
      if (!phoneRegex.test(formData.telefono.replace(/\s/g, ''))) {
        Alert.alert('Error', 'El teléfono debe tener el formato 1234-5678 o 12345678');
        return;
      }
    }

    // Validación de DUI (formato salvadoreño)
    if (formData.dui.trim()) {
      const duiRegex = /^\d{8}[-]?\d{1}$/;
      if (!duiRegex.test(formData.dui.replace(/\s/g, ''))) {
        Alert.alert('Error', 'El DUI debe tener el formato 12345678-9');
        return;
      }
    }

    // Validación de contraseña mínima
    if (formData.contrasena.trim() && formData.contrasena.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      await onConfirm(formData);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error al guardar empleado:', error);
      
      // Manejar diferentes tipos de errores
      let errorMessage = 'Error desconocido al guardar el empleado';
      
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
      nombre: '',
      email: '',
      contrasena: '',
      dui: '',
      telefono: '',
      rol: 'Empleado',
      foto: '',
    });
    onClose();
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        nombre: '',
        email: '',
        contrasena: '',
        dui: '',
        telefono: '',
        rol: 'Empleado',
        foto: '',
      });
      onClose();
    }
  };

  const roles = ['Administrador', 'Gestor', 'Empleado'];

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
            <Text style={styles.successTitle}>¡Empleado guardado!</Text>
            <Text style={styles.successMessage}>El empleado se ha guardado satisfactoriamente</Text>
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
              <Text style={styles.title}>Añadir empleado</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              <View style={styles.iconContainer}>
                <TouchableOpacity 
                  style={styles.photoUploadButton}
                  onPress={showImageOptions}
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
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Nombre del empleado *</Text>
                  <TextInput
                    style={[styles.input, isLoading && styles.disabledInput]}
                    placeholder="Carlos Martínez"
                    value={formData.nombre}
                    onChangeText={(value) => handleInputChange('nombre', value)}
                    autoCapitalize="words"
                    editable={!isLoading}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Correo electrónico *</Text>
                  <TextInput
                    style={[styles.input, isLoading && styles.disabledInput]}
                    placeholder="carlos.martinez@empresa.com"
                    value={formData.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Contraseña</Text>
                  <TextInput
                    style={[styles.input, isLoading && styles.disabledInput]}
                    placeholder="••••••••••••"
                    value={formData.contrasena}
                    onChangeText={(value) => handleInputChange('contrasena', value)}
                    secureTextEntry={true}
                    editable={!isLoading}
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.label}>DUI</Text>
                    <TextInput
                      style={[styles.input, isLoading && styles.disabledInput]}
                      placeholder="123456789-0"
                      value={formData.dui}
                      onChangeText={(value) => handleInputChange('dui', value)}
                      editable={!isLoading}
                    />
                  </View>

                  <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.label}>Rol</Text>
                    <View style={[styles.pickerContainer, isLoading && styles.disabledInput]}>
                      <Picker
                        selectedValue={formData.rol}
                        onValueChange={(value) => handleInputChange('rol', value)}
                        style={styles.picker}
                        enabled={!isLoading}
                      >
                        {roles.map((rol) => (
                          <Picker.Item key={rol} label={rol} value={rol} />
                        ))}
                      </Picker>
                    </View>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Teléfono</Text>
                  <TextInput
                    style={[styles.input, isLoading && styles.disabledInput]}
                    placeholder="1234-5678"
                    value={formData.telefono}
                    onChangeText={(value) => handleInputChange('telefono', value)}
                    keyboardType="phone-pad"
                    editable={!isLoading}
                  />
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
  },
  picker: {
    height: 50,
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
});