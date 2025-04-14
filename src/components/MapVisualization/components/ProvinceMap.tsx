// src/components/MapVisualization/components/ProvinceMap.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl, { Map as MapboxMap, Popup } from 'mapbox-gl';
import { AggregatedGeoData } from '../hooks/useDataAggregation';
import { geoJsonUrls, getColorForValue, metricOptions } from '../utils/mapUtils';

interface ProvinceMapProps {
  aggregatedData: AggregatedGeoData[];
  metricToShow: string;
  isActive: boolean;
  popupRef: React.MutableRefObject<Popup>;
}

const ProvinceMap: React.FC<ProvinceMapProps> = ({ aggregatedData, metricToShow, isActive, popupRef }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<MapboxMap | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [geojsonData, setGeojsonData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentTooltipData, setCurrentTooltipData] = useState<any>(null);
  const hoveredProvinceIdRef = useRef<string | null>(null);

  // URL ke GeoJSON yang diberikan
  const geojsonUrl = geoJsonUrls.province;

  // Mendapatkan nilai maksimum untuk penskalaan warna
  const getMaxValue = useCallback(() => {
    return Math.max(...aggregatedData.map(p => p[metricToShow] || 0), 1);
  }, [aggregatedData, metricToShow]);

  // Memuat data GeoJSON
  useEffect(() => {
    if (!isActive) return;

    const fetchGeoJSON = async () => {
      try {
        setError(null);
        
        
        const response = await fetch(geojsonUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        
        // Validasi struktur data GeoJSON
        if (!data.features || !Array.isArray(data.features)) {
          throw new Error('Invalid GeoJSON format: features array missing');
        }
        
        setGeojsonData(data);
        
      } catch (error) {
        console.error('Error fetching GeoJSON:', error);
        setError(`Failed to load map data: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    if (!geojsonData) {
      fetchGeoJSON();
    }
  }, [isActive, geojsonData, geojsonUrl]);

  // Inisialisasi peta
  useEffect(() => {
    if (!mapContainer.current || !isActive) return;
    
    if (!map.current) {
      
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [118, -2.5], // Pusat Indonesia
        zoom: 4,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      map.current.on('load', () => {
        
        setMapLoaded(true);
      });
    }
  }, [isActive]);

  // Apply GeoJSON to map once everything is ready
  useEffect(() => {
    if (!map.current || !mapLoaded || !geojsonData || !isActive) return;
    
    
    
    const setupLayers = () => {
      try {
        // Check if source already exists
        if (!map.current!.getSource('provinces')) {
          
          
          // Determine the property for province code based on the actual structure
          let codeProperty = 'kode_provinsi';
          let nameProperty = 'nama_provinsi';
          
          // Verify the properties by examining the first feature
          if (geojsonData.features.length > 0) {
            const firstFeature = geojsonData.features[0];
            if (firstFeature.properties) {
              // Log available properties for debugging
              
              
              // Determine correct property names
              if (firstFeature.properties.hasOwnProperty('kode_provinsi')) {
                codeProperty = 'kode_provinsi';
              } else if (firstFeature.properties.hasOwnProperty('KODE_PROV')) {
                codeProperty = 'KODE_PROV';
              }
              
              if (firstFeature.properties.hasOwnProperty('nama_provinsi')) {
                nameProperty = 'nama_provinsi';
              } else if (firstFeature.properties.hasOwnProperty('PROVINSI')) {
                nameProperty = 'PROVINSI';
              }
            }
          }
          
          
          
          // Add the source
          map.current!.addSource('provinces', {
            type: 'geojson',
            data: geojsonData
          });
          
          // Add fill layer
          map.current!.addLayer({
            id: 'province-fills',
            type: 'fill',
            source: 'provinces',
            paint: {
              'fill-color': [
                'match',
                ['get', codeProperty],
                ...aggregatedData.flatMap(p => [
                  p.province,
                  getColorForValue(p[metricToShow] || 0, getMaxValue())
                ]),
                '#CCCCCC' // Default color
              ],
              'fill-opacity': 0.7
            }
          });
          
          // Add outline layer
          map.current!.addLayer({
            id: 'province-outlines',
            type: 'line',
            source: 'provinces',
            paint: {
              'line-color': '#ffffff',
              'line-width': 1
            }
          });
          
          // Setup tooltip interaction
          setupTooltipInteraction(codeProperty, nameProperty);
        } else {
          // Update existing source
          
          const source = map.current!.getSource('provinces') as mapboxgl.GeoJSONSource;
          if (source) {
            source.setData(geojsonData);
          }
          
          // Update colors based on current metric
          updateProvinceColors();
        }
      } catch (error) {
        console.error('Error setting up province layers:', error);
        setError(`Error setting up map: ${error instanceof Error ? error.message : String(error)}`);
      }
    };
    
    setupLayers();
    
  }, [geojsonData, mapLoaded, isActive, aggregatedData, metricToShow, getMaxValue, popupRef]);

  // Function to update tooltip content
  const updateTooltipContent = useCallback((lngLat: mapboxgl.LngLat, provinceName: string, provinceData: any) => {
    const metricLabel = metricOptions.find(m => m.value === metricToShow)?.label || 'Nilai';
    const metricValue = provinceData[metricToShow];
    
    popupRef.current
      .setLngLat(lngLat)
      .setHTML(`
        <div style="background-color: white; color: black; padding: 8px; border-radius: 4px; font-family: sans-serif;">
          <strong style="font-size: 14px;">${provinceName}</strong><br/>
          <span style="font-size: 12px; margin-top: 4px; display: block;">
            <strong>${metricLabel}:</strong> ${metricValue !== undefined ? metricValue.toLocaleString() : 0}
          </span>
          <span style="font-size: 12px; display: block;">
            <strong>Jumlah Faskes:</strong> ${provinceData.facility_count}
          </span>
        </div>
      `)
      .addTo(map.current!);
  }, [metricToShow, popupRef]);

  // Setup tooltip interaction
  const setupTooltipInteraction = useCallback((codeProperty: string, nameProperty: string) => {
    if (!map.current) return;
    
    // Add interaction for hover
    map.current.on('mousemove', 'province-fills', (e) => {
      if (e.features && e.features.length > 0) {
        map.current!.getCanvas().style.cursor = 'pointer';
        
        const feature = e.features[0];
        const properties = feature.properties;
        
        // Get properties safely
        const provinceCode = properties ? properties[codeProperty] || '' : '';
        const provinceName = properties ? properties[nameProperty] || 'Unknown' : 'Unknown';
        
        // Only update tooltip if hovering over a new province
        if (hoveredProvinceIdRef.current !== provinceCode) {
          hoveredProvinceIdRef.current = provinceCode;
          
          // Find data for this province
          const provinceData = aggregatedData.find(p => p.province === provinceCode);
          
          if (provinceData) {
            // Save current tooltip data for re-rendering when metric changes
            setCurrentTooltipData({
              lngLat: e.lngLat,
              provinceCode,
              provinceName,
              provinceData
            });
            
            updateTooltipContent(e.lngLat, provinceName, provinceData);
          }
        } else if (currentTooltipData) {
          // If still on the same province, just update position
          popupRef.current.setLngLat(e.lngLat);
        }
      }
    });
    
    map.current.on('mouseleave', 'province-fills', () => {
      map.current!.getCanvas().style.cursor = '';
      popupRef.current.remove();
      setCurrentTooltipData(null);
      hoveredProvinceIdRef.current = null;
    });
  }, [aggregatedData, popupRef, updateTooltipContent, currentTooltipData]);

  // Update tooltip when metric changes if cursor is hovering over a province
  useEffect(() => {
    if (currentTooltipData && hoveredProvinceIdRef.current) {
      // Don't create a new popup, just update the HTML content
      const metricLabel = metricOptions.find(m => m.value === metricToShow)?.label || 'Nilai';
      const metricValue = currentTooltipData.provinceData[metricToShow];
      
      popupRef.current.setHTML(`
        <div style="background-color: white; color: black; padding: 8px; border-radius: 4px; font-family: sans-serif;">
          <strong style="font-size: 14px;">${currentTooltipData.provinceName}</strong><br/>
          <span style="font-size: 12px; margin-top: 4px; display: block;">
            <strong>${metricLabel}:</strong> ${metricValue !== undefined ? metricValue.toLocaleString() : 0}
          </span>
          <span style="font-size: 12px; display: block;">
            <strong>Jumlah Faskes:</strong> ${currentTooltipData.provinceData.facility_count}
          </span>
        </div>
      `);
    }
  }, [metricToShow, currentTooltipData, popupRef, metricOptions]);

  // Update colors when metric changes
  useEffect(() => {
    if (map.current && mapLoaded && map.current.getLayer('province-fills')) {
      updateProvinceColors();
    }
  }, [metricToShow, mapLoaded]);

  // Update province fill colors
  const updateProvinceColors = useCallback(() => {
    if (!map.current || !mapLoaded || !map.current.getLayer('province-fills') || !geojsonData) return;
    
    try {
      
      
      // Determine property for province code
      let codeProperty = 'kode_provinsi';
      if (geojsonData.features.length > 0) {
        const props = geojsonData.features[0].properties;
        if (props.hasOwnProperty('KODE_PROV')) {
          codeProperty = 'KODE_PROV';
        }
      }
      
      map.current.setPaintProperty(
        'province-fills',
        'fill-color',
        [
          'match',
          ['get', codeProperty],
          ...aggregatedData.flatMap(p => [
            p.province,
            getColorForValue(p[metricToShow] || 0, getMaxValue())
          ]),
          '#CCCCCC' // Default color
        ]
      );
    } catch (error) {
      console.error('Error updating province colors:', error);
    }
  }, [geojsonData, aggregatedData, metricToShow, getMaxValue, mapLoaded]);
  useEffect(() => {
    
    
  }
);
  return (
    <>
      {error && (
        <div style={{ 
          padding: '8px 12px', 
          backgroundColor: '#ffe6e6', 
          color: '#d32f2f',
          borderRadius: '4px',
          marginBottom: '10px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}
      <div 
        ref={mapContainer} 
        style={{ 
          width: '100%', 
          height: '500px',
          borderRadius: '4px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }} 
      />
    </>
  );
};

export default ProvinceMap;