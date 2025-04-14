// src/components/MapVisualization/utils/mapUtils.ts

/**
 * Calculate color based on value relative to max in the dataset
 */
export const getColorForValue = (value: number, max: number) => {
    if (value === 0) return '#000000';
    
    const colorSteps = [
      '#fee5d9', // Very light red
      '#fcbba1', // Light red
      '#fc9272', // Medium-light red
      '#fb6a4a', // Medium red
      '#ef3b2c', // Medium-dark red
      '#cb181d', // Dark red
      '#a50f15', // Very dark red
      '#67000d'  // Extremely dark red
    ];
    
    const index = Math.min(
      colorSteps.length - 1,
      Math.floor((value / max) * colorSteps.length)
    );
    
    return colorSteps[index];
  };
  
  // Available metrics for visualization
  export const metricOptions = [
    { value: 'tot_pos', label: 'Total Kasus Positif' },
    { value: 'konfirmasi_lab_mikroskop', label: 'Konfirmasi Mikroskop' },
    { value: 'konfirmasi_lab_rdt', label: 'Konfirmasi RDT' },
    { value: 'konfirmasi_lab_pcr', label: 'Konfirmasi PCR' },
    { value: 'pos_0_4', label: 'Kasus Usia 0-4' },
    { value: 'pos_5_14', label: 'Kasus Usia 5-14' },
    { value: 'pos_15_64', label: 'Kasus Usia 15-64' },
    { value: 'pos_diatas_64', label: 'Kasus Usia >64' },
    { value: 'hamil_pos', label: 'Kasus Ibu Hamil' },
    { value: 'kematian_malaria', label: 'Kematian Malaria' }
  ];
  
  // GeoJSON URLs
  export const geoJsonUrls = {
    province: '/prov_edited.geojson',
    city: '/kab_edited.geojson',
    district: '/kec_edited.geojson'
  };
  
  // Color scale for legend
  export const colorSteps = [
    '#000000', // Black for 0 values
    '#fee5d9', // Very light red
    '#fcbba1', // Light red
    '#fc9272', // Medium-light red
    '#fb6a4a', // Medium red
    '#ef3b2c', // Medium-dark red
    '#cb181d', // Dark red
    '#a50f15', // Very dark red
    '#67000d'  // Extremely dark red
  ];
  
  export const legendSteps = [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];