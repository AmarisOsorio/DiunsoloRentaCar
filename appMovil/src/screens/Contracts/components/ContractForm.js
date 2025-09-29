import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SignatureCanvas from './SignatureCanvas';

const ContractForm = ({ 
  formData, 
  onFormDataChange, 
  selectedReservation 
}) => {

  const updateFormData = (key, value) => {
    onFormDataChange(key, value);
  };

  const formatCurrency = (value) => {
    return `Q ${parseFloat(value || 0).toFixed(2)}`;
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Información de la reservación */}
      {selectedReservation && (
        <View style={styles.reservationInfo}>
          <Text style={styles.sectionTitle}>Información de la reservación</Text>
          <View style={styles.infoRow}>
            <Ionicons name="document-text-outline" size={16} color="#6B7280" />
            <Text style={styles.infoLabel}>ID:</Text>
            <Text style={styles.infoValue}>#{selectedReservation._id.slice(-8)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={16} color="#6B7280" />
            <Text style={styles.infoLabel}>Cliente:</Text>
            <Text style={styles.infoValue}>
              {`${selectedReservation.clientId?.name || ''} ${selectedReservation.clientId?.lastName || ''}`.trim()}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="car-outline" size={16} color="#6B7280" />
            <Text style={styles.infoLabel}>Vehículo:</Text>
            <Text style={styles.infoValue}>
              {`${selectedReservation.vehicleId?.brand || ''} ${selectedReservation.vehicleId?.model || ''}`.trim()}
            </Text>
          </View>
        </View>
      )}

      {/* Conductor principal */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Conductor principal</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Nombre completo del arrendatario</Text>
          <TextInput
            style={styles.input}
            value={formData.tenantName}
            onChangeText={(text) => updateFormData('tenantName', text)}
            placeholder="Juan Pérez García"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Profesión del arrendatario</Text>
          <TextInput
            style={styles.input}
            value={formData.tenantProfession}
            onChangeText={(text) => updateFormData('tenantProfession', text)}
            placeholder="Ingeniero Civil"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Dirección del arrendatario</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.tenantAddress}
            onChangeText={(text) => updateFormData('tenantAddress', text)}
            placeholder="Av. Siempre Viva 742, San Salvador, El Salvador"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.inputLabel}>País del pasaporte</Text>
            <TextInput
              style={styles.input}
              value={formData.passportCountry}
              onChangeText={(text) => updateFormData('passportCountry', text)}
              placeholder="El Salvador"
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.inputLabel}>No. del Pasaporte</Text>
            <TextInput
              style={styles.input}
              value={formData.passportNumber}
              onChangeText={(text) => updateFormData('passportNumber', text)}
              placeholder="A12345678"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.inputLabel}>País de la licencia</Text>
            <TextInput
              style={styles.input}
              value={formData.licenseCountry}
              onChangeText={(text) => updateFormData('licenseCountry', text)}
              placeholder="El Salvador"
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.inputLabel}>No. de Licencia</Text>
            <TextInput
              style={styles.input}
              value={formData.licenseNumber}
              onChangeText={(text) => updateFormData('licenseNumber', text)}
              placeholder="LSV-99887766"
            />
          </View>
        </View>
      </View>

      {/* Conductor adicional */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Conductor adicional (opcional)</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Nombre del conductor adicional</Text>
          <TextInput
            style={styles.input}
            value={formData.extraDriverName}
            onChangeText={(text) => updateFormData('extraDriverName', text)}
            placeholder="Carlos Mendoza López"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.inputLabel}>País del pasaporte</Text>
            <TextInput
              style={styles.input}
              value={formData.extraDriverPassportCountry}
              onChangeText={(text) => updateFormData('extraDriverPassportCountry', text)}
              placeholder="Guatemala"
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.inputLabel}>No. del Pasaporte</Text>
            <TextInput
              style={styles.input}
              value={formData.extraDriverPassportNumber}
              onChangeText={(text) => updateFormData('extraDriverPassportNumber', text)}
              placeholder="G87654321"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.inputLabel}>País de la licencia</Text>
            <TextInput
              style={styles.input}
              value={formData.extraDriverLicenseCountry}
              onChangeText={(text) => updateFormData('extraDriverLicenseCountry', text)}
              placeholder="Guatemala"
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.inputLabel}>No. de Licencia</Text>
            <TextInput
              style={styles.input}
              value={formData.extraDriverLicenseNumber}
              onChangeText={(text) => updateFormData('extraDriverLicenseNumber', text)}
              placeholder="GT-55443322"
            />
          </View>
        </View>
      </View>

      {/* Datos de entrega */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Datos de entrega al arrendatario</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Ciudad de la entrega</Text>
          <TextInput
            style={styles.input}
            value={formData.deliveryCity}
            onChangeText={(text) => updateFormData('deliveryCity', text)}
            placeholder="San Salvador"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.inputLabel}>Fecha de entrega</Text>
            <TextInput
              style={styles.input}
              value={formData.deliveryDate}
              onChangeText={(text) => updateFormData('deliveryDate', text)}
              placeholder="YYYY-MM-DD"
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.inputLabel}>Hora de entrega</Text>
            <TextInput
              style={styles.input}
              value={formData.deliveryHour}
              onChangeText={(text) => updateFormData('deliveryHour', text)}
              placeholder="14:30"
            />
          </View>
        </View>
      </View>

      {/* Información financiera */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información financiera</Text>
        
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.inputLabel}>Precio por día</Text>
            <TextInput
              style={styles.input}
              value={formData.dailyPrice.toString()}
              onChangeText={(text) => updateFormData('dailyPrice', parseFloat(text) || 0)}
              placeholder="45.00"
              keyboardType="decimal-pad"
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.inputLabel}>Días de alquiler</Text>
            <TextInput
              style={styles.input}
              value={formData.rentalDays.toString()}
              onChangeText={(text) => updateFormData('rentalDays', parseInt(text) || 0)}
              placeholder="7"
              keyboardType="number-pad"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.inputLabel}>Monto total</Text>
            <View style={styles.totalAmountContainer}>
              <Text style={styles.totalAmountText}>
                {formatCurrency(formData.totalAmount)}
              </Text>
            </View>
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.inputLabel}>Depósito</Text>
            <TextInput
              style={styles.input}
              value={formData.depositAmount.toString()}
              onChangeText={(text) => updateFormData('depositAmount', parseFloat(text) || 0)}
              placeholder="100.00"
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.inputLabel}>Días del período</Text>
            <TextInput
              style={styles.input}
              value={formData.termDays.toString()}
              onChangeText={(text) => updateFormData('termDays', parseInt(text) || 0)}
              placeholder="30"
              keyboardType="number-pad"
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.inputLabel}>Penalidad por mal uso</Text>
            <TextInput
              style={styles.input}
              value={formData.misusePenalty.toString()}
              onChangeText={(text) => updateFormData('misusePenalty', parseFloat(text) || 0)}
              placeholder="25.00"
              keyboardType="decimal-pad"
            />
          </View>
        </View>
      </View>

      {/* Firmas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Firmas del contrato</Text>
        
        <View style={styles.signatureGroup}>
          <Text style={styles.signatureLabel}>Firma del arrendatario</Text>
          <SignatureCanvas
            signature={formData.tenantSignature}
            onSignature={(signature) => updateFormData('tenantSignature', signature)}
            placeholder="Firma del arrendatario"
          />
        </View>
        
        <View style={styles.signatureGroup}>
          <Text style={styles.signatureLabel}>Firma del arrendador</Text>
          <SignatureCanvas
            signature={formData.landlordSignature}
            onSignature={(signature) => updateFormData('landlordSignature', signature)}
            placeholder="Firma del arrendador"
          />
        </View>
      </View>

      {/* Observaciones finales */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Observaciones finales</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Comentarios adicionales</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.finalObservations}
            onChangeText={(text) => updateFormData('finalObservations', text)}
            placeholder="Ingrese cualquier observación adicional sobre el contrato..."
            multiline
            numberOfLines={4}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  reservationInfo: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  section: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4285F4',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    marginRight: 8,
    minWidth: 60,
  },
  infoValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  totalAmountContainer: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  totalAmountText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#15803D',
  },
  signatureGroup: {
    marginBottom: 24,
  },
  signatureLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
});

export default ContractForm;