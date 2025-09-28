import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  PanResponder
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const SignatureCanvasModal = ({ 
  visible, 
  onClose, 
  onSave, 
  title = "Firma digital" 
}) => {
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  
  const canvasRef = useRef(null);
  const pathRef = useRef('');

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,

    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      const newPath = `M${locationX.toFixed(2)},${locationY.toFixed(2)}`;
      pathRef.current = newPath;
      setCurrentPath(newPath);
      setIsDrawing(true);
    },

    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      const newPoint = ` L${locationX.toFixed(2)},${locationY.toFixed(2)}`;
      pathRef.current += newPoint;
      setCurrentPath(pathRef.current);
    },

    onPanResponderRelease: () => {
      setPaths(prevPaths => [...prevPaths, pathRef.current]);
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
  };

  const saveSignature = async () => {
    if (paths.length === 0 && currentPath === '') {
      Alert.alert('Error', 'Por favor, dibuje su firma antes de guardar');
      return;
    }

    try {
      // Aquí puedes convertir el SVG a imagen si es necesario
      // Por ahora, guardamos los paths como string
      const signatureData = {
        paths: [...paths, currentPath].filter(path => path !== ''),
        timestamp: new Date().toISOString(),
        dimensions: { width: width - 40, height: 200 }
      };

      onSave(signatureData);
      clearSignature();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la firma');
    }
  };

  const hasSignature = paths.length > 0 || currentPath !== '';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#5F6368" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Firme en el área de abajo</Text>
          <Text style={styles.instructionsText}>
            Use su dedo para dibujar su firma en el espacio designado
          </Text>
        </View>

        {/* Signature Canvas */}
        <View style={styles.canvasContainer}>
          <View style={styles.canvas} {...panResponder.panHandlers}>
            <Svg 
              width={width - 40} 
              height={200}
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
              
              {/* Línea guía */}
              <Path
                d={`M20,160 L${width - 60},160`}
                stroke="#E8EAED"
                strokeWidth="1"
                strokeDasharray="5,5"
              />
            </Svg>
            
            {/* Placeholder text cuando no hay firma */}
            {!hasSignature && (
              <View style={styles.placeholderContainer}>
                <Ionicons name="create-outline" size={32} color="#E8EAED" />
                <Text style={styles.placeholderText}>Firme aquí</Text>
              </View>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.clearButton]}
            onPress={clearSignature}
            disabled={!hasSignature}
          >
            <Ionicons 
              name="refresh" 
              size={20} 
              color={hasSignature ? "#EA4335" : "#E8EAED"} 
            />
            <Text style={[
              styles.buttonText, 
              styles.clearButtonText,
              !hasSignature && styles.disabledButtonText
            ]}>
              Limpiar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.saveButton, !hasSignature && styles.disabledButton]}
            onPress={saveSignature}
            disabled={!hasSignature}
          >
            <Ionicons 
              name="checkmark" 
              size={20} 
              color={hasSignature ? "#FFFFFF" : "#E8EAED"} 
            />
            <Text style={[
              styles.buttonText, 
              styles.saveButtonText,
              !hasSignature && styles.disabledButtonText
            ]}>
              Guardar firma
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EAED',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#202124',
  },
  placeholder: {
    width: 40,
  },
  
  // Instructions
  instructionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#202124',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#5F6368',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Canvas
  canvasContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  canvas: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E8EAED',
    borderStyle: 'dashed',
    position: 'relative',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  placeholderContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  placeholderText: {
    fontSize: 16,
    color: '#E8EAED',
    marginTop: 8,
    fontWeight: '500',
  },
  
  // Footer
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E8EAED',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  clearButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  saveButton: {
    backgroundColor: '#4285F4',
    shadowColor: '#4285F4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#F8F9FA',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  clearButtonText: {
    color: '#EA4335',
  },
  saveButtonText: {
    color: '#FFFFFF',
  },
  disabledButtonText: {
    color: '#E8EAED',
  },
});

export default SignatureCanvasModal;