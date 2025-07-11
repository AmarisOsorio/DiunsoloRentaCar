import React from 'react';
import { useAdminAuth } from '../../hooks/admin/useAdminAuth';
import './styles/AdminDashboard.css';
import { FaCar, FaUsers, FaChartBar, FaCalendarAlt } from 'react-icons/fa';

const AdminDashboard = () => {
  const isAuthorized = useAdminAuth();

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

  // Datos de ejemplo para las estadísticas
  const stats = [
    {
      title: 'Total Vehículos',
      value: '12',
      icon: <FaCar />,
      color: '#4f46e5',
      bgColor: '#eef2ff'
    },
    {
      title: 'Usuarios Registrados',
      value: '48',
      icon: <FaUsers />,
      color: '#059669',
      bgColor: '#ecfdf5'
    },
    {
      title: 'Reservas Activas',
      value: '7',
      icon: <FaCalendarAlt />,
      color: '#dc2626',
      bgColor: '#fef2f2'
    },
    {
      title: 'Ingresos del Mes',
      value: '$2,450',
      icon: <FaChartBar />,
      color: '#7c2d12',
      bgColor: '#fef7ed'
    }
  ];

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-container">
        <header className="admin-dashboard-header">
          <h1>Panel de Administración</h1>
          <p>Bienvenido al sistema de gestión de Diunsolo RentaCar</p>
        </header>

        <div className="admin-stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="admin-stat-card">
              <div 
                className="admin-stat-icon"
                style={{ 
                  backgroundColor: stat.bgColor,
                  color: stat.color 
                }}
              >
                {stat.icon}
              </div>
              <div className="admin-stat-content">
                <h3>{stat.value}</h3>
                <p>{stat.title}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="admin-quick-actions">
          <h2>Acciones Rápidas</h2>
          <div className="admin-actions-grid">
            <a href="/admin/vehiculos" className="admin-action-card">
              <FaCar className="admin-action-icon" />
              <h3>Gestionar Vehículos</h3>
              <p>Añadir, editar o eliminar vehículos del catálogo</p>
            </a>
            
            <a href="/admin/usuarios" className="admin-action-card">
              <FaUsers className="admin-action-icon" />
              <h3>Gestionar Usuarios</h3>
              <p>Ver y administrar cuentas de usuarios</p>
            </a>
            
            <div className="admin-action-card admin-action-disabled">
              <FaCalendarAlt className="admin-action-icon" />
              <h3>Ver Reservas</h3>
              <p>Próximamente - Gestión de reservas</p>
            </div>
            
            <div className="admin-action-card admin-action-disabled">
              <FaChartBar className="admin-action-icon" />
              <h3>Reportes</h3>
              <p>Próximamente - Análisis y estadísticas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
