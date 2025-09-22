import React from 'react';
import { View, Text, StyleSheet, Modal, Animated, Easing } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function SuccessVehicle({ visible, message = '¡Vehículo agregado exitosamente!' }) {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 5,
        tension: 80,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}> 
        <Ionicons name="checkmark-circle" size={80} color="#3D83D2" style={{ marginBottom: 12 }} />
        <Text style={styles.text}>{message}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3D83D2',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  text: {
    fontSize: 20,
    color: '#3D83D2',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
});
