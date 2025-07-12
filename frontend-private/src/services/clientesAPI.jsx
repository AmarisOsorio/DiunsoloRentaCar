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

  static async getClienteById(id) {
    try {
      console.log('🔍 [API] Obteniendo cliente por ID:', id);
      
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error ${response.status}: ${errorData}`);
      }
      
      const cliente = await response.json();
      console.log('✅ [API] Cliente obtenido:', cliente);
      return cliente;
    } catch (error) {
      console.error('❌ [API] Error fetching cliente by ID:', error);
      throw error;
    }
  }

  static async createCliente(clienteData) {
    try {
      console.log('📤 [API] Creando cliente...');
      console.log('📤 [API] Tipo de datos:', clienteData instanceof FormData ? 'FormData' : typeof clienteData);
      
      const isFormData = clienteData instanceof FormData;
      
      let formData;
      if (isFormData) {
        formData = clienteData;
        
        // Debug: mostrar contenido del FormData
        console.log('=== CONTENIDO FORMDATA PARA REGISTRO ===');
        for (let [key, value] of formData.entries()) {
          if (value instanceof File) {
            console.log(`${key}: [File] ${value.name} (${value.type}, ${value.size} bytes)`);
          } else {
            console.log(`${key}: ${value}`);
          }
        }
      } else {
        // Si no es FormData, crearlo
        formData = new FormData();
        
        // Agregar campos básicos
        formData.append('nombre', clienteData.nombre);
        formData.append('apellido', clienteData.apellido);
        formData.append('correo', clienteData.correo);
        formData.append('contraseña', clienteData.contraseña);
        formData.append('telefono', clienteData.telefono);
        formData.append('fechaDeNacimiento', clienteData.fechaDeNacimiento);
        
        // Si hay archivos de imagen, agregarlos
        if (clienteData.licenciaFrente) {
          formData.append('licenciaFrente', clienteData.licenciaFrente);
        }
        if (clienteData.licenciaReverso) {
          formData.append('licenciaReverso', clienteData.licenciaReverso);
        }
        if (clienteData.pasaporteFrente) {
          formData.append('pasaporteFrente', clienteData.pasaporteFrente);
        }
        if (clienteData.pasaporteReverso) {
          formData.append('pasaporteReverso', clienteData.pasaporteReverso);
        }
      }

      const response = await fetch(REGISTER_API_URL, {
        method: 'POST',
        body: formData,
        credentials: 'include' // Incluir cookies
        // NO incluir Content-Type header - el browser lo maneja automáticamente con el boundary correcto
      });
      
      const responseText = await response.text();
      console.log('📥 [API] Respuesta del servidor (raw):', responseText);
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error('❌ [API] Error parseando respuesta:', e);
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${responseText}`);
        }
        throw new Error('Respuesta no válida del servidor');
      }
      
      if (!response.ok) {
        throw new Error(responseData.message || `Error ${response.status}`);
      }
      
      console.log('✅ [API] Cliente creado exitosamente:', responseData);
      return responseData;
    } catch (error) {
      console.error('❌ [API] Error creating cliente:', error);
      throw error;
    }
  }

  static async updateCliente(id, clienteData) {
    try {
      console.log('📤 [API] Actualizando cliente:', id);
      console.log('📤 [API] Tipo de datos:', clienteData instanceof FormData ? 'FormData' : typeof clienteData);
      
      const isFormData = clienteData instanceof FormData;
      
      if (isFormData) {
        // Debug: mostrar contenido del FormData
        console.log('=== CONTENIDO FORMDATA PARA UPDATE ===');
        for (let [key, value] of clienteData.entries()) {
          if (value instanceof File) {
            console.log(`${key}: [File] ${value.name} (${value.type}, ${value.size} bytes)`);
          } else {
            console.log(`${key}: ${value}`);
          }
        }
      }
      
      const requestOptions = {
        method: 'PUT',
        body: isFormData ? clienteData : JSON.stringify(clienteData),
        credentials: 'include'
      };

      // Solo agregar Content-Type si NO es FormData
      if (!isFormData) {
        requestOptions.headers = {
          'Content-Type': 'application/json',
        };
      }

      console.log('📡 [API] Enviando update al servidor...');
      const response = await fetch(`${API_BASE_URL}/${id}`, requestOptions);
      
      console.log('📡 [API] Response status:', response.status);
      
      const responseText = await response.text();
      console.log('📡 [API] Response body (raw):', responseText);
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error('❌ [API] Error parseando respuesta JSON:', e);
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${responseText}`);
        }
        throw new Error('Respuesta no válida del servidor');
      }
      
      if (!response.ok) {
        console.error('❌ [API] Error en update:', responseData);
        throw new Error(responseData.message || `Error ${response.status}`);
      }
      
      console.log('✅ [API] Cliente actualizado exitosamente:', responseData);
      return responseData;
    } catch (error) {
      console.error('❌ [API] Error updating cliente:', error);
      throw error;
    }
  }

  static async deleteCliente(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
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
        body: JSON.stringify({ correo: email }),
        credentials: 'include'
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