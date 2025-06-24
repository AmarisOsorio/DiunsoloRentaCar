import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const AuthProvider = ({ children }) => {
  const [userType, setUserType] = useState(() => localStorage.getItem('userType'));
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('isAuthenticated') === 'true');
  const [userInfo, setUserInfo] = useState(() => {
    const saved = localStorage.getItem('userInfo');
    return saved ? JSON.parse(saved) : null;
  });
  useEffect(() => {
    localStorage.setItem('userType', userType || '');
    localStorage.setItem('isAuthenticated', isAuthenticated);
    if (userInfo) {
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
    } else {
      localStorage.removeItem('userInfo');
    }
  }, [userType, isAuthenticated, userInfo]);

  const login = async ({ correo, contraseña }) => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contraseña })
      });
      const data = await res.json();      if (res.ok && data.userType) {
        const normalizedType = data.userType.toLowerCase();
        setUserType(normalizedType);
        setIsAuthenticated(true);
        // Guardar información del usuario si está disponible
        if (data.user) {
          setUserInfo(data.user);
        }
        window.dispatchEvent(new Event('auth-changed'));
        return { ...data, message: data.message || 'login exitoso' };
      } else if (data.needVerification) {
        setUserType(null);
        setIsAuthenticated(false);
        return data; // <-- Retorna el objeto completo para que useLogin lo detecte
      } else {
        setUserType(null);
        setIsAuthenticated(false);
        return { message: data.message || 'Credenciales incorrectas' };
      }
    } catch (err) {
      setUserType(null);
      setIsAuthenticated(false);
      return { message: 'Error de red o servidor' };
    }
  };

  const register = async (data) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
      // DEBUG: Log all FormData keys and values before sending
      // if (typeof window !== 'undefined') {
      //   console.log('FormData about to be sent:');
      //   for (let pair of formData.entries()) {
      //     console.log(pair[0], ':', pair[1]);
      //   }
      // }
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
    const res = await fetch(`${API_URL}/passwordRecovery/request`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo })
    });
    return res.json();
  };

  const verifyRecoveryCode = async (code) => {
    const res = await fetch(`${API_URL}/passwordRecovery/verify`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    return res.json();
  };

  const setNewPassword = async (newPassword) => {
    const res = await fetch(`${API_URL}/passwordRecovery/new-password`, {
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
    setUserInfo(null);
    localStorage.removeItem('userType');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userInfo');
    window.dispatchEvent(new Event('auth-changed'));
  };
  const resendVerificationCode = async () => {
    const res = await fetch(`${API_URL}/registerClients/resendCodeEmail`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    return res.json();
  };

  const updateUserInfo = async (newInfo) => {
    try {
      const res = await fetch(`${API_URL}/user/update`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInfo)
      });
      const data = await res.json();
      if (res.ok) {
        setUserInfo(data.user);
        return { success: true, message: 'Información actualizada correctamente' };
      }
      return { success: false, message: data.message || 'Error al actualizar información' };
    } catch (error) {
      return { success: false, message: 'Error de conexión' };
    }
  };

  const changePassword = async (newPassword) => {
    try {
      const res = await fetch(`${API_URL}/user/change-password`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword })
      });
      const data = await res.json();
      return { success: res.ok, message: data.message };
    } catch (error) {
      return { success: false, message: 'Error de conexión' };
    }
  };

  const deleteAccount = async () => {
    try {
      const res = await fetch(`${API_URL}/user/delete`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        setUserType(null);
        setIsAuthenticated(false);
        setUserInfo(null);
        localStorage.removeItem('userType');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userInfo');
        window.dispatchEvent(new Event('auth-changed'));
      }
      return { success: res.ok, message: data.message };
    } catch (error) {
      return { success: false, message: 'Error de conexión' };
    }
  };  return (
    <AuthContext.Provider value={{ 
      userType, 
      isAuthenticated, 
      userInfo,
      setUserInfo,
      login, 
      register, 
      verifyAccount, 
      requestPasswordRecovery, 
      verifyRecoveryCode, 
      setNewPassword, 
      logout, 
      resendVerificationCode,
      updateUserInfo,
      changePassword,
      deleteAccount
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
