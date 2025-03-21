import { Box, Divider, Group, Text } from '@mantine/core';

interface DataStatusIndicatorProps {
  actualDate: string;
  predictedDate: string;
}

const DataStatusIndicator = ({ actualDate, predictedDate }: DataStatusIndicatorProps) => {
  return (
    <Box mb="lg">
      <Divider
        my="xs"
        label={
          <Group>
            <Group>
              <Box style={{
                width: 12,
                height: 12,
                backgroundColor: 'blue',
                borderRadius: 4
              }} />
              <Text size="sm">Actual data (through {actualDate})</Text>
            </Group>
            
            <Text size="sm" color="dimmed">→</Text>
            
            <Group>
              <Text size="sm">Predictions (from {predictedDate})</Text>
            </Group>
          </Group>
        }
        labelPosition="center"
      />
    </Box>
  );
};

export default DataStatusIndicator;