import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Componente que protege las rutas de cliente para que los admins no puedan acceder
 * Si un admin intenta acceder a una pantalla de cliente, lo redirige al dashboard admin
 */
const ProtectedClientRoute = ({ children }) => {
  const { userType, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  /*useEffect(() => {
    // Si el usuario está autenticado y es admin, redirigir al dashboard admin
    if (isAuthenticated && userType === 'admin') {
      console.log('Admin detectado intentando acceder a ruta de cliente, redirigiendo al dashboard admin');
      
      // Guardar la ruta a la que intentó acceder para posible log
      sessionStorage.setItem('lastAttemptedClientRoute', location.pathname);
      
      // Redirigir al dashboard admin
      navigate('/admin', { replace: true });
      return;
    }
  }, [isAuthenticated, userType, navigate, location.pathname]);*/

  // Si es admin, no renderizar nada mientras se redirige
  /*if (isAuthenticated && userType === 'admin') {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px',
        color: '#6b7280'
      }}>
        <p>Redirigiendo al panel de administración...</p>
      </div>
    );
  }*/

  // Si no es admin o no está autenticado, mostrar el contenido normal
  return children;
};

export default ProtectedClientRoute;
