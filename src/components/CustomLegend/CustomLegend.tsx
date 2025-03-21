import { Box, Group, Paper, Text } from '@mantine/core';
import React from 'react';

// Define prop types for the component
interface SeriesInfo {
  name: string;
  color: string;
}

interface CustomLegendProps {
  actualSeries: SeriesInfo[];
  title: string;
}

const CustomLegend: React.FC<CustomLegendProps> = ({ actualSeries, title }) => {
  // Get unique base series names (without prefixes)
  const uniqueSeries = actualSeries
    .filter(series => !series.name.includes('predicted_')) // Filter out predicted series
    .map(series => {
      // Handle both prefixed and non-prefixed series names
      const baseName = series.name.startsWith('actual_') 
        ? series.name.replace('actual_', '') 
        : series.name;
      
      return {
        name: baseName,
        color: series.color
      };
    });

  // Helper function to get proper color from theme color string
  const getColorFromTheme = (color: string) => {
    if (color.includes('.')) {
      // This is a simplified approach - in a real component you'd use useTheme() hook
      const colorParts = color.split('.');
      // This is just a placeholder. In a real component, you'd use theme.colors
      const themeColors: Record<string, Record<string, string>> = {
        'blue': { '6': '#3B82F6' },
        'indigo': { '6': '#4F46E5' },
        'teal': { '6': '#14B8A6' },
        'cyan': { '6': '#06B6D4' },
        'green': { '6': '#10B981' },
        'lime': { '6': '#84CC16' },
        'orange': { '6': '#F97316' },
        'red': { '6': '#EF4444' },
        'grey': { '5': '#6B7280' }
      };
      return themeColors[colorParts[0]]?.[colorParts[1]] || 'gray';
    }
    return color;
  };

  return (
    <Paper p="xs" withBorder shadow="sm" radius="sm">
      <Text size="sm" fw={500} mb={6}>{title}</Text>
      <Box>
        {uniqueSeries.map((series) => (
          <Group key={series.name} mb={4}>
            {/* Show the actual series color */}
            <Box style={{
              width: 12,
              height: 12,
              backgroundColor: getColorFromTheme(series.color),
              borderRadius: 2,
            }} />
            <Text size="xs">{series.name}</Text>
          </Group>
        ))}
      </Box>
      
      {/* Add a single legend entry for predictions */}
      <Group mt={8}>
        <Box style={{
          width: 12,
          height: 12,
          backgroundColor: 'gray',
          borderRadius: 2,
        }} />
        <Text size="xs" color="dimmed">predicted values</Text>
      </Group>
    </Paper>
  );
};

export default CustomLegend;