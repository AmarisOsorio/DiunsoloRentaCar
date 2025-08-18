import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export default function SplashScreen({ onAnimationEnd }) {
  const diunAnim = useRef(new Animated.Value(0)).current;
  const solAnim = useRef(new Animated.Value(0)).current;
  const oScaleAnim = useRef(new Animated.Value(0.5)).current;
  const rentaAnim = useRef(new Animated.Value(0)).current;
  const [showO, setShowO] = useState(false);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(diunAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(solAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowO(true);
      Animated.sequence([
        Animated.spring(oScaleAnim, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
        Animated.timing(rentaAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.delay(700),
      ]).start(() => {
        if (onAnimationEnd) onAnimationEnd();
      });
    });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.bgRow}>
        <View style={styles.bgLeft} />
        <View style={styles.bgRight} />
      </View>
      <View style={styles.centerContent}>
        <View style={styles.logoRow}>
          <Animated.Text style={[styles.diun, { opacity: diunAnim }]}>DIUN</Animated.Text>
          <Animated.Text style={[styles.sol, { opacity: solAnim }]}>SOL</Animated.Text>
          {showO ? (
            <Animated.View style={[styles.oWrapper, { transform: [{ scale: oScaleAnim }] }]}> 
              <Animated.Text style={styles.oText}>O</Animated.Text>
              <View style={styles.oDot} />
            </Animated.View>
          ) : (
            <View style={styles.oWrapper} />
          )}
        </View>
        <Animated.Text style={[styles.renta, { opacity: rentaAnim }]}>RENTA CAR</Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bgRow: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    zIndex: -1,
  },
  bgLeft: {
    flex: 1,
    backgroundColor: '#0A1970',
  },
  bgRight: {
    flex: 1,
    backgroundColor: '#1EB6E9',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: 10,
    minWidth: 260,
    maxWidth: 350,
  },
  diun: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFE600',
    letterSpacing: 1,
    marginRight: 6,
    marginLeft: 9,
    textAlign: 'center',
  },
  sol: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
    marginLeft: 6,
    marginRight: 2,
    textAlign: 'center',
  },
  oWrapper: {
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -9,
    marginTop: 1,
    position: 'relative',
  },
  oText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textAlignVertical: 'center',
    textShadowColor: '#1EB6E9',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
    zIndex: 1,
    width: 52,
    height: 52,
    lineHeight: 52,
  },
  oDot: {
    position: 'absolute',
    top: 19,
    left: 14,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2CB34A',
    zIndex: 0,
  },
  renta: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1,
    marginTop: 2,
    fontStyle: 'italic',
    textShadowColor: '#0008',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});