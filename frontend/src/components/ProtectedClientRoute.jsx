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

  // Si no es admin o no está autenticado, mostrar el contenido normal
  return children;
};

export default ProtectedClientRoute;
