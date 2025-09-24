import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PriceInput = ({ pricePerDay, onPriceChange, totalDays, totalAmount }) => {

  const formatCurrency = (amount) => {
    return `Q ${amount.toFixed(2)}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Precio por día</Text>
      
      <View style={styles.priceInputContainer}>
        <View style={styles.currencyContainer}>
          <Text style={styles.currencySymbol}>Q</Text>
        </View>
        <TextInput
          style={styles.priceInput}
          placeholder="0.00"
          value={pricePerDay}
          onChangeText={onPriceChange}
          keyboardType="decimal-pad"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Resumen de cálculo */}
      {totalDays > 0 && pricePerDay && (
        <View style={styles.calculationSummary}>
          <Text style={styles.summaryTitle}>Resumen de renta</Text>
          
          <View style={styles.calculationRow}>
            <Text style={styles.calculationLabel}>Precio por día:</Text>
            <Text style={styles.calculationValue}>{formatCurrency(parseFloat(pricePerDay) || 0)}</Text>
          </View>
          
          <View style={styles.calculationRow}>
            <Text style={styles.calculationLabel}>Días totales:</Text>
            <Text style={styles.calculationValue}>{totalDays}</Text>
          </View>
          
          <View style={styles.dividerLine} />
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total a pagar:</Text>
            <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  priceInputContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  currencyContainer: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  priceInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#374151',
  },
  calculationSummary: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0369A1',
    marginBottom: 12,
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  calculationLabel: {
    fontSize: 14,
    color: '#374151',
  },
  calculationValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#BAE6FD',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0369A1',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0369A1',
  },
});

export default PriceInput;