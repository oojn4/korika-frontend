import React, { useState } from 'react';
import { Paper, Group, Text, ThemeIcon, Badge, SimpleGrid, ActionIcon, Tooltip } from '@mantine/core';
import { IconTemperature, IconDroplet, IconWind, IconCloud, IconEye, IconX, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { format } from 'date-fns';

// Compact Weather Widget component
interface WeatherWidgetProps {
  data: any; // Replace 'any' with the appropriate type for 'data' if known
  onClose: () => void;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ data, onClose }) => {
  const [expanded, setExpanded] = useState(false);
  
  if (!data || !data.data || data.data.length === 0) {
    return (
      <Paper
        shadow="sm"
        p="xs"
        radius="md"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '280px',
          zIndex: 1000,
          backgroundColor: 'white',
        }}
      >
        <Group mb="xs">
          <Text size="sm">Cuaca</Text>
          <ActionIcon onClick={onClose} size="xs" color="gray">
            <IconX size={14} />
          </ActionIcon>
        </Group>
        <Text size="xs">Data cuaca tidak tersedia</Text>
      </Paper>
    );
  }

  // Get the first location data
  const locationData = data.data[0];
  if (!locationData || !locationData.cuaca || locationData.cuaca.length === 0 || locationData.cuaca[0].length === 0) {
    return (
      <Paper
        shadow="sm"
        p="xs"
        radius="md"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '280px',
          zIndex: 1000,
          backgroundColor: 'white',
        }}
      >
        <Group mb="xs">
          <Text size="sm">Cuaca</Text>
          <ActionIcon onClick={onClose} size="xs" color="gray">
            <IconX size={14} />
          </ActionIcon>
        </Group>
        <Text size="xs">Data cuaca tidak tersedia</Text>
      </Paper>
    );
  }

  // Get the first forecast (current/nearest time)
  const currentForecast = locationData.cuaca[0][0];
  
  return (
    <Paper
      shadow="sm"
      p="xs"
      radius="md"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '280px',
        zIndex: 1000,
        backgroundColor: 'white',
      }}
    >
      <Group mb={5}>
        <Group>
          <Text size="sm">
            Cuaca: {
              locationData.lokasi.desa || 
              locationData.lokasi.kecamatan || 
              locationData.lokasi.kotkab || 
              locationData.lokasi.provinsi || 
              "Lokasi tidak tersedia"
            }
          </Text>
          <Badge size="xs" color="blue" variant="light">
            {currentForecast.weather_desc}
          </Badge>
        </Group>
        <Group>
          <ActionIcon onClick={() => setExpanded(!expanded)} size="xs" color="blue">
            {expanded ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
          </ActionIcon>
          <ActionIcon onClick={onClose} size="xs" color="gray">
            <IconX size={14} />
          </ActionIcon>
        </Group>
      </Group>
      
      <Group mb={5}>
        <Text size="xs" color="dimmed">
          {format(new Date(currentForecast.local_datetime), "dd MMM yyyy - HH:mm")}
        </Text>
      </Group>
      
      <SimpleGrid cols={3} spacing={8} mb={expanded ? 10 : 0}>
        <Paper p={8} radius="md" withBorder>
          <Group>
            <ThemeIcon size="sm" radius="md" color="cyan">
              <IconTemperature size={14} />
            </ThemeIcon>
            <div>
              <Text size="xs">Suhu</Text>
              <Text size="sm">{currentForecast.t}</Text>
            </div>
          </Group>
        </Paper>
        
        <Paper p={8} radius="md" withBorder>
          <Group>
            <ThemeIcon size="sm" radius="md" color="blue">
              <IconDroplet size={14} />
            </ThemeIcon>
            <div>
              <Text size="xs">Kelembaban</Text>
              <Text size="sm">{currentForecast.hu}</Text>
            </div>
          </Group>
        </Paper>
        
        <Paper p={8} radius="md" withBorder>
          <Group>
            <ThemeIcon size="sm" radius="md" color="gray">
              <IconCloud size={14} />
            </ThemeIcon>
            <div>
              <Text size="xs">Awan</Text>
              <Text size="sm">{currentForecast.tcc}</Text>
            </div>
          </Group>
        </Paper>
      </SimpleGrid>
      
      {expanded && (
        <>
          <SimpleGrid cols={3} spacing={8} mb={10}>
            <Paper p={8} radius="md" withBorder>
              <Group>
                <ThemeIcon size="sm" radius="md" color="indigo">
                  <IconDroplet size={14} />
                </ThemeIcon>
                <div>
                  <Text size="xs">Hujan</Text>
                  <Text size="sm">{currentForecast.tp || 0}</Text>
                </div>
              </Group>
            </Paper>
            
            <Paper p={8} radius="md" withBorder>
              <Group>
                <ThemeIcon size="sm" radius="md" color="teal">
                  <IconWind size={14} />
                </ThemeIcon>
                <div>
                  <Text size="xs">Angin</Text>
                  <Text size="sm">{currentForecast.ws}</Text>
                </div>
              </Group>
            </Paper>
            
            <Paper p={8} radius="md" withBorder>
              <Group>
                <ThemeIcon size="sm" radius="md" color="blue.5">
                  <IconEye size={14} />
                </ThemeIcon>
                <div>
                  <Text size="xs">Pandang</Text>
                  <Tooltip label={currentForecast.visibility}>
                    <Text size="sm" truncate>{currentForecast.visibility}</Text>
                  </Tooltip>
                </div>
              </Group>
            </Paper>
          </SimpleGrid>
          
        </>
      )}
      
      <Text size="xs" color="dimmed" mt={2}>
        Data BMKG: {format(new Date(currentForecast.analysis_date), "dd/MM/yyyy")}
      </Text>
    </Paper>
  );
};

export default WeatherWidget;