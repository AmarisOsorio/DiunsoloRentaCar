import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const TestChart = () => {
  const data = [
    { name: 'Test', value: 100 }
  ];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <Line dataKey="value" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TestChart;
