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
import VehicleSelector from './components/VehicleSelector';
import MaintenanceTypeSelector from './components/TypeSelector';
import CustomCalendar from './components/CustomCalendar';
import DateInput from './components/DateInput';
import ConfirmationModal from './modals/Confirmation';
import SuccessModal from './modals/SaveMaintenance';
import { useFetchMaintenances } from '../Maintenances/hooks/useFetchMaintenances';

// Para emulador Android usa 10.0.2.2 en lugar de localhost
const API_BASE_URL = 'http://10.0.2.2:4000/api';

const AddMaintenanceScreen = ({ navigation }) => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [maintenanceType, setMaintenanceType] = useState('Cambio de aceite');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [status, setStatus] = useState('Pending');
  const [loading, setLoading] = useState(false);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const { createMaintenance } = useFetchMaintenances();

  // Cargar vehículos desde la API
  useEffect(() => {
    fetchVehicles();
  }, []);

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

  const handleBack = () => {
    navigation.goBack();
  };

  const handleCancel = () => {
    // Verificar si hay datos sin guardar
    if (selectedVehicle || maintenanceType !== 'Cambio de aceite' || 
        startDate || endDate) {
      setShowConfirmationModal(true);
    } else {
      navigation.goBack();
    }
  };

  const handleConfirmCancel = () => {
    setShowConfirmationModal(false);
    navigation.goBack();
  };

  const handleCancelModal = () => {
    setShowConfirmationModal(false);
  };

  const formatDateForAPI = (date) => {
    return date.toISOString();
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

    if (startDate >= endDate) {
      Alert.alert('Error', 'La fecha de inicio debe ser anterior a la fecha de devolución');
      return;
    }

    try {
      setLoading(true);

      const maintenanceData = {
        vehicleId: selectedVehicle._id,
        maintenanceType: maintenanceType.trim(),
        startDate: formatDateForAPI(startDate),
        returnDate: formatDateForAPI(endDate),
        status: status
      };

      await createMaintenance(maintenanceData);
      
      // Mostrar modal de éxito
      setShowSuccessModal(true);

    } catch (error) {
      console.error('Error al crear mantenimiento:', error);
      Alert.alert('Error', error.message || 'No se pudo guardar el mantenimiento');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessOk = () => {
    setShowSuccessModal(false);
    navigation.goBack();
  };


// En AddMaintenanceScreen.js, reemplaza la función handleDateChange con esta versión:

const handleDateChange = (date, type) => {
  if (type === 'start') {
    setStartDate(date);
    // No modificar automáticamente endDate cuando se selecciona startDate desde el calendario
  } else if (type === 'end') {
    if (date === null) {
      // Permitir limpiar la fecha de fin
      setEndDate(null);
    } else if (startDate && date >= startDate) {
      setEndDate(date);
    } else if (startDate && date < startDate) {
      Alert.alert('Error', 'La fecha de devolución debe ser posterior o igual a la fecha de inicio');
    } else {
      // Si no hay startDate, establecer endDate normalmente
      setEndDate(date);
    }
  }
};

  const formatDateForDisplay = (date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (vehiclesLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Añadir mantenimiento</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Cargando vehículos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Añadir mantenimiento</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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

        {/* Status Tabs - Mantenimiento, Reservado, Disponible */}
        <View style={styles.statusSection}>
          <View style={styles.statusTabs}>
            <TouchableOpacity 
              style={[styles.statusTab, styles.availableTab]}
              disabled
            >
              <Text style={styles.availableTabText}>Disponible</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.statusTab, styles.reservedTab]}
              disabled
            >
              <Text style={styles.reservedTabText}>Reservado</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.statusTab, styles.maintenanceTab]}
              disabled
            >
              <Text style={styles.maintenanceTabText}>Mantenimiento</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Calendar */}
        <CustomCalendar 
          selectedVehicle={selectedVehicle}
          startDate={startDate}
          endDate={endDate}
          onDateSelect={handleDateChange}
        />

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
          {!startDate && (
            <TouchableOpacity 
              style={styles.emptyDateInput}
              onPress={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                handleDateChange(tomorrow, 'start');
              }}
            >
              <Text style={styles.emptyDateLabel}>Fecha de inicio</Text>
              <Text style={styles.emptyDateText}>Seleccionar fecha</Text>
            </TouchableOpacity>
          )}

          {endDate && (
            <DateInput 
              label="Fecha de devolución"
              value={endDate}
              onChangeDate={(date) => handleDateChange(date, 'end')}
              minimumDate={startDate ? new Date(startDate.getTime() + 24 * 60 * 60 * 1000) : new Date()}
            />
          )}
          {!endDate && startDate && (
            <TouchableOpacity 
              style={styles.emptyDateInput}
              onPress={() => {
                const dayAfterStart = new Date(startDate);
                dayAfterStart.setDate(dayAfterStart.getDate() + 1);
                handleDateChange(dayAfterStart, 'end');
              }}
            >
              <Text style={styles.emptyDateLabel}>Fecha de devolución</Text>
              <Text style={styles.emptyDateText}>Seleccionar fecha</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Status Selection for Maintenance */}
        <View style={styles.maintenanceStatusSection}>
          <Text style={styles.statusLabel}>Estado de mantenimiento</Text>
          
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

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.saveButton, loading && styles.disabledButton]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.saveButtonText}>Guardar</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modals */}
      <ConfirmationModal
        visible={showConfirmationModal}
        onCancel={handleCancelModal}
        onConfirm={handleConfirmCancel}
        loading={loading}
      />

      <SuccessModal
        visible={showSuccessModal}
        onOk={handleSuccessOk}
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
    flexDirection: 'row',
    alignItems: 'center',
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
    marginTop: 10,
    fontSize: 16,
    color: '#6B7280',
  },
  statusSection: {
    marginBottom: 24,
  },
  statusTabs: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 2,
  },
  availableTab: {
    backgroundColor: '#F3F4F6',
  },
  reservedTab: {
    backgroundColor: '#DBEAFE',
  },
  maintenanceTab: {
    backgroundColor: '#FEF3C7',
  },
  availableTabText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  reservedTabText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  maintenanceTabText: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '600',
  },
  dateSection: {
    marginBottom: 24,
  },
  maintenanceStatusSection: {
    marginBottom: 32,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
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
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 32,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#DC2626',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
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
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyDateInput: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  emptyDateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  emptyDateText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
});


export default AddMaintenanceScreen;