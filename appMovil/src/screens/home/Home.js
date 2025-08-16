import React from 'react';
import { ScrollView, StyleSheet, StatusBar, SafeAreaView, Text, View } from 'react-native';
import { useStatsData } from './hooks/useStatitics';
import RentedVehiclesByBrandChart from './components/RentedVehiclesChart';
import NewClientsChart from './components/NewClientsChart';
import ImportsByBrandChart from './components/ImportsChart';
import DailyRentalsChart from './components/DailyRentalsChart';
import LoadingStats from './components/LoadingStats';

const StatsScreen = () => {
  const { data, loading } = useStatsData();

  if (loading) {
    return <LoadingStats />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>¡Bienvenido Saúl!</Text>
        <Text style={styles.headerSubtitle}>Estadísticas del Negocio</Text>
      </View>

      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Gráfico 1: Vehículos más rentados por marca */}
        <RentedVehiclesByBrandChart data={data.rentedVehiclesByBrand} />

        {/* Gráfico 2: Cantidad de nuevos clientes */}
        <NewClientsChart data={data.newClients} />

        {/* Gráfico 3: Importaciones por marca */}
        <ImportsByBrandChart data={data.importsByBrand} />

        {/* Gráfico 4: Alquileres hasta hoy */}
        <DailyRentalsChart data={data.dailyRentals} />

        {/* Espaciado final */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#4386FC',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E3F2FD',
    opacity: 0.9,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 20,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default StatsScreen;