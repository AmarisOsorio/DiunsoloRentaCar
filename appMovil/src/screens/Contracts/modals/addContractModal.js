import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Animated,
  PanResponder,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const AddContractModal = ({ visible, onClose, onSave, reservations = [] }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Paso 1 - Datos de entrega
    reservationId: '',
    deliveryDate: '',
    returnDate: '',
    unitNumber: '',
    brandModel: '',
    plate: '',
    clientName: '',
    notes: '',
    
    // Documentación de entrega
    deliveryKeys: false,
    deliveryCirculationCard: false,
    deliveryConsumerInvoice: false,
    
    // Inspección física exterior - entrega
    deliveryExteriorCondition: '',
    deliveryHood: false,
    deliveryAntenna: false,
    deliveryMirrors: false,
    deliveryTrunk: false,
    deliveryWindows: false,
    deliveryToolKit: false,
    deliveryDoorHandles: false,
    deliveryFuelCap: false,
    deliveryWheelCoversPresent: false,
    deliveryWheelCoversQuantity: 0,
    
    // Inspección física interior - entrega
    deliveryStartSwitch: false,
    deliveryIgnitionKey: false,
    deliveryLights: false,
    deliveryRadio: false,
    deliveryAC: false,
    deliveryDashboard: '',
    deliveryGearShift: false,
    deliveryDoorLocks: false,
    deliveryMats: false,
    deliverySpareTire: false,
    
    // Combustible
    deliveryFuelLevel: 50,
    returnFuelLevel: 50,
    
    // Firma de entrega
    deliverySignature: null,
    
    // Paso 2 - Datos de arrendamiento (se llenarán desde reservación)
    tenantName: '',
    tenantProfession: '',
    tenantAddress: '',
    passportCountry: '',
    passportNumber: '',
    licenseCountry: '',
    licenseNumber: '',
    
    extraDriverName: '',
    extraDriverPassportCountry: '',
    extraDriverPassportNumber: '',
    extraDriverLicenseCountry: '',
    extraDriverLicenseNumber: '',
    
    deliveryCity: '',
    deliveryHour: '',
    
    dailyPrice: 0,
    totalAmount: 0,
    rentalDays: 0,
    depositAmount: 0,
    termDays: 0,
    misusePenalty: 0,
    
    signatureCity: '',
    signatureHour: '',
    signatureDate: '',
    
    landlordSignature: null,
    tenantSignature: null,
    
    finalObservations: ''
  });

  // Referencias para las firmas
  const deliverySignatureRef = useRef(null);
  const landlordSignatureRef = useRef(null);
  const tenantSignatureRef = useRef(null);

  // Estados para el control de combustible
  const deliveryFuelPan = useRef(new Animated.Value(0)).current;
  const returnFuelPan = useRef(new Animated.Value(0)).current;

  // Función para crear el PanResponder del combustible
  const createFuelPanResponder = (panValue, fuelType) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        const maxWidth = 200; // Ancho del medidor
        const newValue = Math.max(0, Math.min(100, (gestureState.dx / maxWidth) * 100 + formData[fuelType]));
        setFormData(prev => ({ ...prev, [fuelType]: newValue }));
      },
      onPanResponderRelease: () => {
        // Animar a la posición final
      }
    });
  };

  const deliveryFuelResponder = createFuelPanResponder(deliveryFuelPan, 'deliveryFuelLevel');
  const returnFuelResponder = createFuelPanResponder(returnFuelPan, 'returnFuelLevel');

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const validateStep1 = () => {
    const required = [
      'reservationId', 'deliveryDate', 'returnDate', 'unitNumber', 
      'brandModel', 'plate', 'clientName'
    ];
    
    for (let field of required) {
      if (!formData[field]) {
        Alert.alert('Error', `El campo ${field} es requerido`);
        return false;
      }
    }
    
    if (!formData.deliverySignature) {
      Alert.alert('Error', 'La firma de entrega es requerida');
      return false;
    }
    
    return true;
  };

  const validateStep2 = () => {
    const required = [
      'tenantName', 'tenantAddress', 'passportNumber', 'licenseNumber',
      'deliveryCity', 'dailyPrice', 'totalAmount'
    ];
    
    for (let field of required) {
      if (!formData[field]) {
        Alert.alert('Error', `El campo ${field} es requerido`);
        return false;
      }
    }
    
    if (!formData.landlordSignature || !formData.tenantSignature) {
      Alert.alert('Error', 'Ambas firmas son requeridas');
      return false;
    }
    
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
        // Cargar datos de la reservación seleccionada
        loadReservationData();
      }
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleSave = () => {
    if (currentStep === 2 && validateStep2()) {
      onSave(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFormData({
      // Reset todos los campos...
      reservationId: '',
      deliveryDate: '',
      // ... resto de campos
    });
    onClose();
  };

  const loadReservationData = () => {
    // Aquí cargarías los datos de la reservación seleccionada
    const selectedReservation = reservations.find(r => r._id === formData.reservationId);
    if (selectedReservation) {
      // Actualizar formData con datos de la reservación
      setFormData(prev => ({
        ...prev,
        tenantName: selectedReservation.clientName || '',
        // ... otros campos de la reservación
      }));
    }
  };

  // Componente de medidor de combustible
  const FuelGauge = ({ level, onLevelChange, title, panResponder }) => (
    <View style={styles.fuelGaugeContainer}>
      <Text style={styles.fuelGaugeTitle}>{title}</Text>
      <View style={styles.gaugeWrapper}>
        <Svg width={120} height={120} viewBox="0 0 120 120">
          {/* Fondo del medidor */}
          <Path
            d="M20 60 A 40 40 0 1 1 100 60"
            stroke="#E8EAED"
            strokeWidth="8"
            fill="none"
          />
          {/* Progreso del medidor */}
          <Path
            d="M20 60 A 40 40 0 1 1 100 60"
            stroke={level < 25 ? '#EA4335' : level < 50 ? '#FBBC04' : '#34A853'}
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${level * 1.25} 125`}
          />
        </Svg>
        <View style={styles.gaugeCenter}>
          <Text style={styles.gaugeValue}>{Math.round(level)}%</Text>
        </View>
        <View
          style={[styles.gaugeHandle, { transform: [{ rotate: `${(level / 100) * 180 - 90}deg` }] }]}
          {...panResponder.panHandlers}
        >
          <View style={styles.handleDot} />
        </View>
      </View>
    </View>
  );

  // Componente de firma digital
  const SignatureCanvas = ({ title, onSignature, signature }) => (
    <View style={styles.signatureContainer}>
      <Text style={styles.signatureTitle}>{title}</Text>
      <View style={styles.signatureCanvas}>
        {signature ? (
          <View style={styles.signaturePreview}>
            <Text style={styles.signatureText}>Firma capturada</Text>
            <TouchableOpacity
              style={styles.clearSignatureBtn}
              onPress={() => onSignature(null)}
            >
              <Ionicons name="close" size={16} color="#EA4335" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.signatureButton}
            onPress={() => {
              // Aquí abrir modal de firma
              Alert.alert('Firma', 'Funcionalidad de firma digital próximamente');
              onSignature('signature_data_placeholder');
            }}
          >
            <Ionicons name="create-outline" size={24} color="#4285F4" />
            <Text style={styles.signatureButtonText}>Firmar aquí</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderStep1 = () => (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Datos de entrega</Text>
      
      {/* Datos básicos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información básica</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>ID Reservación</Text>
          <TextInput
            style={styles.input}
            value={formData.reservationId}
            onChangeText={(text) => updateFormData('reservationId', text)}
            placeholder="Seleccionar reservación"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.inputLabel}>Fecha de entrega</Text>
            <TextInput
              style={styles.input}
              value={formData.deliveryDate}
              onChangeText={(text) => updateFormData('deliveryDate', text)}
              placeholder="DD/MM/AAAA"
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.inputLabel}>Fecha de devolución</Text>
            <TextInput
              style={styles.input}
              value={formData.returnDate}
              onChangeText={(text) => updateFormData('returnDate', text)}
              placeholder="DD/MM/AAAA"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Número de unidad</Text>
          <TextInput
            style={styles.input}
            value={formData.unitNumber}
            onChangeText={(text) => updateFormData('unitNumber', text)}
            placeholder="UN1234"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Marca y modelo</Text>
          <TextInput
            style={styles.input}
            value={formData.brandModel}
            onChangeText={(text) => updateFormData('brandModel', text)}
            placeholder="Toyota Corolla 2022"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Placa</Text>
          <TextInput
            style={styles.input}
            value={formData.plate}
            onChangeText={(text) => updateFormData('plate', text)}
            placeholder="P123-456"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Nombre del cliente</Text>
          <TextInput
            style={styles.input}
            value={formData.clientName}
            onChangeText={(text) => updateFormData('clientName', text)}
            placeholder="Katherine Fernández"
          />
        </View>
      </View>

      {/* Documentación de entrega */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Documentación de entrega</Text>
        
        <TouchableOpacity
          style={styles.checkboxItem}
          onPress={() => updateFormData('deliveryKeys', !formData.deliveryKeys)}
        >
          <View style={[styles.checkbox, formData.deliveryKeys && styles.checkboxChecked]}>
            {formData.deliveryKeys && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
          </View>
          <Text style={styles.checkboxLabel}>Entrega de llaves</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkboxItem}
          onPress={() => updateFormData('deliveryCirculationCard', !formData.deliveryCirculationCard)}
        >
          <View style={[styles.checkbox, formData.deliveryCirculationCard && styles.checkboxChecked]}>
            {formData.deliveryCirculationCard && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
          </View>
          <Text style={styles.checkboxLabel}>Tarjeta de circulación</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkboxItem}
          onPress={() => updateFormData('deliveryConsumerInvoice', !formData.deliveryConsumerInvoice)}
        >
          <View style={[styles.checkbox, formData.deliveryConsumerInvoice && styles.checkboxChecked]}>
            {formData.deliveryConsumerInvoice && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
          </View>
          <Text style={styles.checkboxLabel}>Factura de consumidor</Text>
        </TouchableOpacity>
      </View>

      {/* Inspección física */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Inspección física</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Estado general exterior</Text>
          <TextInput
            style={styles.input}
            value={formData.deliveryExteriorCondition}
            onChangeText={(text) => updateFormData('deliveryExteriorCondition', text)}
            placeholder="Muy buena"
            multiline
          />
        </View>

        {/* Checklist exterior */}
        <Text style={styles.subsectionTitle}>Exterior</Text>
        {[
          { key: 'deliveryHood', label: 'Capó' },
          { key: 'deliveryAntenna', label: 'Antena' },
          { key: 'deliveryMirrors', label: 'Espejos' },
          { key: 'deliveryTrunk', label: 'Baúl' },
          { key: 'deliveryWindows', label: 'Ventanas en buen estado' },
          { key: 'deliveryToolKit', label: 'Kit de herramientas' },
          { key: 'deliveryDoorHandles', label: 'Manijas de puertas' },
          { key: 'deliveryFuelCap', label: 'Tapón de combustible' }
        ].map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.checkboxItem}
            onPress={() => updateFormData(item.key, !formData[item.key])}
          >
            <View style={[styles.checkbox, formData[item.key] && styles.checkboxChecked]}>
              {formData[item.key] && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
            </View>
            <Text style={styles.checkboxLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}

        {/* Checklist interior */}
        <Text style={styles.subsectionTitle}>Interior</Text>
        {[
          { key: 'deliveryStartSwitch', label: 'Interruptor de encendido' },
          { key: 'deliveryIgnitionKey', label: 'Llave de encendido' },
          { key: 'deliveryLights', label: 'Luces' },
          { key: 'deliveryRadio', label: 'Radio original' },
          { key: 'deliveryAC', label: 'A/C - Calefacción - Ventilación' },
          { key: 'deliveryGearShift', label: 'Palanca de cambios' },
          { key: 'deliveryDoorLocks', label: 'Seguros de puertas' },
          { key: 'deliveryMats', label: 'Alfombras' },
          { key: 'deliverySpareTire', label: 'Llanta de respuesto' }
        ].map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.checkboxItem}
            onPress={() => updateFormData(item.key, !formData[item.key])}
          >
            <View style={[styles.checkbox, formData[item.key] && styles.checkboxChecked]}>
              {formData[item.key] && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
            </View>
            <Text style={styles.checkboxLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Combustible */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estado de combustible</Text>
        <View style={styles.fuelSection}>
          <FuelGauge
            level={formData.deliveryFuelLevel}
            onLevelChange={(level) => updateFormData('deliveryFuelLevel', level)}
            title="Entrega"
            panResponder={deliveryFuelResponder}
          />
          <FuelGauge
            level={formData.returnFuelLevel}
            onLevelChange={(level) => updateFormData('returnFuelLevel', level)}
            title="Devolución"
            panResponder={returnFuelResponder}
          />
        </View>
      </View>

      {/* Firma de entrega */}
      <View style={styles.section}>
        <SignatureCanvas
          title="Firma de entrega"
          signature={formData.deliverySignature}
          onSignature={(sig) => updateFormData('deliverySignature', sig)}
        />
      </View>

      {/* Observaciones */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Observaciones</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.notes}
          onChangeText={(text) => updateFormData('notes', text)}
          placeholder="Observaciones adicionales..."
          multiline
          numberOfLines={4}
        />
      </View>
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Datos de arrendamiento</Text>
      
      {/* Conductor principal */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Conductor principal</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Nombre de arrendatario</Text>
          <TextInput
            style={styles.input}
            value={formData.tenantName}
            onChangeText={(text) => updateFormData('tenantName', text)}
            placeholder="Juan Pérez"
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
            style={styles.input}
            value={formData.tenantAddress}
            onChangeText={(text) => updateFormData('tenantAddress', text)}
            placeholder="Av. Siempre Viva 742, San Salvador"
            multiline
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.inputLabel}>Pasaporte del país</Text>
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
            <Text style={styles.inputLabel}>Licencia del país</Text>
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

      {/* Conductor secundario */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Conductor secundario</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Nombre de conductor secundario</Text>
          <TextInput
            style={styles.input}
            value={formData.extraDriverName}
            onChangeText={(text) => updateFormData('extraDriverName', text)}
            placeholder="Carlos Mendoza"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.inputLabel}>Pasaporte del país</Text>
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
            <Text style={styles.inputLabel}>Licencia del país</Text>
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

      {/* Entrega al arrendatario */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Entrega al arrendatario</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Ciudad de la entrega</Text>
          <TextInput
            style={styles.input}
            value={formData.deliveryCity}
            onChangeText={(text) => updateFormData('deliveryCity', text)}
            placeholder="San Salvador"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Fecha de entrega</Text>
          <TextInput
            style={styles.input}
            value={formData.deliveryDate}
            onChangeText={(text) => updateFormData('deliveryDate', text)}
            placeholder="6/04/2025"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.inputLabel}>Precio diario</Text>
            <TextInput
              style={styles.input}
              value={formData.dailyPrice.toString()}
              onChangeText={(text) => updateFormData('dailyPrice', parseFloat(text) || 0)}
              placeholder="$ 45.00"
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.inputLabel}>Monto total</Text>
            <TextInput
              style={styles.input}
              value={formData.totalAmount.toString()}
              onChangeText={(text) => updateFormData('totalAmount', parseFloat(text) || 0)}
              placeholder="$ 245.00"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.inputLabel}>Días de alquiler</Text>
            <TextInput
              style={styles.input}
              value={formData.rentalDays.toString()}
              onChangeText={(text) => updateFormData('rentalDays', parseInt(text) || 0)}
              placeholder="7"
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.inputLabel}>Depósito</Text>
            <TextInput
              style={styles.input}
              value={formData.depositAmount.toString()}
              onChangeText={(text) => updateFormData('depositAmount', parseFloat(text) || 0)}
              placeholder="$ 100.00"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Penalidad de mal uso</Text>
          <TextInput
            style={styles.input}
            value={formData.misusePenalty.toString()}
            onChangeText={(text) => updateFormData('misusePenalty', parseFloat(text) || 0)}
            placeholder="$ 25.00"
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Firmas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Firma de arrendatario</Text>
        <SignatureCanvas
          title="Firma del arrendatario"
          signature={formData.tenantSignature}
          onSignature={(sig) => updateFormData('tenantSignature', sig)}
        />
        
        <SignatureCanvas
          title="Firma del arrendador"
          signature={formData.landlordSignature}
          onSignature={(sig) => updateFormData('landlordSignature', sig)}
        />
      </View>

      {/* Observaciones finales */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Observaciones finales</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.finalObservations}
          onChangeText={(text) => updateFormData('finalObservations', text)}
          placeholder="Observaciones adicionales para el contrato..."
          multiline
          numberOfLines={4}
        />
      </View>
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleClose}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Añadir contrato</Text>
        </View>

        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={styles.stepIndicator}>
              <View style={[styles.stepCircle, currentStep >= 1 && styles.stepCircleActive]}>
                <Text style={[styles.stepNumber, currentStep >= 1 && styles.stepNumberActive]}>1</Text>
              </View>
              <Text style={styles.stepLabel}>Datos de entrega</Text>
            </View>
            <View style={styles.progressLine} />
            <View style={styles.stepIndicator}>
              <View style={[styles.stepCircle, currentStep >= 2 && styles.stepCircleActive]}>
                <Text style={[styles.stepNumber, currentStep >= 2 && styles.stepNumberActive]}>2</Text>
              </View>
              <Text style={styles.stepLabel}>Datos de arrendamiento</Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {currentStep === 1 ? renderStep1() : renderStep2()}
        </View>

        {/* Footer buttons */}
        <View style={styles.footer}>
          {currentStep === 2 && (
            <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
              <Text style={styles.backBtnText}>Anterior</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.primaryButton, currentStep === 2 && { flex: 1, marginLeft: 12 }]}
            onPress={currentStep === 1 ? handleNext : handleSave}
          >
            <Text style={styles.primaryButtonText}>
              {currentStep === 1 ? 'Siguiente' : 'Guardar contrato'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4285F4',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  
  // Progress indicator
  progressContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndicator: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8EAED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCircleActive: {
    backgroundColor: '#4285F4',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9AA0A6',
  },
  stepNumberActive: {
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 12,
    color: '#5F6368',
    textAlign: 'center',
    maxWidth: 80,
  },
  progressLine: {
    height: 2,
    flex: 1,
    backgroundColor: '#E8EAED',
    marginHorizontal: 16,
    marginBottom: 24,
  },
  
  // Content
  content: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#202124',
    marginBottom: 24,
    textAlign: 'center',
  },
  
  // Sections
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4285F4',
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#202124',
    marginTop: 16,
    marginBottom: 12,
  },
  
  // Form inputs
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5F6368',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E8EAED',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#202124',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // Checkboxes
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E8EAED',
    backgroundColor: '#FFFFFF',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4285F4',
    borderColor: '#4285F4',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#202124',
    flex: 1,
  },
  
  // Fuel gauge
  fuelSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
  },
  fuelGaugeContainer: {
    alignItems: 'center',
  },
  fuelGaugeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5F6368',
    marginBottom: 12,
  },
  gaugeWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeCenter: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gaugeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#202124',
  },
  gaugeHandle: {
    position: 'absolute',
    width: 50,
    height: 50,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  handleDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4285F4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  
  // Signature
  signatureContainer: {
    marginBottom: 16,
  },
  signatureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5F6368',
    marginBottom: 12,
  },
  signatureCanvas: {
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#E8EAED',
    borderStyle: 'dashed',
    borderRadius: 8,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signatureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  signatureButtonText: {
    fontSize: 16,
    color: '#4285F4',
    marginLeft: 8,
    fontWeight: '500',
  },
  signaturePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  signatureText: {
    fontSize: 14,
    color: '#34A853',
    fontWeight: '500',
  },
  clearSignatureBtn: {
    marginLeft: 12,
    padding: 4,
  },
  
  // Footer
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8EAED',
    alignItems: 'center',
  },
  backBtn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5F6368',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#4285F4',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4285F4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AddContractModal;