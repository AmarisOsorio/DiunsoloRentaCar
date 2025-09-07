import { useState, useEffect } from 'react';
import { Linking } from 'react-native';

const API_BASE = 'https://diunsolorentacar.onrender.com';

export default function useVehicleDetails(vehicleId) {
  const [vehicle, setVehicle] = useState(null);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form states para actualización
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    vehicleName: '',
    dailyPrice: '',
    plate: '',
    brandId: '',
    vehicleClass: '',
    color: '',
    year: '',
    capacity: '',
    model: '',
    engineNumber: '',
    chassisNumber: '',
    vinNumber: '',
    status: ''
  });

  const vehicleTypes = [
    { label: 'Pick up', value: 'Pick up' },
    { label: 'SUV', value: 'SUV' },
    { label: 'Sedán', value: 'Sedán' },
    { label: 'Camión', value: 'Camión' },
    { label: 'Van', value: 'Van' },
  ];

  const statusOptions = [
    { label: 'Disponible', value: 'Disponible' },
    { label: 'Reservado', value: 'Reservado' },
    { label: 'Mantenimiento', value: 'Mantenimiento' },
  ];

  // Fetch vehicle details
  const fetchVehicle = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/vehicles/${vehicleId}`);
      const data = await response.json();
      
      if (response.ok) {
        setVehicle(data);
        // Poblar formulario con datos actuales
        setFormData({
          vehicleName: data.vehicleName || '',
          dailyPrice: data.dailyPrice?.toString() || '',
          plate: data.plate || '',
          brandId: data.brandId?._id || data.brandId || '',
          vehicleClass: data.vehicleClass || '',
          color: data.color || '',
          year: data.year?.toString() || '',
          capacity: data.capacity?.toString() || '',
          model: data.model || '',
          engineNumber: data.engineNumber || '',
          chassisNumber: data.chassisNumber || '',
          vinNumber: data.vinNumber || '',
          status: data.status || 'Disponible'
        });
      } else {
        setError(data.mensaje || 'Error al cargar el vehículo');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error fetching vehicle:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch brands
  const fetchBrands = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/brands`);
      const data = await response.json();
      setBrands(data);
    } catch (err) {
      console.error('Error fetching brands:', err);
      setBrands([]);
    }
  };

  // Update vehicle
  const updateVehicle = async () => {
    try {
      setUpdating(true);
      setError(null);

      const response = await fetch(`${API_BASE}/api/vehicles/${vehicleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          dailyPrice: parseFloat(formData.dailyPrice),
          year: parseInt(formData.year),
          capacity: parseInt(formData.capacity)
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('update');
        setVehicle(data.vehicle || data);
        setEditMode(false);
        // Refresh vehicle data
        setTimeout(() => {
          fetchVehicle();
        }, 500);
      } else {
        setError(data.message || data.mensaje || 'Error al actualizar el vehículo');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error updating vehicle:', err);
    } finally {
      setUpdating(false);
    }
  };

  // Delete vehicle
  const deleteVehicle = async () => {
    try {
      setDeleting(true);
      setError(null);

      const response = await fetch(`${API_BASE}/api/vehicles/${vehicleId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSuccess('delete');
        return true; // Indica que se eliminó exitosamente
      } else {
        const data = await response.json();
        setError(data.message || data.mensaje || 'Error al eliminar el vehículo');
        return false;
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error deleting vehicle:', err);
      return false;
    } finally {
      setDeleting(false);
    }
  };

  // Test connection to backend
  const testConnection = async () => {
    try {
      console.log('🔄 Probando conexión al backend...');
      const url = `${API_BASE}/api/vehicles/test-connection`;
      console.log('📡 URL de prueba:', url);
      
      const response = await fetch(url);
      console.log('📥 Status de respuesta:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Respuesta de prueba:', data);
        return true;
      } else {
        console.error('❌ Error en respuesta de prueba:', response.status);
        return false;
      }
    } catch (err) {
      console.error('❌ Error en conexión de prueba:', err);
      return false;
    }
  };

  // Download contract
  const downloadContract = async () => {
    try {
      console.log('🔄 Iniciando descarga de contrato para vehículo ID:', vehicleId);
      setError(null); // Limpiar errores previos
      
      const url = `${API_BASE}/api/vehicles/contract-download/${vehicleId}`;
      console.log('📡 Realizando petición a:', url);
      
      const response = await fetch(url);
      console.log('📥 Respuesta recibida, status:', response.status);
      
      // Si recibimos un 404, el servidor no tiene la ruta actualizada
      if (response.status === 404) {
        console.log('⚠️ Endpoint no encontrado en servidor de producción, usando contrato genérico');
        
        // URL de contrato genérico como fallback
        const fallbackUrl = "https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing";
        
        const supported = await Linking.canOpenURL(fallbackUrl);
        if (supported) {
          await Linking.openURL(fallbackUrl);
          console.log('✅ Contrato genérico abierto exitosamente');
          return true;
        } else {
          console.error('❌ No se puede abrir el contrato genérico');
          setError('No se puede abrir el contrato');
          return false;
        }
      }
      
      // Try to parse JSON response for successful responses
      let data;
      try {
        data = await response.json();
        console.log('✅ Datos recibidos:', data);
      } catch (parseError) {
        console.error('❌ Error al parsear JSON:', parseError);
        
        // Si no se puede parsear como JSON, probablemente es HTML (error del servidor)
        console.log('⚠️ Respuesta no es JSON, usando contrato genérico como fallback');
        const fallbackUrl = "https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing";
        
        const supported = await Linking.canOpenURL(fallbackUrl);
        if (supported) {
          await Linking.openURL(fallbackUrl);
          console.log('✅ Contrato genérico abierto como fallback');
          return true;
        } else {
          setError('Error al procesar la respuesta del servidor');
          return false;
        }
      }
      
      // Check if we have a downloadUrl regardless of status code
      if (data.downloadUrl) {
        console.log('🔗 URL de descarga encontrada:', data.downloadUrl);
        
        // Show warning if in fallback mode
        if (data.fallbackMode || data.emergencyMode) {
          console.log('⚠️ Modo fallback activado:', data.warning || data.mensaje);
        }
        
        // Abrir la URL en el navegador del dispositivo
        const supported = await Linking.canOpenURL(data.downloadUrl);
        if (supported) {
          await Linking.openURL(data.downloadUrl);
          setSuccess('download');
          return true;
        } else {
          console.error('❌ No se puede abrir la URL:', data.downloadUrl);
          setError('No se puede abrir el enlace de descarga');
          return false;
        }
      }
      
      // If response is ok but no downloadUrl
      if (response.ok) {
        console.error('❌ Respuesta exitosa pero sin URL válida:', data);
        setError(data.mensaje || 'URL de descarga no disponible');
        return false;
      } else {
        // Handle error responses
        console.error('❌ Error response:', data);
        
        // Manejar diferentes tipos de errores
        if (response.status === 404) {
          setError(data.mensaje || 'Vehículo o contrato no encontrado');
        } else if (response.status === 500) {
          setError('Error del servidor al generar el contrato. Intente nuevamente.');
        } else {
          setError(data.mensaje || 'Error al descargar el contrato');
        }
        return false;
      }
    } catch (err) {
      console.error('❌ Error downloading contract:', err);
      setError('Error de conexión. Verifique su conexión a internet e intente nuevamente.');
      return false;
    }
  };

  // Update form field
  const updateFormField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    if (editMode) {
      // Si cancelamos, restaurar datos originales
      if (vehicle) {
        setFormData({
          vehicleName: vehicle.vehicleName || '',
          dailyPrice: vehicle.dailyPrice?.toString() || '',
          plate: vehicle.plate || '',
          brandId: vehicle.brandId?._id || vehicle.brandId || '',
          vehicleClass: vehicle.vehicleClass || '',
          color: vehicle.color || '',
          year: vehicle.year?.toString() || '',
          capacity: vehicle.capacity?.toString() || '',
          model: vehicle.model || '',
          engineNumber: vehicle.engineNumber || '',
          chassisNumber: vehicle.chassisNumber || '',
          vinNumber: vehicle.vinNumber || '',
          status: vehicle.status || 'Disponible'
        });
      }
    }
    setEditMode(!editMode);
    setError(null);
  };

  // Reset success message
  const clearSuccess = () => {
    setSuccess(null);
  };

  useEffect(() => {
    if (vehicleId) {
      Promise.all([fetchVehicle(), fetchBrands()]);
    }
  }, [vehicleId]);

  return {
    vehicle,
    brands,
    loading,
    updating,
    deleting,
    error,
    success,
    editMode,
    formData,
    vehicleTypes,
    statusOptions,
    updateVehicle,
    deleteVehicle,
    downloadContract,
    testConnection,
    updateFormField,
    toggleEditMode,
    clearSuccess,
    refreshVehicle: fetchVehicle
  };
}
