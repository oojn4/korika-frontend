// src/components/MapVisualization/EnhancedMapVisualization.tsx
import { Button, Collapse, Group, Paper, Select, SimpleGrid, Space, Tabs, Text } from '@mantine/core';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import React, { useEffect, useRef, useState } from 'react';
import { RawData } from '../../@types/dashboard';
import useDataAggregation from './hooks/useDataAggregation';
import { metricOptions } from './utils/mapUtils';

// Import map components
import MapLegend from '../MapLegend/MapLegend';
import CityMap from './components/CityMap';
import DistrictMap from './components/DistrictMap';
import FaskesMap from './components/FaskesMap';
import ProvinceMap from './components/ProvinceMap';

// Set Mapbox token
mapboxgl.accessToken = 'pk.eyJ1IjoiZmF1emFuZmFsZHkiLCJhIjoiY20yYmF0MG94MG1oYjJrcXhkMWo4dGh4eCJ9.X0AVMmOyRm1Q8ObMiqL7VA';

interface EnhancedMapVisualizationProps {
  data: RawData[];
  predictedMonthYear: string;
}

const EnhancedMapVisualization: React.FC<EnhancedMapVisualizationProps> = ({ data, predictedMonthYear }) => {
  // UI State
  const [tableOpen, setTableOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('faskes');
  const [metricToShow, setMetricToShow] = useState('tot_pos');
  
  // Shared popup reference for all maps
  const popupRef = useRef(new mapboxgl.Popup({ closeButton: false, closeOnClick: false }));
  
  // Get aggregated data from our custom hook
  const { aggregatedProvinceData, aggregatedCityData,aggregatedDistrictData } = useDataAggregation(data);

  // Calculate max value for the current active tab and metric (for legend)
  const getMaxValueForCurrentView = () => {
    switch (activeTab) {
      case 'faskes':
        return Math.max(...data.map(f => f[metricToShow] || 0));
      case 'province':
        return Math.max(...aggregatedProvinceData.map(p => p[metricToShow] || 0));
      case 'city':
        return Math.max(...aggregatedCityData.map(d => d[metricToShow] || 0));
      case 'district':
        return Math.max(...aggregatedDistrictData.map(s => s[metricToShow] || 0));
      default:
        return 100; // Fallback value
    }
  };
  useEffect(() => {
    
    
    
    
  }, []);
  return (
    <>
      <Paper withBorder p="md" radius="md">
        <Group justify="space-between" align="flex-end" gap={0} mb="md">
          <Text fz="xl" fw={700}>
            Sebaran {metricOptions.find(m => m.value === metricToShow)?.label || 'Total Kasus'} Malaria, {predictedMonthYear}
          </Text>
          <Button variant="subtle" onClick={() => setTableOpen((prev) => !prev)}>
            {tableOpen ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
          </Button>
        </Group>
        
        <Collapse in={tableOpen}>
          <SimpleGrid cols={{ base: 1, sm: 5, md: 5 }} spacing="md">
            <Select
              label="Indikator yang ditampilkan"
              value={metricToShow}
              onChange={(value) => setMetricToShow(value || '')}
              data={metricOptions}
              w="auto"
            />
          </SimpleGrid>
          <Space h="lg" />
          
          <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'province')}>
            <Tabs.List>
              <Tabs.Tab value="province">Peta Level Provinsi</Tabs.Tab>
              <Tabs.Tab value="city">Peta Level Kabupaten/Kota</Tabs.Tab>
              <Tabs.Tab value="district">Peta Level Kecamatan</Tabs.Tab>
              <Tabs.Tab value="faskes">Peta Level Faskes</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="faskes" pt="md">
              <FaskesMap 
                data={data} 
                metricToShow={metricToShow} 
                isActive={activeTab === 'faskes'} 
                popupRef={popupRef} 
              />
              <MapLegend 
                metricToShow={metricToShow} 
                maxValue={getMaxValueForCurrentView()} 
              />
            </Tabs.Panel>
            
            <Tabs.Panel value="province" pt="md">
              <ProvinceMap 
                aggregatedData={aggregatedProvinceData} 
                metricToShow={metricToShow} 
                isActive={activeTab === 'province'} 
                popupRef={popupRef} 
              />
              <MapLegend 
                metricToShow={metricToShow} 
                maxValue={getMaxValueForCurrentView()} 
              />
            </Tabs.Panel>
            
            <Tabs.Panel value="city" pt="md">
              <CityMap 
                aggregatedData={aggregatedCityData} 
                metricToShow={metricToShow} 
                isActive={activeTab === 'city'} 
                popupRef={popupRef} 
              />
              <MapLegend 
                metricToShow={metricToShow} 
                maxValue={getMaxValueForCurrentView()} 
              />
            </Tabs.Panel>
            
            <Tabs.Panel value="district" pt="md">
              <DistrictMap 
                aggregatedData={aggregatedDistrictData} 
                metricToShow={metricToShow} 
                isActive={activeTab === 'district'} 
                popupRef={popupRef} 
              />
              <MapLegend 
                metricToShow={metricToShow} 
                maxValue={getMaxValueForCurrentView()} 
              />
            </Tabs.Panel>
          </Tabs>
        </Collapse>
      </Paper>
    </>
  );
};

export default EnhancedMapVisualization;