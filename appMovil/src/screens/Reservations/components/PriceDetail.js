import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PriceDetail = ({ pricePerDay, totalDays, isEditing, onPriceChange }) => {

  const formatCurrency = (amount) => {
    return `$ ${amount.toFixed(2)}`;
  };

  const calculateTotal = () => {
    const price = parseFloat(pricePerDay) || 0;
    return totalDays * price;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Detalles de precio</Text>
      
      <View style={styles.priceCard}>
        {/* Precio por día */}
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Precio por día:</Text>
          {isEditing ? (
            <View style={styles.editablePriceContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.priceInput}
                value={pricePerDay.toString()}
                onChangeText={onPriceChange}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          ) : (
            <Text style={styles.priceValue}>{formatCurrency(parseFloat(pricePerDay))}</Text>
          )}
        </View>

        {/* Días totales */}
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Días totales:</Text>
          <Text style={styles.priceValue}>{totalDays}</Text>
        </View>

        {/* Línea divisoria */}
        <View style={styles.dividerLine} />

        {/* Total */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total a pagar:</Text>
          <Text style={styles.totalValue}>{formatCurrency(calculateTotal())}</Text>
        </View>

        {/* Información adicional */}
        <View style={styles.infoContainer}>
          <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
          <Text style={styles.infoText}>
            El precio incluye seguro básico y kilometraje ilimitado
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  priceCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  priceLabel: {
    fontSize: 16,
    color: '#374151',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0369A1',
  },
  editablePriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 8,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginRight: 4,
  },
  priceInput: {
    fontSize: 16,
    color: '#374151',
    paddingVertical: 8,
    paddingHorizontal: 4,
    minWidth: 80,
    textAlign: 'right',
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0369A1',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
    flex: 1,
    lineHeight: 20,
  },
});

export default PriceDetail;