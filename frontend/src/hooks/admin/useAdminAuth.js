import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

/**
 * Hook personalizado para manejar la autenticación de administradores
 * Redirige automáticamente a la página de inicio si el usuario no está autorizado
 */
export const useAdminAuth = () => {
  const { userType, isAuthenticated } = useAuth();

  console.log('useAdminAuth - isAuthenticated:', isAuthenticated, 'userType:', userType);

  useEffect(() => {
    // Si el usuario no está autenticado o no es admin, redirigir a inicio
    if (!isAuthenticated || userType !== 'admin') {
      console.log('Redirecting to home - not authenticated or not admin');
      window.location.href = '/';
    }
  }, [isAuthenticated, userType]);

  // Retorna true solo si el usuario está autenticado y es admin
  return isAuthenticated && userType === 'admin';
};
