import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Para emulador Android usa 10.0.2.2 en lugar de localhost
const API_BASE_URL = 'http://10.0.2.2:4000/api';

const CustomCalendar = ({ selectedVehicle, startDate, endDate, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [reservations, setReservations] = useState([]);
  const [maintenances, setMaintenances] = useState([]);
  const [tempStartDate, setTempStartDate] = useState(null);

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

  // Cargar reservas y mantenimientos cuando cambie el vehículo seleccionado
  useEffect(() => {
    if (selectedVehicle) {
      fetchReservationsForVehicle(selectedVehicle._id);
      fetchMaintenancesForVehicle(selectedVehicle._id);
    } else {
      setReservations([]);
      setMaintenances([]);
    }
  }, [selectedVehicle]);

  const fetchReservationsForVehicle = async (vehicleId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/reservations`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const vehicleReservations = result.data.filter(
            reservation => reservation.vehicleId._id === vehicleId
          );
          setReservations(vehicleReservations);
        }
      }
    } catch (error) {
      console.error('Error al cargar reservas:', error);
    }
  };

  const fetchMaintenancesForVehicle = async (vehicleId) => {
    try {
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
          const vehicleMaintenances = result.data.filter(
            maintenance => maintenance.vehicleId._id === vehicleId
          );
          setMaintenances(vehicleMaintenances);
        }
      }
    } catch (error) {
      console.error('Error al cargar mantenimientos:', error);
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

  const getReservationForDate = (day) => {
    if (!day) return null;
    
    return reservations.find(reservation => {
      const startDate = new Date(reservation.startDate);
      const endDate = new Date(reservation.returnDate);
      return isDateInRange(day, startDate, endDate);
    });
  };

  const getMaintenanceForDate = (day) => {
    if (!day) return null;
    
    return maintenances.find(maintenance => {
      const startDate = new Date(maintenance.startDate);
      const endDate = new Date(maintenance.returnDate);
      return isDateInRange(day, startDate, endDate);
    });
  };

  const getDayStyle = (day) => {
    if (!day) return null;
    
    const isTempStartDate = tempStartDate && 
      day === tempStartDate.getDate() && 
      currentMonth.getMonth() === tempStartDate.getMonth() && 
      currentMonth.getFullYear() === tempStartDate.getFullYear();
    
    const isInSelectedRange = startDate && endDate && isDateInRange(day, startDate, endDate);
    const isStartDate = startDate && endDate && 
      day === startDate.getDate() && 
      currentMonth.getMonth() === startDate.getMonth() && 
      currentMonth.getFullYear() === startDate.getFullYear();
    const isEndDate = startDate && endDate && 
      day === endDate.getDate() && 
      currentMonth.getMonth() === endDate.getMonth() && 
      currentMonth.getFullYear() === endDate.getFullYear();
    
    const reservation = getReservationForDate(day);
    const maintenance = getMaintenanceForDate(day);
    
    if (isTempStartDate) {
      return styles.tempStartDay;
    }
    
    // Nueva reserva (color azul)
    if (isInSelectedRange) {
      if (isStartDate && isEndDate) {
        return styles.selectedSingleDay;
      } else if (isStartDate) {
        return styles.selectedStartDay;
      } else if (isEndDate) {
        return styles.selectedEndDay;
      } else {
        return styles.selectedMiddleDay;
      }
    }
    
    // Reservas existentes (color azul más claro)
    if (reservation) {
      const reservationStart = new Date(reservation.startDate);
      const reservationEnd = new Date(reservation.returnDate);
      const isReservationStart = day === reservationStart.getDate() && 
        currentMonth.getMonth() === reservationStart.getMonth() && 
        currentMonth.getFullYear() === reservationStart.getFullYear();
      const isReservationEnd = day === reservationEnd.getDate() && 
        currentMonth.getMonth() === reservationEnd.getMonth() && 
        currentMonth.getFullYear() === reservationEnd.getFullYear();
      
      if (isReservationStart && isReservationEnd) {
        return styles.reservationSingleDay;
      } else if (isReservationStart) {
        return styles.reservationStartDay;
      } else if (isReservationEnd) {
        return styles.reservationEndDay;
      } else {
        return styles.reservationMiddleDay;
      }
    }
    
    // Mantenimientos (color amarillo)
    if (maintenance) {
      const maintenanceStart = new Date(maintenance.startDate);
      const maintenanceEnd = new Date(maintenance.returnDate);
      const isMaintenanceStart = day === maintenanceStart.getDate() && 
        currentMonth.getMonth() === maintenanceStart.getMonth() && 
        currentMonth.getFullYear() === maintenanceStart.getFullYear();
      const isMaintenanceEnd = day === maintenanceEnd.getDate() && 
        currentMonth.getMonth() === maintenanceEnd.getMonth() && 
        currentMonth.getFullYear() === maintenanceEnd.getFullYear();
      
      if (isMaintenanceStart && isMaintenanceEnd) {
        return styles.maintenanceSingleDay;
      } else if (isMaintenanceStart) {
        return styles.maintenanceStartDay;
      } else if (isMaintenanceEnd) {
        return styles.maintenanceEndDay;
      } else {
        return styles.maintenanceMiddleDay;
      }
    }
    
    return styles.normalDay;
  };

  const getDayTextStyle = (day) => {
    if (!day) return null;
    
    const isTempStartDate = tempStartDate && 
      day === tempStartDate.getDate() && 
      currentMonth.getMonth() === tempStartDate.getMonth() && 
      currentMonth.getFullYear() === tempStartDate.getFullYear();
    
    const isInSelectedRange = startDate && endDate && isDateInRange(day, startDate, endDate);
    const reservation = getReservationForDate(day);
    const maintenance = getMaintenanceForDate(day);
    
    if (isTempStartDate) {
      return styles.tempStartDayText;
    }
    
    if (isInSelectedRange) {
      return styles.selectedDayText;
    }
    
    if (reservation) {
      return styles.reservationDayText;
    }
    
    if (maintenance) {
      return styles.maintenanceDayText;
    }
    
    return styles.normalDayText;
  };

  const handleDayPress = (day) => {
    if (!day) return;
    
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    selectedDate.setHours(12, 0, 0, 0);
    
    // Verificar fechas pasadas
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      Alert.alert('Fecha inválida', 'No puedes seleccionar fechas pasadas.');
      return;
    }
    
    // Verificar si hay reserva o mantenimiento en esta fecha
    const existingReservation = getReservationForDate(day);
    const existingMaintenance = getMaintenanceForDate(day);
    
    if (existingReservation) {
      Alert.alert('Fecha ocupada', 'Esta fecha ya está reservada por otro cliente.');
      return;
    }
    
    if (existingMaintenance) {
      Alert.alert('Fecha en mantenimiento', 'El vehículo está en mantenimiento en esta fecha.');
      return;
    }
    
    // Lógica de selección igual que en mantenimientos
    if (startDate && endDate) {
      onDateSelect(null, 'end');
      onDateSelect(null, 'start');
      setTimeout(() => {
        setTempStartDate(selectedDate);
      }, 20);
      return;
    }
    
    if (!tempStartDate) {
      setTempStartDate(selectedDate);
    } else {
      let finalStartDate = tempStartDate;
      let finalEndDate = selectedDate;
      
      if (selectedDate < tempStartDate) {
        finalStartDate = selectedDate;
        finalEndDate = tempStartDate;
      }
      
      onDateSelect(finalStartDate, 'start');
      setTimeout(() => {
        onDateSelect(finalEndDate, 'end');
      }, 10);
      
      setTempStartDate(null);
    }
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <View style={styles.container}>
      {/* Header del calendario */}
      <View style={styles.calendarHeader}>
        <TouchableOpacity 
          onPress={() => navigateMonth(-1)}
          style={styles.navButton}
        >
          <Ionicons name="chevron-back" size={20} color="#6B7280" />
        </TouchableOpacity>
        
        <Text style={styles.monthYear}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </Text>
        
        <TouchableOpacity 
          onPress={() => navigateMonth(1)}
          style={styles.navButton}
        >
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Días de la semana */}
      <View style={styles.weekHeader}>
        {dayNames.map((day, index) => (
          <View key={index} style={styles.weekDay}>
            <Text style={styles.weekDayText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendario */}
      <View style={styles.calendar}>
        {days.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.day, getDayStyle(day)]}
            onPress={() => handleDayPress(day)}
            activeOpacity={0.7}
          >
            {day && (
              <Text style={getDayTextStyle(day)}>
                {day}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Leyenda */}
      {selectedVehicle && (
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Leyenda:</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#4A90E2' }]} />
              <Text style={styles.legendText}>Reserva</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.legendText}>Mantenimiento</Text>
            </View>
          </View>
        </View>
      )}
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
  
  // Estilos para fecha temporal (primer click)
  tempStartDay: {
    backgroundColor: '#E0F2FE',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#0EA5E9',
  },
  
  // Estilos para nueva reserva (color azul)
  selectedStartDay: {
    backgroundColor: '#4A90E2',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  selectedMiddleDay: {
    backgroundColor: '#4A90E2',
  },
  selectedEndDay: {
    backgroundColor: '#4A90E2',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  selectedSingleDay: {
    backgroundColor: '#4A90E2',
    borderRadius: 20,
  },
  
  // Estilos para reservas existentes (azul claro)
  reservationStartDay: {
    backgroundColor: '#60A5FA',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  reservationMiddleDay: {
    backgroundColor: '#60A5FA',
  },
  reservationEndDay: {
    backgroundColor: '#60A5FA',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  reservationSingleDay: {
    backgroundColor: '#60A5FA',
    borderRadius: 20,
  },
  
  // Estilos para mantenimiento (amarillo)
  maintenanceStartDay: {
    backgroundColor: '#F59E0B',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  maintenanceMiddleDay: {
    backgroundColor: '#F59E0B',
  },
  maintenanceEndDay: {
    backgroundColor: '#F59E0B',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  maintenanceSingleDay: {
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
  selectedDayText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  reservationDayText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  maintenanceDayText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  
  // Leyenda
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

export default CustomCalendar;