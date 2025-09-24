import { useState } from 'react';
import { Platform } from 'react-native';

export default function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userType, setUserType] = useState(null);
  const [user, setUser] = useState(null);

  const getBaseUrl = () => {
    const baseUrl = 'https://diunsolorentacar.onrender.com';
    console.log('BASE_URL:', baseUrl);
    return baseUrl;
  };

  const login = async ({ email, password }) => {
    setLoading(true);
    setError(null);
    try {
      const baseUrl = getBaseUrl();
      const loginUrl = `${baseUrl}/api/login`;
      
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const responseText = await response.text();
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        setError('Error: Invalid server response format');
        setLoading(false);
        return false;
      }

      if (!response.ok) {
        setError(data.message || 'Authentication error');
        setLoading(false);
        return false;
      }

      // Since the server only returns a success message,
      // we'll create a basic user object
      const userData = {
        email,
        role: 'client', // Default role
        message: data.message
      };

      setUserType(userData.role);
      setUser(userData);
      setLoading(false);
      return true;

    } catch (err) {
      console.error('Login error:', err);
      setError('Connection error. Please verify the server is running.');
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