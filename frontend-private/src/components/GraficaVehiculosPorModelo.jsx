import React, { useEffect, useState } from 'react';
import reservasService from '../services/ReservasServices';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-4 rounded-xl shadow bg-white max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">Modelos más rentados</h2>

      {loading ? (
        <p>Cargando datos...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
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
              label
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
