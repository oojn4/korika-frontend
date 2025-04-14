import { LineChart } from '@mantine/charts';
import { Box, Button, Collapse, Group, Modal, Paper, SimpleGrid, Space, Text } from '@mantine/core';
import { Icon, IconChevronDown, IconChevronUp, IconProps } from '@tabler/icons-react';
import { ForwardRefExoticComponent, RefAttributes, useState } from 'react';
import classes from './Statbox.module.css';

interface TablerIconProps
  extends Partial<
    ForwardRefExoticComponent<
      Omit<IconProps, "ref"> & RefAttributes<Icon>
    >
  > {
  size?: string | number;
  stroke?: string | number;
  strokeWidth?: string | number;
  className?: string;
}

interface SeriesItem {
  name: string;
  color: string;
  lineHidden?: boolean;
}

interface StatboxProps {
  title: string;
  icon?: React.ComponentType<TablerIconProps>;
  data: any[];
  textStatbox: any[];
  dataKey: string;
  series: SeriesItem[];
  isCollapsible?: boolean;
  filterComponent?: React.ReactNode; // New prop for filter component
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
            
            return (
              <Text 
                key={`${item.name}-${item.type}`} 
                c={textColor} 
                fz="xs" 
                lh="1.2"
                pl={8}
              >
                {item.value} {item.type === 'predicted' && <Text span size="xs" c="dimmed">(predicted)</Text>}
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
  filterComponent, // New prop
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
  
  const getMaxYValue = () => {
    let max = 0;
  
    data.forEach((item) => {
      visibleSeries.forEach((s) => {
        const val = Number(item[s.name]);
        if (!isNaN(val) && val > max) {
          max = val;
        }
      });
    });
  
    return Math.ceil(max * 1.05); // Add 5% buffer
  };
  
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
        {/* Include the filter component if provided */}
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
          series={visibleSeries}
          curveType="linear"
          onClick={handleChartClick}
          tooltipProps={{
            content: ({ label, payload }) => <ChartTooltip label={label} payload={payload} />,
          }}
          withXAxis
          withLegend={false}
          yAxisProps={{
            domain: [0, getMaxYValue()],
            tickCount: 6,
          }}
        />
        
        <Space h="xs" />
        
        {/* Modal for enlarged chart */}
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
              series={visibleSeries}
              curveType="linear"
              withLegend={false}
              yAxisProps={{
                domain: [0, getMaxYValue()],
                tickCount: 8,
              }}
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