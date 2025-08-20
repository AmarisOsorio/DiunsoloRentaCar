import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';

const { width, height } = Dimensions.get('window');

export default function ClientDetailsModal({ visible, cliente, onClose, onUpdate, isEditing = false }) {
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    birthDate: new Date(),
    licenseFront: '',
    licenseBack: '',
    passportFront: '',
    passportBack: '',
    foto: '',
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (cliente) {
      setFormData({
        name: cliente.name || '',
        lastName: cliente.lastName || '',
        email: cliente.email || '',
        password: cliente.password || '',
        phone: cliente.phone || '',
        birthDate: cliente.birthDate ? new Date(cliente.birthDate) : new Date(),
        licenseFront: cliente.licenseFront || '',
        licenseBack: cliente.licenseBack || '',
        passportFront: cliente.passportFront || '',
        passportBack: cliente.passportBack || '',
        foto: cliente.foto || '',
      });
    }
  }, [cliente]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const pickImage = async (field) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permisos necesarios', 'Se necesitan permisos para acceder a la galería de fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: field === 'foto' ? [1, 1] : [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      handleInputChange(field, result.assets[0].uri);
    }
  };

  const takePhoto = async (field) => {
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

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        birthDate: selectedDate,
      }));
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleUpdate = () => {
    if (formData.name.trim() && formData.lastName.trim() && formData.email.trim()) {
      onUpdate(formData);
      setShowSuccessModal(true);
    } else {
      Alert.alert('Error', 'Por favor completa los campos obligatorios');
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    onClose();
  };

  const getInitials = (name, lastName) => {
    return ((name || '').charAt(0) + (lastName || '').charAt(0))
      .toUpperCase();
  };

  const renderDocumentImage = (imageUri, placeholder) => {
    if (imageUri) {
      return (
        <Image source={{ uri: imageUri }} style={styles.documentImage} />
      );
    }
    return (
      <View style={styles.documentPlaceholder}>
        <Text style={styles.documentPlaceholderText}>{placeholder}</Text>
      </View>
    );
  };

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
            <Text style={styles.successTitle}>¡Cliente actualizado!</Text>
            <Text style={styles.successMessage}>El cliente se actualizó satisfactoriamente</Text>
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
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.modalContainer}>
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="chevron-back" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.title}>Detalles del Cliente</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              <View style={styles.avatarContainer}>
                {isEditing ? (
                  <TouchableOpacity 
                    style={styles.avatarButton}
                    onPress={() => showImageOptions('foto')}
                  >
                    {formData.foto ? (
                      <Image source={{ uri: formData.foto }} style={styles.avatar} />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>
                          {getInitials(cliente?.name, cliente?.lastName)}
                        </Text>
                      </View>
                    )}
                    <View style={styles.cameraOverlay}>
                      <Ionicons name="camera" size={20} color="white" />
                    </View>
                  </TouchableOpacity>
                ) : (
                  formData.foto ? (
                    <Image source={{ uri: formData.foto }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarText}>
                        {getInitials(cliente?.name, cliente?.lastName)}
                      </Text>
                    </View>
                  )
                )}
              </View>

              <View style={styles.formContainer}>
                <View style={styles.row}>
                  <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.label}>Nombre</Text>
                    <TextInput
                      style={[styles.input, !isEditing && styles.disabledInput]}
                      value={formData.name}
                      onChangeText={(value) => handleInputChange('name', value)}
                      editable={isEditing}
                      placeholder="Nombre"
                    />
                  </View>

                  <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.label}>Apellido</Text>
                    <TextInput
                      style={[styles.input, !isEditing && styles.disabledInput]}
                      value={formData.lastName}
                      onChangeText={(value) => handleInputChange('lastName', value)}
                      editable={isEditing}
                      placeholder="Apellido"
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Correo electrónico</Text>
                  <TextInput
                    style={[styles.input, !isEditing && styles.disabledInput]}
                    value={formData.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    editable={isEditing}
                    placeholder="correo@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Contraseña</Text>
                  <TextInput
                    style={[styles.input, !isEditing && styles.disabledInput]}
                    value={formData.password}
                    onChangeText={(value) => handleInputChange('password', value)}
                    editable={isEditing}
                    secureTextEntry={true}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Teléfono</Text>
                  <TextInput
                    style={[styles.input, !isEditing && styles.disabledInput]}
                    value={formData.phone}
                    onChangeText={(value) => handleInputChange('phone', value)}
                    editable={isEditing}
                    placeholder="0000-0000"
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Fecha de nacimiento</Text>
                  {isEditing ? (
                    <TouchableOpacity
                      style={styles.dateInput}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Text style={styles.dateText}>
                        {formatDate(formData.birthDate)}
                      </Text>
                      <Ionicons name="calendar" size={20} color="#666" />
                    </TouchableOpacity>
                  ) : (
                    <TextInput
                      style={[styles.input, styles.disabledInput]}
                      value={formatDate(formData.birthDate)}
                      editable={false}
                    />
                  )}
                  {showDatePicker && (
                    <DateTimePicker
                      value={formData.birthDate}
                      mode="date"
                      display="default"
                      onChange={handleDateChange}
                      maximumDate={new Date()}
                    />
                  )}
                </View>

                <Text style={styles.sectionTitle}>Documentos</Text>

                <View style={styles.row}>
                  <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.label}>Licencia (Frente)</Text>
                    {isEditing ? (
                      <TouchableOpacity 
                        style={styles.documentButton}
                        onPress={() => showImageOptions('licenseFront')}
                      >
                        <Ionicons name="camera" size={20} color="#5B9BD5" />
                        <Text style={styles.documentButtonText}>
                          {formData.licenseFront ? 'Cambiar' : 'Subir'}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      renderDocumentImage(formData.licenseFront, 'Sin imagen')
                    )}
                  </View>

                  <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.label}>Licencia (Reverso)</Text>
                    {isEditing ? (
                      <TouchableOpacity 
                        style={styles.documentButton}
                        onPress={() => showImageOptions('licenseBack')}
                      >
                        <Ionicons name="camera" size={20} color="#5B9BD5" />
                        <Text style={styles.documentButtonText}>
                          {formData.licenseBack ? 'Cambiar' : 'Subir'}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      renderDocumentImage(formData.licenseBack, 'Sin imagen')
                    )}
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.label}>Pasaporte (Frente)</Text>
                    {isEditing ? (
                      <TouchableOpacity 
                        style={styles.documentButton}
                        onPress={() => showImageOptions('passportFront')}
                      >
                        <Ionicons name="camera" size={20} color="#5B9BD5" />
                        <Text style={styles.documentButtonText}>
                          {formData.passportFront ? 'Cambiar' : 'Subir'}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      renderDocumentImage(formData.passportFront, 'Sin imagen')
                    )}
                  </View>

                  <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.label}>Pasaporte (Reverso)</Text>
                    {isEditing ? (
                      <TouchableOpacity 
                        style={styles.documentButton}
                        onPress={() => showImageOptions('passportBack')}
                      >
                        <Ionicons name="camera" size={20} color="#5B9BD5" />
                        <Text style={styles.documentButtonText}>
                          {formData.passportBack ? 'Cambiar' : 'Subir'}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      renderDocumentImage(formData.passportBack, 'Sin imagen')
                    )}
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              {isEditing && (
                <TouchableOpacity
                  style={[styles.button, styles.updateButton]}
                  onPress={handleUpdate}
                >
                  <Text style={styles.updateButtonText}>Actualizar</Text>
                </TouchableOpacity>
              )}
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
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  avatarButton: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    resizeMode: 'cover',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#666',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#5B9BD5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
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
    color: '#666',
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
  },
  documentButtonText: {
    color: '#5B9BD5',
    fontSize: 14,
    fontWeight: '500',
  },
  documentImage: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  documentPlaceholder: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  documentPlaceholderText: {
    color: '#999',
    fontSize: 12,
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
  updateButton: {
    backgroundColor: '#5B9BD5',
  },
  updateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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