/** Aquí nos permite hacer las peticiones para traer los datos
 * y colocarlos en los gráficos**/
import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api'; 

const clientsService = {
  getNuevosClientesRegistrados: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/clients/nuevos-clientes-registrados`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener nuevos clientes registrados:', error);
      throw error;
    }
  },
};

export default clientsService;
