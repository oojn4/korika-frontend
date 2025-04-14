// src/components/MapVisualization/EnhancedMapVisualizationLepto.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Button, Collapse, Group, Paper, Text, Tabs, Select, SimpleGrid, Space } from '@mantine/core';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { LeptoRawDataItem } from '../../@types/dashboard';
import useDataAggregationLepto from './hooks/useDataAggregationLepto';
import { metricOptionsLepto } from './utils/mapUtilsLepto';

// Import map components
import ProvinceMapLepto from './components/ProvinceMapLepto';
import CityMapLepto from './components/CityMapLepto';
import MapLegendLepto from '../MapLegend/MapLegend';

// Set Mapbox token
mapboxgl.accessToken = 'pk.eyJ1IjoiZmF1emFuZmFsZHkiLCJhIjoiY20yYmF0MG94MG1oYjJrcXhkMWo4dGh4eCJ9.X0AVMmOyRm1Q8ObMiqL7VA';

interface EnhancedMapVisualizationLeptoProps {
  data: LeptoRawDataItem[];
  predictedMonthYear: string;
}

const EnhancedMapVisualizationLepto: React.FC<EnhancedMapVisualizationLeptoProps> = ({ data, predictedMonthYear }) => {
  // UI State
  const [tableOpen, setTableOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('province');
  const [metricToShow, setMetricToShow] = useState('lep_k');
  
  // Shared popup reference for all maps
  const popupRef = useRef(new mapboxgl.Popup({ closeButton: false, closeOnClick: false }));
  
  // Get aggregated data from our custom hook
  const { aggregatedProvinceData, aggregatedCityData } = useDataAggregationLepto(data);

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
    const selectedMetric = metricOptionsLepto.find(m => m.value === metricToShow);
    return selectedMetric ? selectedMetric.label : 'Jumlah Kasus Lepto';
  };
  
  // Log data for debugging
  useEffect(() => {
    
    
    
  }, [aggregatedProvinceData, aggregatedCityData, data]);

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
              onChange={(value) => setMetricToShow(value || 'lep_k')}
              data={metricOptionsLepto}
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
                <ProvinceMapLepto 
                  aggregatedData={aggregatedProvinceData} 
                  metricToShow={metricToShow} 
                  isActive={activeTab === 'province'} 
                  popupRef={popupRef} 
                />
                <MapLegendLepto 
                  metricToShow={metricToShow} 
                  maxValue={getMaxValueForCurrentView()} 
                />
              </div>
            </Tabs.Panel>
            
            <Tabs.Panel value="city" pt="md">
              <div style={{ position: 'relative', height: '500px' }}>
                <CityMapLepto 
                  aggregatedData={aggregatedCityData} 
                  metricToShow={metricToShow} 
                  isActive={activeTab === 'city'} 
                  popupRef={popupRef} 
                />
                <MapLegendLepto 
                  metricToShow={metricToShow} 
                  maxValue={getMaxValueForCurrentView()} 
                />
              </div>
            </Tabs.Panel>
          </Tabs>
          
          <Text size="xs" mt="xs" c="dimmed">
            Data Lepto (Demam Berdarah Dengue) ditampilkan berdasarkan laporan dari fasilitas kesehatan. 
            Kasus ditunjukkan pada metrik Lepto_P, sementara kematian ditunjukkan pada metrik Lepto_M.
            {metricToShow.includes('_change') && (
              <span> Untuk perubahan persentase, warna hijau menunjukkan penurunan (membaik) dan warna merah menunjukkan peningkatan (memburuk).</span>
            )}
          </Text>
        </Collapse>
      </Paper>
    </>
  );
};

export default EnhancedMapVisualizationLepto;