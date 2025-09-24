import React, { createContext, useContext, useState } from "react";
import { Platform } from 'react-native';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const getBaseUrl = () => {
    if (Platform.OS === 'android') {
      return 'http://192.168.125.22:4000';
    } else if (Platform.OS === 'ios') {
      return 'http://localhost:4000';
    }
    return 'http://localhost:4000';
  };

  const login = (userData, type) => {
    setUser(userData);
    setUserType(type);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setUserType(null);
    setIsAuthenticated(false);
  };

  const requestPasswordRecovery = async (email) => {
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/api/passwordRecovery/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: email
        })
      });

      const data = await response.json();
      return { message: data.message };
    } catch (error) {
      return { message: 'Error de conexión. Verifica que el servidor esté ejecutándose.' };
    }
  };

  const verifyRecoveryCode = async (code) => {
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/api/passwordRecovery/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          code: code
        })
      });

      const data = await response.json();
      return { message: data.message };
    } catch (error) {
      return { message: 'Error de conexión. Verifica que el servidor esté ejecutándose.' };
    }
  };

  const setNewPassword = async (newPassword) => {
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/api/passwordRecovery/new-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          newPassword: newPassword
        })
      });

      const data = await response.json();
      return { message: data.message };
    } catch (error) {
      return { message: 'Error de conexión. Verifica que el servidor esté ejecutándose.' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      userType,
      isAuthenticated,
      login,
      logout,
      requestPasswordRecovery,
      verifyRecoveryCode,
      setNewPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};