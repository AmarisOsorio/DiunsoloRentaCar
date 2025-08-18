import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

// Configuración base para todas las gráficas
export const baseChartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(67, 134, 252, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
  style: {
    borderRadius: 12,
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#4386FC'
  },
  propsForBackgroundLines: {
    strokeDasharray: '',
    stroke: '#e3e3e3',
    strokeWidth: 1,
  },
  formatYLabel: (value) => Math.floor(value).toString(),
  formatXLabel: (value) => value,
};

// Configuración específica para gráfico de barras (vehículos rentados)
export const barChartConfig = {
  ...baseChartConfig,
  color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
  propsForLabels: {
    fontSize: 12,
    fontWeight: '500',
  },
};

// Configuración para gráfico de línea (nuevos clientes)
export const lineChartConfig = {
  ...baseChartConfig,
  color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
  fillShadowGradient: '#2E7D32',
  fillShadowGradientOpacity: 0.1,
};

// Configuración para gráfico de área (alquileres diarios)
export const areaChartConfig = {
  ...baseChartConfig,
  color: (opacity = 1) => `rgba(255, 167, 38, ${opacity})`,
  fillShadowGradient: '#FFA726',
  fillShadowGradientOpacity: 0.3,
};

// Dimensiones responsivas
export const chartDimensions = {
  width: screenWidth - 32, // Margen de 16px a cada lado
  height: 220,
  pieHeight: 200,
};

// Estilos comunes para contenedores de gráficas
export const chartStyles = {
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  chartWrapper: {
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 8,
  }
};