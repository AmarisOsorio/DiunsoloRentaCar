const API_BASE_URL = 'http://localhost:4000/api/clients';
const REGISTER_API_URL = 'http://localhost:4000/api/register-clients';

class ClientesAPI {
  static async getClientes() {
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
      console.error('Error fetching clientes:', error);
      throw error;
    }
  }

  static async createCliente(clienteData) {
    try {
      console.log('📤 Enviando cliente a registerClients:', clienteData);
      
      const isFormData = clienteData instanceof FormData;
      
      let formData;
      if (isFormData) {
        formData = clienteData;
        
        // Verificar si necesitamos mapear campos para mantener compatibilidad
        const hasNombre = Array.from(formData.keys()).includes('nombre');
        const hasNombres = Array.from(formData.keys()).includes('nombres');
        
        if (hasNombre && !hasNombres) {
          const nombre = formData.get('nombre');
          const apellido = formData.get('apellido');
          formData.append('nombres', nombre);
          formData.append('apellidos', apellido);
        }

        // Mapear contraseña si es necesario
        if (formData.has('contraseña') && !formData.has('contraseña')) {
          formData.append('contraseña', formData.get('contraseña'));
        }
      } else {
        formData = new FormData();
        // Mapear los campos del objeto a FormData
        formData.append('nombres', clienteData.nombre);
        formData.append('apellidos', clienteData.apellido);
        formData.append('correo', clienteData.correo);
        formData.append('contraseña', clienteData.contraseña);
        formData.append('telefono', clienteData.telefono);
        formData.append('fechaDeNacimiento', clienteData.fechaDeNacimiento);
      }

      const response = await fetch(REGISTER_API_URL, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error ${response.status}: ${errorData}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating cliente:', error);
      throw error;
    }
  }

  static async updateCliente(id, clienteData) {
    try {
      const isFormData = clienteData instanceof FormData;
      
      const requestOptions = {
        method: 'PUT',
        body: isFormData ? clienteData : JSON.stringify(clienteData)
      };

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
      console.error('Error updating cliente:', error);
      throw error;
    }
  }

  static async deleteCliente(id) {
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
      console.error('Error deleting cliente:', error);
      throw error;
    }
  }

  static async checkEmailExists(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/check-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo: email })
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error ${response.status}: ${errorData}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error checking email:', error);
      throw error;
    }
  }
}

export default ClientesAPI;