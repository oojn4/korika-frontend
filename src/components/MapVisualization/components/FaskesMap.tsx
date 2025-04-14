// src/components/MapVisualization/components/FaskesMap.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl, { Map as MapboxMap, Popup, LngLatBounds } from 'mapbox-gl';
import { RawData } from '../../../@types/dashboard';
import { metricOptions } from '../utils/mapUtils';

interface FaskesMapProps {
  data: RawData[];
  metricToShow: string;
  isActive: boolean;
  popupRef: React.MutableRefObject<Popup>;
}

const FaskesMap: React.FC<FaskesMapProps> = ({ data, metricToShow, isActive, popupRef }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<MapboxMap | null>(null);
  const prevDataLength = useRef<number>(0);
  const dataRef = useRef(data); // Referensi untuk data saat ini
  const [mapLoaded, setMapLoaded] = useState(false);

  // Fungsi untuk membuat data GeoJSON
  const createGeoJsonData = useCallback(() => {
    return {
      type: 'FeatureCollection',
      features: data.filter(point => point.lon && point.lat && !isNaN(point.lon) && !isNaN(point.lat)).map((point) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [point.lon, point.lat],
        },
        properties: {
          id: point.id_faskes,
          value: point[metricToShow] || 0,
          nama_faskes: point.nama_faskes,
          metric_name: metricOptions.find(m => m.value === metricToShow)?.label || 'Nilai'
        },
      })),
    } as GeoJSON.FeatureCollection;
  }, [data, metricToShow]);

  // Fungsi untuk menyesuaikan peta ke batas data
  const fitMapToBounds = useCallback(() => {
    if (!map.current || data.length === 0) return;

    const bounds = new LngLatBounds();
    let validPointsFound = false;
    
    data.forEach((point) => {
      if (point.lon && point.lat && !isNaN(point.lon) && !isNaN(point.lat)) {
        bounds.extend([point.lon, point.lat]);
        validPointsFound = true;
      }
    });

    if (validPointsFound && !bounds.isEmpty()) {
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 12,
        duration: 800
      });
    }
  }, [data]);

  // Fungsi untuk memperbarui sumber data peta
  const updateMapSource = useCallback(() => {
    if (!map.current || !mapLoaded) return;
    
    try {
      const geojsonData = createGeoJsonData();
      
      if (map.current.getSource('points-data')) {
        const source = map.current.getSource('points-data') as mapboxgl.GeoJSONSource;
        if (source) {
          source.setData(geojsonData);
          
          
          // Sesuaikan batas peta jika data berubah signifikan
          if (Math.abs(data.length - prevDataLength.current) > 3) {
            fitMapToBounds();
            prevDataLength.current = data.length;
          }
        }
      } else if (mapLoaded) {
        // Jika sumber belum ada tapi peta sudah dimuat, buat sumber baru
        
        initializeMapLayers();
      }
    } catch (error) {
      console.error('Error updating map source:', error);
    }
  }, [mapLoaded, createGeoJsonData, data, fitMapToBounds]);

  // Inisialisasi layer peta
  const initializeMapLayers = useCallback(() => {
    if (!map.current || !mapLoaded) return;
    
    try {
      const geojsonData = createGeoJsonData();
      
      // Tambahkan sumber data
      map.current.addSource('points-data', {
        type: 'geojson',
        data: geojsonData,
      });

      // Tambahkan layer untuk titik
      map.current.addLayer({
        id: 'points-layer',
        type: 'circle',
        source: 'points-data',
        paint: {
          // Radius lingkaran berdasarkan nilai metrik
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['get', 'value'],
            0, 5,
            10, 8,
            50, 12,
            100, 16,
            200, 20
          ],
          // Warna lingkaran berdasarkan nilai metrik
          'circle-color': [
            'case',
            ['==', ['get', 'value'], 0],
            '#000000',
            [
              'interpolate',
              ['linear'],
              ['get', 'value'],
              1, '#fee5d9',
              10, '#fcbba1',
              50, '#fc9272',
              100, '#fb6a4a',
              150, '#ef3b2c',
              200, '#cb181d',
              300, '#a50f15',
              500, '#67000d'
            ]
          ],
          'circle-opacity': 0.8,
          'circle-stroke-width': 1,
          'circle-stroke-color': [
            'case',
            ['==', ['get', 'value'], 0],
            '#555555',
            '#ffffff'
          ]
        }
      });

      // Tambahkan interaksi hover
      map.current.on('mousemove', 'points-layer', (e) => {
        if (e.features && e.features.length > 0) {
          map.current!.getCanvas().style.cursor = 'pointer';
          
          const feature = e.features[0];
          if (feature.geometry.type === 'Point') {
            const coordinates = feature.geometry.coordinates.slice() as [number, number];
            const properties = feature.properties;
            
            popupRef.current
              .setLngLat(coordinates)
              .setHTML(`
                <div style="background-color: white; color: black; padding: 8px; border-radius: 4px; font-family: sans-serif;">
                  <strong style="font-size: 14px;">${properties?.nama_faskes}</strong><br/>
                  <span style="font-size: 12px; margin-top: 4px; display: block;">
                    <strong>${properties?.metric_name}:</strong> ${properties?.value.toLocaleString()} 
                    ${properties?.value === 0 ? '(Tidak ada kasus)' : ''}
                  </span>
                </div>
              `);
            
            popupRef.current.addTo(map.current!);
          }
        }
      });
      
      map.current.on('mouseleave', 'points-layer', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = '';
        }
        popupRef.current.remove();
      });

      // Tambahkan fitur klik untuk zoom in
      map.current.on('click', 'points-layer', (e) => {
        if (e.features && e.features.length > 0 && map.current) {
          const feature = e.features[0];
          if (feature.geometry.type === 'Point') {
            const coordinates = feature.geometry.coordinates.slice() as [number, number];
            
            map.current.flyTo({
              center: coordinates,
              zoom: Math.min(14, map.current.getZoom() + 2),
              duration: 1000
            });
          }
        }
      });

      // Sesuaikan batas peta ke data saat pertama kali
      fitMapToBounds();
      
      
    } catch (error) {
      console.error('Error initializing map layers:', error);
    }
  }, [mapLoaded, createGeoJsonData, fitMapToBounds, popupRef]);

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

      // Tambahkan kontrol navigasi
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Setelah peta dimuat
      map.current.on('load', () => {
        
        setMapLoaded(true);
      });
    }
    
    // Cleanup function
    return () => {
      // Don't remove the map here
    };
  }, [isActive]);

  // Effect untuk mendeteksi perubahan data
  useEffect(() => {
    if (JSON.stringify(data) !== JSON.stringify(dataRef.current)) {
      
      dataRef.current = data;
      
      // Pembaruan sumber data jika peta sudah dimuat
      if (mapLoaded) {
        updateMapSource();
      }
    }
  }, [data, mapLoaded, updateMapSource]);

  // Effect untuk mendeteksi perubahan metrik
  useEffect(() => {
    if (mapLoaded) {
      updateMapSource();
    }
  }, [metricToShow, mapLoaded, updateMapSource]);

  // Inisialisasi layer setelah peta dimuat
  useEffect(() => {
    if (mapLoaded && map.current && !map.current.getSource('points-data')) {
      initializeMapLayers();
    }
  }, [mapLoaded, initializeMapLayers]);

  // Pastikan titik muncul ketika tab menjadi aktif
  useEffect(() => {
    if (isActive && mapLoaded) {
      // Tunggu sebentar untuk memastikan peta sudah benar-benar tersedia
      const timer = setTimeout(() => {
        updateMapSource();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isActive, mapLoaded, updateMapSource]);

  return (
    <div 
      ref={mapContainer} 
      style={{ 
        width: '100%', 
        height: '500px',
        borderRadius: '4px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }} 
    />
  );
};

export default FaskesMap;