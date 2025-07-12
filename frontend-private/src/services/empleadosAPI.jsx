// services/empleadosAPI.js
const API_BASE_URL = 'http://localhost:4000/api/Empleados';

class EmpleadosAPI {
  // Obtener todos los empleados
  static async getEmpleados() {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error ${response.status}: ${errorData}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching empleados:', error);
      throw error;
    }
  }

  // Crear un nuevo empleado
  static async createEmpleado(empleadoData) {
    try {
      // Detectar si empleadoData es FormData o un objeto regular
      const isFormData = empleadoData instanceof FormData;
      
      const requestOptions = {
        method: 'POST',
        body: isFormData ? empleadoData : JSON.stringify(empleadoData)
      };

      // Solo agregar Content-Type si NO es FormData
      // (FormData maneja automáticamente el Content-Type con boundary)
      if (!isFormData) {
        requestOptions.headers = {
          'Content-Type': 'application/json',
        };
      }

      const response = await fetch(API_BASE_URL, requestOptions);
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error ${response.status}: ${errorData}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating empleado:', error);
      throw error;
    }
  }

  // Actualizar un empleado
  static async updateEmpleado(id, empleadoData) {
    try {
      // Detectar si empleadoData es FormData o un objeto regular
      const isFormData = empleadoData instanceof FormData;
      
      const requestOptions = {
        method: 'PUT',
        body: isFormData ? empleadoData : JSON.stringify(empleadoData)
      };

      // Solo agregar Content-Type si NO es FormData
      if (!isFormData) {
        requestOptions.headers = {
          'Content-Type': 'application/json',
        };
      }

      const response = await fetch(`${API_BASE_URL}/${id}`, requestOptions);
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error ${response.status}: ${errorData}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating empleado:', error);
      throw error;
    }
  }

  // Eliminar un empleado
  static async deleteEmpleado(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error ${response.status}: ${errorData}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting empleado:', error);
      throw error;
    }
  }
}

export default EmpleadosAPI;