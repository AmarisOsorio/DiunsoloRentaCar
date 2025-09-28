import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import VehicleSelector from '../components/VehicleSelector';
import MaintenanceTypeSelector from '../components/TypeSelector';
import DateInput from '../components/DateInput';

const EditMaintenanceModal = ({ visible, maintenance, onSave, onCancel }) => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [maintenanceType, setMaintenanceType] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [status, setStatus] = useState('Pending');
  const [loading, setLoading] = useState(false);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);

  // Para emulador Android usa 10.0.2.2 en lugar de localhost
  const API_BASE_URL = 'http://10.0.2.2:4000/api';

  useEffect(() => {
    if (visible) {
      fetchVehicles();
      initializeFormData();
    }
  }, [visible, maintenance]);

  const fetchVehicles = async () => {
    try {
      setVehiclesLoading(true);
      const response = await fetch(`${API_BASE_URL}/vehicles`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Error al cargar vehículos`);
      }

      const vehiclesData = await response.json();
      setVehicles(vehiclesData);
    } catch (error) {
      console.error('Error al cargar vehículos:', error);
      Alert.alert('Error', 'No se pudieron cargar los vehículos');
    } finally {
      setVehiclesLoading(false);
    }
  };

  const initializeFormData = () => {
    if (maintenance) {
      setSelectedVehicle(maintenance.vehicleId);
      setMaintenanceType(maintenance.maintenanceType);
      setStartDate(new Date(maintenance.startDate));
      setEndDate(new Date(maintenance.returnDate));
      setStatus(maintenance.status);
    }
  };

  const handleSave = async () => {
    // Validaciones
    if (!selectedVehicle) {
      Alert.alert('Error', 'Por favor selecciona un vehículo');
      return;
    }

    if (!maintenanceType.trim()) {
      Alert.alert('Error', 'Por favor ingresa el tipo de mantenimiento');
      return;
    }

    if (!startDate || !endDate) {
      Alert.alert('Error', 'Por favor selecciona las fechas de inicio y fin');
      return;
    }

    if (startDate >= endDate) {
      Alert.alert('Error', 'La fecha de inicio debe ser anterior a la fecha de devolución');
      return;
    }

    try {
      setLoading(true);

      const updatedData = {
        vehicleId: selectedVehicle._id,
        maintenanceType: maintenanceType.trim(),
        startDate: startDate.toISOString(),
        returnDate: endDate.toISOString(),
        status: status
      };

      await onSave(updatedData);
    } catch (error) {
      console.error('Error al actualizar mantenimiento:', error);
      Alert.alert('Error', 'No se pudo actualizar el mantenimiento');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Resetear formulario
    initializeFormData();
    onCancel();
  };

  const handleDateChange = (date, type) => {
    if (type === 'start') {
      setStartDate(date);
      // Si no hay fecha de fin o la fecha de fin es antes que la nueva fecha de inicio, actualizarla
      if (!endDate || endDate <= date) {
        const newEndDate = new Date(date);
        newEndDate.setDate(newEndDate.getDate() + 1);
        setEndDate(newEndDate);
      }
    } else if (type === 'end') {
      // Solo permitir fechas posteriores a la fecha de inicio
      if (startDate && date > startDate) {
        setEndDate(date);
      } else {
        Alert.alert('Error', 'La fecha de devolución debe ser posterior a la fecha de inicio');
      }
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar mantenimiento</Text>
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveHeaderButton, loading && styles.disabledButton]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.saveHeaderText}>Guardar</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {vehiclesLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4A90E2" />
              <Text style={styles.loadingText}>Cargando vehículos...</Text>
            </View>
          ) : (
            <>
              {/* Vehicle Selector */}
              <VehicleSelector 
                vehicles={vehicles}
                selectedVehicle={selectedVehicle}
                onSelectVehicle={setSelectedVehicle}
              />

              {/* Maintenance Type */}
              <MaintenanceTypeSelector 
                maintenanceType={maintenanceType}
                onSelectType={setMaintenanceType}
              />

              {/* Status Selection */}
              <View style={styles.statusSection}>
                <Text style={styles.sectionTitle}>Estado de mantenimiento</Text>
                
                <TouchableOpacity 
                  style={[styles.statusOption, status === 'Active' && styles.statusActive]}
                  onPress={() => setStatus('Active')}
                >
                  <View style={[styles.statusDot, status === 'Active' && styles.statusDotActive]} />
                  <Text style={[styles.statusText, status === 'Active' && styles.statusTextActive]}>
                    Activa
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.statusOption, status === 'Pending' && styles.statusActive]}
                  onPress={() => setStatus('Pending')}
                >
                  <View style={[styles.statusDot, status === 'Pending' && styles.statusDotPending]} />
                  <Text style={[styles.statusText, status === 'Pending' && styles.statusTextPending]}>
                    Pendiente
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.statusOption, status === 'Completed' && styles.statusActive]}
                  onPress={() => setStatus('Completed')}
                >
                  <View style={[styles.statusDot, status === 'Completed' && styles.statusDotCompleted]} />
                  <Text style={[styles.statusText, status === 'Completed' && styles.statusTextCompleted]}>
                    Finalizada
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Date Inputs */}
              <View style={styles.dateSection}>
                {startDate && (
                  <DateInput 
                    label="Fecha de inicio"
                    value={startDate}
                    onChangeDate={(date) => handleDateChange(date, 'start')}
                    minimumDate={new Date()}
                  />
                )}

                {endDate && (
                  <DateInput 
                    label="Fecha de devolución"
                    value={endDate}
                    onChangeDate={(date) => handleDateChange(date, 'end')}
                    minimumDate={startDate ? new Date(startDate.getTime() + 24 * 60 * 60 * 1000) : new Date()}
                  />
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.cancelModalButton}
                  onPress={handleCancel}
                  disabled={loading}
                >
                  <Text style={styles.cancelModalButtonText}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.saveButton, loading && styles.disabledButton]}
                  onPress={handleSave}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.saveButtonText}>Actualizar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
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
  },
  cancelButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  saveHeaderButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveHeaderText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  statusSection: {
    marginBottom: 24,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusActive: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#D1D5DB',
    marginRight: 12,
  },
  statusDotActive: {
    backgroundColor: '#10B981',
  },
  statusDotPending: {
    backgroundColor: '#F59E0B',
  },
  statusDotCompleted: {
    backgroundColor: '#3B82F6',
  },
  statusText: {
    fontSize: 16,
    color: '#6B7280',
  },
  statusTextActive: {
    color: '#10B981',
    fontWeight: '600',
  },
  statusTextPending: {
    color: '#F59E0B',
    fontWeight: '600',
  },
  statusTextCompleted: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  dateSection: {
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 32,
  },
  cancelModalButton: {
    flex: 1,
    backgroundColor: '#6B7280',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelModalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
});

export default EditMaintenanceModal;