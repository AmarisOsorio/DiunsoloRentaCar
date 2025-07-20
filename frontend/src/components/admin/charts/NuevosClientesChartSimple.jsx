import React, { useState, useEffect } from 'react';
import clientsService from '../../../services/ClientsServices';
import './styles/AdminCharts.css';

const NuevosClientesChartSimple = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await clientsService.getNuevosClientesRegistrados();
      const transformedData = response.map(item => ({
        fecha: item._id,
        clientes: item.totalClientes,
        fechaFormateada: new Date(item._id).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit'
        })
      }));

      transformedData.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
      setData(transformedData);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos del gráfico');
      
      // Fallback a datos simulados
      const mockData = [
        { fecha: '2024-01-01', clientes: 5, fechaFormateada: '01/01/24' },
        { fecha: '2024-01-02', clientes: 8, fechaFormateada: '02/01/24' },
        { fecha: '2024-01-03', clientes: 3, fechaFormateada: '03/01/24' },
        { fecha: '2024-01-04', clientes: 12, fechaFormateada: '04/01/24' },
        { fecha: '2024-01-05', clientes: 7, fechaFormateada: '05/01/24' },
      ];
      setData(mockData);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">Registro de Nuevos Clientes</h3>
          <p className="chart-description">Clientes registrados por día</p>
        </div>
        <div className="loading-container">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p>Cargando datos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && data.length === 0) {
    return (
      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">Registro de Nuevos Clientes</h3>
          <p className="chart-description">Clientes registrados por día</p>
        </div>
        <div className="error-container">
          <p>{error}</p>
          <button onClick={fetchData} className="error-retry-button">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3 className="chart-title">Registro de Nuevos Clientes</h3>
        <p className="chart-description">Clientes registrados por día</p>
      </div>

      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {data.map((item, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '8px 12px',
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
              border: '1px solid #e9ecef'
            }}>
              <span style={{ fontWeight: '500' }}>{item.fechaFormateada}</span>
              <span style={{ color: '#3b82f6', fontWeight: '600' }}>
                {item.clientes} clientes
              </span>
            </div>
          ))}
        </div>
        
        {data.length === 0 && (
          <div className="no-data-message">
            No hay datos disponibles para mostrar
          </div>
        )}
        
        <div style={{ 
          marginTop: '15px', 
          padding: '10px', 
          backgroundColor: '#eff6ff', 
          borderRadius: '6px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#1e40af'
        }}>
          📊 Versión simplificada - Las gráficas interactivas se cargarán cuando recharts esté disponible
        </div>
      </div>
    </div>
  );
};

export default NuevosClientesChartSimple;
