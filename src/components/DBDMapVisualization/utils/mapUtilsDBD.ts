// src/components/MapVisualization/utils/mapUtilsDBD.ts

// Metric options for DBD data
export const metricOptionsDBD = [
  { value: 'dbd_p', label: 'Kasus DBD' },
  { value: 'dbd_m', label: 'Kematian dengan DBD' },
  // { value: 'dbd_p_m_to_m_change', label: 'Perubahan Kasus M-to-M (%)' },
  // { value: 'dbd_m_m_to_m_change', label: 'Perubahan Kematian M-to-M (%)' },
  // { value: 'dbd_p_y_on_y_change', label: 'Perubahan Kasus Y-on-Y (%)' },
  // { value: 'dbd_m_y_on_y_change', label: 'Perubahan Kematian Y-on-Y (%)' }
];
export const geoJsonUrls = {
  province: '/prov_edited.geojson',
  city: '/kab_edited.geojson',
  district: '/kec_edited.geojson'
};

// Calculate color for a value based on metric
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


// Get radius size based on value (for point features)
export const getRadiusForDBDValue = (value: number, maxValue: number) => {
  if (!value) return 4;
  const normalizedValue = value / maxValue;
  return 4 + (normalizedValue * 16); // Min size 4px, max 20px
};

// Function to format values for display in popups
export const formatDBDValue = (value: number | null | undefined, metricToShow: string) => {
  if (value === null || value === undefined) return 'No data';
  
  if (metricToShow.includes('_change')) {
    // For percentage metrics
    return `${value.toFixed(2)}%`;
  }
  
  // For count metrics
  return value.toString();
};

// Generate legend items based on current metric and max value
export const generateDBDLegendItems = (maxValue: number, metricToShow: string) => {
  if (metricToShow.includes('_change')) {
    // For percentage metrics (both negative and positive)
    return [
      { color: '#1f874b', label: '< -50%' },
      { color: '#75d493', label: '-50% to -10%' },
      { color: '#d1f0da', label: '-10% to 0%' },
      { color: '#fee0d2', label: '0% to 10%' },
      { color: '#fc9272', label: '10% to 50%' },
      { color: '#ef3b2c', label: '> 50%' }
    ];
  }
  
  // For count metrics
  const step = maxValue / 5;
  return [
    { color: '#ffedea', label: `0 - ${Math.round(step)}` },
    { color: '#ffad9f', label: `${Math.round(step)} - ${Math.round(2 * step)}` },
    { color: '#ff8a75', label: `${Math.round(2 * step)} - ${Math.round(3 * step)}` },
    { color: '#e2492d', label: `${Math.round(3 * step)} - ${Math.round(4 * step)}` },
    { color: '#9a311f', label: `${Math.round(4 * step)} - ${Math.round(maxValue)}` }
  ];
};