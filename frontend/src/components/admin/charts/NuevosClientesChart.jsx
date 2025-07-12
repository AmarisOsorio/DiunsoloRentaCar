import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import clientsService from '../../../services/ClientsServices';
import './styles/AdminCharts.css';

const NuevosClientesChart = () => {
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
      
      // Fallback a datos simulados en caso de error
      const mockData = [
        { fecha: '2024-01-01', clientes: 5, fechaFormateada: '01/01/24' },
        { fecha: '2024-01-02', clientes: 8, fechaFormateada: '02/01/24' },
        { fecha: '2024-01-03', clientes: 3, fechaFormateada: '03/01/24' },
        { fecha: '2024-01-04', clientes: 12, fechaFormateada: '04/01/24' },
        { fecha: '2024-01-05', clientes: 7, fechaFormateada: '05/01/24' },
        { fecha: '2024-01-06', clientes: 15, fechaFormateada: '06/01/24' },
        { fecha: '2024-01-07', clientes: 9, fechaFormateada: '07/01/24' },
      ];
      setData(mockData);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const date = new Date(payload[0].payload.fecha);
      const formattedDate = date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      return (
        <div className="custom-tooltip">
          <p className="tooltip-date">{formattedDate}</p>
          <p className="tooltip-value">Nuevos clientes: {payload[0].value}</p>
        </div>
      );
    }
    return null;
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
        <h3 className="chart-title">Registro de Nuevos Clientes</h3>
        <p className="chart-description">Clientes registrados por día</p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="fechaFormateada"
            stroke="#6b7280"
            fontSize={12}
            tickMargin={10}
          />
          <YAxis
            stroke="#6b7280"
            fontSize={12}
            tickMargin={10}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="clientes"
            stroke="#009BDB"
            strokeWidth={3}
            dot={{ fill: '#009BDB', strokeWidth: 2, r: 6 }}
            activeDot={{ r: 8, fill: '#0284c7' }}
            name="Nuevos Clientes"
          />
        </LineChart>
      </ResponsiveContainer>

      {data.length === 0 && (
        <div className="no-data-message">
          No hay datos disponibles para mostrar
        </div>
      )}
    </div>
  );
};

export default NuevosClientesChart;
