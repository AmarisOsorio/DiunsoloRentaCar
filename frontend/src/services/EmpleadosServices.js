/** Servicio para obtener datos de empleados
 * y mostrarlos en los gráficos del dashboard**/
import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api'; 

const empleadosService = {
  getEmpleadosPorCargo: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/empleados/por-cargo`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener empleados por cargo:', error);
      throw error;
    }
  },
  
  getTotalEmpleados: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/empleados/total`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener total de empleados:', error);
      throw error;
    }
  }
};

export default empleadosService;
