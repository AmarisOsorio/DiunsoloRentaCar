import { useState } from 'react';

export default function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userType, setUserType] = useState(null);
  const [user, setUser] = useState(null);

  const login = async ({ email, password }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:4000/api/login', {
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
      setError('Error de conexión');
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