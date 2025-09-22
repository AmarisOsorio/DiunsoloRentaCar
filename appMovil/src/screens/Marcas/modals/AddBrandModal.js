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
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const { width, height } = Dimensions.get('window');

export default function AddBrandModal({ visible, onClose, onConfirm }) {
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    country: '',
    established: '',
    description: '',
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const pickImage = async () => {
    // Pedir permisos
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permisos necesarios', 'Se necesitan permisos para acceder a la galería de fotos.');
      return;
    }

    // Abrir selector de imágenes
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['image'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      handleInputChange('logo', result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    // Pedir permisos de cámara
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permisos necesarios', 'Se necesitan permisos para acceder a la cámara.');
      return;
    }

    // Abrir cámara
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      handleInputChange('logo', result.assets[0].uri);
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

  const handleConfirm = () => {
    if (formData.name.trim()) {
      onConfirm({
        ...formData,
        established: formData.established ? parseInt(formData.established) : new Date().getFullYear(),
      });
      setFormData({
        name: '',
        logo: '',
        country: '',
        established: '',
        description: '',
      });
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      logo: '',
      country: '',
      established: '',
      description: '',
    });
    onClose();
  };

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
              <Text style={styles.title}>Agregar marca</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              <View style={styles.iconContainer}>
                <View style={styles.addIcon}>
                  <Ionicons name="add" size={32} color="white" />
                </View>
              </View>

              <Text style={styles.subtitle}>Agregar marca</Text>
              <Text style={styles.description}>
                Llena los datos para crear una nueva marca
              </Text>

              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Logo de marca</Text>
                  <View style={styles.logoUploadContainer}>
                    <TouchableOpacity 
                      style={styles.logoUploadButton}
                      onPress={showImageOptions}
                    >
                      {formData.logo ? (
                        <Image source={{ uri: formData.logo }} style={styles.logoPreview} />
                      ) : (
                        <Ionicons name="cloud-upload-outline" size={32} color="#5B9BD5" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Nombre</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nombre de la marca"
                    value={formData.name}
                    onChangeText={(value) => handleInputChange('name', value)}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={handleConfirm}
              >
                <Text style={styles.confirmButtonText}>Guardar</Text>
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
    maxHeight: height * 0.85,
    minHeight: height * 0.6,
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
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  addIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#5B9BD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
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
  logoUploadContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoUploadButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0F8FF',
    borderWidth: 2,
    borderColor: '#5B9BD5',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoPreview: {
    width: 96,
    height: 96,
    borderRadius: 48,
    resizeMode: 'cover',
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
    backgroundColor: '#95A5A6',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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