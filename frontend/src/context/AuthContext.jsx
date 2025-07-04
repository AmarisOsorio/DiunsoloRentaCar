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

  // Cargar perfil automáticamente si el usuario está autenticado pero no hay userInfo
  useEffect(() => {
    const loadUserProfile = async () => {
      if (isAuthenticated && userType === 'cliente' && !userInfo) {
        const result = await getProfile();
        if (result.success) {
          setUserInfo(result.user);
        }
      }
    };

    loadUserProfile();
  }, [isAuthenticated, userType, userInfo]);

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
      let formData;
      if (data instanceof FormData) {
        formData = data;
        // Elimina 'contrasena' si existe
        if (formData.has('contrasena')) {
          formData.delete('contrasena');
        }
      } else {
        formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (key === 'confirmarContraseña') return;
            if (key === 'contrasena') return; // No agregar 'contrasena'
            formData.append(key, value);
          }
        });
      }
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
      // Solo enviar nombres y apellidos (no nombreCompleto)
      const filteredInfo = { ...newInfo };
      if ('nombreCompleto' in filteredInfo) delete filteredInfo.nombreCompleto;
      const res = await fetch(`${API_URL}/profile/update`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filteredInfo)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUserInfo(data.user);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Error al actualizar información' };
    } catch (error) {
      return { success: false, message: 'Error de conexión' };
    }
  };

  const changePassword = async (newPassword) => {
    try {
      const res = await fetch(`${API_URL}/profile/change-password`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword })
      });
      const data = await res.json();
      return { success: data.success, message: data.message };
    } catch (error) {
      return { success: false, message: 'Error de conexión' };
    }
  };

  const deleteAccount = async () => {
    try {
      const res = await fetch(`${API_URL}/profile/delete`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUserType(null);
        setIsAuthenticated(false);
        setUserInfo(null);
        localStorage.removeItem('userType');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userInfo');
        window.dispatchEvent(new Event('auth-changed'));
      }
      return { success: data.success, message: data.message };
    } catch (error) {
      return { success: false, message: 'Error de conexión' };
    }
  };

  // Función para obtener información del perfil
  const getProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/profile`, {
        method: 'GET',
        credentials: 'include'
      });
      if (res.status === 401) {
        // Si el backend responde 401, forzar logout en frontend
        setUserType(null);
        setIsAuthenticated(false);
        setUserInfo(null);
        localStorage.removeItem('userType');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userInfo');
        window.dispatchEvent(new Event('auth-changed'));
        return { success: false, message: 'No autorizado' };
      }
      const data = await res.json();
      if (res.ok && data.success) {
        setUserInfo(data.user);
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: 'Error de conexión' };
    }
  };

  // Función para subir documento con lado específico
  const uploadDocument = async (file, documentType, side) => {
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', documentType);
      formData.append('side', side); // 'frente' o 'reverso'

      const res = await fetch(`${API_URL}/profile/upload-document`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      const data = await res.json();
      
      if (data.success) {
        // Actualizar el usuario en el contexto si es necesario
        setUserInfo(prevUser => ({
          ...prevUser,
          ...data.updatedFields
        }));
      }

      return { success: data.success, message: data.message, fileUrl: data.fileUrl };
    } catch (error) {
      return { success: false, message: 'Error de conexión' };
    }
  };

  // Función para eliminar documento con lado específico
  const deleteDocument = async (documentType, side) => {
    try {
      const res = await fetch(`${API_URL}/profile/delete-document`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          documentType,
          side
        })
      });

      const data = await res.json();
      
      if (data.success) {
        // Actualizar el usuario en el contexto
        setUserInfo(prevUser => ({
          ...prevUser,
          ...data.updatedFields
        }));
        
        // Forzar una actualización del perfil para asegurar sincronización
        await getProfile();
      }

      return data;
    } catch (error) {
      console.error('Error deleting document:', error);
      return {
        success: false,
        message: 'Error de conexión'
      };
    }
  };

  return (
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
      deleteAccount,
      getProfile,
      uploadDocument,
      deleteDocument
    // , requestEmailChange, verifyEmailChange
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
