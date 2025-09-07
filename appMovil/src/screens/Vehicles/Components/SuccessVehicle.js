import React from 'react';
import { View, Text, StyleSheet, Animated, Easing, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Puedes reemplazar la URL por una animación de confeti local si tienes una
const CONFETTI_URL = 'https://cdn.pixabay.com/animation/2022/10/18/09/36/09-36-36-627_512.gif';

export default function SuccessVehicle({ visible, message = '¡Vehículo agregado exitosamente!' }) {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const confettiAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 5,
        tension: 80,
      }).start();
      Animated.timing(confettiAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
        easing: Easing.out(Easing.exp),
      }).start();
    } else {
      scaleAnim.setValue(0);
      confettiAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      {/* Confetti animado */}
      <Animated.View style={[styles.confettiContainer, { opacity: confettiAnim }]}> 
        <Image source={{ uri: CONFETTI_URL }} style={styles.confetti} resizeMode="contain" />
      </Animated.View>
      <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}> 
        <View style={styles.iconCircle}>
          <Ionicons name="car-sport" size={54} color="#fff" style={{ marginBottom: 0 }} />
        </View>
        <Ionicons name="checkmark-circle" size={60} color="#3D83D2" style={{ marginBottom: 8, marginTop: -18 }} />
        <Text style={styles.title}>¡Nuevo vehículo agregado!</Text>
        <Text style={styles.text}>{message}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 2,
  },
  confetti: {
    width: 220,
    height: 120,
    marginTop: 10,
    opacity: 0.92,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 26,
    paddingVertical: 38,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3D83D2',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 3,
    minWidth: 270,
  },
  iconCircle: {
    backgroundColor: '#3D83D2',
    borderRadius: 40,
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
    marginTop: -30,
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#3D83D2',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    color: '#3D83D2',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  text: {
    fontSize: 16,
    color: '#3977ce',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 2,
    letterSpacing: 0.1,
  },
});
