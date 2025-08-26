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
  isEditing, 
  onDateChange, 
  onStatusChange 
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [maintenances, setMaintenances] = useState([]);
  const [selectedStartDate, setSelectedStartDate] = useState(startDate ? new Date(startDate) : null);
  const [selectedEndDate, setSelectedEndDate] = useState(endDate ? new Date(endDate) : null);

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
    fetchMaintenances();
  }, [startDate, endDate]);

  // Solo notificar cambios cuando el usuario termine de seleccionar
  useEffect(() => {
    if (selectedStartDate && selectedEndDate && onDateChange && isEditing) {
      onDateChange(selectedStartDate.toISOString(), selectedEndDate.toISOString());
    }
  }, [selectedStartDate, selectedEndDate, isEditing]);

  const fetchMaintenances = async () => {
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
          const otherMaintenances = result.data.filter(m => m._id !== maintenanceId);
          setMaintenances(otherMaintenances);
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

  const getOtherMaintenanceForDate = (day) => {
    if (!day) return null;
    
    const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    
    return maintenances.find(maintenance => {
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
        'Esta fecha ya está ocupada por otro mantenimiento. Por favor selecciona otra fecha.'
      );
      return;
    }

    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      setSelectedStartDate(selectedDate);
      setSelectedEndDate(null);
    } else if (selectedStartDate && !selectedEndDate) {
      if (selectedDate < selectedStartDate) {
        setSelectedEndDate(selectedStartDate);
        setSelectedStartDate(selectedDate);
      } else if (selectedDate.getTime() === selectedStartDate.getTime()) {
        const nextDay = new Date(selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);
        setSelectedEndDate(nextDay);
      } else {
        setSelectedEndDate(selectedDate);
      }
    }
  };

  const getDayStyle = (day) => {
    if (!day) return null;
    
    const isCurrentMaintenance = isDateInRange(day, selectedStartDate, selectedEndDate);
    const otherMaintenance = getOtherMaintenanceForDate(day);
    
    // Todos los mantenimientos se muestran igual (amarillo/naranja)
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
        return styles.maintenanceSingleDay;
      } else if (isStart) {
        return styles.maintenanceStartDay;
      } else if (isEnd) {
        return styles.maintenanceEndDay;
      } else {
        return styles.maintenanceMiddleDay;
      }
    }
    
    if (otherMaintenance) {
      const maintenanceStart = new Date(otherMaintenance.startDate);
      const maintenanceEnd = new Date(otherMaintenance.returnDate);
      const isMaintenanceStart = day === maintenanceStart.getDate() && 
        currentMonth.getMonth() === maintenanceStart.getMonth() && 
        currentMonth.getFullYear() === maintenanceStart.getFullYear();
      const isMaintenanceEnd = day === maintenanceEnd.getDate() && 
        currentMonth.getMonth() === maintenanceEnd.getMonth() && 
        currentMonth.getFullYear() === maintenanceEnd.getFullYear();
      
      // Mismo estilo para otros mantenimientos
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
    
    const isCurrentMaintenance = isDateInRange(day, selectedStartDate, selectedEndDate);
    const otherMaintenance = getOtherMaintenanceForDate(day);
    
    // Mismo estilo de texto para todos los mantenimientos
    if (isCurrentMaintenance || otherMaintenance) {
      return styles.maintenanceDayText;
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

      {/* Leyenda simplificada */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Leyenda:</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.legendText}>Mantenimiento</Text>
          </View>
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
  // Estilos unificados para todos los mantenimientos
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
  normalDayText: {
    fontSize: 16,
    color: '#374151',
  },
  maintenanceDayText: {
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