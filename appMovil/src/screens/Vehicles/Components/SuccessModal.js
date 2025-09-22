import React from 'react';
import { View, Text, StyleSheet, Modal, Animated, Easing } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function SuccessModal({ 
  visible, 
  type = 'update', // 'update', 'delete', 'download'
  message,
  onHide 
}) {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const bounceAnim = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      // Secuencia de animaciones
      Animated.sequence([
        // Aparecer el modal
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        // Escalar con bounce
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 4,
          tension: 100,
        }),
        // Animación de rebote del icono
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide después de 2.5 segundos
      const timeout = setTimeout(() => {
        if (onHide) onHide();
      }, 2500);

      return () => clearTimeout(timeout);
    } else {
      scaleAnim.setValue(0);
      bounceAnim.setValue(0);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const getContent = () => {
    switch (type) {
      case 'delete':
        return {
          icon: 'trash',
          iconColor: '#e74c3c',
          bgColor: '#ffe6e6',
          title: '¡Vehículo eliminado!',
          defaultMessage: 'El vehículo ha sido eliminado exitosamente',
          particles: '🗑️✨'
        };
      case 'download':
        return {
          icon: 'download',
          iconColor: '#27ae60',
          bgColor: '#e8f5e8',
          title: '¡Descarga iniciada!',
          defaultMessage: 'El contrato se está descargando',
          particles: '📄⬇️'
        };
      default: // update
        return {
          icon: 'checkmark-circle',
          iconColor: '#27ae60',
          bgColor: '#e8f5e8',
          title: '¡Actualizado exitosamente!',
          defaultMessage: 'Los datos del vehículo han sido actualizados',
          particles: '✅✨'
        };
    }
  };

  const { icon, iconColor, bgColor, title, defaultMessage, particles } = getContent();

  if (!visible) return null;

  return (
    <Modal transparent={true} visible={visible} animationType="none">
      <View style={styles.transparentContainer}>
        {/* Partículas animadas */}
        <Animated.View style={[styles.particlesContainer, { opacity: fadeAnim }]}>
          <Animated.Text 
            style={[
              styles.particles, 
              styles.particle1,
              {
                transform: [{
                  translateY: bounceAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, -20]
                  })
                }]
              }
            ]}
          >
            {particles.split('')[0]}
          </Animated.Text>
          <Animated.Text 
            style={[
              styles.particles, 
              styles.particle2,
              {
                transform: [{
                  translateY: bounceAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, -30]
                  })
                }]
              }
            ]}
          >
            {particles.split('')[1]}
          </Animated.Text>
        </Animated.View>

        <Animated.View 
          style={[
            styles.modal, 
            { 
              backgroundColor: bgColor,
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim
            }
          ]}
        >
          <View style={styles.iconWrapper}>
            <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
              <Animated.View
                style={{
                  transform: [{
                    scale: bounceAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1.1]
                    })
                  }]
                }}
              >
                <Ionicons name={icon} size={60} color={iconColor} />
              </Animated.View>
            </View>
          </View>
          
          <Animated.Text 
            style={[
              styles.title,
              {
                opacity: bounceAnim,
                transform: [{
                  translateY: bounceAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0]
                  })
                }]
              }
            ]}
          >
            {title}
          </Animated.Text>
          
          <Animated.Text 
            style={[
              styles.message,
              {
                opacity: bounceAnim,
                transform: [{
                  translateY: bounceAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0]
                  })
                }]
              }
            ]}
          >
            {message || defaultMessage}
          </Animated.Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  transparentContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  particlesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  particles: {
    position: 'absolute',
    fontSize: 24,
  },
  particle1: {
    top: '35%',
    left: '20%',
  },
  particle2: {
    top: '40%',
    right: '25%',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    minWidth: 280,
    maxWidth: 320,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  iconWrapper: {
    marginBottom: 16,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 22,
  },
});
