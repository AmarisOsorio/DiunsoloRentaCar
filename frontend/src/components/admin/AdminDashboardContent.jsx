import React from 'react';
import NuevosClientesChartSimple from './charts/NuevosClientesChartSimple';
import NuevosClientesChart from './charts/NuevosClientesChart';
import GraficaVehiculosPorMarca from './charts/GraficaVehiculosPorMarca';
import GraficaVehiculosPorModelo from './charts/GraficaVehiculosPorModelo';
import EmpleadosPorCargaChart from './charts/EmpleadosPorCargaChart';
import './styles/AdminDashboardContent.css';

const AdminDashboardContent = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div className="dashboard-header-content">
            <h1>Dashboard</h1>
            <p>Administra y visualiza las estadísticas del sistema</p>
          </div>
        </div>

        {/* Usuarios conectados */}
        <div className="dashboard-grid">
          <div className="dashboard-card maintenance-card">
            <h3>Usuarios conectados</h3>
            <div className="maintenance-message">
              <p>Esta sección se encuentra en mantenimiento</p>
              <span>Próximamente disponible</span>
            </div>
          </div>

          {/* Gráfica registro de nuevos clientes */}
          <NuevosClientesChart />
        </div>

        {/* Gráficas vehículos */}
        <div className="dashboard-bottom-grid">
          <GraficaVehiculosPorMarca />
          <GraficaVehiculosPorModelo />
          
          {/* Empleados por cargo */}
          <div className="dashboard-card maintenance-card">
            <h3>Empleados por cargo</h3>
            <div className="maintenance-message">
              <p>Esta sección se encuentra en mantenimiento</p>
              <span>Próximamente disponible</span>
            </div>
          </div>
        </div>
    
      </div>
    </div>
  );
};


export default AdminDashboardContent;