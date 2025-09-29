
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  Animated, 
  TouchableWithoutFeedback, 
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '../../Context/AuthContext';
import ConfirmLogout from './ConfirmLogout';
import SuccesLogout from './SuccesLogout';
import axios from 'axios';

// URL base de la API
const API_URL = 'https://diunsolorentacar.onrender.com';

export default function ProfilePopout({ visible, onClose, navigation, onRequestReopen, onRequestCloseProfile }) {
  const { logout, user } = useAuth();
  const [showLogoutAnim, setShowLogoutAnim] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [showConfirm, setShowConfirm] = useState(false);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(visible);
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Estados para el cambio de contraseña
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false
  });

  // Función para cambiar la contraseña
  const handleChangePassword = async () => {
    // Validaciones
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Por favor complete todos los campos');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas nuevas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      const response = await axios.put(`${API_URL}/api/employees/${user.id}`, {
        password: newPassword // Cambiado a 'password' para que coincida con el backend
      }, {
        headers: {
          'Authorization': `Bearer ${user?.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      Alert.alert('Éxito', 'Contraseña actualizada correctamente');
      // Limpiar campos y cerrar la edición
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al cambiar la contraseña. Intente nuevamente.';
      Alert.alert('Error', errorMessage);
      console.error('Error changing password:', error);
    }
  };

  // Efecto para cargar los datos del perfil
  useEffect(() => {
    if (visible) {
      fetchProfileData();
    }
  }, [visible]);

  // Función para obtener los datos del perfil desde el backend
  const fetchProfileData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!user) {
        throw new Error('No hay sesión activa');
      }

      // Configuración de la solicitud con timeout
      const config = {
        headers: {
          'Authorization': `Bearer ${user?.accessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000 // 5 segundos de timeout
      };

      // Intentar obtener datos del backend
      try {
        console.log('Intentando conectar a:', `${API_URL}/api/employees/${user.id}`);
        const response = await axios.get(`${API_URL}/api/employees/${user.id}`, config);
        
        if (response.data?.data) {
          setProfileData({
            nombre: response.data.data.name,
            rol: response.data.data.rol,
            email: response.data.data.email
          });
          return; // Si la petición es exitosa, terminamos aquí
        }
      } catch (networkError) {
        console.error('Error de red detallado:', {
          message: networkError.message,
          url: `${API_URL}/api/employees/${user.id}`,
          code: networkError.code,
          response: networkError.response?.data
        });
        
        if (networkError.code === 'ECONNREFUSED') {
          Alert.alert('Error de conexión', 'No se pudo conectar al servidor. Verifique que el servidor esté ejecutándose.');
        } else if (networkError.response?.status === 404) {
          Alert.alert('Error', 'Usuario no encontrado');
        } else {
          Alert.alert('Error de red', 'No se pudo conectar al servidor. Usando datos almacenados.');
        }
      }

      // Si llegamos aquí, significa que hubo un error con la API
      // Usamos los datos del contexto como fallback
      setProfileData({
        nombre: user.username || user.nombre || 'Usuario',
        rol: user.role || user.rol || 'Usuario',
        email: user.email || ''
      });

    } catch (error) {
      console.error('Error en fetchProfileData:', error);
      
      // Manejar diferentes tipos de errores
      if (error.response?.status === 401) {
        setError('Sesión expirada');
        setTimeout(() => logout(), 1500);
      } else if (error.code === 'ECONNABORTED') {
        setError('Tiempo de espera agotado');
      } else {
        setError('Error de conexión');
      }

      // Usar datos del contexto si están disponibles
      if (user) {
        setProfileData({
          nombre: user.nombre,
          rol: user.rol
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Sincroniza el estado interno con la prop 'visible' y maneja la reapertura
  useEffect(() => {
    if (visible) {
      setIsProfileModalVisible(true);
    } else {
      // Solo cerramos si no estamos en proceso de logout
      if (!showConfirm && !showLogoutAnim) {
        setIsProfileModalVisible(false);
      }
    }
  }, [visible, showConfirm, showLogoutAnim]);

  const handleLogout = () => {
    onClose(); // Notificamos al padre que queremos cerrar
    setIsProfileModalVisible(false);
    
    // 2. Muestra el modal de confirmación después de un breve retraso
    setTimeout(() => setShowConfirm(true), 200);
  };

  const handleCancelConfirm = () => {
    setShowConfirm(false);
    if (onRequestReopen) {
      // 3. Vuelve a abrir el modal de ProfilePopout si se cancela la acción
      setTimeout(() => onRequestReopen(), 200);
    }
  };

  const doLogout = () => {
    setShowConfirm(false);
    setShowLogoutAnim(true);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
    setTimeout(() => {
      setShowLogoutAnim(false);
      logout();
    }, 1400);
  };

  const renderPasswordSection = () => {
    if (!isChangingPassword) {
      return (
        <View style={styles.passwordRow}>
          <Text style={styles.password}>••••••••••</Text>
          <TouchableOpacity onPress={() => setIsChangingPassword(true)}>
            <View>
              <Ionicons name="pencil" size={18} color="#fff" style={styles.editIcon} />
            </View>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.passwordChangeContainer}>
        <View style={styles.passwordInputContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Nueva contraseña"
            placeholderTextColor="#B1D0FF"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showPasswords.new}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
          >
            <Ionicons
              name={showPasswords.new ? "eye-off" : "eye"}
              size={20}
              color="#B1D0FF"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.passwordInputContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Confirmar nueva contraseña"
            placeholderTextColor="#B1D0FF"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPasswords.confirm}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
          >
            <Ionicons
              name={showPasswords.confirm ? "eye-off" : "eye"}
              size={20}
              color="#B1D0FF"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.passwordButtonsContainer}>
          <TouchableOpacity
            style={[styles.passwordButton, styles.cancelButton]}
            onPress={() => {
              setIsChangingPassword(false);
              setOldPassword('');
              setNewPassword('');
              setConfirmPassword('');
            }}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.passwordButton, styles.saveButton]}
            onPress={handleChangePassword}
          >
            <Text style={styles.saveButtonText}>Guardar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <>
      <ConfirmLogout
        visible={showConfirm}
        onCancel={handleCancelConfirm}
        onConfirm={() => { setShowConfirm(false); setTimeout(doLogout, 100); }}
      />
      <SuccesLogout
        visible={showLogoutAnim}
      />
      <Modal
        // Usa el estado interno para controlar la visibilidad
        visible={isProfileModalVisible && !showLogoutAnim}
        transparent
        statusBarTranslucent
        animationType="fade"
        onRequestClose={onClose}
      >
        {/* Overlay que cierra el modal al tocar fuera */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <Animated.View
                style={[styles.card, { opacity: fadeAnim }]}
              >
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <View>
                    <Ionicons name="close" size={24} color="#fff" />
                  </View>
                </TouchableOpacity>
                <Text style={styles.title}>Mi perfil</Text>
                <View style={styles.avatarContainer}>
                  <Ionicons name="person" size={72} color="#153A8B" style={styles.avatarIcon} />
                </View>
                <Text style={styles.name}>
                  {isLoading ? 'Cargando...' : (profileData?.nombre || 'Sin nombre')}
                </Text>
                <Text style={styles.role}>
                  {isLoading ? 'Cargando...' : (profileData?.rol || 'Sin rol')}
                </Text>
                {error && (
                  <Text style={[styles.role, { color: '#ff6b6b' }]}>
                    Error al cargar el perfil
                  </Text>
                )}
                {renderPasswordSection()}
                
                <View style={styles.divider} />
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                  <Text style={styles.logoutText}>Cerrar sesión</Text>
                </TouchableOpacity>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(21, 58, 139, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  card: {
    width: 280,
    backgroundColor: '#153A8B',
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 18,
    alignItems: 'center',
    position: 'relative',
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 2,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 18,
  },
  avatarContainer: {
    backgroundColor: '#fff',
    borderRadius: 48,
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarIcon: {
    alignSelf: 'center',
  },
  name: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },
  role: {
    color: '#B1D0FF',
    fontSize: 14,
    marginBottom: 18,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    marginBottom: 2,
    marginTop: 2,
  },
  password: {
    color: '#fff',
    fontSize: 16,
    letterSpacing: 2,
    flex: 1,
  },
  editIcon: {
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#fff',
    opacity: 0.3,
    alignSelf: 'stretch',
    marginVertical: 10,
  },
  logoutButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  logoutText: {
    color: '#153A8B',
    fontWeight: 'bold',
    fontSize: 15,
  },
  // Estilos para el cambio de contraseña
  passwordChangeContainer: {
    width: '100%',
    marginVertical: 10,
  },
  passwordInputContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  passwordInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 10,
    color: '#fff',
    width: '100%',
    paddingRight: 40,
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  passwordButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  passwordButton: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  saveButton: {
    backgroundColor: '#fff',
  },
  cancelButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#153A8B',
    textAlign: 'center',
    fontWeight: '600',
  },
});