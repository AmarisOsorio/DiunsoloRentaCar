import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DateInput = ({ label, value, onChangeDate, minimumDate, maximumDate }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDay, setSelectedDay] = useState(new Date(value).getDate());
  const [selectedMonth, setSelectedMonth] = useState(new Date(value).getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date(value).getFullYear());

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const formatDate = (date) => {
    if (typeof date === 'string') {
      date = new Date(date);
    }
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getYearRange = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 1; year <= currentYear + 2; year++) {
      years.push(year);
    }
    return years;
  };

  const handleConfirm = () => {
    try {
      const newDate = new Date(selectedYear, selectedMonth, selectedDay);
      
      // Validar fecha mínima
      if (minimumDate && newDate < minimumDate) {
        Alert.alert('Error', 'La fecha seleccionada es anterior a la fecha mínima permitida');
        return;
      }
      
      // Validar fecha máxima
      if (maximumDate && newDate > maximumDate) {
        Alert.alert('Error', 'La fecha seleccionada es posterior a la fecha máxima permitida');
        return;
      }
      
      onChangeDate(newDate);
      setShowPicker(false);
    } catch (error) {
      Alert.alert('Error', 'Fecha inválida seleccionada');
    }
  };

  const handleCancel = () => {
    // Restaurar valores originales
    const originalDate = typeof value === 'string' ? new Date(value) : value;
    setSelectedDay(originalDate.getDate());
    setSelectedMonth(originalDate.getMonth());
    setSelectedYear(originalDate.getFullYear());
    setShowPicker(false);
  };

  const openPicker = () => {
    const currentDate = typeof value === 'string' ? new Date(value) : value;
    setSelectedDay(currentDate.getDate());
    setSelectedMonth(currentDate.getMonth());
    setSelectedYear(currentDate.getFullYear());
    setShowPicker(true);
  };

  const renderScrollableOptions = (options, selectedValue, onSelect, keyExtractor) => (
    <ScrollView 
      style={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {options.map((option, index) => {
        const key = keyExtractor ? keyExtractor(option, index) : index;
        const isSelected = selectedValue === (keyExtractor ? key : option);
        
        return (
          <TouchableOpacity
            key={key}
            style={[styles.option, isSelected && styles.selectedOption]}
            onPress={() => onSelect(keyExtractor ? key : option)}
          >
            <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity 
        style={styles.dateInput}
        onPress={openPicker}
      >
        <Text style={styles.dateText}>{formatDate(value)}</Text>
        <Ionicons name="calendar-outline" size={20} color="#0369A1" />
      </TouchableOpacity>

      <Modal
        transparent={true}
        animationType="slide"
        visible={showPicker}
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                onPress={handleCancel}
                style={styles.modalButton}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <Text style={styles.modalTitle}>{label}</Text>
              
              <TouchableOpacity 
                onPress={handleConfirm}
                style={styles.modalButton}
              >
                <Text style={styles.confirmButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.pickerContainer}>
              <View style={styles.pickerColumn}>
                <Text style={styles.columnTitle}>Día</Text>
                {renderScrollableOptions(
                  Array.from({ length: getDaysInMonth(selectedMonth, selectedYear) }, (_, i) => i + 1),
                  selectedDay,
                  setSelectedDay
                )}
              </View>
              
              <View style={styles.pickerColumn}>
                <Text style={styles.columnTitle}>Mes</Text>
                {renderScrollableOptions(
                  months,
                  selectedMonth,
                  setSelectedMonth,
                  (_, index) => index
                )}
              </View>
              
              <View style={styles.pickerColumn}>
                <Text style={styles.columnTitle}>Año</Text>
                {renderScrollableOptions(
                  getYearRange(),
                  selectedYear,
                  setSelectedYear
                )}
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  dateInput: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#0369A1',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalButton: {
    minWidth: 80,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6B7280',
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#0369A1',
    fontWeight: '600',
    textAlign: 'right',
  },
  pickerContainer: {
    flexDirection: 'row',
    height: 300,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  pickerColumn: {
    flex: 1,
    marginHorizontal: 5,
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 8,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 2,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#E0F2FE',
  },
  optionText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  selectedOptionText: {
    color: '#0369A1',
    fontWeight: '600',
  },
});

export default DateInput;