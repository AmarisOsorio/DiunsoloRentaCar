import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Svg, { Path } from 'react-native-svg';

export default function Calendario({ navigation, route }) {
  const { vehicleId, vehicleName } = route?.params || {};

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerBg}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButtonHeader} onPress={handleGoBack}>
              <Ionicons name="chevron-back" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Calendario de reservas</Text>
          </View>
          <View style={[styles.headerCurveContainer, { width: '100%' }]} pointerEvents="none">
            <Svg height="50" width="100%" viewBox="0 0 400 50" preserveAspectRatio="none">
              <Path d="M0,0 H400 V50 H0 Z" fill="#3D83D2" />
              <Path d="M0,40 Q200,0 400,40 L400,50 L0,50 Z" fill="#F2F2F2" />
            </Svg>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.vehicleInfo}>
          <Ionicons name="car-sport" size={24} color="#3D83D2" />
          <Text style={styles.vehicleText}>
            {vehicleName || 'Vehículo seleccionado'}
          </Text>
        </View>

        <View style={styles.comingSoonContainer}>
          <Ionicons name="calendar" size={80} color="#bdc3c7" />
          <Text style={styles.comingSoonTitle}>Calendario de reservas</Text>
          <Text style={styles.comingSoonText}>
            Esta funcionalidad estará disponible próximamente.
            Aquí podrás ver y gestionar todas las reservas de este vehículo.
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Próximas funcionalidades:</Text>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#27ae60" />
            <Text style={styles.featureText}>Ver reservas activas</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#27ae60" />
            <Text style={styles.featureText}>Crear nuevas reservas</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#27ae60" />
            <Text style={styles.featureText}>Calendario interactivo</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#27ae60" />
            <Text style={styles.featureText}>Gestión de disponibilidad</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  // Header styles (same as VehicleDetails)
  headerContainer: {
    backgroundColor: '#3D83D2',
    paddingHorizontal: 0,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  headerBg: {
    backgroundColor: '#3D83D2',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 44,
    paddingBottom: 16,
  },
  backButtonHeader: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  headerCurveContainer: {
    height: 50,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
  },
  vehicleInfo: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  vehicleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 12,
  },
  comingSoonContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 12,
  },
  comingSoonText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresContainer: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  featureText: {
    fontSize: 16,
    color: '#34495e',
    marginLeft: 12,
  },
});
