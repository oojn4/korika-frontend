// src/components/MapVisualization/components/DistrictMap.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl, { Map as MapboxMap, Popup } from 'mapbox-gl';
import { AggregatedGeoData } from '../hooks/useDataAggregation';
import { getColorForValue, geoJsonUrls, metricOptions } from '../utils/mapUtils';

interface DistrictMapProps {
  aggregatedData: AggregatedGeoData[];
  metricToShow: string;
  isActive: boolean;
  popupRef: React.MutableRefObject<Popup>;
}

const DistrictMap: React.FC<DistrictMapProps> = ({ aggregatedData, metricToShow, isActive, popupRef }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<MapboxMap | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [geojsonData, setGeojsonData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentTooltipData, setCurrentTooltipData] = useState<any>(null);
  const hoveredDistrictIdRef = useRef<string | null>(null);

  // URL ke GeoJSON kecamatan
  const geojsonUrl = geoJsonUrls.district;

  // Mendapatkan nilai maksimum untuk penskalaan warna
  const getMaxValue = useCallback(() => {
    return Math.max(...aggregatedData.map(s => s[metricToShow] || 0), 1);
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
        
        
        // Log properti untuk debugging
        if (data.features.length > 0) {
          
        }
      } catch (error) {
        console.error('Error fetching district GeoJSON:', error);
        setError(`Failed to load district map data: ${error instanceof Error ? error.message : String(error)}`);
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
        if (!map.current!.getSource('districts')) {
          
          
          // Determine the property for district code based on the actual structure
          let codeProperty = 'ADM3_PCODE';
          let nameProperty = 'ADM3_EN';
          
          // Verify the properties by examining the first feature
          if (geojsonData.features.length > 0) {
            const firstFeature = geojsonData.features[0];
            if (firstFeature.properties) {
              // Log available properties for debugging
              
              
              // Determine correct property names (keeping ADM3_PCODE as default)
              if (!firstFeature.properties.hasOwnProperty('ADM3_PCODE')) {
                if (firstFeature.properties.hasOwnProperty('id')) {
                  codeProperty = 'id';
                } else if (firstFeature.properties.hasOwnProperty('kode_kecamatan')) {
                  codeProperty = 'kode_kecamatan';
                }
              }
              
              if (!firstFeature.properties.hasOwnProperty('ADM3_EN')) {
                if (firstFeature.properties.hasOwnProperty('name')) {
                  nameProperty = 'name';
                } else if (firstFeature.properties.hasOwnProperty('nama_kecamatan')) {
                  nameProperty = 'nama_kecamatan';
                }
              }
            }
          }
          
          
          
          // Add the source
          map.current!.addSource('districts', {
            type: 'geojson',
            data: geojsonData
          });
          
          // Add fill layer
          map.current!.addLayer({
            id: 'district-fills',
            type: 'fill',
            source: 'districts',
            paint: {
              'fill-color': [
                'match',
                ['get', codeProperty],
                ...aggregatedData.flatMap(s => {
                  // Match both with and without "ID" prefix
                  return [
                    s.district, // Raw code
                    getColorForValue(s[metricToShow] || 0, getMaxValue()),
                    `ID${s.district}`, // With "ID" prefix
                    getColorForValue(s[metricToShow] || 0, getMaxValue())
                  ];
                }),
                '#CCCCCC' // Default color
              ],
              'fill-opacity': 0.7
            }
          });
          
          // Add outline layer
          map.current!.addLayer({
            id: 'district-outlines',
            type: 'line',
            source: 'districts',
            paint: {
              'line-color': '#ffffff',
              'line-width': 0.5
            }
          });
          
          // Setup tooltip interaction
          setupTooltipInteraction(codeProperty, nameProperty);
        } else {
          // Update existing source
          
          const source = map.current!.getSource('districts') as mapboxgl.GeoJSONSource;
          if (source) {
            source.setData(geojsonData);
          }
          
          // Update colors based on current metric
          updateDistrictColors();
        }
      } catch (error) {
        console.error('Error setting up district layers:', error);
        setError(`Error setting up district map: ${error instanceof Error ? error.message : String(error)}`);
      }
    };
    
    setupLayers();
    
  }, [geojsonData, mapLoaded, isActive, aggregatedData, metricToShow, getMaxValue, popupRef]);

  // Function to update tooltip content
  const updateTooltipContent = useCallback((lngLat: mapboxgl.LngLat, districtName: string, districtData: any) => {
    const metricLabel = metricOptions.find(m => m.value === metricToShow)?.label || 'Nilai';
    const metricValue = districtData[metricToShow];
    
    popupRef.current
      .setLngLat(lngLat)
      .setHTML(`
        <div style="background-color: white; color: black; padding: 8px; border-radius: 4px; font-family: sans-serif;">
          <strong style="font-size: 14px;">${districtName}</strong><br/>
          <span style="font-size: 12px; margin-top: 4px; display: block;">
            <strong>${metricLabel}:</strong> ${metricValue !== undefined ? metricValue.toLocaleString() : 0}
          </span>
          <span style="font-size: 12px; display: block;">
            <strong>Jumlah Faskes:</strong> ${districtData.facility_count}
          </span>
        </div>
      `)
      .addTo(map.current!);
  }, [metricToShow, popupRef]);

  // Setup tooltip interaction
  const setupTooltipInteraction = useCallback((codeProperty: string, nameProperty: string) => {
    if (!map.current) return;
    
    // Add interaction for hover
    map.current.on('mousemove', 'district-fills', (e) => {
      if (e.features && e.features.length > 0) {
        map.current!.getCanvas().style.cursor = 'pointer';
        
        const feature = e.features[0];
        const properties = feature.properties;
        
        // Get properties safely
        let districtCode = properties ? properties[codeProperty] || '' : '';
        const districtName = properties ? properties[nameProperty] || 'Unknown' : 'Unknown';
        
        // Remove "ID" prefix if it exists
        if (districtCode.startsWith('ID')) {
          districtCode = districtCode.substring(2);
        }
        
        // Only update tooltip if hovering over a new district
        if (hoveredDistrictIdRef.current !== districtCode) {
          hoveredDistrictIdRef.current = districtCode;
          
          // Find data for this district
          const districtData = aggregatedData.find(s => s.district === districtCode);
          
          if (districtData) {
            // Save current tooltip data for re-rendering when metric changes
            setCurrentTooltipData({
              lngLat: e.lngLat,
              districtCode,
              districtName,
              districtData
            });
            
            updateTooltipContent(e.lngLat, districtName, districtData);
          }
        } else if (currentTooltipData) {
          // If still on the same district, just update position
          popupRef.current.setLngLat(e.lngLat);
        }
      }
    });
    
    map.current.on('mouseleave', 'district-fills', () => {
      map.current!.getCanvas().style.cursor = '';
      popupRef.current.remove();
      setCurrentTooltipData(null);
      hoveredDistrictIdRef.current = null;
    });
    
    // Add click interaction for zoom
    map.current.on('click', 'district-fills', (e) => {
      if (e.features && e.features.length > 0 && map.current) {
        const feature = e.features[0];
        
        try {
          // Try to determine bounds
          const bounds = new mapboxgl.LngLatBounds();
          let boundsSet = false;
          
          if (feature.geometry) {
            if (feature.geometry.type === 'Polygon') {
              feature.geometry.coordinates[0].forEach((coord: number[]) => {
                bounds.extend([coord[0], coord[1]]);
                boundsSet = true;
              });
            } else if (feature.geometry.type === 'MultiPolygon') {
              feature.geometry.coordinates.forEach((polygon: number[][][]) => {
                polygon[0].forEach((coord: number[]) => {
                  bounds.extend([coord[0], coord[1]]);
                  boundsSet = true;
                });
              });
            }
          }
          
          if (boundsSet && !bounds.isEmpty()) {
            map.current.fitBounds(bounds, { 
              padding: 40,
              maxZoom: 10,
              duration: 1000
            });
          }
        } catch (error) {
          console.error('Error zooming to district:', error);
        }
      }
    });
  }, [aggregatedData, popupRef, updateTooltipContent, currentTooltipData]);

  // Update tooltip when metric changes if cursor is hovering over a district
  useEffect(() => {
    if (currentTooltipData && hoveredDistrictIdRef.current) {
      // Don't create a new popup, just update the HTML content
      const metricLabel = metricOptions.find(m => m.value === metricToShow)?.label || 'Nilai';
      const metricValue = currentTooltipData.districtData[metricToShow];
      
      popupRef.current.setHTML(`
        <div style="background-color: white; color: black; padding: 8px; border-radius: 4px; font-family: sans-serif;">
          <strong style="font-size: 14px;">${currentTooltipData.districtName}</strong><br/>
          <span style="font-size: 12px; margin-top: 4px; display: block;">
            <strong>${metricLabel}:</strong> ${metricValue !== undefined ? metricValue.toLocaleString() : 0}
          </span>
          <span style="font-size: 12px; display: block;">
            <strong>Jumlah Faskes:</strong> ${currentTooltipData.districtData.facility_count}
          </span>
        </div>
      `);
    }
  }, [metricToShow, currentTooltipData, popupRef, metricOptions]);

  // Update colors when metric changes
  useEffect(() => {
    if (map.current && mapLoaded && map.current.getLayer('district-fills')) {
      updateDistrictColors();
    }
  }, [metricToShow, mapLoaded]);

  // Update district fill colors
  const updateDistrictColors = useCallback(() => {
    if (!map.current || !mapLoaded || !map.current.getLayer('district-fills') || !geojsonData) return;
    
    try {
      
      
      // Determine property for district code
      let codeProperty = 'ADM3_PCODE';
      if (geojsonData.features.length > 0) {
        const props = geojsonData.features[0].properties;
        if (!props.hasOwnProperty('ADM3_PCODE')) {
          if (props.hasOwnProperty('id')) {
            codeProperty = 'id';
          } else if (props.hasOwnProperty('kode_kecamatan')) {
            codeProperty = 'kode_kecamatan';
          }
        }
      }
      
      map.current.setPaintProperty(
        'district-fills',
        'fill-color',
        [
          'match',
          ['get', codeProperty],
          ...aggregatedData.flatMap(s => {
            // Include both with and without "ID" prefix
            return [
              s.district, // Raw code
              getColorForValue(s[metricToShow] || 0, getMaxValue()),
              `ID${s.district}`, // With "ID" prefix
              getColorForValue(s[metricToShow] || 0, getMaxValue())
            ];
          }),
          '#CCCCCC' // Default color
        ]
      );
    } catch (error) {
      console.error('Error updating district colors:', error);
    }
  }, [geojsonData, aggregatedData, metricToShow, getMaxValue, mapLoaded]);

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

export default DistrictMap;