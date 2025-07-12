import React, { useEffect, useState } from 'react';
import { useAdminAuth } from '../../hooks/admin/useAdminAuth';
import AdminDashboardContent from '../../components/admin/AdminDashboardContent';
import './styles/AdminDashboard.css';

const AdminDashboard = () => {
  let isAuthorized = true;
  
  try {
    isAuthorized = useAdminAuth();
  } catch (error) {
    console.error('Error in useAdminAuth:', error);
    isAuthorized = false;
  }
  
  const [showRedirectMessage, setShowRedirectMessage] = useState(false);
  const [attemptedRoute, setAttemptedRoute] = useState('');

  useEffect(() => {
    // Verificar si el admin fue redirigido desde una ruta de cliente
    const attemptedClientRoute = sessionStorage.getItem('adminAttemptedClientRoute');
    if (attemptedClientRoute) {
      try {
        const routeInfo = JSON.parse(attemptedClientRoute);
        setAttemptedRoute(routeInfo.route);
        setShowRedirectMessage(true);
        
        // Limpiar la información después de mostrarla
        sessionStorage.removeItem('adminAttemptedClientRoute');
        
        // Ocultar el mensaje después de 5 segundos
        setTimeout(() => {
          setShowRedirectMessage(false);
        }, 5000);
      } catch (error) {
        console.error('Error parsing attempted route:', error);
      }
    }
  }, []);

  // Si no está autorizado, mostrar un loading mientras redirige
  if (!isAuthorized) {
    return (
      <div className="admin-dashboard">
        <div className="admin-dashboard-container">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Verificando permisos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mensaje de notificación si fue redirigido */}
      {showRedirectMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#fbbf24',
          color: '#92400e',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          maxWidth: '400px'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>
            ⚠️ Acceso Restringido
          </div>
          <div style={{ fontSize: '14px' }}>
            Como administrador, no puedes acceder a "{attemptedRoute}". 
            Has sido redirigido al panel de administración.
          </div>
          <button 
            onClick={() => setShowRedirectMessage(false)}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'none',
              border: 'none',
              color: '#92400e',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            ×
          </button>
        </div>
      )}
      
      <AdminDashboardContent />
    </>
  );
};

export default AdminDashboard;
