import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import VehicleDetailCard from './components/VehicleDetailCard';
import MaintenanceTypeDetail from './components/TypeDetail';
import CustomDetailCalendar from './components/CustomDetailCalendar';
import DateDisplay from './components/DateDisplay';
import DeleteConfirmationModal from './modals/DeleteModal';
import UpdateSuccessModal from './modals/UpdateSuccessModal';
import { useFetchMaintenances } from './hooks/useFetchMaintenances';

const API_BASE_URL = 'http://10.0.2.2:4000/api';

const MaintenanceDetailsScreen = ({ route, navigation }) => {
  const { maintenanceId } = route.params;
  
  const [maintenance, setMaintenance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpdateSuccessModal, setShowUpdateSuccessModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  // Estado de edición - inicializamos con los datos originales
  const [editedData, setEditedData] = useState({
    vehicleId: null,
    maintenanceType: '',
    startDate: null,
    returnDate: null,
    status: 'Pending'
  });
  
  const { updateMaintenance, deleteMaintenance } = useFetchMaintenances();

  useEffect(() => {
    fetchMaintenanceDetails();
  }, [maintenanceId]);

  const fetchMaintenanceDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/maintenances/${maintenanceId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Error al cargar mantenimiento`);
      }

      const result = await response.json();
      if (result.success) {
        setMaintenance(result.data);
        // Inicializar datos de edición con los valores originales
        setEditedData({
          vehicleId: result.data.vehicleId,
          maintenanceType: result.data.maintenanceType,
          startDate: result.data.startDate,
          returnDate: result.data.returnDate,
          status: result.data.status
        });
      } else {
        throw new Error(result.message || 'Error al cargar mantenimiento');
      }
    } catch (error) {
      console.error('Error al cargar mantenimiento:', error);
      Alert.alert('Error', 'No se pudo cargar el mantenimiento');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (isEditing) {
      Alert.alert(
        'Descartar cambios',
        '¿Estás seguro que deseas salir sin guardar los cambios?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Salir sin guardar', onPress: () => navigation.goBack() }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleUpdate = async () => {
    // Validaciones
    if (!editedData.vehicleId) {
      Alert.alert('Error', 'Por favor selecciona un vehículo');
      return;
    }

    if (!editedData.maintenanceType?.trim()) {
      Alert.alert('Error', 'Por favor ingresa el tipo de mantenimiento');
      return;
    }

    if (!editedData.startDate || !editedData.returnDate) {
      Alert.alert('Error', 'Por favor selecciona las fechas de inicio y fin');
      return;
    }

    if (new Date(editedData.startDate) >= new Date(editedData.returnDate)) {
      Alert.alert('Error', 'La fecha de inicio debe ser anterior a la fecha de devolución');
      return;
    }

    try {
      setUpdating(true);

      const updatedData = {
        vehicleId: editedData.vehicleId._id,
        maintenanceType: editedData.maintenanceType.trim(),
        startDate: editedData.startDate,
        returnDate: editedData.returnDate,
        status: editedData.status
      };

      const updated = await updateMaintenance(maintenanceId, updatedData);
      setMaintenance(updated);
      setIsEditing(false);
      
      // Mostrar modal de éxito en lugar del alert
      setShowUpdateSuccessModal(true);
      
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el mantenimiento');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    // Restaurar datos originales
    setEditedData({
      vehicleId: maintenance.vehicleId,
      maintenanceType: maintenance.maintenanceType,
      startDate: maintenance.startDate,
      returnDate: maintenance.returnDate,
      status: maintenance.status
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteMaintenance(maintenanceId);
      setShowDeleteModal(false);
      Alert.alert('Éxito', 'Mantenimiento eliminado correctamente');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar el mantenimiento');
      setShowDeleteModal(false);
    }
  };

  // Funciones para actualizar los datos editados
  const handleVehicleChange = (vehicle) => {
    setEditedData(prev => ({ ...prev, vehicleId: vehicle }));
  };

  const handleTypeChange = (type) => {
    setEditedData(prev => ({ ...prev, maintenanceType: type }));
  };

  const handleDateChange = (startDate, endDate) => {
    // Si solo se proporciona startDate (string), asumir que es el primer parámetro
    if (typeof startDate === 'string' && typeof endDate === 'string') {
      setEditedData(prev => ({
        ...prev,
        startDate: startDate,
        returnDate: endDate
      }));
    } else {
      // Manejar casos donde se pasan las fechas por separado
      if (startDate) {
        setEditedData(prev => ({
          ...prev,
          startDate: typeof startDate === 'string' ? startDate : startDate.toISOString()
        }));
      }
      if (endDate) {
        setEditedData(prev => ({
          ...prev,
          returnDate: typeof endDate === 'string' ? endDate : endDate.toISOString()
        }));
      }
    }
  };

  const handleUpdateSuccessClose = () => {
    setShowUpdateSuccessModal(false);
  };

  const handleStatusChange = (status) => {
    setEditedData(prev => ({ ...prev, status: status }));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalles mantenimiento</Text>
          <View style={styles.editButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Cargando detalles...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!maintenance) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Error</Text>
          <View style={styles.editButton} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorText}>No se encontró el mantenimiento</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Determinar qué datos mostrar (editados o originales)
  const displayData = isEditing ? editedData : maintenance;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Editando mantenimiento' : 'Detalles mantenimiento'}
        </Text>
        {!isEditing ? (
          <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
            <Ionicons name="create-outline" size={24} color="white" />
          </TouchableOpacity>
        ) : (
          <View style={styles.editButton} />
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <VehicleDetailCard 
          vehicle={displayData.vehicleId} 
          isEditing={isEditing}
          onVehicleChange={handleVehicleChange}
        />

        <MaintenanceTypeDetail 
          maintenanceType={displayData.maintenanceType}
          isEditing={isEditing}
          onTypeChange={handleTypeChange}
        />

        <CustomDetailCalendar 
          startDate={displayData.startDate}
          endDate={displayData.returnDate}
          status={displayData.status}
          maintenanceId={maintenanceId}
          vehicleId={displayData.vehicleId?._id}
          isEditing={isEditing}
          onDateChange={handleDateChange}
          onStatusChange={handleStatusChange}
        />

        <View style={styles.datesSection}>
          <DateDisplay 
            label="Fecha de inicio"
            date={displayData.startDate}
          />
          <DateDisplay 
            label="Fecha de devolución"
            date={displayData.returnDate}
          />
        </View>

        {/* Mostrar diferentes botones según el modo */}
        {isEditing ? (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={updating}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.updateButton, updating && styles.disabledButton]}
              onPress={handleUpdate}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.updateButtonText}>Actualizar</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <Text style={styles.deleteButtonText}>Eliminar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.editActionButton}
              onPress={handleEdit}
            >
              <Text style={styles.editActionButtonText}>Editar</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      <DeleteConfirmationModal
        visible={showDeleteModal}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
        maintenanceName={maintenance.vehicleId?.vehicleName}
      />

      <UpdateSuccessModal
        visible={showUpdateSuccessModal}
        onClose={handleUpdateSuccessClose}
        vehicleName={maintenance.vehicleId?.vehicleName}
        autoClose={true}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  editButton: {
    marginLeft: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
  },
  datesSection: {
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6B7280',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  updateButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  updateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#DC2626',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  editActionButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  editActionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
});

export default MaintenanceDetailsScreen;