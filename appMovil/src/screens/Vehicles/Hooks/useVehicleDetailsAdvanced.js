import { useState, useEffect } from 'react';
import { Linking, Alert, Platform } from 'react-native';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

const API_BASE = 'https://diunsolorentacar.onrender.com';

export default function useVehicleDetailsAdvanced(vehicleId) {
  const [vehicle, setVehicle] = useState(null);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);
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

  // Download contract - Versión avanzada con descarga real
  const downloadContract = async () => {
    try {
      setDownloading(true);
      setError(null);

      // Primero obtener la URL del contrato
      const response = await fetch(`${API_BASE}/api/vehicles/contract-download/${vehicleId}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.downloadUrl) {
          // Opción 1: Abrir en navegador (más simple)
          const supported = await Linking.canOpenURL(data.downloadUrl);
          if (supported) {
            await Linking.openURL(data.downloadUrl);
            setSuccess('download');
            return true;
          } else {
            setError('No se puede abrir el enlace de descarga');
            return false;
          }

          // Opción 2: Descargar archivo (comentado, requiere configuración adicional)
          /*
          try {
            const fileName = `contrato_${vehicle?.plate || vehicleId}_${Date.now()}.pdf`;
            const downloadDest = `${RNFS.DocumentDirectoryPath}/${fileName}`;

            const downloadResult = await RNFS.downloadFile({
              fromUrl: data.downloadUrl,
              toFile: downloadDest,
            }).promise;

            if (downloadResult.statusCode === 200) {
              // Mostrar opciones para compartir o abrir el archivo
              Alert.alert(
                'Descarga completada',
                'El contrato se ha descargado exitosamente. ¿Qué deseas hacer?',
                [
                  {
                    text: 'Compartir',
                    onPress: () => shareFile(downloadDest),
                  },
                  {
                    text: 'Ver archivo',
                    onPress: () => openFile(downloadDest),
                  },
                  { text: 'Cerrar', style: 'cancel' },
                ]
              );
              setSuccess('download');
              return true;
            } else {
              setError('Error al descargar el archivo');
              return false;
            }
          } catch (downloadError) {
            console.error('Error downloading file:', downloadError);
            setError('Error al descargar el archivo');
            return false;
          }
          */
        } else {
          setError('URL de descarga no disponible');
          return false;
        }
      } else {
        const errorData = await response.json();
        setError(errorData.mensaje || 'Error al obtener el contrato');
        return false;
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error downloading contract:', err);
      return false;
    } finally {
      setDownloading(false);
    }
  };

  // Función para compartir archivo
  const shareFile = async (filePath) => {
    try {
      const shareOptions = {
        title: 'Contrato de Arrendamiento',
        message: 'Contrato de arrendamiento del vehículo',
        url: `file://${filePath}`,
        type: 'application/pdf',
      };
      await Share.open(shareOptions);
    } catch (error) {
      console.error('Error sharing file:', error);
    }
  };

  // Función para abrir archivo
  const openFile = async (filePath) => {
    try {
      await Linking.openURL(`file://${filePath}`);
    } catch (error) {
      console.error('Error opening file:', error);
      Alert.alert('Error', 'No se pudo abrir el archivo');
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
    downloading,
    error,
    success,
    editMode,
    formData,
    vehicleTypes,
    statusOptions,
    updateVehicle,
    deleteVehicle,
    downloadContract,
    updateFormField,
    toggleEditMode,
    clearSuccess,
    refreshVehicle: fetchVehicle
  };
}
