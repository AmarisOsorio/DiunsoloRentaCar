import { useState } from 'react';
import { Platform } from 'react-native';

export default function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userType, setUserType] = useState(null);
  const [user, setUser] = useState(null);

  // Configuración de URL para producción
  const getBaseUrl = () => {
    return 'https://diunsolorentacar.onrender.com';
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