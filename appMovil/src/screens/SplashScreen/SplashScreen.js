import React, { useEffect, useRef, useState } from 'react';
import { View, Image, StyleSheet, Animated, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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
    top: -0.19 * screenHeight,
    left: -0.18 * screenWidth,
    width: screenWidth * 1.7,
    height: screenHeight * 0.65,
    zIndex: 1,
  },
  StraightBottom: {
    position: 'absolute',
    top: screenHeight * 0.65,
    left: -0.5 * screenWidth,
    width: screenWidth * 1.7,
    height: screenHeight * 0.65,
    zIndex: 1,
  },
  RoundTop: {
    position: 'absolute',
    bottom: screenHeight * 0.85,
    right: -0.35 * screenWidth,
    width: screenWidth * 0.9,
    height: screenWidth * 0.95,
    resizeMode: 'contain',
    zIndex: 2,
  },
  RoundBottom: {
    position: 'absolute',
    bottom: -0.24 * screenHeight,
    right: screenWidth * 0.35,
    width: screenWidth * 0.9,
    height: screenWidth * 0.95,
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
    width: screenWidth * 0.8,
    height: screenWidth * 0.26,
    bottom: 0.04 * screenHeight,
    resizeMode: 'contain',
  }
});