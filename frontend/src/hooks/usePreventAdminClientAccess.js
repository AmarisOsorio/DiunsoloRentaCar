import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Hook que previene el acceso de administradores a rutas de cliente
 * Redirige automáticamente al dashboard admin si detecta que un admin 
 * está intentando acceder a una pantalla de cliente
 */
export const usePreventAdminClientAccess = () => {
  const { userType, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Lista de rutas que son exclusivas para clientes
    const clientOnlyRoutes = [
      '/perfil',
      '/catalogo',
      '/contacto',
      '/reservas',
      '/mis-reservas'
    ];

    // Verificar si la ruta actual es una ruta de cliente
    const isClientRoute = clientOnlyRoutes.some(route => 
      location.pathname === route || location.pathname.startsWith(route + '/')
    );

    // Si es admin autenticado intentando acceder a ruta de cliente
    if (isAuthenticated && userType === 'admin' && isClientRoute) {
      console.log(`Admin detectado en ruta de cliente: ${location.pathname}, redirigiendo...`);
      
      // Guardar información de la ruta intentada
      sessionStorage.setItem('adminAttemptedClientRoute', JSON.stringify({
        route: location.pathname,
        timestamp: new Date().toISOString()
      }));
      
      // Redirigir al dashboard admin
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, userType, location.pathname, navigate]);

  // Retorna información útil sobre el estado
  return {
    isAdmin: isAuthenticated && userType === 'admin',
    shouldRedirect: isAuthenticated && userType === 'admin'
  };
};

export default usePreventAdminClientAccess;
