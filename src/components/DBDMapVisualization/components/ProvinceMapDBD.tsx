// src/components/MapVisualization/components/ProvinceMapDBD.tsx
import _ from 'lodash';
import mapboxgl, { Map as MapboxMap, Popup } from 'mapbox-gl';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { geoJsonUrls, getColorForValue, metricOptionsDBD } from '../utils/mapUtilsDBD';

interface AggregatedDBDGeoData {
  kd_prov: string;
  province: string;
  dbd_p: number;
  dbd_m: number;
  dbd_p_m_to_m_change: number | null;
  dbd_m_m_to_m_change: number | null;
  dbd_p_y_on_y_change: number | null;
  dbd_m_y_on_y_change: number | null;
  count: number;
  [key: string]: any;
}

interface ProvinceMapDBDProps {
  aggregatedData: AggregatedDBDGeoData[];
  metricToShow: string;
  isActive: boolean;
  popupRef: React.MutableRefObject<Popup>;
}

const ProvinceMapDBD: React.FC<ProvinceMapDBDProps> = ({ aggregatedData, metricToShow, isActive, popupRef }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<MapboxMap | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [geojsonData, setGeojsonData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentTooltipData, setCurrentTooltipData] = useState<any>(null);

  // URL ke GeoJSON provinsi
  const geojsonUrl = geoJsonUrls.province;

  // Mendapatkan nilai maksimum untuk penskalaan warna
  const getMaxValue = useCallback(() => {
    return Math.max(...aggregatedData.map(p => {
      const value = p[metricToShow];
      if (metricToShow.includes('_change')) {
        // For percentage metrics, we use absolute values for color scaling
        return typeof value === 'number' ? Math.abs(value) : 0;
      }
      return typeof value === 'number' ? value : 0;
    }), 1);
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
        console.error('Error fetching province GeoJSON:', error);
        setError(`Failed to load province map data: ${error instanceof Error ? error.message : String(error)}`);
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
              if (!firstFeature.properties.hasOwnProperty('kode_provinsi')) {
                if (firstFeature.properties.hasOwnProperty('KODE_PROV')) {
                  codeProperty = 'KODE_PROV';
                } else if (firstFeature.properties.hasOwnProperty('id')) {
                  codeProperty = 'id';
                }
              }
              
              if (!firstFeature.properties.hasOwnProperty('nama_provinsi')) {
                if (firstFeature.properties.hasOwnProperty('PROVINSI')) {
                  nameProperty = 'PROVINSI';
                } else if (firstFeature.properties.hasOwnProperty('name')) {
                  nameProperty = 'name';
                }
              }
            }
          }
          
          
          
          // Add the source
          map.current!.addSource('provinces', {
            type: 'geojson',
            data: geojsonData
          });

          // Add fill layer with separated match expression
          map.current!.addLayer({
            id: 'province-fills',
            type: 'fill',
            source: 'provinces',
            paint: {
              'fill-color': (() => {
                // Prepare match expression pairs safely
                const matchPairs = aggregatedData.length > 0 ? 
                  aggregatedData.flatMap(d => [
                    d.kd_prov,
                    getColorForValue(d[metricToShow] || 0, getMaxValue())
                  ]) : 
                  // Provide at least one valid match pair if data is empty to avoid the "at least 4 arguments" error
                  ["dummy", "#CCCCCC"];
          
                return [
                  'match',
                  ['get', codeProperty],
                  ...matchPairs,
                  '#CCCCCC' // Default color
                ];
              })(),
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
        console.error('Error setting up province layers for DBD:', error);
        setError(`Error setting up province map: ${error instanceof Error ? error.message : String(error)}`);
      }
    };
    
    setupLayers();
    
  }, [geojsonData, mapLoaded, isActive, aggregatedData, metricToShow, getMaxValue, popupRef]);

  // Setup tooltip interaction
  const setupTooltipInteraction = useCallback((codeProperty: string, nameProperty: string) => {
    if (!map.current) return;
    
    // Variabel untuk melacak wilayah yang sedang di-hover
    let hoveredProvinceId: string | null = null;
    
    // Add interaction for hover
    map.current.on('mousemove', 'province-fills', (e) => {
      if (e.features && e.features.length > 0) {
        map.current!.getCanvas().style.cursor = 'pointer';
        
        const feature = e.features[0];
        const properties = feature.properties;
        
        
        // Get properties safely
        const provinceCode = properties ? properties[codeProperty] || '' : '';
        const provinceName = properties ? properties[nameProperty] || 'Unknown' : 'Unknown';
        
        // Hanya update tooltip jika hover ke wilayah baru
        if (hoveredProvinceId !== provinceCode) {
          hoveredProvinceId = provinceCode;
          
          // Find data for this province
          const provinceData = aggregatedData.find(d => d.kd_prov === provinceCode);
          
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
        } else {
          // Update hanya posisi tooltip jika masih di wilayah yang sama
          // tapi mouse bergerak, tanpa mengubah konten
          if (currentTooltipData) {
            popupRef.current.setLngLat(e.lngLat);
          }
        }
      }
    });
    
    map.current.on('mouseleave', 'province-fills', () => {
      map.current!.getCanvas().style.cursor = '';
      popupRef.current.remove();
      setCurrentTooltipData(null);
      hoveredProvinceId = null;
    });
    
  }, [aggregatedData, popupRef, currentTooltipData]);

  // Function to update tooltip content with debounce
  const updateTooltipContent = useCallback(
    _.debounce((lngLat: mapboxgl.LngLat, provinceName: string, provinceData: any) => {
      const metricLabel = metricOptionsDBD.find(m => m.value === metricToShow)?.label || 'Nilai';
      const metricValue = provinceData[metricToShow];
      
      // Format the value based on metric type
      let formattedValue: string;
      if (metricToShow.includes('_change')) {
        formattedValue = metricValue !== null && metricValue !== undefined ? `${metricValue.toFixed(2)}%` : 'N/A';
      } else {
        formattedValue = metricValue !== undefined ? metricValue.toLocaleString() : '0';
      }
      
      // Add icon indicators for trends
      let trendIndicator = '';
      if (metricToShow.includes('_change')) {
        if (metricValue > 0) {
          trendIndicator = '<span style="color: #d32f2f;">▲</span>'; // Red up arrow
        } else if (metricValue < 0) {
          trendIndicator = '<span style="color: #388e3c;">▼</span>'; // Green down arrow
        }
      }
      
      // Calculate Case Fatality Rate (CFR)
      const cfr = provinceData.dbd_p > 0 
        ? ((provinceData.dbd_m / provinceData.dbd_p) * 100).toFixed(2) 
        : 0;
        
      popupRef.current
        .setLngLat(lngLat)
        .setHTML(`
          <div style="background-color: white; color: black; padding: 8px; border-radius: 4px; font-family: sans-serif;">
            <strong style="font-size: 14px;">${provinceName}</strong><br/>
            <span style="font-size: 12px; margin-top: 4px; display: block;">
              <strong>${metricLabel}:</strong> ${formattedValue} ${trendIndicator}
            </span>
            <span style="font-size: 12px; display: block;">
              <strong>Kasus DBD:</strong> ${provinceData.dbd_p || 0} kasus
            </span>
            <span style="font-size: 12px; display: block;">
              <strong>Kematian dengan DBD:</strong> ${provinceData.dbd_m || 0} kasus
            </span>
            <span style="font-size: 12px; display: block;">
              <strong>CFR:</strong> ${cfr}%
            </span>
          </div>
        `)
        .addTo(map.current!);
    }, 50), // Delay 50ms
    [metricToShow, popupRef]
  );

  // Update tooltip when metric changes if cursor is hovering over a province
  useEffect(() => {
    if (currentTooltipData) {
      updateTooltipContent(
        currentTooltipData.lngLat,
        currentTooltipData.provinceName,
        currentTooltipData.provinceData
      );
    }
  }, [metricToShow, currentTooltipData, updateTooltipContent]);
// Add this near the top of your component with other useEffects
  useEffect(() => {
    // Initialize popup if needed
    if (isActive && !popupRef.current) {
      popupRef.current = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
      });
    }
  }, [isActive, popupRef]);
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
        if (!props.hasOwnProperty('kode_provinsi')) {
          if (props.hasOwnProperty('KODE_PROV')) {
            codeProperty = 'KODE_PROV';
          } else if (props.hasOwnProperty('id')) {
            codeProperty = 'id';
          }
        }
      }
      
      map.current.setPaintProperty(
        'province-fills',
        'fill-color',
        (() => {
          // Prepare match expression pairs safely
          const matchPairs = aggregatedData.length > 0 ? 
            aggregatedData.flatMap(d => [
              d.kd_prov,
              getColorForValue(d[metricToShow] || 0, getMaxValue())
            ]) : 
            // Provide at least one valid match pair if data is empty
            ["dummy", "#CCCCCC"];
            
          return [
            'match',
            ['get', codeProperty],
            ...matchPairs,
            '#CCCCCC' // Default color
          ];
        })()
      );
    } catch (error) {
      console.error('Error updating province colors for DBD:', error);
    }
  }, [geojsonData, aggregatedData, metricToShow, getMaxValue, mapLoaded]);

  // Update tooltip when metric changes if cursor is hovering over a province
  useEffect(() => {
    if (currentTooltipData && map.current) {
      // Don't create a new tooltip, just update the HTML content
      const metricLabel = metricOptionsDBD.find(m => m.value === metricToShow)?.label || 'Nilai';
      const metricValue = currentTooltipData.provinceData[metricToShow];
      
      // Format the value based on metric type
      let formattedValue: string;
      if (metricToShow.includes('_change')) {
        formattedValue = metricValue !== null && metricValue !== undefined ? `${metricValue.toFixed(2)}%` : 'N/A';
      } else {
        formattedValue = metricValue !== undefined ? metricValue.toLocaleString() : '0';
      }
      
      // Add icon indicators for trends
      let trendIndicator = '';
      if (metricToShow.includes('_change')) {
        if (metricValue > 0) {
          trendIndicator = '<span style="color: #d32f2f;">▲</span>'; // Red up arrow
        } else if (metricValue < 0) {
          trendIndicator = '<span style="color: #388e3c;">▼</span>'; // Green down arrow
        }
      }
      
      // Calculate Case Fatality Rate (CFR)
      const cfr = currentTooltipData.provinceData.dbd_p > 0 
        ? ((currentTooltipData.provinceData.dbd_m / currentTooltipData.provinceData.dbd_p) * 100).toFixed(2) 
        : 0;
      
      popupRef.current
        .setHTML(`
          <div style="background-color: white; color: black; padding: 8px; border-radius: 4px; font-family: sans-serif;">
            <strong style="font-size: 14px;">${currentTooltipData.provinceName}</strong><br/>
            <span style="font-size: 12px; margin-top: 4px; display: block;">
              <strong>${metricLabel}:</strong> ${formattedValue} ${trendIndicator}
            </span>
            <span style="font-size: 12px; display: block;">
              <strong>Kasus DBD:</strong> ${currentTooltipData.provinceData.dbd_p || 0} kasus
            </span>
            <span style="font-size: 12px; display: block;">
              <strong>Kematian dengan DBD:</strong> ${currentTooltipData.provinceData.dbd_m || 0} kasus
            </span>
            <span style="font-size: 12px; display: block;">
              <strong>CFR:</strong> ${cfr}%
            </span>
          </div>
        `);
      // No need to call addTo() again, since the popup already exists
    }
  }, [metricToShow, currentTooltipData, popupRef]);

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

export default ProvinceMapDBD;