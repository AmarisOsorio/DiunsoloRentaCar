import { useState, useEffect } from 'react';
import axios from 'axios';
import { Alert } from 'react-native';

const API_BASE_URL = 'https://diunsolorentacar.onrender.com/api';

export default function useVehicleDetails(vehicleId) {
  // Estados principales
  const [vehicle, setVehicle] = useState(null);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // Datos del formulario
  const [formData, setFormData] = useState({
    vehicleName: '',
    model: '',
    year: '',
    capacity: '',
    color: '',
    dailyPrice: '',
    brandId: '',
    vehicleClass: '',
    status: 'Disponible',
    plate: '',
    engineNumber: '',
    chassisNumber: '',
    vinNumber: '',
    mainViewImage: '',
    sideImage: '',
    galleryImages: []
  });

  // Opciones para los selectores
  const vehicleTypes = [
    { label: 'Sedán', value: 'Sedán' },
    { label: 'SUV', value: 'SUV' },
    { label: 'Hatchback', value: 'Hatchback' },
    { label: 'Pickup', value: 'Pickup' },
    { label: 'Convertible', value: 'Convertible' },
    { label: 'Coupé', value: 'Coupé' },
    { label: 'Minivan', value: 'Minivan' },
    { label: 'Deportivo', value: 'Deportivo' }
  ];

  const statusOptions = [
    { label: 'Disponible', value: 'Disponible' },
    { label: 'Reservado', value: 'Reservado' },
    { label: 'Mantenimiento', value: 'Mantenimiento' }
  ];

  // Cargar datos iniciales
  useEffect(() => {
    if (vehicleId) {
      loadVehicleDetails();
      loadBrands();
    }
  }, [vehicleId]);

  // Función para cargar detalles del vehículo
  const loadVehicleDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE_URL}/vehicles/${vehicleId}`);
      const vehicleData = response.data;
      
      setVehicle(vehicleData);
      
      // Llenar formData con los datos del vehículo
      setFormData({
        vehicleName: vehicleData.vehicleName || '',
        model: vehicleData.model || '',
        year: vehicleData.year?.toString() || '',
        capacity: vehicleData.capacity?.toString() || '',
        color: vehicleData.color || '',
        dailyPrice: vehicleData.dailyPrice?.toString() || '',
        brandId: vehicleData.brandId?._id || vehicleData.brandId || '',
        vehicleClass: vehicleData.vehicleClass || '',
        status: vehicleData.status || 'Disponible',
        plate: vehicleData.plate || '',
        engineNumber: vehicleData.engineNumber || '',
        chassisNumber: vehicleData.chassisNumber || '',
        vinNumber: vehicleData.vinNumber || '',
        mainViewImage: vehicleData.mainViewImage || '',
        sideImage: vehicleData.sideImage || '',
        galleryImages: vehicleData.galleryImages || []
      });
      
    } catch (err) {
      console.error('Error loading vehicle details:', err);
      setError(err.response?.data?.message || 'Error al cargar los detalles del vehículo');
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar marcas
  const loadBrands = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/brands`);
      setBrands(response.data || []);
    } catch (err) {
      console.error('Error loading brands:', err);
      // No mostramos error aquí porque es secundario
    }
  };

  // Función para actualizar campo del formulario
  const updateFormField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Función para alternar modo de edición
  const toggleEditMode = () => {
    if (editMode) {
      // Si estamos saliendo del modo edición, restaurar datos originales
      if (vehicle) {
        setFormData({
          vehicleName: vehicle.vehicleName || '',
          model: vehicle.model || '',
          year: vehicle.year?.toString() || '',
          capacity: vehicle.capacity?.toString() || '',
          color: vehicle.color || '',
          dailyPrice: vehicle.dailyPrice?.toString() || '',
          brandId: vehicle.brandId?._id || vehicle.brandId || '',
          vehicleClass: vehicle.vehicleClass || '',
          status: vehicle.status || 'Disponible',
          plate: vehicle.plate || '',
          engineNumber: vehicle.engineNumber || '',
          chassisNumber: vehicle.chassisNumber || '',
          vinNumber: vehicle.vinNumber || '',
          mainViewImage: vehicle.mainViewImage || '',
          sideImage: vehicle.sideImage || '',
          galleryImages: vehicle.galleryImages || []
        });
      }
    }
    setEditMode(!editMode);
    setError(null);
  };

  // Función para actualizar vehículo
  const updateVehicle = async () => {
    try {
      setUpdating(true);
      setError(null);

      // Preparar datos para enviar
      const updateData = {
        ...formData,
        year: parseInt(formData.year) || 0,
        capacity: parseInt(formData.capacity) || 0,
        dailyPrice: parseFloat(formData.dailyPrice) || 0
      };

      const response = await axios.put(`${API_BASE_URL}/vehicles/${vehicleId}`, updateData);
      
      setVehicle(response.data);
      setEditMode(false);
      setSuccess('Vehículo actualizado exitosamente');
      
      return true;
    } catch (err) {
      console.error('Error updating vehicle:', err);
      setError(err.response?.data?.message || 'Error al actualizar el vehículo');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  // Función para eliminar vehículo
  const deleteVehicle = async () => {
    try {
      setDeleting(true);
      setError(null);

      await axios.delete(`${API_BASE_URL}/vehicles/${vehicleId}`);
      
      setSuccess('Vehículo eliminado exitosamente');
      return true;
    } catch (err) {
      console.error('Error deleting vehicle:', err);
      setError(err.response?.data?.message || 'Error al eliminar el vehículo');
      return false;
    } finally {
      setDeleting(false);
    }
  };

  // Función para descargar contrato
  const downloadContract = async () => {
    try {
      setError(null);
      
      // Aquí implementarías la lógica de descarga
      // Por ahora simularemos la descarga
      Alert.alert('Funcionalidad pendiente', 'La descarga de contratos se implementará próximamente');
      
      setSuccess('Descarga iniciada');
      return true;
    } catch (err) {
      console.error('Error downloading contract:', err);
      setError('Error al descargar el contrato');
      return false;
    }
  };

  // Función para limpiar mensaje de éxito
  const clearSuccess = () => {
    setSuccess(null);
  };

  // Función para limpiar errores
  const clearError = () => {
    setError(null);
  };

  return {
    // Estados
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
    
    // Funciones
    updateVehicle,
    deleteVehicle,
    downloadContract,
    updateFormField,
    toggleEditMode,
    clearSuccess,
    clearError,
    loadVehicleDetails
  };
}
