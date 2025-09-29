import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';

const Contracts = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        backgroundColor="#3D83D2" 
        barStyle="light-content"
        translucent={false}
        hidden={false}
      />
      <View style={styles.content}>
        <Text style={styles.title}>Contratos</Text>
        <Text style={styles.subtitle}>Pantalla de prueba para contratos</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#153A8B',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default Contracts;
