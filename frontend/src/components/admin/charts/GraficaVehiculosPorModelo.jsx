import React, { useEffect, useState } from 'react';
import reservasService from '../../../services/ReservasServices';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './styles/AdminCharts.css';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a28eff'];

const GraficaVehiculosPorModelo = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const datos = await reservasService.getVehiculosPorModelo();
        console.log("Datos recibidos por modelo:", datos);

        const transformedData = datos.map((item) => ({
          name: item._id || 'Sin modelo',
          value: item.totalReservas,
        }));

        setData(transformedData);
        setError(null);
      } catch (err) {
        console.error('Error al obtener datos de vehículos por modelo:', err);
        setError('Error al cargar los datos');
        
        // Fallback a datos simulados en caso de error
        const mockData = [
          { name: 'Corolla', value: 15 },
          { name: 'Civic', value: 12 },
          { name: 'Sentra', value: 10 },
          { name: 'Focus', value: 8 },
          { name: 'CX-5', value: 6 },
        ];
        setData(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3 className="chart-title">Modelos más rentados</h3>
        <p className="chart-description">Distribución por modelo de vehículo</p>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p>Cargando datos...</p>
          </div>
        </div>
      ) : error ? (
        <div className="error-container">
          <p>{error}</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default GraficaVehiculosPorModelo;
