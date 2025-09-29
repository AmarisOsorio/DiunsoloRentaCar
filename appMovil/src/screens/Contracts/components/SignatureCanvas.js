import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  PanResponder
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

const SignatureCanvas = ({ 
  signature, 
  onSignature, 
  placeholder = "Firma aquí",
  height = 150
}) => {
  const [paths, setPaths] = useState(signature?.paths || []);
  const [currentPath, setCurrentPath] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  
  const pathRef = useRef('');
  const canvasWidth = width - 80; // Margen de 40 por cada lado

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,

    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      
      // Validar límites del canvas
      if (locationX >= 0 && locationX <= canvasWidth && locationY >= 0 && locationY <= height) {
        const newPath = `M${locationX.toFixed(2)},${locationY.toFixed(2)}`;
        pathRef.current = newPath;
        setCurrentPath(newPath);
        setIsDrawing(true);
      }
    },

    onPanResponderMove: (evt) => {
      if (!isDrawing) return;
      
      const { locationX, locationY } = evt.nativeEvent;
      
      // Validar límites del canvas
      if (locationX >= 0 && locationX <= canvasWidth && locationY >= 0 && locationY <= height) {
        const newPoint = ` L${locationX.toFixed(2)},${locationY.toFixed(2)}`;
        pathRef.current += newPoint;
        setCurrentPath(pathRef.current);
      }
    },

    onPanResponderRelease: () => {
      if (isDrawing && pathRef.current) {
        const newPaths = [...paths, pathRef.current];
        setPaths(newPaths);
        
        // Guardar firma
        const signatureData = {
          paths: newPaths,
          timestamp: new Date().toISOString(),
          dimensions: { width: canvasWidth, height }
        };
        
        onSignature(signatureData);
      }
      
      setCurrentPath('');
      pathRef.current = '';
      setIsDrawing(false);
    }
  });

  const clearSignature = () => {
    setPaths([]);
    setCurrentPath('');
    pathRef.current = '';
    setIsDrawing(false);
    onSignature(null);
  };

  const hasSignature = paths.length > 0 || currentPath !== '';

  return (
    <View style={styles.container}>
      <View style={styles.canvasContainer}>
        {/* Canvas de firma */}
        <View 
          style={[styles.canvas, { width: canvasWidth, height }]} 
          {...panResponder.panHandlers}
        >
          <Svg 
            width={canvasWidth} 
            height={height}
            style={styles.svg}
          >
            {/* Paths guardados */}
            {paths.map((path, index) => (
              <Path
                key={index}
                d={path}
                stroke="#202124"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ))}
            
            {/* Path actual */}
            {currentPath !== '' && (
              <Path
                d={currentPath}
                stroke="#202124"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            )}
          </Svg>
          
          {/* Línea guía y placeholder */}
          {!hasSignature && (
            <View style={styles.placeholderContainer}>
              <View style={styles.guideLine} />
              <View style={styles.placeholderContent}>
                <Ionicons name="create-outline" size={24} color="#C7C7CC" />
                <Text style={styles.placeholderText}>{placeholder}</Text>
              </View>
            </View>
          )}
          
          {/* Indicador de estado */}
          {hasSignature && (
            <View style={styles.signatureStatus}>
              <Ionicons name="checkmark-circle" size={16} color="#34A853" />
              <Text style={styles.signatureStatusText}>Firmado</Text>
            </View>
          )}
        </View>
        
        {/* Botón de limpiar */}
        {hasSignature && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearSignature}
          >
            <Ionicons name="refresh-outline" size={20} color="#EA4335" />
            <Text style={styles.clearButtonText}>Limpiar</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Instrucciones */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          Use su dedo para dibujar su firma en el área designada
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  canvasContainer: {
    position: 'relative',
  },
  canvas: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E8EAED',
    borderStyle: 'dashed',
    position: 'relative',
    overflow: 'hidden',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  placeholderContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideLine: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: '#E8EAED',
  },
  placeholderContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: '#C7C7CC',
    marginTop: 8,
    fontWeight: '500',
  },
  signatureStatus: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 168, 83, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  signatureStatusText: {
    fontSize: 12,
    color: '#34A853',
    fontWeight: '600',
    marginLeft: 4,
  },
  clearButton: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(234, 67, 53, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  clearButtonText: {
    fontSize: 12,
    color: '#EA4335',
    fontWeight: '600',
    marginLeft: 4,
  },
  instructionsContainer: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  instructionsText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default SignatureCanvas;