import React from 'react';
import { View, Text } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { baseChartConfig, chartDimensions, chartStyles } from './Charts';

const ImportsByBrandChart = ({ data }) => {
  if (!data) return null;

  return (
    <View style={chartStyles.container}>
      <Text style={chartStyles.title}>Importaciones de Vehículos por Marca</Text>
      <View style={chartStyles.chartWrapper}>
        <PieChart
          data={data}
          width={chartDimensions.width}
          height={chartDimensions.pieHeight}
          chartConfig={baseChartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          center={[10, 0]}
          absolute
          style={{
            marginVertical: 8,
            borderRadius: 8,
          }}
        />
      </View>
    </View>
  );
};

export default ImportsByBrandChart;