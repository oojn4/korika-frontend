import { LineChart } from '@mantine/charts';
import { Box, Button, Collapse, Group, Modal, Paper, SimpleGrid, Space, Text } from '@mantine/core';
import { IconChevronDown, IconChevronUp, IconProps } from '@tabler/icons-react';
import { useState } from 'react';
import classes from './Statbox.module.css';

interface TablerIconProps extends Partial<Omit<IconProps, "ref">> {
  size?: string | number;
  stroke?: string | number;
  strokeWidth?: string | number;
  className?: string;
}

interface SeriesItem {
  name: string;
  color: string;
  lineHidden?: boolean;
  yAxisId?: 'left' | 'right'; // Add property for dual axis support
}

interface StatboxProps {
  title: string;
  icon?: React.ComponentType<TablerIconProps>;
  data: any[];
  textStatbox: any[];
  dataKey: string;
  series: SeriesItem[];
  isCollapsible?: boolean;
  filterComponent?: React.ReactNode;
  useDualAxis?: boolean; // New prop to enable dual Y-axis
  rightAxisLabel?: string; // Label for the right axis
  leftAxisLabel?: string;  // Label for the left axis
}

interface ChartTooltipProps {
  label: string;
  payload: Record<string, any>[] | undefined;
}

function ChartTooltip({ label, payload }: ChartTooltipProps) {
  if (!payload || payload.length === 0) return null;

  // Get the data item for this month/date point
  const dataItem = payload[0]?.payload;
  
  // Check if this is a predicted data point
  const isPredicted = dataItem?.is_predicted === true;

  // Group items by base metric name (removing prefixes)
  const groupedItems: { [key: string]: any[] } = {};
  
  payload.forEach((item: any) => {
    const name = item.name;
    const isActual = name.startsWith('actual_');
    const isPredicted = name.startsWith('predicted_');
    
    if (isActual || isPredicted) {
      // Remove prefix for grouping
      const baseName = name.replace(/^(actual_|predicted_)/, '');
      
      if (!groupedItems[baseName]) {
        groupedItems[baseName] = [];
      }
      
      // Only add to grouped items if:
      // 1. It's an actual value, or
      // 2. It's a predicted value AND there's no actual value for this metric and date
      const hasActualForThisMetric = payload.some(p => 
        p.name === `actual_${baseName}` && p.value !== undefined && p.value !== null
      );
      
      if (isActual || (isPredicted && !hasActualForThisMetric)) {
        groupedItems[baseName].push({
          ...item,
          type: isActual ? 'actual' : 'predicted'
        });
      }
    } else {
      // Handle non-prefixed series (for continuous data approach)
      if (!groupedItems[name]) {
        groupedItems[name] = [];
      }
      
      groupedItems[name].push({
        ...item,
        type: isPredicted ? 'predicted' : 'actual'
      });
    }
  });

  return (
    <Paper
      px="sm"
      py="xs"
      withBorder
      shadow="sm"
      radius="sm"
    >
      <Text fw={500} mb={5} fz="sm">
        {label} {isPredicted && <Text span size="xs" color="dimmed">(predicted)</Text>}
      </Text>
      
      {Object.entries(groupedItems).map(([baseName, items]) => (
        <Box key={baseName} mb={5}>
          <Text fw={500} fz="xs">{baseName}:</Text>
          
          {items.map(item => {
            // Determine color based on data type
            const textColor = item.type === 'predicted' ? 'gray' : item.color;
            
            // Round the value to 2 decimal places if it's a number
            const displayValue = ((typeof item.value === 'number') && (item.value  % 1 === 0)) ? item.value:Number(item.value).toFixed(2);

            return (
              <Text 
                key={`${item.name}-${item.type}`} 
                c={textColor} 
                fz="xs" 
                lh="1.2"
                pl={8}
              >
                {displayValue} {item.type === 'predicted' && <Text span size="xs" c="dimmed">(predicted)</Text>}
              </Text>
            );
          })}
        </Box>
      ))}
    </Paper>
  );
}

const Statbox: React.FC<StatboxProps> = ({
  title,
  icon: Icon,
  data,
  textStatbox,
  dataKey,
  series,
  isCollapsible = true,
  filterComponent,
  useDualAxis = false,
  rightAxisLabel = '',
  leftAxisLabel = '',
}) => {
  const [opened, setOpened] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);

  // Toggle modal visibility
  const handleChartClick = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  // Filter the series to get visible series (not hidden)
  const visibleSeries = series.filter(item => !item.lineHidden);
  
  // Keep all series for stat filtering
  const filteredTextStatBox = textStatbox.filter((item) =>
    series.some((seriesItem) => seriesItem.name === item.label)
  );
  
  const articleDescriptions = filteredTextStatBox.map((stat) => (
    <Box key={stat.label} style={{ borderBottomColor: stat.color }} className={classes.stat}>
      <Text tt="uppercase" fz="xs" c="dimmed" fw={700}>
        {stat.label}
      </Text>
      <Group justify="space-between" align="flex-end" gap={0}>
        <div style={{ textAlign: 'left', flex: '0 0 auto' }}> 
            <Text fw={500}> 
                {stat.count}
            </Text>
        </div>
        <div style={{ textAlign: 'right' }}> 
            <Text c={stat.color_m_to_m} fw={500} size="sm" className={classes.statCount}>
            {stat.m_to_m?.toFixed(2)}%
            </Text>
            <Text size="xs" className={classes.statCount}>
            M-to-M
            </Text>
        </div>
        <div style={{ textAlign: 'right' }}> 
            <Text c={stat.color_y_on_y} fw={500} size="sm" className={classes.statCount}>
            {stat.y_on_y?.toFixed(2)}%
            </Text>
            <Text size="xs" className={classes.statCount}>
            Y-on-Y
            </Text>
        </div>
       </Group>
    </Box>
  ));
  
  // Function to get max Y value for the left axis
  const getMaxYValueLeft = () => {
    let max = 0;
  
    data.forEach((item) => {
      visibleSeries
        .filter(s => !s.yAxisId || s.yAxisId === 'left')
        .forEach((s) => {
          const val = Number(item[s.name]);
          if (!isNaN(val) && val > max) {
            max = val;
          }
        });
    });
  
    return Math.ceil(max * 1.05); // Add 5% buffer
  };
  
  // Function to get max Y value for the right axis
  const getMaxYValueRight = () => {
    let max = 0;
  
    data.forEach((item) => {
      visibleSeries
        .filter(s => s.yAxisId === 'right')
        .forEach((s) => {
          const val = Number(item[s.name]);
          if (!isNaN(val) && val > max) {
            max = val;
          }
        });
    });
  
    // If no right axis values or all are zero, return a default
    return max === 0 ? 100 : Math.ceil(max * 1.05); // Add 5% buffer
  };
    // Function to get max Y value for the left axis
    const getMinYValueLeft = () => {
      let min = 0;
    
      data.forEach((item) => {
        visibleSeries
          .filter(s => !s.yAxisId || s.yAxisId === 'left')
          .forEach((s) => {
            const val = Number(item[s.name]);
            if (!isNaN(val) && val < min) {
              min = val;
            }
          });
      });
    
      return Math.ceil(min - min*0.05); // Add 5% buffer
    };
  const getMinYValueRight = () => {
      let min = 0;
    
      data.forEach((item) => {
        visibleSeries
          .filter(s => s.yAxisId === 'right')
          .forEach((s) => {
            const val = Number(item[s.name]);
            if (!isNaN(val) && val < min) {
              min = val;
            }
          });
      });
    
      // If no right axis values or all are zero, return a default
      return min === 0 ? 100 : Math.ceil(min - min*0.05); // Add 5% buffer
    };
    
  
  // Create the series configuration for the chart
  const chartSeries = visibleSeries.map(s => ({
    ...s,
    yAxisId: useDualAxis ? (s.yAxisId || 'left') : undefined // Only add yAxisId when dual axis is enabled
  }));

  return (
    <Paper withBorder p="md" radius="md">
      <Group justify="space-between">
        <Group align="center" gap="xs">
          <Text fz="xl" fw={500}>
            {title}
          </Text>
          {Icon && <Icon size="1.4rem" className={classes.icon} stroke={1.5} />}
        </Group>
        {isCollapsible && (
          <Button
            variant="subtle"
            size="xs"
            onClick={() => setOpened((prev) => !prev)}
          >
            {opened ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
          </Button>
        )}
      </Group>

      <Collapse in={opened}>
        {filterComponent && (
          <>
            {filterComponent}
            <Space h="xs" />
          </>
        )}
        
        <LineChart
          h={300}
          data={data}
          dataKey={dataKey}
          series={chartSeries}
          curveType="linear"
          onClick={handleChartClick}
          tooltipProps={{
            content: ({ label, payload }) => <ChartTooltip label={label} payload={payload} />,
          }}
          withXAxis
          withLegend={false}
          withRightYAxis={useDualAxis} // Add this line to enable the right Y-axis
          yAxisLabel={leftAxisLabel}
          rightYAxisLabel={rightAxisLabel}
          yAxisProps={{
            domain: [getMinYValueLeft() % 1 === 0 ? getMinYValueLeft().toFixed(2):getMinYValueLeft(), getMaxYValueLeft() % 1 === 0 ? getMaxYValueLeft().toFixed(2):getMaxYValueLeft()],
            tickCount: 6,
            orientation: 'left',
            tickFormatter: (value: number) => value % 1 === 0 ? `${value}` : `${value.toFixed(2)}`
          }}
          rightYAxisProps={useDualAxis ? {
            domain: [getMinYValueRight() % 1 === 0 ? getMinYValueRight().toFixed(2):getMinYValueRight(), getMaxYValueRight() % 1 === 0 ? getMaxYValueRight().toFixed(2):getMaxYValueRight()],
            tickCount: 6,
            orientation: 'right',
            stroke: '#777', // Add explicit stroke color
            axisLine: true, // Ensure the axis line is visible
            tickLine: true,  // Ensure tick lines are visible
            tickFormatter: (value: number) => value % 1 === 0 ? `${value}` : `${value.toFixed(2)}`
          } : undefined}
        />
        
        <Space h="xs" />
        
        <Modal
            opened={isModalOpen}
            onClose={handleCloseModal}
            size="xl"
            title={title}
        >
            <LineChart
              h={600}
              data={data}
              dataKey={dataKey}
              series={chartSeries}
              curveType="linear"
              withLegend={true}
              withRightYAxis={useDualAxis} // Add this line for the modal chart
              yAxisLabel={leftAxisLabel}
              rightYAxisLabel={rightAxisLabel}
              yAxisProps={{
                domain: [getMinYValueLeft() % 1 === 0 ? getMinYValueLeft().toFixed(2):getMinYValueLeft(), getMaxYValueLeft() % 1 === 0 ? getMaxYValueLeft().toFixed(2):getMaxYValueLeft()],
                tickCount: 6,
                tickFormatter: (value: number) => `${value.toFixed(2)}`
              }}
              rightYAxisProps={useDualAxis ? {
                domain: [getMinYValueRight() % 1 === 0 ? getMinYValueRight().toFixed(2):getMinYValueRight(), getMaxYValueRight() % 1 === 0 ? getMaxYValueRight().toFixed(2):getMaxYValueRight()],
                tickCount: 6,
                orientation: 'right',
                stroke: '#777',
                axisLine: true,
                tickLine: true,
                tickFormatter: (value: number) => `${value.toFixed(2)}`
              } : undefined}
            />
            <Space h="md" />
        </Modal>
        
        <Space h="md" />
        <SimpleGrid cols={{ base: 1, xs: 2 }} mt="xl">
          {articleDescriptions}
        </SimpleGrid>
      </Collapse>
    </Paper>
  );
};

export default Statbox;