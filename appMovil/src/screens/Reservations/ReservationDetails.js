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
import ClientDetailCard from './components/ClientDetailCard';
import CustomDetailCalendar from './components/CustomDetailCalendar';
import DateDisplay from './components/DateDisplay';
import PriceDetail from './components/PriceDetail';
import DeleteConfirmationModal from './modals/DeleteModal';
import StatusChangeModal from './modals/StatusChangeModal';
import StatusSuccessModal from './modals/StatusSuccessModal';
import { useFetchReservations } from './hooks/useFetchReservations';

const API_BASE_URL = 'http://10.0.2.2:4000/api';

const ReservationDetailsScreen = ({ route, navigation }) => {
  const { reservationId, reservation: initialReservation } = route.params;
  
  const [reservation, setReservation] = useState(initialReservation || null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  // Estados para cambios de status
  const [showStatusChangeModal, setShowStatusChangeModal] = useState(false);
  const [showStatusSuccessModal, setShowStatusSuccessModal] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  
  // Estado de edición
  const [editedData, setEditedData] = useState({
    vehicleId: null,
    clientId: null,
    client: null,
    startDate: null,
    returnDate: null,
    status: 'Pending',
    pricePerDay: ''
  });
  
  const { updateReservation, deleteReservation } = useFetchReservations();

  useEffect(() => {
    if (reservationId) {
      fetchReservationDetails();
    }
  }, [reservationId]);

  const fetchReservationDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Error al cargar reserva`);
      }

      const result = await response.json();
      if (result.success) {
        setReservation(result.data);
        // Inicializar datos de edición con los valores originales
        setEditedData({
          vehicleId: result.data.vehicleId,
          clientId: result.data.clientId,
          client: result.data.client,
          startDate: result.data.startDate,
          returnDate: result.data.returnDate,
          status: result.data.status,
          pricePerDay: result.data.pricePerDay.toString()
        });
      } else {
        throw new Error(result.message || 'Error al cargar reserva');
      }
    } catch (error) {
      console.error('Error al cargar reserva:', error);
      Alert.alert('Error', 'No se pudo cargar la reserva');
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
    navigation.navigate('EditReservation', { reservationId: reservationId });
  };

  const calculateTotalDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDifference = end - start;
    const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
    return Math.max(1, daysDifference);
  };

  const handleUpdate = async () => {
    // Validaciones
    if (!editedData.vehicleId) {
      Alert.alert('Error', 'Por favor selecciona un vehículo');
      return;
    }

    if (!editedData.clientId && !editedData.client) {
      Alert.alert('Error', 'Por favor selecciona un cliente');
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

    if (!editedData.pricePerDay.trim() || parseFloat(editedData.pricePerDay) <= 0) {
      Alert.alert('Error', 'Por favor ingresa un precio por día válido');
      return;
    }

    try {
      setUpdating(true);

      const updatedData = {
        vehicleId: editedData.vehicleId._id || editedData.vehicleId,
        clientId: editedData.clientId._id || editedData.clientId,
        client: editedData.client,
        startDate: editedData.startDate,
        returnDate: editedData.returnDate,
        status: editedData.status,
        pricePerDay: parseFloat(editedData.pricePerDay)
      };

      const updated = await updateReservation(reservationId, updatedData);
      setReservation(updated);
      setIsEditing(false);
      Alert.alert('Éxito', 'Reserva actualizada correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la reserva');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    // Restaurar datos originales
    setEditedData({
      vehicleId: reservation.vehicleId,
      clientId: reservation.clientId,
      client: reservation.client,
      startDate: reservation.startDate,
      returnDate: reservation.returnDate,
      status: reservation.status,
      pricePerDay: reservation.pricePerDay.toString()
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteReservation(reservationId);
      setShowDeleteModal(false);
      Alert.alert('Éxito', 'Reserva eliminada correctamente');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar la reserva');
      setShowDeleteModal(false);
    }
  };

  // Funciones para cambios de estado
  const handleAcceptReservation = () => {
    setPendingStatusChange('Active');
    setShowStatusChangeModal(true);
  };

  const handleRejectReservation = () => {
    setPendingStatusChange('Completed');
    setShowStatusChangeModal(true);
  };

  const handleCompleteReservation = () => {
    setPendingStatusChange('Completed');
    setShowStatusChangeModal(true);
  };

  const handleConfirmStatusChange = async () => {
    setShowStatusChangeModal(false);
    
    try {
      setUpdating(true);
      const updated = await updateReservation(reservationId, { status: pendingStatusChange });
      setReservation(updated);
      setEditedData(prev => ({ ...prev, status: pendingStatusChange }));
      setShowStatusSuccessModal(true);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cambiar el estado de la reserva');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelStatusChange = () => {
    setShowStatusChangeModal(false);
    setPendingStatusChange(null);
  };

  const handleStatusSuccessClose = () => {
    setShowStatusSuccessModal(false);
    setPendingStatusChange(null);
  };

  // Funciones para actualizar los datos editados
  const handleVehicleChange = (vehicle) => {
    setEditedData(prev => ({ ...prev, vehicleId: vehicle }));
  };

  const handleClientChange = (client) => {
    setEditedData(prev => ({ ...prev, clientId: client }));
  };

  const handleDateChange = (startDate, endDate) => {
    setEditedData(prev => ({
      ...prev,
      startDate: startDate,
      returnDate: endDate
    }));
  };

  const handleStatusChange = (status) => {
    setEditedData(prev => ({ ...prev, status: status }));
  };

  const handlePriceChange = (price) => {
    setEditedData(prev => ({ ...prev, pricePerDay: price }));
  };

  const getClientName = () => {
    if (reservation && reservation.client && reservation.client.length > 0) {
      return reservation.client[0].name;
    }
    if (reservation && reservation.clientId) {
      return `${reservation.clientId.name || ''} ${reservation.clientId.lastName || ''}`.trim();
    }
    return 'Cliente';
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Active':
        return {
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          textColor: '#10B981',
          dotColor: '#10B981'
        };
      case 'Pending':
        return {
          backgroundColor: 'rgba(251, 146, 60, 0.15)',
          textColor: '#F59E0B',
          dotColor: '#F59E0B'
        };
      case 'Completed':
        return {
          backgroundColor: 'rgba(59, 130, 246, 0.15)',
          textColor: '#3B82F6',
          dotColor: '#3B82F6'
        };
      default:
        return {
          backgroundColor: 'rgba(107, 114, 128, 0.15)',
          textColor: '#6B7280',
          dotColor: '#6B7280'
        };
    }
  };

  const getStatusTextLocal = (status) => {
    switch (status) {
      case 'Active': return 'Activa';
      case 'Pending': return 'Pendiente';
      case 'Completed': return 'Completada';
      default: return status;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalles reserva</Text>
          <View style={styles.editButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Cargando detalles...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!reservation) {
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
          <Text style={styles.errorText}>No se encontró la reserva</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Determinar qué datos mostrar (editados o originales)
  const displayData = isEditing ? editedData : reservation;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Editando reserva' : 'Detalles reserva'}
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
        {/* Estado de la reserva - Enhanced with better styling and actions */}
        {!isEditing && (
          <View style={styles.statusActionsContainer}>
            <Text style={styles.statusActionsTitle}>Gestión de reserva</Text>
            
            {/* Current Status Display */}
            <View style={styles.currentStatusContainer}>
              <Text style={styles.currentStatusLabel}>Estado actual:</Text>
              <View style={[styles.currentStatusBadge, getStatusBadgeStyle(reservation.status)]}>
                <View style={[styles.currentStatusDot, { backgroundColor: getStatusBadgeStyle(reservation.status).dotColor }]} />
                <Text style={[styles.currentStatusText, { color: getStatusBadgeStyle(reservation.status).textColor }]}>
                  {getStatusTextLocal(reservation.status)}
                </Text>
              </View>
            </View>
            
            {/* Action Buttons based on status */}
            {reservation.status === 'Pending' && (
              <View style={styles.statusActions}>
                <TouchableOpacity 
                  style={styles.acceptButton}
                  onPress={handleAcceptReservation}
                  disabled={updating}
                >
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                  <Text style={styles.acceptButtonText}>Aceptar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.rejectButton}
                  onPress={handleRejectReservation}
                  disabled={updating}
                >
                  <Ionicons name="close-circle" size={20} color="white" />
                  <Text style={styles.rejectButtonText}>Rechazar</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {reservation.status === 'Active' && (
              <View style={styles.statusActions}>
                <TouchableOpacity 
                  style={styles.completeButton}
                  onPress={handleCompleteReservation}
                  disabled={updating}
                >
                  <Ionicons name="flag" size={20} color="white" />
                  <Text style={styles.completeButtonText}>Completar</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {reservation.status === 'Completed' && (
              <View style={styles.statusInfoContainer}>
                <Ionicons name="information-circle" size={20} color="#3B82F6" />
                <Text style={styles.statusInfoText}>
                  Esta reserva ha sido completada. El vehículo está disponible para nuevas reservas.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Información básica - Temporalmente simplificada */}
        <View style={styles.basicInfoContainer}>
          <Text style={styles.sectionTitle}>Información básica</Text>
          <Text style={styles.infoText}>Vehículo: {displayData.vehicleId?.vehicleName || 'No asignado'}</Text>
          <Text style={styles.infoText}>Cliente: {getClientName()}</Text>
          <Text style={styles.infoText}>Estado: {displayData.status}</Text>
          <Text style={styles.infoText}>Precio por día: Q{displayData.pricePerDay}</Text>
          <Text style={styles.infoText}>Días: {calculateTotalDays(displayData.startDate, displayData.returnDate)}</Text>
          <Text style={styles.infoText}>Total: Q{(parseFloat(displayData.pricePerDay) * calculateTotalDays(displayData.startDate, displayData.returnDate)).toFixed(2)}</Text>
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
        reservationName={getClientName()}
      />

      {/* Status Change Modal */}
      <StatusChangeModal
        visible={showStatusChangeModal}
        onCancel={handleCancelStatusChange}
        onConfirm={handleConfirmStatusChange}
        currentStatus={reservation?.status}
        nextStatus={pendingStatusChange}
        vehicleName={reservation?.vehicleId?.vehicleName}
        clientName={getClientName()}
        isReservation={true}
      />

      {/* Status Success Modal */}
      <StatusSuccessModal
        visible={showStatusSuccessModal}
        onClose={handleStatusSuccessClose}
        newStatus={pendingStatusChange}
        vehicleName={reservation?.vehicleId?.vehicleName}
        clientName={getClientName()}
        isReservation={true}
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
  statusActionsContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusActionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    textAlign: 'center',
  },
  currentStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  currentStatusLabel: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  currentStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  currentStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  currentStatusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusActions: {
    flexDirection: 'row',
    gap: 12,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  rejectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  completeButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  statusInfoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  statusInfoText: {
    fontSize: 14,
    color: '#1E40AF',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  basicInfoContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 24,
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
    backgroundColor: '#4A90E2',
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

export default ReservationDetailsScreen;