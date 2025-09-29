import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ChecklistSection = ({ 
  title, 
  items = [], 
  values = {}, 
  onValueChange,
  style 
}) => {
  
  const handleItemToggle = (key) => {
    if (onValueChange) {
      onValueChange(key, !values[key]);
    }
  };

  const getCompletionStatus = () => {
    const checkedItems = items.filter(item => values[item.key]).length;
    return { checked: checkedItems, total: items.length };
  };

  const { checked, total } = getCompletionStatus();
  const completionPercentage = total > 0 ? (checked / total) * 100 : 0;

  return (
    <View style={[styles.container, style]}>
      {/* Header con título y progreso */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>{checked}/{total}</Text>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground} />
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${completionPercentage}%` }
              ]} 
            />
          </View>
        </View>
      </View>

      {/* Lista de items */}
      <View style={styles.itemsContainer}>
        {items.map((item, index) => {
          const isChecked = values[item.key];
          
          return (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.checklistItem,
                index === items.length - 1 && styles.lastItem
              ]}
              onPress={() => handleItemToggle(item.key)}
              activeOpacity={0.7}
            >
              <View style={styles.itemContent}>
                <View style={styles.checkboxContainer}>
                  <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                    {isChecked && (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    )}
                  </View>
                </View>
                
                <View style={styles.labelContainer}>
                  <Text style={[styles.itemLabel, isChecked && styles.itemLabelChecked]}>
                    {item.label}
                  </Text>
                  {item.description && (
                    <Text style={styles.itemDescription}>
                      {item.description}
                    </Text>
                  )}
                </View>
                
                {isChecked && (
                  <View style={styles.statusIndicator}>
                    <Ionicons name="checkmark-circle" size={20} color="#34A853" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Footer con resumen si está completo */}
      {checked === total && total > 0 && (
        <View style={styles.completionFooter}>
          <Ionicons name="checkmark-circle" size={16} color="#34A853" />
          <Text style={styles.completionText}>Sección completada</Text>
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
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4285F4',
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    minWidth: 40,
  },
  progressBarContainer: {
    flex: 1,
    height: 6,
    marginLeft: 12,
    position: 'relative',
  },
  progressBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
  },
  progressBarFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: '#34A853',
    borderRadius: 3,
    transition: 'width 0.3s ease',
  },
  itemsContainer: {
    // Contenedor de items
  },
  checklistItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  checkboxChecked: {
    backgroundColor: '#4285F4',
    borderColor: '#4285F4',
    shadowColor: '#4285F4',
    shadowOpacity: 0.3,
  },
  labelContainer: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    lineHeight: 20,
  },
  itemLabelChecked: {
    color: '#10B981',
  },
  itemDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
    lineHeight: 16,
  },
  statusIndicator: {
    marginLeft: 8,
  },
  completionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: 'rgba(52, 168, 83, 0.05)',
    marginHorizontal: -20,
    marginBottom: -20,
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  completionText: {
    fontSize: 14,
    color: '#34A853',
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default ChecklistSection;