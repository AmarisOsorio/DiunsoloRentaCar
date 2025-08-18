import React from 'react';
import { View, Text } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { areaChartConfig, chartDimensions, chartStyles } from './Charts';

const DailyRentalsChart = ({ data }) => {
  if (!data) return null;

  const customConfig = {
    ...areaChartConfig,
    color: (opacity = 1) => `rgba(255, 167, 38, ${opacity})`,
    propsForLabels: {
      fontSize: 12,
      fontWeight: '500',
    },
  };

  return (
    <View style={chartStyles.container}>
      <Text style={chartStyles.title}>Alquileres hasta el Día de Hoy</Text>
      <View style={chartStyles.chartWrapper}>
        <BarChart
          data={data}
          width={chartDimensions.width}
          height={chartDimensions.height}
          chartConfig={customConfig}
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

export default DailyRentalsChart;