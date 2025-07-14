import React from 'react';
import { useAdminAuth } from '../../hooks/admin/useAdminAuth';
import UsuariosPage from './UsuariosPage';

const AdminUsers = () => {
  const isAuthorized = useAdminAuth();

  // Si no está autorizado, mostrar un loading mientras redirige
  if (!isAuthorized) {
    return (
      <div className="admin-page">
        <div className="admin-page-container">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Verificando permisos...</p>
          </div>
        </div>
      </div>
    );
  }

  return <UsuariosPage />;
};

export default AdminUsers;
