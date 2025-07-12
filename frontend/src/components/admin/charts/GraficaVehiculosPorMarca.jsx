import React, { useEffect, useState } from 'react';
import reservasService from '../../../services/ReservasServices';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './styles/AdminCharts.css';

const COLORS = ['#009BDB', '#00C49F', '#FFBB28', '#FF8042', '#A28EFF'];

const GraficaVehiculosPorMarca = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const datos = await reservasService.getVehiculosPorMarca();
        console.log("Datos recibidos por marca:", datos);

        const transformedData = datos.map((item) => ({
          name: item._id || 'Sin marca',
          value: item.totalReservas,
        }));

        setData(transformedData);
        setError(null);
      } catch (err) {
        console.error('Error al obtener datos de vehículos por marca:', err);
        setError('Error al cargar los datos');
        
        // Fallback a datos simulados en caso de error
        const mockData = [
          { name: 'Toyota', value: 25 },
          { name: 'Honda', value: 18 },
          { name: 'Nissan', value: 15 },
          { name: 'Ford', value: 12 },
          { name: 'Mazda', value: 8 },
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
        <h3 className="chart-title">Marcas más rentadas</h3>
        <p className="chart-description">Distribución por marca de vehículo</p>
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

export default GraficaVehiculosPorMarca;
