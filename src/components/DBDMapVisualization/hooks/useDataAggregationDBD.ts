// src/components/MapVisualization/hooks/useDataAggregationDBD.ts
import { useMemo } from 'react';
import { DBDRawDataItem } from '../../../@types/dashboard';

const useDataAggregationDBD = (data: DBDRawDataItem[]) => {
  // Aggregate data by province
  const aggregatedProvinceData = useMemo(() => {
    const provinceMap = new Map();
    
    data.forEach(item => {
      if (!item.province || !item.kd_prov) return;
      
      const key = item.kd_prov;
      if (!provinceMap.has(key)) {
        provinceMap.set(key, {
          kd_prov: item.kd_prov,
          province: item.province,
          dbd_p: 0,
          dbd_m: 0,
          dbd_p_m_to_m_change: null,
          dbd_m_m_to_m_change: null,
          dbd_p_y_on_y_change: null,
          dbd_m_y_on_y_change: null,
          count: 0
        });
      }
      
      const provinceData = provinceMap.get(key);
      provinceData.dbd_p += item.dbd_p || 0;
      provinceData.dbd_m += item.dbd_m || 0;
      
      // For change metrics, use weighted average
      if (item.dbd_p_m_to_m_change !== null && item.dbd_p !== null && item.dbd_p > 0) {
        provinceData.dbd_p_m_to_m_change = 
          (provinceData.dbd_p_m_to_m_change || 0) * provinceData.count + (item.dbd_p_m_to_m_change || 0);
        provinceData.dbd_p_m_to_m_change /= (provinceData.count + 1);
      }
      
      if (item.dbd_m_m_to_m_change !== null && item.dbd_m !== null && item.dbd_m > 0) {
        provinceData.dbd_m_m_to_m_change = 
          (provinceData.dbd_m_m_to_m_change || 0) * provinceData.count + (item.dbd_m_m_to_m_change || 0);
        provinceData.dbd_m_m_to_m_change /= (provinceData.count + 1);
      }
      
      if (item.dbd_p_y_on_y_change !== null && item.dbd_p !== null && item.dbd_p > 0) {
        provinceData.dbd_p_y_on_y_change = 
          (provinceData.dbd_p_y_on_y_change || 0) * provinceData.count + (item.dbd_p_y_on_y_change || 0);
        provinceData.dbd_p_y_on_y_change /= (provinceData.count + 1);
      }
      
      if (item.dbd_m_y_on_y_change !== null && item.dbd_m !== null && item.dbd_m > 0) {
        provinceData.dbd_m_y_on_y_change = 
          (provinceData.dbd_m_y_on_y_change || 0) * provinceData.count + (item.dbd_m_y_on_y_change || 0);
        provinceData.dbd_m_y_on_y_change /= (provinceData.count + 1);
      }
      
      provinceData.count += 1;
    });
    
    return Array.from(provinceMap.values());
  }, [data]);
  
  // Aggregate data by city
  const aggregatedCityData = useMemo(() => {
    const cityMap = new Map();
    
    data.forEach(item => {
      if (!item.city || !item.kd_kab) return;
      
      const key = item.kd_kab;
      if (!cityMap.has(key)) {
        cityMap.set(key, {
          kd_prov: item.kd_prov,
          kd_kab: item.kd_kab,
          province: item.province,
          city: item.city,
          dbd_p: 0,
          dbd_m: 0,
          dbd_p_m_to_m_change: null,
          dbd_m_m_to_m_change: null,
          dbd_p_y_on_y_change: null,
          dbd_m_y_on_y_change: null,
          count: 0
        });
      }
      
      const cityData = cityMap.get(key);
      cityData.dbd_p += item.dbd_p || 0;
      cityData.dbd_m += item.dbd_m || 0;
      
      // For change metrics, use weighted average
      if (item.dbd_p_m_to_m_change !== null && item.dbd_p !== null && item.dbd_p > 0) {
        cityData.dbd_p_m_to_m_change = 
          (cityData.dbd_p_m_to_m_change || 0) * cityData.count + (item.dbd_p_m_to_m_change || 0);
        cityData.dbd_p_m_to_m_change /= (cityData.count + 1);
      }
      
      if (item.dbd_m_m_to_m_change !== null && item.dbd_m !== null && item.dbd_m > 0) {
        cityData.dbd_m_m_to_m_change = 
          (cityData.dbd_m_m_to_m_change || 0) * cityData.count + (item.dbd_m_m_to_m_change || 0);
        cityData.dbd_m_m_to_m_change /= (cityData.count + 1);
      }
      
      if (item.dbd_p_y_on_y_change !== null && item.dbd_p !== null && item.dbd_p > 0) {
        cityData.dbd_p_y_on_y_change = 
          (cityData.dbd_p_y_on_y_change || 0) * cityData.count + (item.dbd_p_y_on_y_change || 0);
        cityData.dbd_p_y_on_y_change /= (cityData.count + 1);
      }
      
      if (item.dbd_m_y_on_y_change !== null && item.dbd_m !== null && item.dbd_m > 0) {
        cityData.dbd_m_y_on_y_change = 
          (cityData.dbd_m_y_on_y_change || 0) * cityData.count + (item.dbd_m_y_on_y_change || 0);
        cityData.dbd_m_y_on_y_change /= (cityData.count + 1);
      }
      
      cityData.count += 1;
    });
    
    return Array.from(cityMap.values());
  }, [data]);

  // Return aggregated data
  return {
    aggregatedProvinceData,
    aggregatedCityData
  };
};

export default useDataAggregationDBD;