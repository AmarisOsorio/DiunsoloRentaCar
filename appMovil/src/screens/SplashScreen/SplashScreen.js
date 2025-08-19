import React, { useEffect, useRef, useState } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';

export default function SplashScreen({ onAnimationEnd }) {
  const rotateAnimTop = useRef(new Animated.Value(0)).current;
  const rotateAnimBottom = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [hide, setHide] = useState(false);

  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(0)).current;
  const elementsFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(rotateAnimTop, {
      toValue: 1,
      duration: 6500,
      useNativeDriver: true,
    }).start();

    Animated.timing(rotateAnimBottom, {
      toValue: 1,
      duration: 6700,
      useNativeDriver: true,
    }).start();

    Animated.parallel([
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(logoTranslateY, {
          toValue: -270,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(elementsFade, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(() => {
          setHide(true);
          if (onAnimationEnd) onAnimationEnd();
        }, 100);
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [onAnimationEnd, rotateAnimTop, rotateAnimBottom, fadeAnim, logoScale, logoOpacity, logoTranslateY, elementsFade]);

  const rotateInterpolateTop = rotateAnimTop.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const rotateInterpolateBottom = rotateAnimBottom.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });

  if (hide) return null;

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('./assets/Straight-Tire.png')}
        style={[styles.StraightTop, { opacity: elementsFade }]}
      />
      <Animated.Image
        source={require('./assets/Straight-Tire.png')}
        style={[styles.StraightBottom, { opacity: elementsFade }]}
      />
      <Animated.Image
        source={require('./assets/Round-Tire.png')}
        style={[
          styles.RoundTop,
          { 
            opacity: elementsFade,
            transform: [{ rotate: rotateInterpolateTop }] 
          }
        ]}
      />
      <Animated.Image
        source={require('./assets/Round-Tire.png')}
        style={[
          styles.RoundBottom,
          { 
            opacity: elementsFade,
            transform: [{ rotate: rotateInterpolateBottom }] 
          }
        ]}
      />
      <View style={styles.logoContainer}>
        <Animated.Image
          source={require('./assets/Logo.png')}
          style={[
            styles.logo,
            {
              opacity: logoOpacity,
              transform: [
                { scale: logoScale },
                { translateY: logoTranslateY }
              ],
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3D83D2',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  StraightTop: {
    position: 'absolute',
    top: -120,
    left: -70,
    width: 600,
    height: 400,
    zIndex: 1,
  },
  StraightBottom: {
    position: 'absolute',
    top: 400,
    left: -120,
    width: 600,
    height: 400,
    zIndex: 1,
  },
  RoundTop: {
    position: 'absolute',
    bottom: 525,
    right: -125,
    width: 341,
    height: 357,
    resizeMode: 'contain',
    zIndex: 2,
  },
  RoundBottom: {
    position: 'absolute',
    bottom: -150,
    right: 125,
    width: 341,
    height: 357,
    resizeMode: 'contain',
    zIndex: 2,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  logo: {
    width: 312,
    height: 103,
    bottom: 30,
    resizeMode: 'contain',
  }
});