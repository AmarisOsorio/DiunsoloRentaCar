import { useState } from 'react';
import { Platform } from 'react-native';

export default function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userType, setUserType] = useState(null);
  const [user, setUser] = useState(null);

  // Configuración de URLs para diferentes plataformas
  const getBaseUrl = () => {
    if (Platform.OS === 'android') {
      // Para emulador de Android
      return 'http://10.0.2.2:4000';
      // Para dispositivo físico Android, usa tu IP local:
      // return 'http://192.168.1.XXX:4000'; // Reemplaza XXX con tu IP
    } else if (Platform.OS === 'ios') {
      // Para simulador iOS
      return 'http://localhost:4000';
      // Para dispositivo físico iOS, usa tu IP local:
      // return 'http://192.168.1.XXX:4000'; // Reemplaza XXX con tu IP
    }
    // Fallback para web
    return 'http://localhost:4000';
  };

  const login = async ({ email, password }) => {
    setLoading(true);
    setError(null);
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Error de autenticación');
        setLoading(false);
        return false;
      }

      setUserType(data.userType);
      setUser(data.user);
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Error de login:', err);
      setError('Error de conexión. Verifica que el servidor esté ejecutándose.');
      setLoading(false);
      return false;
    }
  };

  return {
    loading,
    error,
    userType,
    user,
    login
  };
}