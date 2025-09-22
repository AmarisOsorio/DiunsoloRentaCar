import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = ({ navigation }) => {
  const quickActions = [
    {
      title: 'Agregar Marca',
      subtitle: 'Nueva marca de vehículo',
      action: () => navigation.navigate('Marcas'),
      color: '#4A90E2',
      icon: 'add-circle'
    },
    {
      title: 'Nuevo Mantenimiento',
      subtitle: 'Registrar mantenimiento',
      action: () => navigation.navigate('Maintenance'),
      color: '#E74C3C',
      icon: 'construct'
    }
  ];  

  const statsCards = [
    {
      title: 'Marcas Registradas',
      value: '12',
      icon: 'car-sport',
      color: '#4A90E2'
    },
    {
      title: 'Mantenimientos Activos',
      value: '5',
      icon: 'construct',
      color: '#E74C3C'
    },
    {
      title: 'Pendientes',
      value: '3',
      icon: 'time',
      color: '#FF9800'
    },
    {
      title: 'Completados',
      value: '24',
      icon: 'checkmark-circle',
      color: '#4CAF50'
    }
  ];

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.headerSubtitle}>Bienvenido de vuelta</Text>
        <Text style={styles.headerTitle}>Panel de Control</Text>
      </View>
      <TouchableOpacity style={styles.notificationButton}>
        <Ionicons name="notifications" size={24} color="#FFFFFF" />
        <View style={styles.notificationBadge}>
          <Text style={styles.badgeText}>2</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderStatsCard = (card, index) => (
    <View key={index} style={[styles.statsCard, { borderLeftColor: card.color }]}>
      <View style={styles.statsContent}>
        <View style={[styles.statsIcon, { backgroundColor: `${card.color}20` }]}>
          <Ionicons name={card.icon} size={24} color={card.color} />
        </View>
        <View style={styles.statsText}>
          <Text style={styles.statsValue}>{card.value}</Text>
          <Text style={styles.statsTitle}>{card.title}</Text>
        </View>
      </View>
    </View>
  );

  const renderQuickAction = (action, index) => (
    <TouchableOpacity
      key={index}
      style={[styles.quickActionButton, { backgroundColor: action.color }]}
      onPress={action.action}
      activeOpacity={0.8}
    >
      <Ionicons name={action.icon} size={24} color="#FFFFFF" />
      <Text style={styles.quickActionTitle}>{action.title}</Text>
      <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A90E2" />
      
      {renderHeader()}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Estadísticas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen</Text>
          <View style={styles.statsGrid}>
            {statsCards.map((card, index) => renderStatsCard(card, index))}
          </View>
        </View>

        {/* Acciones Rápidas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <View style={styles.quickActionsContainer}>
            {quickActions.map((action, index) => renderQuickAction(action, index))}
          </View>
        </View>

        {/* Actividad Reciente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actividad Reciente</Text>
          <View style={styles.activityContainer}>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="add-circle" size={16} color="#4CAF50" />
              </View>
              <View style={styles.activityText}>
                <Text style={styles.activityTitle}>Nueva marca agregada</Text>
                <Text style={styles.activityTime}>Hace 2 horas</Text>
              </View>
            </View>
            
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="construct" size={16} color="#E74C3C" />
              </View>
              <View style={styles.activityText}>
                <Text style={styles.activityTitle}>Mantenimiento completado</Text>
                <Text style={styles.activityTime}>Ayer</Text>
              </View>
            </View>
            
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              </View>
              <View style={styles.activityText}>
                <Text style={styles.activityTitle}>Revisión finalizada</Text>
                <Text style={styles.activityTime}>Hace 3 días</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#4A90E2',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: 'space-between',
  },
  headerContent: {
    flex: 1,
  },
  headerSubtitle: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 5,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#E74C3C',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    width: '48%',
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statsText: {
    flex: 1,
  },
  statsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  statsTitle: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 1,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  quickActionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.8,
    marginTop: 4,
    textAlign: 'center',
  },
  activityContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityText: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
  activityTime: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
});

export default HomeScreen;