import { Button, Collapse, Group, Paper, Text } from '@mantine/core';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import mapboxgl, { Map as MapboxMap, Popup } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import React, { useEffect, useRef, useState } from 'react';
import { RawData } from '../../@types/dashboard';

mapboxgl.accessToken = 'pk.eyJ1IjoiZmF1emFuZmFsZHkiLCJhIjoiY20yYmF0MG94MG1oYjJrcXhkMWo4dGh4eCJ9.X0AVMmOyRm1Q8ObMiqL7VA'; // Replace with your Mapbox token

interface MapVisualizationProps {
  data: RawData[];
  predictedMonthYear:string; // Array of data points with lat, lng, value, and location name
}

const MapVisualization: React.FC<MapVisualizationProps> = ({ data,predictedMonthYear }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<MapboxMap | null>(null);
  const popupRef = useRef(new Popup({ closeButton: false, closeOnClick: false }));
  const [tableOpen, setTableOpen] = useState(true); // State for table visibility

  const [, setHoveredFeature] = useState<{ lat: number; lon: number; tot_pos: number; nama_faskes: string } | null>(null);

  useEffect(() => {
    if (mapContainer.current && data.length > 0) {
      if (!map.current) {
        // Initialize Mapbox map
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v11',
          center: [data[0].lon, data[0].lat], // Center on the first point
          zoom: 8,
        });
      }

      map.current.on('load', () => {
        const geojsonData:GeoJSON.FeatureCollection = {
          type: 'FeatureCollection',
          features: data.map((point) => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [point.lon, point.lat],
            },
            properties: {
              tot_pos: point.tot_pos,
              nama_faskes: point.nama_faskes,
            },
          })),
        };

        if (!map.current?.getSource('points-data')) {
          map.current?.addSource('points-data', {
            type: 'geojson',
            data: geojsonData,
          });

          // Add a circle layer to render points
          map.current?.addLayer({
            id: 'points-layer',
            type: 'circle',
            source: 'points-data',
            paint: {
              // Circle radius based on tot_pos value
              'circle-radius': [
                'interpolate',
                ['linear'],
                ['get', 'tot_pos'],
                0, 5,         // Base size for 0 values
                10, 8,        // Medium size
                50, 12,       // Larger
                100, 16,      // Even larger
                200, 20       // Maximum size
              ],
              // Circle color based on tot_pos value
              'circle-color': [
                'case',
                ['==', ['get', 'tot_pos'], 0],
                '#000000',    // Black for 0 values
                [
                  'interpolate',
                  ['linear'],
                  ['get', 'tot_pos'],
                  1, '#fee5d9',     // Very light red for low values
                  10, '#fcbba1',    // Light red
                  50, '#fc9272',    // Medium-light red
                  100, '#fb6a4a',   // Medium red
                  150, '#ef3b2c',   // Medium-dark red
                  200, '#cb181d',   // Dark red
                  300, '#a50f15',   // Very dark red
                  500, '#67000d'    // Extremely dark red
                ]
              ],
              'circle-opacity': 0.8,
              // Add outline to make points more visible
              'circle-stroke-width': 1,
              'circle-stroke-color': [
                'case',
                ['==', ['get', 'tot_pos'], 0],
                '#555555',    // Dark gray stroke for black dots
                '#ffffff'     // White stroke for colored dots
              ]
            }
          });

        // Add mousemove and mouseleave events for tooltips
        map.current?.on('mousemove', 'points-layer', (e) => {
            if (e.features && e.features.length > 0) {
            const feature = e.features[0];
        
            // Ensure geometry is a Point before accessing coordinates
            if (feature.geometry.type === 'Point') {
                const coordinates = feature.geometry.coordinates;
                const properties = feature.properties;
        
                if (properties) {
                setHoveredFeature({
                    lat: coordinates[1],
                    lon: coordinates[0],
                    tot_pos: properties.tot_pos,
                    nama_faskes: properties.nama_faskes,
                });
        
                popupRef.current
                .setLngLat([coordinates[0], coordinates[1]])
                .setHTML(`
                  <div style="background-color: white; color: black; padding: 8px; border-radius: 4px; font-family: sans-serif;">
                    <strong style="font-size: 14px;">${properties.nama_faskes}</strong><br/>
                    <span style="font-size: 12px; margin-top: 4px; display: block;">
                      <strong>Jumlah Kasus:</strong> ${properties.tot_pos} 
                      ${properties.tot_pos === 0 ? '(Tidak ada kasus)' : ''}
                    </span>
                  </div>
                `);
                if (map.current) {
                    popupRef.current.addTo(map.current); // Ensures map.current is not null before using it
                }
                }
            }
            }
        });
  
          map.current?.on('mouseleave', 'points-layer', () => {
            popupRef.current.remove(); // Remove tooltip on mouse leave
            setHoveredFeature(null);
          });
        }
      });
    }

    // Update the map data when input data changes
    if (map.current && data.length > 0) {
      const geojsonData :GeoJSON.FeatureCollection =  {
        type: 'FeatureCollection',
        features: data.map((point) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [point.lon, point.lat],
          },
          properties: {
            tot_pos: point.tot_pos,
            nama_faskes: point.nama_faskes,
          },
        })),
      };

      const source = map.current.getSource('points-data') as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData(geojsonData);
      }

      // Fit the map bounds to the new data
      const bounds = new mapboxgl.LngLatBounds();
      data.forEach((point) => {
        bounds.extend([point.lon, point.lat]);
      });

      if (!bounds.isEmpty()) {
        map.current.fitBounds(bounds, { padding: 20 });
      }
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [data]);

  return (
  <>
  <Paper  withBorder p="md" radius="md">
    <Group justify="space-between" align="flex-end" gap={0} mb="md">
        <Text fz="xl" fw={700}>Sebaran Prediksi Total Kasus Malaria Berdasarkan Faskes, {predictedMonthYear}</Text>
        <Button variant="subtle" onClick={() => setTableOpen((prev) => !prev)}>
          {tableOpen ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
        </Button>
    </Group>
    <Collapse in={tableOpen}>
        <div ref={mapContainer} style={{ width: '100%', height: '500px' }} />
    </Collapse>
  </Paper>
  </>
  )
};

export default MapVisualization;
