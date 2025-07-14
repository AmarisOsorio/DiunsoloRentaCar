/** Aquí nos permite hacer las peticiones para traer los datos
 * y colocarlos en los gráficos**/
import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api'; 

const reservasService = {
  getVehiculosPorMarca: async () => {
    const response = await axios.get(`${API_BASE_URL}/reservas/vehiculos-rentados-marcas`);
    return response.data;
  },
  getVehiculosPorModelo: async () => {
    const response = await axios.get(`${API_BASE_URL}/reservas/vehiculos-rentados-modelos`);
    return response.data;
  }
};

export default reservasService;
