import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Perfil from './Perfil';

/**
 * Wrapper del componente Perfil que previene el acceso a administradores
 * Los administradores son redirigidos automáticamente al dashboard de admin
 */
const PerfilWrapper = () => {
  const { userType, isAuthenticated } = useAuth();

  useEffect(() => {
    // Si el usuario está autenticado y es admin, redirigir al dashboard
    if (isAuthenticated && userType === 'admin') {
      window.location.href = '/admin';
    }
  }, [isAuthenticated, userType]);

  // Si es admin, no renderizar nada mientras redirige
  if (isAuthenticated && userType === 'admin') {
    return null;
  }

  // Para usuarios normales, mostrar el perfil normal
  return <Perfil />;
};

export default PerfilWrapper;
