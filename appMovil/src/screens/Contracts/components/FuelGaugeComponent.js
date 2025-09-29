import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  Dimensions
} from 'react-native';
import Svg, { Path, Circle, G, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const FuelGauge = ({ 
  level = 50, 
  onLevelChange, 
  title = "Combustible",
  size = 140,
  disabled = false
}) => {
  const animatedValue = useRef(new Animated.Value(level)).current;
  const [currentLevel, setCurrentLevel] = useState(level);
  
  // Convertir nivel a ángulo (0% = 225°, 100% = -45°) - semicírculo inferior
  const levelToAngle = (level) => {
    // 270 grados total de rango (desde 225° hasta -45°)
    const startAngle = 225; // Posición Empty (bottom-left)
    const endAngle = -45;   // Posición Full (bottom-right)
    const totalRange = startAngle - endAngle; // 270 grados
    
    return startAngle - (level / 100) * totalRange;
  };
  
  // Convertir ángulo a nivel
  const angleToLevel = (angle) => {
    const startAngle = 225;
    const endAngle = -45;
    const totalRange = startAngle - endAngle;
    
    let normalizedAngle = angle;
    if (normalizedAngle < 0) normalizedAngle += 360;
    if (normalizedAngle > 225) normalizedAngle = 225;
    if (normalizedAngle < 135) normalizedAngle = 135;
    
    const level = ((225 - normalizedAngle) / totalRange) * 100;
    return Math.max(0, Math.min(100, level));
  };

  // Calcular posición del handle basado en el nivel
  const getHandlePosition = (level) => {
    const angle = levelToAngle(level);
    const radius = (size / 2) - 25;
    const centerX = size / 2;
    const centerY = size / 2;
    
    const radians = (angle * Math.PI) / 180;
    const x = centerX + radius * Math.cos(radians);
    const y = centerY + radius * Math.sin(radians);
    
    return { x, y };
  };

  // Calcular ángulo desde coordenadas
  const getAngleFromPosition = (x, y, centerX, centerY) => {
    const deltaX = x - centerX;
    const deltaY = y - centerY;
    let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    
    // Normalizar ángulo
    if (angle < 0) angle += 360;
    
    return angle;
  };

  // Crear PanResponder para manejar el arrastre
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !disabled,
    onMoveShouldSetPanResponder: () => !disabled,
    
    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      const centerX = size / 2;
      const centerY = size / 2;
      
      // Calcular ángulo desde el centro
      const angle = getAngleFromPosition(locationX, locationY, centerX, centerY);
      
      // Convertir ángulo a nivel de combustible
      const newLevel = angleToLevel(angle);
      
      setCurrentLevel(newLevel);
      
      if (onLevelChange) {
        onLevelChange(Math.round(newLevel));
      }
    },
    
    onPanResponderRelease: () => {
      // Animar a la posición final
      Animated.spring(animatedValue, {
        toValue: currentLevel,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }).start();
    }
  });

  // Actualizar animación cuando cambie el nivel
  useEffect(() => {
    setCurrentLevel(level);
    Animated.spring(animatedValue, {
      toValue: level,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  }, [level]);

  // Obtener color basado en el nivel
  const getLevelColor = (level) => {
    if (level <= 25) return '#EA4335';      // Rojo
    if (level <= 50) return '#FBBC04';      // Amarillo  
    if (level <= 75) return '#FF9800';      // Naranja
    return '#34A853';                       // Verde
  };

  // Obtener texto del nivel
  const getLevelText = (level) => {
    if (level <= 12.5) return 'E';
    if (level >= 87.5) return 'F';
    if (level <= 25) return '¼';
    if (level <= 50) return '½';
    if (level <= 75) return '¾';
    return 'F';
  };

  // Crear el path del arco principal
  const createArcPath = (startAngle, endAngle, radius, centerX, centerY) => {
    const startRadians = (startAngle * Math.PI) / 180;
    const endRadians = (endAngle * Math.PI) / 180;
    
    const start = {
      x: centerX + radius * Math.cos(startRadians),
      y: centerY + radius * Math.sin(startRadians)
    };
    
    const end = {
      x: centerX + radius * Math.cos(endRadians),
      y: centerY + radius * Math.sin(endRadians)
    };
    
    const largeArcFlag = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
    const sweepFlag = endAngle > startAngle ? 1 : 0;
    
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`;
  };

  const radius = (size / 2) - 20;
  const centerX = size / 2;
  const centerY = size / 2;
  const handlePos = getHandlePosition(currentLevel);
  const currentAngle = levelToAngle(currentLevel);
  
  return (
    <View style={[styles.container, { width: size + 40, height: size + 20 }]}>
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.gaugeContainer} {...panResponder.panHandlers}>
        <Svg width={size} height={size} style={styles.gauge}>
          <Defs>
            <LinearGradient id="fuelGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#EA4335" />
              <Stop offset="25%" stopColor="#FBBC04" />
              <Stop offset="75%" stopColor="#FF9800" />
              <Stop offset="100%" stopColor="#34A853" />
            </LinearGradient>
          </Defs>
          
          {/* Arco de fondo */}
          <Path
            d={createArcPath(225, -45, radius, centerX, centerY)}
            stroke="#E8EAED"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Arco de progreso */}
          <Path
            d={createArcPath(225, currentAngle, radius, centerX, centerY)}
            stroke={getLevelColor(currentLevel)}
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Marcadores principales */}
          <G>
            {[
              { angle: 225, label: 'E', level: 0 },
              { angle: 180, label: '¼', level: 25 },
              { angle: 135, label: '½', level: 50 },
              { angle: 90, label: '¾', level: 75 },
              { angle: -45, label: 'F', level: 100 }
            ].map((mark) => {
              const markRadius = radius + 15;
              const radians = (mark.angle * Math.PI) / 180;
              const x = centerX + markRadius * Math.cos(radians);
              const y = centerY + markRadius * Math.sin(radians);
              
              return (
                <G key={mark.angle}>
                  {/* Línea del marcador */}
                  <Path
                    d={`M ${centerX + (radius - 8) * Math.cos(radians)} ${centerY + (radius - 8) * Math.sin(radians)} L ${centerX + (radius + 8) * Math.cos(radians)} ${centerY + (radius + 8) * Math.sin(radians)}`}
                    stroke="#5F6368"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  {/* Etiqueta del marcador */}
                  <SvgText
                    x={x}
                    y={y + 4}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="600"
                    fill="#5F6368"
                  >
                    {mark.label}
                  </SvgText>
                </G>
              );
            })}
          </G>
          
          {/* Marcadores menores */}
          <G>
            {[202.5, 157.5, 112.5, 67.5, -22.5].map((angle) => {
              const radians = (angle * Math.PI) / 180;
              const innerRadius = radius - 4;
              const outerRadius = radius + 4;
              
              return (
                <Path
                  key={angle}
                  d={`M ${centerX + innerRadius * Math.cos(radians)} ${centerY + innerRadius * Math.sin(radians)} L ${centerX + outerRadius * Math.cos(radians)} ${centerY + outerRadius * Math.sin(radians)}`}
                  stroke="#9AA0A6"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
              );
            })}
          </G>
          
          {/* Handle/Aguja indicadora */}
          <G>
            {/* Sombra del handle */}
            <Circle
              cx={handlePos.x + 1}
              cy={handlePos.y + 1}
              r="10"
              fill="rgba(0, 0, 0, 0.2)"
            />
            {/* Handle principal */}
            <Circle
              cx={handlePos.x}
              cy={handlePos.y}
              r="10"
              fill={getLevelColor(currentLevel)}
              stroke="#FFFFFF"
              strokeWidth="3"
            />
            {/* Centro del handle */}
            <Circle
              cx={handlePos.x}
              cy={handlePos.y}
              r="4"
              fill="#FFFFFF"
            />
          </G>
          
          {/* Centro del medidor */}
          <Circle
            cx={centerX}
            cy={centerY}
            r="8"
            fill="#5F6368"
            stroke="#FFFFFF"
            strokeWidth="2"
          />
        </Svg>
        
        {/* Display del valor */}
        <View style={styles.valueDisplay}>
          <Text style={[styles.valueText, { color: getLevelColor(currentLevel) }]}>
            {Math.round(currentLevel)}%
          </Text>
          <View style={styles.fuelIcon}>
            <Ionicons name="car" size={16} color="#9AA0A6" />
          </View>
        </View>
      </View>
      
      {/* Indicador de estado */}
      <View style={styles.statusIndicator}>
        <View style={[styles.statusDot, { backgroundColor: getLevelColor(currentLevel) }]} />
        <Text style={[styles.statusText, { color: getLevelColor(currentLevel) }]}>
          {currentLevel <= 25 ? 'Bajo' : currentLevel <= 50 ? 'Medio' : currentLevel <= 75 ? 'Alto' : 'Lleno'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  gaugeContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  gauge: {
    // Estilos adicionales si es necesario
  },
  valueDisplay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 30,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  valueText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
  },
  fuelIcon: {
    opacity: 0.6,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default FuelGauge;