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

interface StatboxProps {
  title: string;
  icon?: React.ComponentType<TablerIconProps>;
  data: any[];
  textStatbox:any[];
  dataKey: string;
  series: { name: string; color: string }[];
  isCollapsible?: boolean;
}
interface ChartTooltipProps {
  label: string;
  payload: Record<string, any>[] | undefined;
}

function ChartTooltip({ label, payload }: ChartTooltipProps) {
  if (!payload || payload.length === 0) return null;

  return (
    <Paper
      px="sm" // Smaller horizontal padding
      py="xs" // Smaller vertical padding
      withBorder
      shadow="sm" // Reduced shadow
      radius="sm" // Smaller border radius
    >
      <Text fw={400} mb={3} fz="xs"> {/* Smaller font size and weight */}
        {label}
      </Text>
      {payload.map((item: any) => (
        <Text key={item.name} c={item.color} fz="xs" lh="1.2"> {/* Smaller font size and line height */}
          {item.name}: {item.value} 
        </Text>
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
            <Text fw={500}  > {/* Use text alignment */}
                {stat.count}
            </Text>
        </div>
        <div style={{ textAlign: 'right' }}> {/* Set div content alignment */}
            <Text c={stat.color_m_to_m} fw={500} size="sm" className={classes.statCount}>
            {stat.m_to_m?.toFixed(2)}%
            </Text>
            <Text size="xs" className={classes.statCount}>
            M-to-M
            </Text>
        </div>
        <div style={{ textAlign: 'right' }}> {/* Set div content alignment */}
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
            // onClick={()=>console.log(series)}
          >
            {opened ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
          </Button>
        )}
      </Group>

      <Collapse in={opened}>
        <LineChart
          h={300}
          data={data}
          dataKey={dataKey}
          series={series}
          curveType="linear"
          onClick={handleChartClick} // Add click handler
          tooltipProps={{
            content: ({ label, payload }) => <ChartTooltip label={label} payload={payload} />,
          }}
          withXAxis
        />
        {/* Modal for enlarged chart */}
        <Modal
            opened={isModalOpen}
            onClose={handleCloseModal}
            size="xl"
            title={title}
        >
            <LineChart
            h={600} // Enlarged height
            data={data}
            dataKey={dataKey}
            series={series}
            curveType="linear"
            />
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
