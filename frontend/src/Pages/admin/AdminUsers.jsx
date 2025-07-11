import React from 'react';
import { useAdminAuth } from '../../hooks/admin/useAdminAuth';
import './styles/AdminPage.css';
import { FaUsers, FaSearch } from 'react-icons/fa';

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

  return (
    <div className="admin-page">
      <div className="admin-page-container">
        <header className="admin-page-header">
          <div className="admin-page-title-section">
            <FaUsers className="admin-page-icon" />
            <div>
              <h1>Gestión de Usuarios</h1>
              <p>Administra las cuentas de usuarios registrados</p>
            </div>
          </div>
          <button className="admin-btn admin-btn-secondary">
            <FaSearch />
            Buscar Usuario
          </button>
        </header>

        <div className="admin-page-content">
          <div className="admin-placeholder">
            <div className="admin-placeholder-icon">
              <FaUsers />
            </div>
            <h3>Gestión de Usuarios</h3>
            <p>Esta funcionalidad estará disponible próximamente.</p>
            <p>Aquí podrás:</p>
            <ul>
              <li>Ver lista completa de usuarios registrados</li>
              <li>Buscar usuarios por nombre o correo</li>
              <li>Ver detalles de perfil de cada usuario</li>
              <li>Verificar estado de documentos</li>
              <li>Gestionar permisos y estados de cuenta</li>
              <li>Ver historial de reservas por usuario</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
