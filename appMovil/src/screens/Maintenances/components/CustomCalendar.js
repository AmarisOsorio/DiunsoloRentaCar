import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// URL de producción para la API
const API_BASE_URL = 'https://diunsolorentacar.onrender.com/api';

const CustomCalendar = ({ selectedVehicle, startDate, endDate, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [maintenances, setMaintenances] = useState([]);
  const [reservations, setReservations] = useState([]); // Para futuro uso

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

  // Cargar mantenimientos cuando cambie el vehículo seleccionado
  useEffect(() => {
    if (selectedVehicle) {
      fetchMaintenancesForVehicle(selectedVehicle._id);
    } else {
      setMaintenances([]);
    }
  }, [selectedVehicle]);

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
          // Filtrar mantenimientos solo para el vehículo seleccionado
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
    
    // Normalizar fechas a solo fecha (sin hora)
    checkDate.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    return checkDate >= start && checkDate <= end;
  };

  const getMaintenanceForDate = (day) => {
    if (!day) return null;
    
    const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    
    return maintenances.find(maintenance => {
      const startDate = new Date(maintenance.startDate);
      const endDate = new Date(maintenance.returnDate);
      
      return isDateInRange(day, startDate, endDate);
    });
  };

  const getDayStyle = (day) => {
    if (!day) return null;
    
    // Verificar si es parte del rango de selección actual (nuevo mantenimiento)
    const isInSelectedRange = isDateInRange(day, startDate, endDate);
    const isStartDate = startDate && 
      day === startDate.getDate() && 
      currentMonth.getMonth() === startDate.getMonth() && 
      currentMonth.getFullYear() === startDate.getFullYear();
    const isEndDate = endDate && 
      day === endDate.getDate() && 
      currentMonth.getMonth() === endDate.getMonth() && 
      currentMonth.getFullYear() === endDate.getFullYear();
    
    // Verificar si hay mantenimiento existente en esta fecha
    const maintenance = getMaintenanceForDate(day);
    
    // Prioridad: selección actual (nuevo mantenimiento) > mantenimientos existentes
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
    
    // Si hay mantenimiento existente, mostrar en color de mantenimiento (amarillo/naranja)
    if (maintenance) {
      const maintenanceStart = new Date(maintenance.startDate);
      const maintenanceEnd = new Date(maintenance.returnDate);
      const isMaintenanceStart = day === maintenanceStart.getDate() && 
        currentMonth.getMonth() === maintenanceStart.getMonth() && 
        currentMonth.getFullYear() === maintenanceStart.getFullYear();
      const isMaintenanceEnd = day === maintenanceEnd.getDate() && 
        currentMonth.getMonth() === maintenanceEnd.getMonth() && 
        currentMonth.getFullYear() === maintenanceEnd.getFullYear();
      
      // Usar un solo color para todos los mantenimientos
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
    
    const isInSelectedRange = isDateInRange(day, startDate, endDate);
    const maintenance = getMaintenanceForDate(day);
    
    if (isInSelectedRange) {
      return styles.selectedDayText;
    }
    
    if (maintenance) {
      return styles.maintenanceDayText;
    }
    
    return styles.normalDayText;
  };

  const handleDayPress = (day) => {
    // Deshabilitar la selección desde el calendario
    // Solo mostrar información, no permitir editar
    return;
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
          <View
            key={index}
            style={[styles.day, getDayStyle(day)]}
          >
            {day && (
              <Text style={getDayTextStyle(day)}>
                {day}
              </Text>
            )}
          </View>
        ))}
      </View>

      {/* Leyenda */}
      {selectedVehicle && (
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Leyenda:</Text>
          <View style={styles.legendItems}>
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
  normalDay: {
    backgroundColor: 'transparent',
  },
  
  // Estilos para selección actual (nuevo mantenimiento - color amarillo)
  selectedStartDay: {
    backgroundColor: '#F59E0B',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  selectedMiddleDay: {
    backgroundColor: '#F59E0B',
  },
  selectedEndDay: {
    backgroundColor: '#F59E0B',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  selectedSingleDay: {
    backgroundColor: '#F59E0B',
    borderRadius: 20,
  },
  
  // Estilos para mantenimiento (un solo color - amarillo/naranja)
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
  selectedDayText: {
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