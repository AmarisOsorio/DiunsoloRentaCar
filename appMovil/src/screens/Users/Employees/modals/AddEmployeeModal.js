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

  const validateAndSave = async () => {
    // Validar campos obligatorios
    if (!formData.nombre.trim()) {
      Alert.alert(
        'Campo obligatorio faltante', 
        'El nombre es obligatorio\n\nEjemplo: Carlos Eduardo Martínez'
      );
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert(
        'Campo obligatorio faltante', 
        'El email es obligatorio\n\nEjemplo: carlos.martinez@empresa.com'
      );
      return;
    }

    if (!formData.contrasena.trim()) {
      Alert.alert(
        'Campo obligatorio faltante', 
        'La contraseña es obligatoria\n\nDebe tener al menos 6 caracteres\nEjemplo: MiClave123'
      );
      return;
    }

    if (!formData.dui.trim()) {
      Alert.alert(
        'Campo obligatorio faltante', 
        'El DUI es obligatorio\n\nFormato requerido: 12345678-9\n(8 dígitos, guión, 1 dígito)'
      );
      return;
    }

    if (!formData.telefono.trim()) {
      Alert.alert(
        'Campo obligatorio faltante', 
        'El teléfono es obligatorio\n\nFormatos válidos:\n• 2345-6789\n• 6789-1234\n• 7890-5678\n\nDebe iniciar con 2, 6 o 7'
      );
      return;
    }

    // Validar formato de email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      Alert.alert(
        'Formato de email incorrecto', 
        'El email debe tener un formato válido\n\nEjemplos correctos:\n• usuario@empresa.com\n• carlos.martinez@gmail.com\n• admin@miempresa.sv'
      );
      return;
    }

    // Validar teléfono
    const phoneClean = formData.telefono.replace(/\s/g, '');
    if (!/^[267]\d{3}[-\s]?\d{4}$/.test(phoneClean)) {
      Alert.alert(
        'Formato de teléfono incorrecto', 
        'El teléfono debe seguir el formato salvadoreño\n\nFormatos válidos:\n• 2345-6789 (fijo)\n• 6789-1234 (móvil)\n• 7890-5678 (móvil)\n\nDebe iniciar con 2, 6 o 7 y tener 8 dígitos'
      );
      return;
    }

    // Validar DUI
    const duiClean = formData.dui.replace(/\s/g, '');
    
    // Caso especial: 9 dígitos sin guión
    if (duiClean.length === 9 && !duiClean.includes('-')) {
      Alert.alert(
        'Formato de DUI incorrecto', 
        'Falta el guión (-) en el DUI\n\nFormato correcto: 12345678-9\n\nTu DUI: ' + duiClean + '\nFormato correcto: ' + duiClean.substring(0, 8) + '-' + duiClean.substring(8)
      );
      return;
    }
    
    // Caso: números sin guión pero longitud incorrecta
    if (/^\d+$/.test(duiClean) && duiClean.length !== 9) {
      Alert.alert(
        'Formato de DUI incorrecto', 
        'El DUI debe tener exactamente 9 dígitos\n\nFormato correcto: 12345678-9\n(8 dígitos + guión + 1 dígito)\n\nTu DUI tiene ' + duiClean.length + ' dígitos'
      );
      return;
    }
    
    // Validación completa del formato
    if (!/^\d{8}[-]\d{1}$/.test(duiClean)) {
      Alert.alert(
        'Formato de DUI incorrecto', 
        'El DUI debe seguir el formato salvadoreño\n\nFormato correcto: 12345678-9\n\n• 8 dígitos\n• Un guión (-)\n• 1 dígito verificador\n\nEjemplos válidos:\n• 03456789-0\n• 12345678-9'
      );
      return;
    }

    // Validar contraseña
    if (formData.contrasena.length < 6) {
      Alert.alert(
        'Contraseña muy corta', 
        'La contraseña debe tener al menos 6 caracteres\n\nRecomendaciones:\n• Mínimo 6 caracteres\n• Combina letras y números\n\nEjemplos seguros:\n• MiClave123\n• Admin2024\n• Carlos456'
      );
      return;
    }

    // Proceder con el guardado
    setIsLoading(true);

    try {
      await onConfirm(formData);
      setShowSuccessModal(true);
    } catch (error) {
      Alert.alert(
        'Error al guardar empleado', 
        error.message,
        [{ text: 'Entendido', style: 'default' }]
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
                  <Text style={styles.label}>Contraseña *</Text>
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
                    <Text style={styles.label}>DUI *</Text>
                    <TextInput
                      style={[styles.input, isLoading && styles.disabledInput]}
                      placeholder="12345678-9"
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
                  <Text style={styles.label}>Teléfono *</Text>
                  <TextInput
                    style={[styles.input, isLoading && styles.disabledInput]}
                    placeholder="2345-6789"
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
                onPress={validateAndSave}
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