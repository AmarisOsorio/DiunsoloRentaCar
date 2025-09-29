import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const ContractDetailsModal = ({ 
  visible, 
  contract, 
  onClose, 
  onDelete, 
  onGeneratePdf 
}) => {
  const [activeTab, setActiveTab] = useState('general');

  if (!contract) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const formatCurrency = (amount) => {
    return `$${amount || 0}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return '#4CAF50';
      case 'Finished':
        return '#2196F3';
      case 'Canceled':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  const handleDeletePress = () => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar este contrato?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            onDelete(contract._id);
            onClose();
          }
        }
      ]
    );
  };

  const handleGeneratePdfPress = () => {
    onGeneratePdf(contract._id);
  };

  const renderGeneralTab = () => (
    <View style={styles.tabContent}>
      {/* Contract Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estado del Contrato</Text>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(contract.status) }]}>
            <Text style={styles.statusText}>{contract.status}</Text>
          </View>
          <View style={styles.dateInfo}>
            <Text style={styles.dateLabel}>Fecha de inicio:</Text>
            <Text style={styles.dateValue}>{formatDate(contract.startDate)}</Text>
            {contract.endDate && (
              <>
                <Text style={styles.dateLabel}>Fecha de fin:</Text>
                <Text style={styles.dateValue}>{formatDate(contract.endDate)}</Text>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Client Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información del Cliente</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Nombre:</Text>
          <Text style={styles.infoValue}>{contract.leaseData?.tenantName || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Profesión:</Text>
          <Text style={styles.infoValue}>{contract.leaseData?.tenantProfession || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Dirección:</Text>
          <Text style={styles.infoValue}>{contract.leaseData?.tenantAddress || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Pasaporte:</Text>
          <Text style={styles.infoValue}>
            {contract.leaseData?.passportNumber || 'N/A'} 
            {contract.leaseData?.passportCountry && ` (${contract.leaseData.passportCountry})`}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Licencia:</Text>
          <Text style={styles.infoValue}>
            {contract.leaseData?.licenseNumber || 'N/A'}
            {contract.leaseData?.licenseCountry && ` (${contract.leaseData.licenseCountry})`}
          </Text>
        </View>
      </View>

      {/* Vehicle Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información del Vehículo</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Vehículo:</Text>
          <Text style={styles.infoValue}>{contract.statusSheetData?.brandModel || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Placa:</Text>
          <Text style={styles.infoValue}>{contract.statusSheetData?.plate || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Unidad:</Text>
          <Text style={styles.infoValue}>{contract.statusSheetData?.unitNumber || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Fecha de entrega:</Text>
          <Text style={styles.infoValue}>{formatDate(contract.statusSheetData?.deliveryDate)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Fecha de devolución:</Text>
          <Text style={styles.infoValue}>{formatDate(contract.statusSheetData?.returnDate)}</Text>
        </View>
      </View>

      {/* Pricing Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información de Precios</Text>
        <View style={styles.pricingGrid}>
          <View style={styles.pricingItem}>
            <Text style={styles.pricingLabel}>Días de renta</Text>
            <Text style={styles.pricingValue}>{contract.leaseData?.rentalDays || 0}</Text>
          </View>
          <View style={styles.pricingItem}>
            <Text style={styles.pricingLabel}>Precio diario</Text>
            <Text style={styles.pricingValue}>{formatCurrency(contract.leaseData?.dailyPrice)}</Text>
          </View>
          <View style={styles.pricingItem}>
            <Text style={styles.pricingLabel}>Depósito</Text>
            <Text style={styles.pricingValue}>{formatCurrency(contract.leaseData?.depositAmount)}</Text>
          </View>
          <View style={styles.pricingItem}>
            <Text style={styles.pricingLabel}>Total</Text>
            <Text style={[styles.pricingValue, styles.totalAmount]}>
              {formatCurrency(contract.leaseData?.totalAmount)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderInspectionTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* Vehicle Documentation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Documentación del Vehículo</Text>
        
        <Text style={styles.subSectionTitle}>Entrega</Text>
        <View style={styles.checklistContainer}>
          <View style={styles.checklistItem}>
            <Ionicons 
              name={contract.statusSheetData?.vehicleDocumentation?.delivery?.keys ? "checkmark-circle" : "close-circle"} 
              size={20} 
              color={contract.statusSheetData?.vehicleDocumentation?.delivery?.keys ? "#4CAF50" : "#F44336"} 
            />
            <Text style={styles.checklistText}>Llaves</Text>
          </View>
          <View style={styles.checklistItem}>
            <Ionicons 
              name={contract.statusSheetData?.vehicleDocumentation?.delivery?.circulationCard ? "checkmark-circle" : "close-circle"} 
              size={20} 
              color={contract.statusSheetData?.vehicleDocumentation?.delivery?.circulationCard ? "#4CAF50" : "#F44336"} 
            />
            <Text style={styles.checklistText}>Tarjeta de circulación</Text>
          </View>
          <View style={styles.checklistItem}>
            <Ionicons 
              name={contract.statusSheetData?.vehicleDocumentation?.delivery?.consumerInvoice ? "checkmark-circle" : "close-circle"} 
              size={20} 
              color={contract.statusSheetData?.vehicleDocumentation?.delivery?.consumerInvoice ? "#4CAF50" : "#F44336"} 
            />
            <Text style={styles.checklistText}>Factura de consumidor</Text>
          </View>
        </View>

        <Text style={styles.subSectionTitle}>Devolución</Text>
        <View style={styles.checklistContainer}>
          <View style={styles.checklistItem}>
            <Ionicons 
              name={contract.statusSheetData?.vehicleDocumentation?.return?.keys ? "checkmark-circle" : "close-circle"} 
              size={20} 
              color={contract.statusSheetData?.vehicleDocumentation?.return?.keys ? "#4CAF50" : "#F44336"} 
            />
            <Text style={styles.checklistText}>Llaves</Text>
          </View>
          <View style={styles.checklistItem}>
            <Ionicons 
              name={contract.statusSheetData?.vehicleDocumentation?.return?.circulationCard ? "checkmark-circle" : "close-circle"} 
              size={20} 
              color={contract.statusSheetData?.vehicleDocumentation?.return?.circulationCard ? "#4CAF50" : "#F44336"} 
            />
            <Text style={styles.checklistText}>Tarjeta de circulación</Text>
          </View>
          <View style={styles.checklistItem}>
            <Ionicons 
              name={contract.statusSheetData?.vehicleDocumentation?.return?.consumerInvoice ? "checkmark-circle" : "close-circle"} 
              size={20} 
              color={contract.statusSheetData?.vehicleDocumentation?.return?.consumerInvoice ? "#4CAF50" : "#F44336"} 
            />
            <Text style={styles.checklistText}>Factura de consumidor</Text>
          </View>
        </View>
      </View>

      {/* Fuel Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estado del Combustible</Text>
        <View style={styles.fuelContainer}>
          <View style={styles.fuelItem}>
            <Text style={styles.fuelLabel}>Entrega:</Text>
            <Text style={styles.fuelValue}>{contract.statusSheetData?.fuelStatus?.delivery || 'N/A'}</Text>
          </View>
          <View style={styles.fuelItem}>
            <Text style={styles.fuelLabel}>Devolución:</Text>
            <Text style={styles.fuelValue}>{contract.statusSheetData?.fuelStatus?.return || 'N/A'}</Text>
          </View>
        </View>
      </View>

      {/* Notes */}
      {contract.statusSheetData?.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notas</Text>
          <Text style={styles.notesText}>{contract.statusSheetData.notes}</Text>
        </View>
      )}
    </ScrollView>
  );

  const renderDocumentsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Documentos</Text>
        
        <TouchableOpacity style={styles.documentItem} onPress={handleGeneratePdfPress}>
          <View style={styles.documentIcon}>
            <Ionicons name="document-text" size={24} color="#2196F3" />
          </View>
          <View style={styles.documentInfo}>
            <Text style={styles.documentTitle}>Contrato de Arrendamiento</Text>
            <Text style={styles.documentSubtitle}>Generar PDF</Text>
          </View>
          <Ionicons name="download-outline" size={20} color="#2196F3" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.documentItem}>
          <View style={styles.documentIcon}>
            <Ionicons name="clipboard" size={24} color="#4CAF50" />
          </View>
          <View style={styles.documentInfo}>
            <Text style={styles.documentTitle}>Hoja de Estado</Text>
            <Text style={styles.documentSubtitle}>Inspección del vehículo</Text>
          </View>
          <Ionicons name="download-outline" size={20} color="#4CAF50" />
        </TouchableOpacity>

        {contract.statusSheetData?.conditionPhotos && contract.statusSheetData.conditionPhotos.length > 0 && (
          <View style={styles.photosContainer}>
            <Text style={styles.photosTitle}>Fotos del Estado del Vehículo</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {contract.statusSheetData.conditionPhotos.map((photo, index) => (
                <Image
                  key={index}
                  source={{ uri: photo }}
                  style={styles.conditionPhoto}
                />
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#212121" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalles del Contrato</Text>
          <TouchableOpacity onPress={handleDeletePress} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={24} color="#F44336" />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'general' && styles.activeTab]}
            onPress={() => setActiveTab('general')}
          >
            <Text style={[styles.tabText, activeTab === 'general' && styles.activeTabText]}>
              General
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'inspection' && styles.activeTab]}
            onPress={() => setActiveTab('inspection')}
          >
            <Text style={[styles.tabText, activeTab === 'inspection' && styles.activeTabText]}>
              Inspección
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'documents' && styles.activeTab]}
            onPress={() => setActiveTab('documents')}
          >
            <Text style={[styles.tabText, activeTab === 'documents' && styles.activeTabText]}>
              Documentos
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'general' && renderGeneralTab()}
          {activeTab === 'inspection' && renderInspectionTab()}
          {activeTab === 'documents' && renderDocumentsTab()}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#2196F3',
    backgroundColor: '#ffffff',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#757575',
  },
  activeTabText: {
    color: '#2196F3',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 16,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
    marginTop: 16,
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 16,
  },
  statusText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  dateInfo: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 14,
    color: '#212121',
    fontWeight: '500',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  infoLabel: {
    fontSize: 14,
    color: '#757575',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#212121',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  pricingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  pricingItem: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  pricingLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
    textAlign: 'center',
  },
  pricingValue: {
    fontSize: 18,
    color: '#212121',
    fontWeight: 'bold',
  },
  totalAmount: {
    color: '#4CAF50',
  },
  checklistContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checklistText: {
    fontSize: 14,
    color: '#212121',
    marginLeft: 12,
  },
  fuelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fuelItem: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  fuelLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  fuelValue: {
    fontSize: 16,
    color: '#212121',
    fontWeight: 'bold',
  },
  notesText: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 2,
  },
  documentSubtitle: {
    fontSize: 12,
    color: '#757575',
  },
  photosContainer: {
    marginTop: 20,
  },
  photosTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 12,
  },
  conditionPhoto: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#F5F5F5',
  },
});

export default ContractDetailsModal;