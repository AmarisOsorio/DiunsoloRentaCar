import { useState, useEffect } from 'react';

export const useStatsData = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});

  // Datos simulados para las gráficas
  const mockData = {
    // Datos para vehículos más rentados por marca (gráfico de barras)
    rentedVehiclesByBrand: {
      labels: ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan'],
      datasets: [{
        data: [85, 72, 68, 54, 41]
      }]
    },

    // Datos para nuevos clientes (gráfico de línea)
    newClients: {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
      datasets: [{
        data: [20, 35, 28, 45, 52, 38],
        color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
        strokeWidth: 3
      }]
    },

    // Datos para importaciones por marca (gráfico circular)
    importsByBrand: [
      {
        name: 'Toyota',
        population: 35,
        color: '#FF6B6B',
        legendFontColor: '#333',
        legendFontSize: 12
      },
      {
        name: 'Honda',
        population: 28,
        color: '#4ECDC4',
        legendFontColor: '#333',
        legendFontSize: 12
      },
      {
        name: 'Ford',
        population: 20,
        color: '#45B7D1',
        legendFontColor: '#333',
        legendFontSize: 12
      },
      {
        name: 'Nissan',
        population: 17,
        color: '#FFA726',
        legendFontColor: '#333',
        legendFontSize: 12
      }
    ],

    // Datos para alquileres hasta hoy (gráfico de barras horizontales)
    dailyRentals: {
      labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
      datasets: [{
        data: [12, 19, 15, 25, 22, 30, 18]
      }]
    }
  };

  useEffect(() => {
    // Simular carga de datos
    const timer = setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return { data, loading };
};