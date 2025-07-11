import React from 'react';
import { useAdminAuth } from '../../hooks/admin/useAdminAuth';
import './styles/AdminPage.css';
import { FaCar, FaPlus } from 'react-icons/fa';

const AdminVehicles = () => {
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
            <FaCar className="admin-page-icon" />
            <div>
              <h1>Gestión de Vehículos</h1>
              <p>Administra el catálogo de vehículos disponibles</p>
            </div>
          </div>
          <button className="admin-btn admin-btn-primary">
            <FaPlus />
            Añadir Vehículo
          </button>
        </header>

        <div className="admin-page-content">
          <div className="admin-placeholder">
            <div className="admin-placeholder-icon">
              <FaCar />
            </div>
            <h3>Gestión de Vehículos</h3>
            <p>Esta funcionalidad estará disponible próximamente.</p>
            <p>Aquí podrás:</p>
            <ul>
              <li>Ver todos los vehículos registrados</li>
              <li>Añadir nuevos vehículos al catálogo</li>
              <li>Editar información de vehículos existentes</li>
              <li>Gestionar disponibilidad y precios</li>
              <li>Subir y administrar imágenes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminVehicles;
