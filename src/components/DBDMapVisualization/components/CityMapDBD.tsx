// src/components/MapVisualization/components/CityMapDBD.tsx
import _ from 'lodash';
import mapboxgl, { Map as MapboxMap, Popup } from 'mapbox-gl';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { geoJsonUrls, getColorForValue, metricOptionsDBD } from '../utils/mapUtilsDBD';

interface AggregatedDBDGeoData {
  kd_prov: string;
  kd_kab: string;
  province: string;
  city: string;
  dbd_p: number;
  dbd_m: number;
  dbd_p_m_to_m_change: number | null;
  dbd_m_m_to_m_change: number | null;
  dbd_p_y_on_y_change: number | null;
  dbd_m_y_on_y_change: number | null;
  count: number;
  [key: string]: any;
}

interface CityMapDBDProps {
  aggregatedData: AggregatedDBDGeoData[];
  metricToShow: string;
  isActive: boolean;
  popupRef: React.MutableRefObject<Popup>;
}

const CityMapDBD: React.FC<CityMapDBDProps> = ({ aggregatedData, metricToShow, isActive, popupRef }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<MapboxMap | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [geojsonData, setGeojsonData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentTooltipData, setCurrentTooltipData] = useState<any>(null);

  // URL ke GeoJSON kabupaten
  const geojsonUrl = geoJsonUrls.city;

  // Mendapatkan nilai maksimum untuk penskalaan warna
  const getMaxValue = useCallback(() => {
    return Math.max(...aggregatedData.map(d => {
      const value = d[metricToShow];
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
        console.error('Error fetching city GeoJSON:', error);
        setError(`Failed to load city map data: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    if (!geojsonData) {
      fetchGeoJSON();
    }
  }, [isActive, geojsonData]);

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
        if (!map.current!.getSource('cities')) {
          
          // Determine the property for city code based on the actual structure
          let codeProperty = 'ADM2_PCODE';
          let nameProperty = 'ADM2_EN';
          
          // Verify the properties by examining the first feature
          if (geojsonData.features.length > 0) {
            const firstFeature = geojsonData.features[0];
            if (firstFeature.properties) {
              // Log available properties for debugging
              
              // Determine correct property names (keeping ADM2_PCODE as default)
              if (!firstFeature.properties.hasOwnProperty('ADM2_PCODE')) {
                if (firstFeature.properties.hasOwnProperty('id')) {
                  codeProperty = 'id';
                } else if (firstFeature.properties.hasOwnProperty('kode_kabupaten')) {
                  codeProperty = 'kode_kabupaten';
                }
              }
              
              if (!firstFeature.properties.hasOwnProperty('ADM2_EN')) {
                if (firstFeature.properties.hasOwnProperty('name')) {
                  nameProperty = 'name';
                } else if (firstFeature.properties.hasOwnProperty('nama_kabupaten')) {
                  nameProperty = 'nama_kabupaten';
                }
              }
            }
          }
          
          
          // Add the source
          map.current!.addSource('cities', {
            type: 'geojson',
            data: geojsonData
          });

          
          // Add fill layer with separated match expression
          map.current!.addLayer({
            id: 'city-fills',
            type: 'fill',
            source: 'cities',
            paint: {
              'fill-color': (() => {
                // Prepare match expression pairs safely
                const matchPairs = aggregatedData.length > 0 ? 
                  aggregatedData.flatMap(d => {
                    // Remove "ID" prefix from ADM2_PCODE if it exists to match with city code
                    const cityCode = d.kd_kab;
                    // For each city in our data, we'll create two match cases:
                    // 1. Match against the raw code (e.g., "1234")
                    // 2. Match against the code with "ID" prefix (e.g., "ID1234")
                    return [
                      cityCode, // Raw code
                      getColorForValue(d[metricToShow] || 0, getMaxValue()),
                      `ID${cityCode}`, // With "ID" prefix
                      getColorForValue(d[metricToShow] || 0, getMaxValue())
                    ];
                  }) : 
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
            id: 'city-outlines',
            type: 'line',
            source: 'cities',
            paint: {
              'line-color': '#ffffff',
              'line-width': 0.5
            }
          });
          
          // Setup tooltip interaction
          setupTooltipInteraction(codeProperty, nameProperty);
        } else {
          // Update existing source
          const source = map.current!.getSource('cities') as mapboxgl.GeoJSONSource;
          if (source) {
            source.setData(geojsonData);
          }
          
          // Update colors based on current metric
          updateCityColors();
        }
      } catch (error) {
        console.error('Error setting up city layers for DBD:', error);
        setError(`Error setting up city map: ${error instanceof Error ? error.message : String(error)}`);
      }
    };
    
    setupLayers();
    
  }, [geojsonData, mapLoaded, isActive, aggregatedData, metricToShow, getMaxValue, popupRef]);

  // Setup tooltip interaction
  const setupTooltipInteraction = useCallback((codeProperty: string, nameProperty: string) => {
    if (!map.current) return;
    
    // Variabel untuk melacak wilayah yang sedang di-hover
    let hoveredCityId: string | null = null;
    
    // Add interaction for hover
    map.current.on('mousemove', 'city-fills', (e) => {
      if (e.features && e.features.length > 0) {
        map.current!.getCanvas().style.cursor = 'pointer';
        
        const feature = e.features[0];
        const properties = feature.properties;
        // Get properties safely
        let cityCode = properties ? properties[codeProperty] || '' : '';
        const cityName = properties ? properties[nameProperty] || 'Unknown' : 'Unknown';
        
        // Remove "ID" prefix if it exists
        if (cityCode.startsWith('ID')) {
          cityCode = cityCode.substring(2);
        }
        
        // Hanya update tooltip jika hover ke wilayah baru
        if (hoveredCityId !== cityCode) {
          hoveredCityId = cityCode;
          
          // Find data for this city
          const cityData = aggregatedData.find(d => d.kd_kab === cityCode);
          
          if (cityData) {
            // Save current tooltip data for re-rendering when metric changes
            setCurrentTooltipData({
              lngLat: e.lngLat,
              cityCode,
              cityName,
              cityData
            });
            
            updateTooltipContent(e.lngLat, cityName, cityData);
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
    
    map.current.on('mouseleave', 'city-fills', () => {
      map.current!.getCanvas().style.cursor = '';
      popupRef.current.remove();
      setCurrentTooltipData(null);
      hoveredCityId = null;
    });
    
  }, [aggregatedData, popupRef, metricToShow, currentTooltipData]);

  // Function to update tooltip content with debounce
  const updateTooltipContent = useCallback(
    _.debounce((lngLat: mapboxgl.LngLat, cityName: string, cityData: any) => {
      const metricLabel = metricOptionsDBD.find(m => m.value === metricToShow)?.label || 'Nilai';
      const metricValue = cityData[metricToShow];
      
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
      const cfr = cityData.dbd_p > 0 
        ? ((cityData.dbd_m / cityData.dbd_p) * 100).toFixed(2) 
        : 0;
        
      popupRef.current
        .setLngLat(lngLat)
        .setHTML(`
          <div style="background-color: white; color: black; padding: 8px; border-radius: 4px; font-family: sans-serif;">
            <strong style="font-size: 14px;">${cityName}</strong><br/>
            <span style="font-size: 11px; color: #666;">${cityData.province}</span>
            <span style="font-size: 12px; margin-top: 4px; display: block;">
              <strong>${metricLabel}:</strong> ${formattedValue} ${trendIndicator}
            </span>
            <span style="font-size: 12px; display: block;">
              <strong>Kasus DBD:</strong> ${cityData.dbd_p || 0} kasus
            </span>
            <span style="font-size: 12px; display: block;">
              <strong>Kematian dengan DBD:</strong> ${cityData.dbd_m || 0} kasus
            </span>
            <span style="font-size: 12px; display: block;">
              <strong>Tingkat Kematian dengan DBD:</strong> ${cfr}%
            </span>
          </div>
        `)
        .addTo(map.current!);
    }, 50), // Delay 50ms
    [metricToShow, popupRef]
  );

  // Update tooltip when metric changes if cursor is hovering over a city
  useEffect(() => {
    if (currentTooltipData) {
      updateTooltipContent(
        currentTooltipData.lngLat,
        currentTooltipData.cityName,
        currentTooltipData.cityData
      );
    }
  }, [metricToShow, currentTooltipData, updateTooltipContent]);

  // Update colors when metric changes
  useEffect(() => {
    if (map.current && mapLoaded && map.current.getLayer('city-fills')) {
      updateCityColors();
    }
  }, [metricToShow, mapLoaded]);

  // Update city fill colors
  const updateCityColors = useCallback(() => {
    if (!map.current || !mapLoaded || !map.current.getLayer('city-fills') || !geojsonData) return;
    
    try {
      // Determine property for city code
      let codeProperty = 'ADM2_PCODE';
      if (geojsonData.features.length > 0) {
        const props = geojsonData.features[0].properties;
        if (!props.hasOwnProperty('ADM2_PCODE')) {
          if (props.hasOwnProperty('id')) {
            codeProperty = 'id';
          } else if (props.hasOwnProperty('kode_kabupaten')) {
            codeProperty = 'kode_kabupaten';
          }
        }
      }
  
      // Prepare match expression pairs safely
      const matchPairs = aggregatedData.length > 0 ? 
        aggregatedData.flatMap(d => {
          // Include both with and without "ID" prefix
          return [
            d.kd_kab, // Raw code
            getColorForValue(d[metricToShow] || 0, getMaxValue()),
            `ID${d.kd_kab}`, // With "ID" prefix
            getColorForValue(d[metricToShow] || 0, getMaxValue())
          ];
        }) : 
        // Provide at least one valid match pair if data is empty
        ["dummy", "#CCCCCC"];
        
      map.current.setPaintProperty(
        'city-fills',
        'fill-color',
        [
          'match',
          ['get', codeProperty],
          ...matchPairs,
          '#CCCCCC' // Default color
        ]
      );
    } catch (error) {
      console.error('Error updating city colors for DBD:', error);
    }
  }, [geojsonData, aggregatedData, metricToShow, getMaxValue, mapLoaded]);
  // Update tooltip when metric changes if cursor is hovering over a city
  useEffect(() => {
    if (currentTooltipData && map.current) {
      // Don't create a new tooltip, just update the HTML content
      const metricLabel = metricOptionsDBD.find(m => m.value === metricToShow)?.label || 'Nilai';
      const metricValue = currentTooltipData.cityData[metricToShow];
      
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
      const cfr = currentTooltipData.cityData.dbd_p > 0 
        ? ((currentTooltipData.cityData.dbd_m / currentTooltipData.cityData.dbd_p) * 100).toFixed(2) 
        : 0;
      
      popupRef.current
        .setHTML(`
          <div style="background-color: white; color: black; padding: 8px; border-radius: 4px; font-family: sans-serif;">
            <strong style="font-size: 14px;">${currentTooltipData.cityName}</strong><br/>
            <span style="font-size: 11px; color: #666;">${currentTooltipData.cityData.province}</span>
            <span style="font-size: 12px; margin-top: 4px; display: block;">
              <strong>${metricLabel}:</strong> ${formattedValue} ${trendIndicator}
            </span>
            <span style="font-size: 12px; display: block;">
              <strong>Kasus DBD:</strong> ${currentTooltipData.cityData.dbd_p || 0} kasus
            </span>
            <span style="font-size: 12px; display: block;">
              <strong>Kematian dengan DBD:</strong> ${currentTooltipData.cityData.dbd_m || 0} kasus
            </span>
            <span style="font-size: 12px; display: block;">
              <strong>Tingkat Kematian dengan DBD:</strong> ${cfr}%
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

export default CityMapDBD;