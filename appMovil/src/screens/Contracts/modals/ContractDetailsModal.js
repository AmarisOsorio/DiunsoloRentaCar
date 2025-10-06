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
  StatusBar,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const ContractDetailsModal = ({ 
  visible, 
  contract, 
  onClose, 
  onDelete, 
  onGeneratePdf,
  onEdit
}) => {
  const [activeTab, setActiveTab] = useState('general');

  if (!contract) return null;

  // Helpers
  const getNestedValue = (obj, path, defaultValue = 'N/A') => {
    return path.split('.').reduce((current, key) => 
      current && current[key] !== undefined ? current[key] : defaultValue, obj
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  const formatCurrency = (amount) => {
    return `Q ${parseFloat(amount || 0).toFixed(2)}`;
  };

  const getStatusConfig = (status) => {
    const configs = {
      Active: { color: '#00C896', icon: 'play-circle', label: 'Activo', bg: '#E6F9F4' },
      Finished: { color: '#4285F4', icon: 'checkmark-circle', label: 'Completado', bg: '#E8F0FE' },
      Canceled: { color: '#EA4335', icon: 'close-circle', label: 'Cancelado', bg: '#FEF7F0' }
    };
    return configs[status] || { color: '#9AA0A6', icon: 'help-circle', label: status, bg: '#F1F3F4' };
  };

  // Extract data
  const clientName = getNestedValue(contract, 'reservationId.clientId.name', '') + ' ' + 
                    getNestedValue(contract, 'reservationId.clientId.lastName', '');
  const vehicleBrand = getNestedValue(contract, 'reservationId.vehicleId.brand', 'Vehículo');
  const vehicleModel = getNestedValue(contract, 'reservationId.vehicleId.model', 'N/A');
  const vehiclePlate = getNestedValue(contract, 'reservationId.vehicleId.plate', 'Sin placa');
  const statusConfig = getStatusConfig(contract.status);

  // Components
  const InfoCard = ({ icon, label, value, iconColor = '#4285F4', iconBg = '#E8F0FE' }) => (
    <View style={styles.infoCard}>
      <View style={[styles.infoIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );

  const StatCard = ({ label, value, color = '#202124', icon }) => (
    <View style={styles.statCard}>
      {icon && <Ionicons name={icon} size={18} color={color} style={styles.statIcon} />}
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );

  const CheckItem = ({ label, checked }) => (
    <View style={styles.checkItem}>
      <View style={[styles.checkCircle, checked && styles.checkCircleActive]}>
        <Ionicons 
          name={checked ? "checkmark" : "close"} 
          size={14} 
          color={checked ? "#00C896" : "#EA4335"} 
        />
      </View>
      <Text style={styles.checkLabel}>{label}</Text>
    </View>
  );

  const renderGeneralTab = () => {
    const tenantName = getNestedValue(contract, 'leaseData.tenantName', clientName);
    const tenantAddress = getNestedValue(contract, 'leaseData.tenantAddress', 'N/A');
    const passportNumber = getNestedValue(contract, 'leaseData.passportNumber', 'N/A');
    const licenseNumber = getNestedValue(contract, 'leaseData.licenseNumber', 'N/A');
    const dailyPrice = getNestedValue(contract, 'leaseData.dailyPrice', 0);
    const totalAmount = getNestedValue(contract, 'leaseData.totalAmount', 0);
    const rentalDays = getNestedValue(contract, 'leaseData.rentalDays', 0);
    const depositAmount = getNestedValue(contract, 'leaseData.depositAmount', 0);
    const deliveryDate = getNestedValue(contract, 'statusSheetData.deliveryDate', contract.startDate);
    const returnDate = getNestedValue(contract, 'statusSheetData.returnDate', contract.endDate);

    return (
      <View style={styles.tabContent}>
        {/* Vehicle Header Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons name="car-sport" size={40} color="#FFFFFF" />
          </View>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>{vehicleBrand} {vehicleModel}</Text>
            <Text style={styles.heroSubtitle}>{vehiclePlate}</Text>
            <View style={[styles.heroBadge, { backgroundColor: statusConfig.bg }]}>
              <Ionicons name={statusConfig.icon} size={14} color={statusConfig.color} />
              <Text style={[styles.heroBadgeText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard label="Días" value={rentalDays} icon="calendar" color="#4285F4" />
          <StatCard label="Diario" value={formatCurrency(dailyPrice)} icon="cash" color="#FF9800" />
          <StatCard label="Depósito" value={formatCurrency(depositAmount)} icon="wallet" color="#9C27B0" />
          <StatCard label="Total" value={formatCurrency(totalAmount)} icon="card" color="#00C896" />
        </View>

        {/* Client Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={20} color="#4285F4" />
            <Text style={styles.sectionTitle}>Información del Cliente</Text>
          </View>
          <View style={styles.cardContent}>
            <InfoCard icon="person-circle" label="Nombre" value={tenantName} />
            <InfoCard icon="location" label="Dirección" value={tenantAddress} iconColor="#00C896" iconBg="#E6F9F4" />
            <InfoCard icon="card" label="Pasaporte" value={passportNumber} iconColor="#FF9800" iconBg="#FFF8E1" />
            <InfoCard icon="newspaper" label="Licencia" value={licenseNumber} iconColor="#9C27B0" iconBg="#F3E5F5" />
          </View>
        </View>

        {/* Dates Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar" size={20} color="#4285F4" />
            <Text style={styles.sectionTitle}>Período de Renta</Text>
          </View>
          <View style={styles.dateRange}>
            <View style={styles.dateCard}>
              <Ionicons name="arrow-forward-circle" size={24} color="#00C896" />
              <Text style={styles.dateLabel}>Entrega</Text>
              <Text style={styles.dateValue}>{formatDate(deliveryDate)}</Text>
            </View>
            <View style={styles.dateDivider}>
              <Ionicons name="swap-horizontal" size={20} color="#E8EAED" />
            </View>
            <View style={styles.dateCard}>
              <Ionicons name="arrow-back-circle" size={24} color="#4285F4" />
              <Text style={styles.dateLabel}>Devolución</Text>
              <Text style={styles.dateValue}>{formatDate(returnDate)}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderInspectionTab = () => {
    const fuelDelivery = getNestedValue(contract, 'statusSheetData.fuelStatus.delivery', '50');
    const fuelReturn = getNestedValue(contract, 'statusSheetData.fuelStatus.return', '50');
    const physicalInspection = getNestedValue(contract, 'statusSheetData.physicalInspection.delivery', {});

    return (
      <View style={styles.tabContent}>
        {/* Fuel Status */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="speedometer" size={20} color="#4285F4" />
            <Text style={styles.sectionTitle}>Combustible</Text>
          </View>
          <View style={styles.fuelGrid}>
            <View style={styles.fuelCard}>
              <View style={styles.fuelIcon}>
                <Ionicons name="speedometer" size={32} color="#00C896" />
              </View>
              <Text style={styles.fuelLabel}>Entrega</Text>
              <Text style={styles.fuelValue}>{fuelDelivery}%</Text>
              <View style={styles.fuelBar}>
                <View style={[styles.fuelFill, { width: `${fuelDelivery}%`, backgroundColor: '#00C896' }]} />
              </View>
            </View>
            <View style={styles.fuelCard}>
              <View style={styles.fuelIcon}>
                <Ionicons name="speedometer" size={32} color="#4285F4" />
              </View>
              <Text style={styles.fuelLabel}>Devolución</Text>
              <Text style={styles.fuelValue}>{fuelReturn}%</Text>
              <View style={styles.fuelBar}>
                <View style={[styles.fuelFill, { width: `${fuelReturn}%`, backgroundColor: '#4285F4' }]} />
              </View>
            </View>
          </View>
        </View>

        {/* External Inspection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="car" size={20} color="#4285F4" />
            <Text style={styles.sectionTitle}>Inspección Externa</Text>
          </View>
          <View style={styles.checkGrid}>
            <CheckItem label="Capó" checked={physicalInspection.external?.hood} />
            <CheckItem label="Antena" checked={physicalInspection.external?.antenna} />
            <CheckItem label="Espejos" checked={physicalInspection.external?.mirrors} />
            <CheckItem label="Baúl" checked={physicalInspection.external?.trunk} />
            <CheckItem label="Ventanas" checked={physicalInspection.external?.windowsGoodCondition} />
            <CheckItem label="Herramientas" checked={physicalInspection.external?.toolKit} />
          </View>
        </View>

        {/* Internal Inspection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="construct" size={20} color="#4285F4" />
            <Text style={styles.sectionTitle}>Inspección Interna</Text>
          </View>
          <View style={styles.checkGrid}>
            <CheckItem label="Encendido" checked={physicalInspection.internal?.startSwitch} />
            <CheckItem label="Llave" checked={physicalInspection.internal?.ignitionKey} />
            <CheckItem label="Luces" checked={physicalInspection.internal?.lights} />
            <CheckItem label="Radio" checked={physicalInspection.internal?.originalRadio} />
            <CheckItem label="A/C" checked={physicalInspection.internal?.acHeatingVentilation} />
            <CheckItem label="Alfombras" checked={physicalInspection.internal?.mats} />
            <CheckItem label="Repuesto" checked={physicalInspection.internal?.spareTire} />
          </View>
        </View>
      </View>
    );
  };

  const handleDeletePress = () => {
    Alert.alert(
      'Eliminar Contrato',
      '¿Estás seguro? Esta acción no se puede deshacer.',
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="#4285F4" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Contrato</Text>
            <Text style={styles.headerSubtitle}>#{contract._id?.slice(-8)}</Text>
          </View>
          <View style={styles.headerButton} />
        </View>

        {/* Tabs */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'general' && styles.activeTab]}
            onPress={() => setActiveTab('general')}
          >
            <Ionicons 
              name="information-circle" 
              size={20} 
              color={activeTab === 'general' ? '#4285F4' : '#9AA0A6'} 
            />
            <Text style={[styles.tabText, activeTab === 'general' && styles.activeTabText]}>
              General
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'inspection' && styles.activeTab]}
            onPress={() => setActiveTab('inspection')}
          >
            <Ionicons 
              name="clipboard" 
              size={20} 
              color={activeTab === 'inspection' ? '#4285F4' : '#9AA0A6'} 
            />
            <Text style={[styles.tabText, activeTab === 'inspection' && styles.activeTabText]}>
              Inspección
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {activeTab === 'general' ? renderGeneralTab() : renderInspectionTab()}
        </ScrollView>

        {/* Action Bar */}
        <View style={styles.actionBar}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.pdfButton]}
            onPress={() => onGeneratePdf(contract._id)}
          >
            <Ionicons name="document-text" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>PDF</Text>
          </TouchableOpacity>

          {onEdit && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.editButton]}
              onPress={() => onEdit(contract)}
            >
              <Ionicons name="create" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Editar</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDeletePress}
          >
            <Ionicons name="trash" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Eliminar</Text>
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
  
  // Header
  header: {
    backgroundColor: '#4285F4',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'monospace',
    marginTop: 2,
  },

  // Tabs
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EAED',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4285F4',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9AA0A6',
  },
  activeTabText: {
    color: '#4285F4',
    fontWeight: '600',
  },

  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  tabContent: {
    gap: 20,
  },

  // Hero Card
  heroCard: {
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundColor: '#4285F4',
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#4285F4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  heroContent: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#9AA0A6',
    fontWeight: '500',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },

  // Section
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#202124',
  },
  cardContent: {
    gap: 12,
  },

  // Info Card
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#9AA0A6',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#202124',
  },

  // Date Range
  dateRange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  dateDivider: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 12,
    color: '#9AA0A6',
    fontWeight: '500',
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#202124',
  },

  // Fuel Grid
  fuelGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  fuelCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  fuelIcon: {
    marginBottom: 12,
  },
  fuelLabel: {
    fontSize: 12,
    color: '#9AA0A6',
    fontWeight: '500',
    marginBottom: 8,
  },
  fuelValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#202124',
    marginBottom: 12,
  },
  fuelBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#E8EAED',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fuelFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Check Grid
  checkGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '47%',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FEF7F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircleActive: {
    backgroundColor: '#E6F9F4',
  },
  checkLabel: {
    fontSize: 13,
    color: '#202124',
    fontWeight: '500',
    flex: 1,
  },

  // Action Bar
  actionBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    borderTopWidth: 1,
    borderTopColor: '#E8EAED',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  pdfButton: {
    backgroundColor: '#4285F4',
  },
  editButton: {
    backgroundColor: '#FF9800',
  },
  deleteButton: {
    backgroundColor: '#EA4335',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ContractDetailsModal;