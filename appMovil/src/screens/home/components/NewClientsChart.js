import React from 'react';
import { View, Text } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { lineChartConfig, chartDimensions, chartStyles } from './Charts';

const NewClientsChart = ({ data }) => {
  if (!data) return null;

  return (
    <View style={chartStyles.container}>
      <Text style={chartStyles.title}>Cantidad de Nuevos Clientes</Text>
      <View style={chartStyles.chartWrapper}>
        <LineChart
          data={data}
          width={chartDimensions.width}
          height={chartDimensions.height}
          chartConfig={lineChartConfig}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 8,
          }}
          withDots={true}
          withShadow={true}
          withScrollableDot={false}
          withInnerLines={false}
          withOuterLines={false}
          withVerticalLines={false}
          withHorizontalLines={true}
        />
      </View>
    </View>
  );
};

export default NewClientsChart;