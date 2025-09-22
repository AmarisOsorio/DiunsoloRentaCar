import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const API_BASE_URL = 'http://10.0.2.2:4000/api';

const CustomDetailCalendar = ({ 
  startDate, 
  endDate, 
  status, 
  maintenanceId, 
  vehicleId, // Necesitamos el ID del vehículo
  isEditing, 
  onDateChange, 
  onStatusChange 
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [vehicleMaintenances, setVehicleMaintenances] = useState([]);
  const [selectedStartDate, setSelectedStartDate] = useState(startDate ? new Date(startDate) : null);
  const [selectedEndDate, setSelectedEndDate] = useState(endDate ? new Date(endDate) : null);
  const [tempStartDate, setTempStartDate] = useState(null); // Para el modo interactivo

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

  useEffect(() => {
    if (startDate) {
      const start = new Date(startDate);
      setCurrentMonth(new Date(start.getFullYear(), start.getMonth(), 1));
      setSelectedStartDate(start);
    }
    if (endDate) {
      setSelectedEndDate(new Date(endDate));
    }
    
    // Solo cargar mantenimientos si tenemos el ID del vehículo
    if (vehicleId) {
      fetchVehicleMaintenances();
    }
  }, [startDate, endDate, vehicleId]);

  // Solo notificar cambios cuando el usuario termine de seleccionar
  useEffect(() => {
    if (selectedStartDate && selectedEndDate && onDateChange && isEditing) {
      onDateChange(selectedStartDate.toISOString(), selectedEndDate.toISOString());
    }
  }, [selectedStartDate, selectedEndDate, isEditing]);

  const fetchVehicleMaintenances = async () => {
    try {
      console.log('Fetching maintenances for vehicleId:', vehicleId);
      console.log('Current maintenanceId to exclude:', maintenanceId);
      
      const response = await fetch(`${API_BASE_URL}/maintenances`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log('All maintenances:', result.data.length);
          
          // Filtrar solo mantenimientos del mismo vehículo, excluyendo el mantenimiento actual
          const sameVehicleMaintenances = result.data.filter(m => {
            const isSameVehicle = m.vehicleId && m.vehicleId._id === vehicleId;
            const isDifferentMaintenance = m._id !== maintenanceId;
            
            console.log('Maintenance:', m._id, 'Vehicle:', m.vehicleId?._id, 'Same vehicle:', isSameVehicle, 'Different maintenance:', isDifferentMaintenance);
            
            return isSameVehicle && isDifferentMaintenance;
          });
          
          console.log('Filtered same vehicle maintenances:', sameVehicleMaintenances.length);
          setVehicleMaintenances(sameVehicleMaintenances);
        }
      }
    } catch (error) {
      console.error('Error al cargar mantenimientos del vehículo:', error);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const isDateInRange = (day, startDate, endDate) => {
    if (!day || !startDate || !endDate) return false;
    
    const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    checkDate.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    return checkDate >= start && checkDate <= end;
  };

  const getOtherMaintenanceForDate = (day) => {
    if (!day) return null;
    
    const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    
    return vehicleMaintenances.find(maintenance => {
      const maintenanceStart = new Date(maintenance.startDate);
      const maintenanceEnd = new Date(maintenance.returnDate);
      
      return isDateInRange(day, maintenanceStart, maintenanceEnd);
    });
  };

  const handleDayPress = (day) => {
    if (!isEditing || !day) return;
    
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    selectedDate.setHours(12, 0, 0, 0);
    
    const otherMaintenance = getOtherMaintenanceForDate(day);
    if (otherMaintenance) {
      Alert.alert(
        'Fecha ocupada',
        `Esta fecha ya está ocupada por otro mantenimiento del mismo vehículo: "${otherMaintenance.maintenanceType}". Por favor selecciona otra fecha.`
      );
      return;
    }

    // Si ya hay un rango completo (startDate y endDate), reiniciar completamente
    if (selectedStartDate && selectedEndDate) {
      // Limpiar todo primero
      setSelectedStartDate(null);
      setSelectedEndDate(null);
      // Luego establecer nueva selección temporal
      setTimeout(() => {
        setTempStartDate(selectedDate);
      }, 20);
      return;
    }

    if (!tempStartDate && !selectedStartDate) {
      // Primera selección - guardar temporalmente
      setTempStartDate(selectedDate);
    } else {
      // Segunda selección - ahora establecer el rango completo
      let finalStartDate = tempStartDate || selectedStartDate;
      let finalEndDate = selectedDate;
      
      // Si la segunda fecha es anterior, hacer swap
      if (selectedDate < finalStartDate) {
        finalStartDate = selectedDate;
        finalEndDate = tempStartDate || selectedStartDate;
      }
      
      // Establecer ambas fechas
      setSelectedStartDate(finalStartDate);
      setSelectedEndDate(finalEndDate);
      
      // Limpiar estado temporal
      setTempStartDate(null);
    }
  };

  const getDayStyle = (day) => {
    if (!day) return null;
    
    // Verificar si es la fecha temporal (primer click) - solo en modo edición
    const isTempStartDate = isEditing && tempStartDate && 
      day === tempStartDate.getDate() && 
      currentMonth.getMonth() === tempStartDate.getMonth() && 
      currentMonth.getFullYear() === tempStartDate.getFullYear();
    
    const isCurrentMaintenance = isDateInRange(day, selectedStartDate, selectedEndDate);
    const otherMaintenance = getOtherMaintenanceForDate(day);
    
    // Prioridad: fecha temporal > mantenimiento actual > otros mantenimientos
    if (isTempStartDate) {
      return styles.tempStartDay;
    }
    
    // Mantenimiento actual (el que se está editando) - Color más oscuro
    if (isCurrentMaintenance) {
      const isStart = selectedStartDate && 
        day === selectedStartDate.getDate() && 
        currentMonth.getMonth() === selectedStartDate.getMonth() && 
        currentMonth.getFullYear() === selectedStartDate.getFullYear();
      const isEnd = selectedEndDate && 
        day === selectedEndDate.getDate() && 
        currentMonth.getMonth() === selectedEndDate.getMonth() && 
        currentMonth.getFullYear() === selectedEndDate.getFullYear();
      
      if (isStart && isEnd) {
        return styles.currentMaintenanceSingleDay;
      } else if (isStart) {
        return styles.currentMaintenanceStartDay;
      } else if (isEnd) {
        return styles.currentMaintenanceEndDay;
      } else {
        return styles.currentMaintenanceMiddleDay;
      }
    }
    
    // Otros mantenimientos del mismo vehículo - Color claro
    if (otherMaintenance) {
      const maintenanceStart = new Date(otherMaintenance.startDate);
      const maintenanceEnd = new Date(otherMaintenance.returnDate);
      const isMaintenanceStart = day === maintenanceStart.getDate() && 
        currentMonth.getMonth() === maintenanceStart.getMonth() && 
        currentMonth.getFullYear() === maintenanceStart.getFullYear();
      const isMaintenanceEnd = day === maintenanceEnd.getDate() && 
        currentMonth.getMonth() === maintenanceEnd.getMonth() && 
        currentMonth.getFullYear() === maintenanceEnd.getFullYear();
      
      if (isMaintenanceStart && isMaintenanceEnd) {
        return styles.otherMaintenanceSingleDay;
      } else if (isMaintenanceStart) {
        return styles.otherMaintenanceStartDay;
      } else if (isMaintenanceEnd) {
        return styles.otherMaintenanceEndDay;
      } else {
        return styles.otherMaintenanceMiddleDay;
      }
    }
    
    return styles.normalDay;
  };

  const getDayTextStyle = (day) => {
    if (!day) return null;
    
    const isTempStartDate = isEditing && tempStartDate && 
      day === tempStartDate.getDate() && 
      currentMonth.getMonth() === tempStartDate.getMonth() && 
      currentMonth.getFullYear() === tempStartDate.getFullYear();
    
    const isCurrentMaintenance = isDateInRange(day, selectedStartDate, selectedEndDate);
    const otherMaintenance = getOtherMaintenanceForDate(day);
    
    if (isTempStartDate) {
      return styles.tempStartDayText;
    }
    
    if (isCurrentMaintenance) {
      return styles.currentMaintenanceDayText;
    }
    
    if (otherMaintenance) {
      return styles.otherMaintenanceDayText;
    }
    
    return styles.normalDayText;
  };

  const handleStatusChange = (newStatus) => {
    if (isEditing && onStatusChange) {
      onStatusChange(newStatus);
    }
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <View style={styles.container}>
      <View style={styles.statusSection}>
        <View style={styles.statusTabs}>
          <TouchableOpacity 
            style={[styles.statusTab, styles.availableTab, status === 'Completed' && styles.activeStatusTab]}
            onPress={() => handleStatusChange('Completed')}
            disabled={!isEditing}
          >
            <Text style={[
              styles.availableTabText,
              status === 'Completed' && styles.activeStatusTabText
            ]}>
              Disponible
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.statusTab, styles.reservedTab]}
            disabled
          >
            <Text style={styles.reservedTabText}>Reservado</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.statusTab, 
              styles.maintenanceTab, 
              (status === 'Active' || status === 'Pending') && styles.activeStatusTab
            ]}
            onPress={() => handleStatusChange(status === 'Active' ? 'Pending' : 'Active')}
            disabled={!isEditing}
          >
            <Text style={[
              styles.maintenanceTabText,
              (status === 'Active' || status === 'Pending') && styles.activeStatusTabText
            ]}>
              Mantenimiento
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.calendarHeader}>
        <TouchableOpacity 
          onPress={() => navigateMonth(-1)}
          style={styles.navButton}
          disabled={!isEditing}
        >
          <Ionicons name="chevron-back" size={20} color={isEditing ? "#6B7280" : "#D1D5DB"} />
        </TouchableOpacity>
        
        <Text style={styles.monthYear}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </Text>
        
        <TouchableOpacity 
          onPress={() => navigateMonth(1)}
          style={styles.navButton}
          disabled={!isEditing}
        >
          <Ionicons name="chevron-forward" size={20} color={isEditing ? "#6B7280" : "#D1D5DB"} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekHeader}>
        {dayNames.map((day, index) => (
          <View key={index} style={styles.weekDay}>
            <Text style={styles.weekDayText}>{day}</Text>
          </View>
        ))}
      </View>

      <View style={styles.calendar}>
        {days.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.day, getDayStyle(day)]}
            onPress={() => handleDayPress(day)}
            disabled={!isEditing}
            activeOpacity={isEditing ? 0.7 : 1}
          >
            {day && (
              <Text style={getDayTextStyle(day)}>
                {day}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {isEditing && (
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsText}>
            Toca las fechas para seleccionar el período de mantenimiento
          </Text>
        </View>
      )}

      {/* Leyenda actualizada */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Leyenda:</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#D97706' }]} />
            <Text style={styles.legendText}>Mantenimiento actual</Text>
          </View>
          {vehicleMaintenances.length > 0 && (
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.legendText}>Otros mantenimientos</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  statusSection: {
    marginBottom: 24,
  },
  statusTabs: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 4,
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
  activeStatusTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  activeStatusTabText: {
    fontWeight: '700',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    padding: 8,
  },
  monthYear: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  day: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  normalDay: {
    backgroundColor: 'transparent',
  },
  
  // Estilos para mantenimiento actual (amarillo oscuro - más prominente)
  currentMaintenanceStartDay: {
    backgroundColor: '#D97706',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  currentMaintenanceMiddleDay: {
    backgroundColor: '#D97706',
  },
  currentMaintenanceEndDay: {
    backgroundColor: '#D97706',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  currentMaintenanceSingleDay: {
    backgroundColor: '#D97706',
    borderRadius: 20,
  },
  
  // Estilos para otros mantenimientos del vehículo (amarillo claro - igual que en el calendario principal)
  otherMaintenanceStartDay: {
    backgroundColor: '#F59E0B',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  otherMaintenanceMiddleDay: {
    backgroundColor: '#F59E0B',
  },
  otherMaintenanceEndDay: {
    backgroundColor: '#F59E0B',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  otherMaintenanceSingleDay: {
    backgroundColor: '#F59E0B',
    borderRadius: 20,
  },
  
  // Estilos de texto
  normalDayText: {
    fontSize: 16,
    color: '#374151',
  },
  tempStartDayText: {
    fontSize: 16,
    color: '#0EA5E9',
    fontWeight: '600',
  },
  currentMaintenanceDayText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  otherMaintenanceDayText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  instructionsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  instructionsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  legend: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default CustomDetailCalendar;