import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFetchReservations } from './hooks/useFetchReservations';

const API_BASE_URL = 'http://10.0.2.2:4000/api';

const EditReservationScreen = ({ route, navigation }) => {
  const { reservationId } = route.params;
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Estados para los datos editables
  const [vehicles, setVehicles] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [pricePerDay, setPricePerDay] = useState('');
  const [status, setStatus] = useState('Pending');
  
  // Estados para modales
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isSelectingStartDate, setIsSelectingStartDate] = useState(true);
  
  // Estados para calendario
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  
  const { updateReservation } = useFetchReservations();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchReservationDetails(),
        fetchVehicles(),
        fetchClients()
      ]);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const fetchReservationDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}`);
      const result = await response.json();
      
      if (result.success) {
        const res = result.data;
        setReservation(res);
        setSelectedVehicle(res.vehicleId);
        setSelectedClient(res.clientId);
        setStartDate(new Date(res.startDate));
        setEndDate(new Date(res.returnDate));
        setPricePerDay(res.pricePerDay.toString());
        setStatus(res.status);
      }
    } catch (error) {
      console.error('Error fetching reservation:', error);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles`);
      const data = await response.json();
      setVehicles(data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/clients`);
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const calculateDays = () => {
    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return Math.max(1, daysDiff);
  };

  const calculateTotal = () => {
    const days = calculateDays();
    const price = parseFloat(pricePerDay) || 0;
    return days * price;
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const updatedData = {
        vehicleId: selectedVehicle._id,
        clientId: selectedClient._id,
        startDate: startDate.toISOString(),
        returnDate: endDate.toISOString(),
        status: status,
        pricePerDay: parseFloat(pricePerDay)
      };

      await updateReservation(reservationId, updatedData);
      Alert.alert('Éxito', 'Reserva actualizada correctamente');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la reserva');
    } finally {
      setSaving(false);
    }
  };

  // Componente de calendario
  const renderCalendar = () => {
    const getDaysInMonth = (date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay();

      const days = [];
      
      // Días vacíos al inicio
      for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null);
      }
      
      // Días del mes
      for (let day = 1; day <= daysInMonth; day++) {
        days.push(day);
      }
      
      return days;
    };

    const isDateInRange = (day) => {
      if (!day) return false;
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      return date >= startDate && date <= endDate;
    };

    const isStartOrEndDate = (day) => {
      if (!day) return false;
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      return date.toDateString() === startDate.toDateString() || 
             date.toDateString() === endDate.toDateString();
    };

    const handleDateSelect = (day) => {
      if (!day) return;
      
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      
      if (isSelectingStartDate) {
        setStartDate(date);
        if (date > endDate) {
          const nextDay = new Date(date);
          nextDay.setDate(nextDay.getDate() + 1);
          setEndDate(nextDay);
        }
      } else {
        if (date > startDate) {
          setEndDate(date);
        } else {
          Alert.alert('Error', 'La fecha de fin debe ser posterior a la fecha de inicio');
        }
      }
    };

    const days = getDaysInMonth(currentMonth);

    return (
      <View style={styles.calendar}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity 
            onPress={() => {
              const newMonth = new Date(currentMonth);
              newMonth.setMonth(currentMonth.getMonth() - 1);
              setCurrentMonth(newMonth);
            }}
          >
            <Ionicons name="chevron-back" size={24} color="#4A90E2" />
          </TouchableOpacity>
          
          <Text style={styles.monthYear}>
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </Text>
          
          <TouchableOpacity 
            onPress={() => {
              const newMonth = new Date(currentMonth);
              newMonth.setMonth(currentMonth.getMonth() + 1);
              setCurrentMonth(newMonth);
            }}
          >
            <Ionicons name="chevron-forward" size={24} color="#4A90E2" />
          </TouchableOpacity>
        </View>

        <View style={styles.weekHeader}>
          {dayNames.map((day, index) => (
            <Text key={index} style={styles.weekDay}>{day}</Text>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {days.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.calendarDay,
                isDateInRange(day) && styles.selectedDay,
                isStartOrEndDate(day) && styles.startEndDay
              ]}
              onPress={() => handleDateSelect(day)}
            >
              <Text style={[
                styles.dayText,
                isDateInRange(day) && styles.selectedDayText
              ]}>
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalles de reserva</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Cliente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nombre del Cliente</Text>
          <TouchableOpacity 
            style={styles.inputContainer}
            onPress={() => setShowClientModal(true)}
          >
            <Text style={styles.inputText}>
              {selectedClient ? `${selectedClient.name} ${selectedClient.lastName || ''}`.trim() : 'Seleccionar cliente'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#4A90E2" />
          </TouchableOpacity>
          <Text style={styles.inputLabel}>Cliente</Text>
        </View>

        {/* Email */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputText}>
              {selectedClient?.email || 'email@ejemplo.com'}
            </Text>
          </View>
        </View>

        {/* Vehículo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehículo Deseado</Text>
          <TouchableOpacity 
            style={styles.vehicleContainer}
            onPress={() => setShowVehicleModal(true)}
          >
            {selectedVehicle && (
              <Image 
                source={{ uri: selectedVehicle.sideImage || selectedVehicle.mainViewImage || 'https://via.placeholder.com/120x80' }}
                style={styles.vehicleImage}
              />
            )}
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleText}>
                {selectedVehicle?.vehicleName || 'Seleccionar vehículo'}
              </Text>
              <Text style={styles.vehicleSubtext}>
                {selectedVehicle ? `${selectedVehicle.year} - ${selectedVehicle.model}` : 'Sin vehículo'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#4A90E2" />
          </TouchableOpacity>
        </View>

        {/* Fechas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fechas</Text>
          <TouchableOpacity 
            style={styles.calendarButton}
            onPress={() => setShowCalendar(true)}
          >
            {renderCalendar()}
          </TouchableOpacity>
        </View>

        {/* Fechas seleccionadas */}
        <View style={styles.dateRow}>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Fecha de inicio</Text>
            <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
          </View>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Fecha de devolución</Text>
            <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
          </View>
        </View>

        {/* Precio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Precio por día</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.currencySymbol}>Q</Text>
            <TextInput
              style={styles.priceInput}
              value={pricePerDay}
              onChangeText={setPricePerDay}
              keyboardType="numeric"
              placeholder="0.00"
            />
          </View>
          <Text style={styles.inputLabel}>Precio diario</Text>
        </View>

        {/* Resumen */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Días totales</Text>
          <Text style={styles.summaryValue}>{calculateDays()}</Text>
        </View>

        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Precio total</Text>
          <Text style={styles.totalValue}>Q {calculateTotal().toFixed(2)}</Text>
        </View>

        {/* Botones */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.saveButton, saving && styles.disabledButton]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.saveButtonText}>Guardar</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de Vehículos */}
      <Modal visible={showVehicleModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowVehicleModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Seleccionar Vehículo</Text>
            <View style={styles.placeholder} />
          </View>
          <FlatList
            data={vehicles}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.vehicleModalItem}
                onPress={() => {
                  setSelectedVehicle(item);
                  setPricePerDay(item.dailyPrice?.toString() || '');
                  setShowVehicleModal(false);
                }}
              >
                <Image 
                  source={{ uri: item.sideImage || item.mainViewImage || 'https://via.placeholder.com/60x40' }}
                  style={styles.vehicleModalImage}
                />
                <View style={styles.vehicleModalInfo}>
                  <Text style={styles.vehicleModalName}>{item.vehicleName}</Text>
                  <Text style={styles.vehicleModalDetails}>{item.year} - {item.model}</Text>
                  <Text style={styles.vehicleModalPrice}>Q{item.dailyPrice}/día</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>

      {/* Modal de Clientes */}
      <Modal visible={showClientModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowClientModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Seleccionar Cliente</Text>
            <View style={styles.placeholder} />
          </View>
          <FlatList
            data={clients}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.clientModalItem}
                onPress={() => {
                  setSelectedClient(item);
                  setShowClientModal(false);
                }}
              >
                <View style={styles.clientModalInfo}>
                  <Text style={styles.clientModalName}>{item.name} {item.lastName || ''}</Text>
                  <Text style={styles.clientModalEmail}>{item.email}</Text>
                  <Text style={styles.clientModalPhone}>{item.phone}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#4A90E2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inputText: {
    fontSize: 16,
    color: '#333',
  },
  inputLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  vehicleContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  vehicleImage: {
    width: 60,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  vehicleSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  calendarButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  calendar: {
    padding: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthYear: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  selectedDay: {
    backgroundColor: '#E3F2FD',
  },
  startEndDay: {
    backgroundColor: '#4A90E2',
    borderRadius: 20,
  },
  dayText: {
    fontSize: 16,
    color: '#333',
  },
  selectedDayText: {
    color: 'white',
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 16,
  },
  dateItem: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dateLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4A90E2',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    paddingLeft: 16,
  },
  priceInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#333',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 16,
    color: '#333',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A90E2',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#DC2626',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#999',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  vehicleModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  vehicleModalImage: {
    width: 60,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
  vehicleModalInfo: {
    flex: 1,
  },
  vehicleModalName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  vehicleModalDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  vehicleModalPrice: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '500',
    marginTop: 2,
  },
  clientModalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  clientModalInfo: {
    flex: 1,
  },
  clientModalName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  clientModalEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  clientModalPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});

export default EditReservationScreen;