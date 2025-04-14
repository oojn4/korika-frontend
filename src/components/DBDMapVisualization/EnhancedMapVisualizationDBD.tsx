// src/components/MapVisualization/EnhancedMapVisualizationDBD.tsx
import React, { useRef, useState } from 'react';
import { Button, Collapse, Group, Paper, Text, Tabs, Select, SimpleGrid, Space } from '@mantine/core';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { DBDRawDataItem } from '../../@types/dashboard';
import useDataAggregationDBD from './hooks/useDataAggregationDBD';
import { metricOptionsDBD } from './utils/mapUtilsDBD';

// Import map components
import ProvinceMapDBD from './components/ProvinceMapDBD';
import CityMapDBD from './components/CityMapDBD';
import MapLegendDBD from '../MapLegend/MapLegend';

// Set Mapbox token
mapboxgl.accessToken = 'pk.eyJ1IjoiZmF1emFuZmFsZHkiLCJhIjoiY20yYmF0MG94MG1oYjJrcXhkMWo4dGh4eCJ9.X0AVMmOyRm1Q8ObMiqL7VA';

interface EnhancedMapVisualizationDBDProps {
  data: DBDRawDataItem[];
  predictedMonthYear: string;
}

const EnhancedMapVisualizationDBD: React.FC<EnhancedMapVisualizationDBDProps> = ({ data, predictedMonthYear }) => {
  // UI State
  const [tableOpen, setTableOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('province');
  const [metricToShow, setMetricToShow] = useState('dbd_p');
  
  // Shared popup reference for all maps
  const popupRef = useRef(new mapboxgl.Popup({ closeButton: false, closeOnClick: false }));
  
  // Get aggregated data from our custom hook
  const { aggregatedProvinceData, aggregatedCityData } = useDataAggregationDBD(data);

  // Calculate max value for the current active tab and metric (for legend)
  const getMaxValueForCurrentView = () => {
    switch (activeTab) {
      case 'province':
        return Math.max(...aggregatedProvinceData.map(p => {
          const value = p[metricToShow];
          if (metricToShow.includes('_change')) {
            // For percentage metrics, we use absolute values for color scaling
            return typeof value === 'number' ? Math.abs(value) : 0;
          }
          return typeof value === 'number' ? value : 0;
        }), 1);
      case 'city':
        return Math.max(...aggregatedCityData.map(d => {
          const value = d[metricToShow];
          if (metricToShow.includes('_change')) {
            // For percentage metrics, we use absolute values for color scaling
            return typeof value === 'number' ? Math.abs(value) : 0;
          }
          return typeof value === 'number' ? value : 0;
        }), 1);
      default:
        return 100; // Fallback value
    }
  };

  // Get label for selected metric
  const getMetricLabel = () => {
    const selectedMetric = metricOptionsDBD.find(m => m.value === metricToShow);
    return selectedMetric ? selectedMetric.label : 'Jumlah Kasus DBD';
  };
  

  return (
    <>
      <Paper withBorder p="md" radius="md">
        <Group justify="space-between" align="flex-end" gap={0} mb="md">
          <Text fz="xl" fw={700}>
            Sebaran {getMetricLabel()}, {predictedMonthYear}
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
              onChange={(value) => setMetricToShow(value || 'dbd_p')}
              data={metricOptionsDBD}
              w="auto"
            />
          </SimpleGrid>
          <Space h="lg" />
          
          <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'province')}>
            <Tabs.List>
              <Tabs.Tab value="province">Peta Level Provinsi</Tabs.Tab>
              <Tabs.Tab value="city">Peta Level Kabupaten/Kota</Tabs.Tab>
            </Tabs.List>
            
            <Tabs.Panel value="province" pt="md">
              <div style={{ position: 'relative', height: '500px' }}>
                <ProvinceMapDBD 
                  aggregatedData={aggregatedProvinceData} 
                  metricToShow={metricToShow} 
                  isActive={activeTab === 'province'} 
                  popupRef={popupRef} 
                />
                <MapLegendDBD 
                  metricToShow={metricToShow} 
                  maxValue={getMaxValueForCurrentView()} 
                />
              </div>
            </Tabs.Panel>
            
            <Tabs.Panel value="city" pt="md">
              <div style={{ position: 'relative', height: '500px' }}>
                <CityMapDBD 
                  aggregatedData={aggregatedCityData} 
                  metricToShow={metricToShow} 
                  isActive={activeTab === 'city'} 
                  popupRef={popupRef} 
                />
                <MapLegendDBD 
                  metricToShow={metricToShow} 
                  maxValue={getMaxValueForCurrentView()} 
                />
              </div>
            </Tabs.Panel>
          </Tabs>
          
          <Text size="xs" mt="xs" c="dimmed">
            Data DBD (Demam Berdarah Dengue) ditampilkan berdasarkan laporan dari fasilitas kesehatan. 
            Kasus ditunjukkan pada metrik DBD_P, sementara kematian ditunjukkan pada metrik DBD_M.
            {metricToShow.includes('_change') && (
              <span> Untuk perubahan persentase, warna hijau menunjukkan penurunan (membaik) dan warna merah menunjukkan peningkatan (memburuk).</span>
            )}
          </Text>
        </Collapse>
      </Paper>
    </>
  );
};

export default EnhancedMapVisualizationDBD;