import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  Dimensions
} from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';

const { width } = Dimensions.get('window');

const FuelGauge = ({ 
  level = 50, 
  onLevelChange, 
  title = "Combustible",
  size = 120,
  disabled = false
}) => {
  const animatedValue = useRef(new Animated.Value(level)).current;
  const panValue = useRef({ x: 0, y: 0 });
  
  // Convertir nivel a ángulo (0% = -90°, 100% = 90°)
  const levelToAngle = (level) => {
    return ((level / 100) * 180) - 90;
  };
  
  // Convertir ángulo a nivel
  const angleToLevel = (angle) => {
    return Math.max(0, Math.min(100, ((angle + 90) / 180) * 100));
  };

  // Calcular posición del handle basado en el nivel
  const getHandlePosition = (level) => {
    const angle = levelToAngle(level);
    const radius = (size / 2) - 20;
    const centerX = size / 2;
    const centerY = size / 2;
    
    const x = centerX + radius * Math.cos((angle * Math.PI) / 180);
    const y = centerY + radius * Math.sin((angle * Math.PI) / 180);
    
    return { x, y };
  };

  // Crear PanResponder para manejar el arrastre
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !disabled,
    onMoveShouldSetPanResponder: () => !disabled,
    
    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      panValue.current = { x: locationX, y: locationY };
    },
    
    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      const centerX = size / 2;
      const centerY = size / 2;
      
      // Calcular ángulo desde el centro
      const deltaX = locationX - centerX;
      const deltaY = locationY - centerY;
      let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
      
      // Limitar el ángulo al rango semicircular (-90° a 90°)
      angle = Math.max(-90, Math.min(90, angle));
      
      // Convertir ángulo a nivel de combustible
      const newLevel = angleToLevel(angle);
      
      if (onLevelChange) {
        onLevelChange(Math.round(newLevel));
      }
    },
    
    onPanResponderRelease: () => {
      // Animar a la posición final
      Animated.spring(animatedValue, {
        toValue: level,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }).start();
    }
  });

  // Actualizar animación cuando cambie el nivel
  useEffect(() => {
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

  // Crear el path del arco
  const createArcPath = (startAngle, endAngle, radius, centerX, centerY) => {
    const start = {
      x: centerX + radius * Math.cos((startAngle * Math.PI) / 180),
      y: centerY + radius * Math.sin((startAngle * Math.PI) / 180)
    };
    
    const end = {
      x: centerX + radius * Math.cos((endAngle * Math.PI) / 180),
      y: centerY + radius * Math.sin((endAngle * Math.PI) / 180)
    };
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  };

  const radius = (size / 2) - 15;
  const centerX = size / 2;
  const centerY = size / 2;
  const handlePos = getHandlePosition(level);
  
  return (
    <View style={[styles.container, { width: size + 40, height: size + 40 }]}>
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.gaugeContainer} {...panResponder.panHandlers}>
        <Svg width={size} height={size} style={styles.gauge}>
          {/* Arco de fondo */}
          <Path
            d={createArcPath(-90, 90, radius, centerX, centerY)}
            stroke="#E8EAED"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Arco de progreso */}
          <Path
            d={createArcPath(-90, levelToAngle(level), radius, centerX, centerY)}
            stroke={getLevelColor(level)}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Marcadores */}
          <G>
            {[0, 25, 50, 75, 100].map((mark) => {
              const angle = levelToAngle(mark);
              const innerRadius = radius - 15;
              const outerRadius = radius - 5;
              
              const innerX = centerX + innerRadius * Math.cos((angle * Math.PI) / 180);
              const innerY = centerY + innerRadius * Math.sin((angle * Math.PI) / 180);
              const outerX = centerX + outerRadius * Math.cos((angle * Math.PI) / 180);
              const outerY = centerY + outerRadius * Math.sin((angle * Math.PI) / 180);
              
              return (
                <Path
                  key={mark}
                  d={`M ${innerX} ${innerY} L ${outerX} ${outerY}`}
                  stroke="#9AA0A6"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              );
            })}
          </G>
          
          {/* Handle/Indicador */}
          <Circle
            cx={handlePos.x}
            cy={handlePos.y}
            r="8"
            fill={getLevelColor(level)}
            stroke="#FFFFFF"
            strokeWidth="2"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
            }}
          />
        </Svg>
        
        {/* Display del valor */}
        <View style={styles.valueDisplay}>
          <Text style={[styles.valueText, { color: getLevelColor(level) }]}>
            {Math.round(level)}%
          </Text>
          <Text style={styles.valueLabel}>Tank</Text>
        </View>
      </View>
      
      {/* Etiquetas de los extremos */}
      <View style={styles.labels}>
        <Text style={styles.labelText}>E</Text>
        <Text style={styles.labelText}>F</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5F6368',
    marginBottom: 8,
    textAlign: 'center',
  },
  gaugeContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gauge: {
    // Estilos adicionales si es necesario
  },
  valueDisplay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  valueText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  valueLabel: {
    fontSize: 10,
    color: '#9AA0A6',
    textAlign: 'center',
    marginTop: -2,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 8,
  },
  labelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9AA0A6',
  },
});

export default FuelGauge;