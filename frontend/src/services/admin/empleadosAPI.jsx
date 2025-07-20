// services/empleadosAPI.js
const API_BASE_URL = 'http://localhost:4000/api/empleados';

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
      console.log('📤 [API] Iniciando creación de empleado');
      console.log('📤 [API] Tipo de datos recibidos:', empleadoData instanceof FormData ? 'FormData' : typeof empleadoData);
      
      // Detectar si empleadoData es FormData o un objeto regular
      const isFormData = empleadoData instanceof FormData;
      
      if (!isFormData) {
        console.log('❌ [API] Error: Se esperaba FormData pero se recibió:', typeof empleadoData);
        throw new Error('Se esperaba FormData para enviar archivos');
      }
      
      if (isFormData) {
        // Debug: mostrar contenido del FormData antes de enviar
        console.log('=== [API] CONTENIDO FORMDATA ANTES DE ENVIAR ===');
        let hasContent = false;
        let hasImage = false;
        
        for (let [key, value] of empleadoData.entries()) {
          hasContent = true;
          if (value instanceof File) {
            console.log(`${key}: [File] ${value.name} (${value.type}, ${value.size} bytes)`);
            if (key === 'foto') {
              hasImage = true;
              // Verificar que el archivo sea una imagen
              if (!value.type.startsWith('image/')) {
                console.warn('⚠️ [API] El archivo no es una imagen:', value.type);
              }
            }
          } else {
            console.log(`${key}: "${value}" (tipo: ${typeof value})`);
          }
        }
        
        if (!hasContent) {
          console.log('❌ [API] FormData está vacío!');
          throw new Error('FormData está vacío');
        }
        
        if (!hasImage) {
          console.log('ℹ️ [API] No se incluye imagen en esta solicitud');
        }
      }
      
      const requestOptions = {
        method: 'POST',
        body: empleadoData, // FormData no necesita JSON.stringify
        credentials: 'include' // Incluir cookies si es necesario
      };

      // NO agregar Content-Type para FormData (el browser lo maneja automáticamente)
      console.log('📡 [API] Enviando request al servidor...');
      console.log('📡 [API] URL:', API_BASE_URL);
      console.log('📡 [API] Method:', requestOptions.method);
      
      const response = await fetch(API_BASE_URL, requestOptions);
      
      console.log('📡 [API] Response status:', response.status);
      console.log('📡 [API] Response headers:', Object.fromEntries(response.headers.entries()));
      
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
        console.error('❌ [API] Error response:', responseData);
        throw new Error(responseData.message || `Error ${response.status}`);
      }
      
      console.log('✅ [API] Empleado creado exitosamente:', responseData);
      return responseData;
    } catch (error) {
      console.error('❌ [API] Error creating empleado:', error);
      console.error('❌ [API] Error stack:', error.stack);
      throw error;
    }
  }

  // Actualizar un empleado
  static async updateEmpleado(id, empleadoData) {
    try {
      console.log('📤 [API] Actualizando empleado:', id);
      console.log('📤 [API] Tipo de datos:', empleadoData instanceof FormData ? 'FormData' : typeof empleadoData);
      
      // Detectar si empleadoData es FormData o un objeto regular
      const isFormData = empleadoData instanceof FormData;
      
      if (isFormData) {
        // Debug: mostrar contenido del FormData antes de enviar
        console.log('=== [API] CONTENIDO FORMDATA EN UPDATE ===');
        let hasImage = false;
        
        for (let [key, value] of empleadoData.entries()) {
          if (value instanceof File) {
            console.log(`${key}: [File] ${value.name} (${value.type}, ${value.size} bytes)`);
            if (key === 'foto') {
              hasImage = true;
            }
          } else {
            console.log(`${key}: ${value}`);
          }
        }
        
        if (!hasImage) {
          console.log('ℹ️ [API] No se incluye nueva imagen en esta actualización');
        }
      }
      
      const requestOptions = {
        method: 'PUT',
        body: isFormData ? empleadoData : JSON.stringify(empleadoData),
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
      
      console.log('📡 [API] Update response status:', response.status);
      
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
      
      console.log('✅ [API] Empleado actualizado exitosamente:', responseData);
      return responseData;
    } catch (error) {
      console.error('❌ [API] Error updating empleado:', error);
      throw error;
    }
  }

  // Eliminar un empleado
  static async deleteEmpleado(id) {
    try {
      console.log('🗑️ [API] Eliminando empleado:', id);
      
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      console.log('📡 [API] Delete response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ [API] Error en delete:', errorData);
        throw new Error(`Error ${response.status}: ${errorData}`);
      }
      
      const result = await response.json();
      console.log('✅ [API] Empleado eliminado exitosamente:', result);
      return result;
    } catch (error) {
      console.error('❌ [API] Error deleting empleado:', error);
      throw error;
    }
  }
}

export default EmpleadosAPI;
