import React from 'react';
import { View, Text } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { barChartConfig, chartDimensions, chartStyles } from './Charts';

const RentedVehiclesByBrandChart = ({ data }) => {
  if (!data) return null;

  return (
    <View style={chartStyles.container}>
      <Text style={chartStyles.title}>Vehículos Más Rentados por Marca</Text>
      <View style={chartStyles.chartWrapper}>
        <BarChart
          data={data}
          width={chartDimensions.width}
          height={chartDimensions.height}
          chartConfig={barChartConfig}
          verticalLabelRotation={0}
          showValuesOnTopOfBars={true}
          fromZero={true}
          yAxisSuffix=""
          yAxisInterval={1}
          style={{
            marginVertical: 8,
            borderRadius: 8,
          }}
        />
      </View>
    </View>
  );
};

export default RentedVehiclesByBrandChart;