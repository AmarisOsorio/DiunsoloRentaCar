import React from 'react';
import NuevosClientesChartSimple from './charts/NuevosClientesChartSimple';
// import NuevosClientesChart from './charts/NuevosClientesChart';
// import GraficaVehiculosPorMarca from './charts/GraficaVehiculosPorMarca';
// import GraficaVehiculosPorModelo from './charts/GraficaVehiculosPorModelo';
// import EmpleadosPorCargaChart from './charts/EmpleadosPorCargaChart';
import './styles/AdminDashboardContent.css';

const AdminDashboardContent = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="dashboard-header">
          <p>Dashboard</p>
          <h1>¡Bienvenido!</h1>
        </div>

        {/* Usuarios conectados */}
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Usuarios conectados</h3>
            <div className="user-status">
              <div className="user-item">
                <span className="user-status-dot"></span>
                <span className="user-name">Georgina Guzmán</span>
                <span className="user-state">Activo</span>
              </div>
              <div className="user-item">
                <span className="user-status-dot"></span>
                <span className="user-name">Edenilson Amaya</span>
                <span className="user-state">Activo</span>
              </div>
              <div className="user-item">
                <span className="user-status-dot"></span>
                <span className="user-name">José Iraheta</span>
                <span className="user-state">Activo</span>
              </div>
              <div className="user-item">
                <span className="user-status-dot"></span>
                <span className="user-name">Christhian Sánchez</span>
                <span className="user-state">Activo</span>
              </div>
              <div className="user-item">
                <span className="user-status-dot"></span>
                <span className="user-name">Eduardo Lima</span>
                <span className="user-state">Activo</span>
              </div>
            </div>
          </div>

          {/* Gráfica registro de nuevos clientes */}
          <div className="dashboard-card">
            <NuevosClientesChartSimple />
          </div>
        </div>

        {/* Gráfica vehículos más rentados por marcas */}
        <div className="dashboard-bottom-grid">
          <div className="dashboard-card">
            <h3>Marcas más rentadas</h3>
            <div className="dashboard-placeholder">Gráfica temporalmente deshabilitada - Se está solucionando el problema con recharts</div>
          </div>

         {/* Gráfica vehículos más rentados por modelo */} 
          <div className="dashboard-card">
            <h3>Modelos más rentados</h3>
            <div className="dashboard-placeholder">Gráfica temporalmente deshabilitada - Se está solucionando el problema con recharts</div>
          </div>

          {/* Gráfica empleados por carga */} 
          <div className="dashboard-card">
            <h3>Empleados por carga</h3>
            <div className="dashboard-placeholder">Gráfica temporalmente deshabilitada - Se está solucionando el problema con recharts</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboardContent;
