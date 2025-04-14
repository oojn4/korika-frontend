// src/components/MapVisualization/components/MapLegend.tsx
import React from 'react';
import { Box, Text, Group } from '@mantine/core';
import { colorSteps, legendSteps, metricOptions } from '../MapVisualization/utils/mapUtils';

interface MapLegendProps {
  metricToShow: string;
  maxValue: number;
}

const MapLegend: React.FC<MapLegendProps> = ({ metricToShow, maxValue }) => {
  return (
    <Box p="sm" style={{ background: 'white', borderRadius: '4px', marginTop: '10px' }}>
      <Text fw={600} size="sm" mb={8}>
        {metricOptions.find((m: { value: string; }) => m.value === metricToShow)?.label || 'Nilai'}
      </Text>
      <Group align="center">
        {legendSteps.map((step: number, index: number) => {
          const value = Math.round(step * maxValue);
          return (
            <Box key={index} style={{ textAlign: 'center' }}>
              <Box
                style={{
                  width: '24px',
                  height: '12px',
                  backgroundColor: colorSteps[index],
                  display: 'inline-block',
                  border: '1px solid #ccc'
                }}
              />
              <Text size="xs" mt={4}>
                {index === 0 ? '0' : value}
              </Text>
            </Box>
          );
        })}
      </Group>
    </Box>
  );
};

export default MapLegend;