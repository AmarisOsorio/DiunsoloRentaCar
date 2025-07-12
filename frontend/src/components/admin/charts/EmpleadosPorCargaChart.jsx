import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './styles/AdminCharts.css';

const EmpleadosPorCargaChart = () => {
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
      
      // Datos simulados por ahora - reemplazar con servicio real cuando esté disponible
      const mockData = [
        { cargo: 'Gerente', empleados: 2 },
        { cargo: 'Vendedor', empleados: 5 },
        { cargo: 'Mecánico', empleados: 3 },
        { cargo: 'Limpieza', empleados: 4 },
        { cargo: 'Administrador', empleados: 1 }
      ];

      setData(mockData);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos del gráfico');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={fetchData} className="error-retry-button">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3 className="chart-title">Empleados por Cargo</h3>
        <p className="chart-description">Distribución del personal por área</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="cargo" 
            stroke="#6b7280"
            fontSize={12}
            tickMargin={10}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            tickMargin={10}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend />
          <Bar 
            dataKey="empleados" 
            fill="#3b82f6" 
            name="Empleados"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      {data.length === 0 && (
        <div className="no-data-message">
          No hay datos disponibles para mostrar
        </div>
      )}
    </div>
  );
};

export default EmpleadosPorCargaChart;
