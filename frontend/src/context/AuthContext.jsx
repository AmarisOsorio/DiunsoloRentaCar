import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const AuthProvider = ({ children }) => {
  const [userType, setUserType] = useState(() => localStorage.getItem('userType'));
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('isAuthenticated') === 'true');

  useEffect(() => {
    localStorage.setItem('userType', userType || '');
    localStorage.setItem('isAuthenticated', isAuthenticated);
  }, [userType, isAuthenticated]);

  const login = async ({ correo, contraseña }) => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contraseña })
      });
      const data = await res.json();
      if (res.ok && data.userType) {
        const normalizedType = data.userType.toLowerCase();
        setUserType(normalizedType);
        setIsAuthenticated(true);
        return normalizedType;
      } else {
        setUserType(null);
        setIsAuthenticated(false);
        return null;
      }
    } catch (err) {
      setUserType(null);
      setIsAuthenticated(false);
      return null;
    }
  };

  const register = async (data) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });
      const res = await fetch(`${API_URL}/registerClients`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      return res.json();
    } catch (err) {
      return { message: 'Error de red o servidor' };
    }
  };

  const verifyAccount = async (verificationCode) => {
    const res = await fetch(`${API_URL}/registerClients/verifyCodeEmail`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verificationCode })
    });
    return res.json();
  };

  const requestPasswordRecovery = async (correo) => {
    const res = await fetch(`${API_URL}/password-recovery/request`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo })
    });
    return res.json();
  };

  const verifyRecoveryCode = async (code) => {
    const res = await fetch(`${API_URL}/password-recovery/verify`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    return res.json();
  };

  const setNewPassword = async (newPassword) => {
    const res = await fetch(`${API_URL}/password-recovery/new-password`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword })
    });
    return res.json();
  };

  const logout = async () => {
    await fetch(`${API_URL}/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    setUserType(null);
    setIsAuthenticated(false);
    localStorage.removeItem('userType');
    localStorage.removeItem('isAuthenticated');
  };

  const resendVerificationCode = async () => {
    const res = await fetch(`${API_URL}/registerClients/resendCodeEmail`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    return res.json();
  };

  return (
    <AuthContext.Provider value={{ userType, isAuthenticated, login, register, verifyAccount, requestPasswordRecovery, verifyRecoveryCode, setNewPassword, logout, resendVerificationCode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
