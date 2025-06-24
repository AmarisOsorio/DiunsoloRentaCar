import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente de ruta protegida que requiere autenticación
 * Redirige al usuario a la página principal si no está autenticado
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // Si el usuario no está autenticado, redirigir a la página principal
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Si está autenticado, renderizar el contenido protegido
  return children;
};

export default ProtectedRoute;
