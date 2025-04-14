// src/components/MapVisualization/hooks/useDataAggregationDBD.ts
import { useMemo } from 'react';
import {LeptoRawDataItem } from '../../../@types/dashboard';

const useDataAggregationLepto = (data: LeptoRawDataItem[]) => {
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
          lep_k: 0,
          lep_m: 0,
          lep_k_m_to_m_change: null,
          lep_m_m_to_m_change: null,
          lep_k_y_on_y_change: null,
          lep_m_y_on_y_change: null,
          count: 0
        });
      }
      
      const provinceData = provinceMap.get(key);
      provinceData.lep_k += item.lep_k || 0;
      provinceData.lep_m += item.lep_m || 0;
      
      // For change metrics, use weighted average
      if (item.lep_k_m_to_m_change !== null && item.lep_k !== null && item.lep_k > 0) {
        provinceData.lep_k_m_to_m_change = 
          (provinceData.lep_k_m_to_m_change || 0) * provinceData.count + (item.lep_k_m_to_m_change || 0);
        provinceData.lep_k_m_to_m_change /= (provinceData.count + 1);
      }
      
      if (item.lep_m_m_to_m_change !== null && item.lep_m !== null && item.lep_m > 0) {
        provinceData.lep_m_m_to_m_change = 
          (provinceData.lep_m_m_to_m_change || 0) * provinceData.count + (item.lep_m_m_to_m_change || 0);
        provinceData.lep_m_m_to_m_change /= (provinceData.count + 1);
      }
      
      if (item.lep_k_y_on_y_change !== null && item.lep_k !== null && item.lep_k > 0) {
        provinceData.lep_k_y_on_y_change = 
          (provinceData.lep_k_y_on_y_change || 0) * provinceData.count + (item.lep_k_y_on_y_change || 0);
        provinceData.lep_k_y_on_y_change /= (provinceData.count + 1);
      }
      
      if (item.lep_m_y_on_y_change !== null && item.lep_m !== null && item.lep_m > 0) {
        provinceData.lep_m_y_on_y_change = 
          (provinceData.lep_m_y_on_y_change || 0) * provinceData.count + (item.lep_m_y_on_y_change || 0);
        provinceData.lep_m_y_on_y_change /= (provinceData.count + 1);
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
          lep_k: 0,
          lep_m: 0,
          lep_k_m_to_m_change: null,
          lep_m_m_to_m_change: null,
          lep_k_y_on_y_change: null,
          lep_m_y_on_y_change: null,
          count: 0
        });
      }
      
      const cityData = cityMap.get(key);
      cityData.lep_k += item.lep_k || 0;
      cityData.lep_m += item.lep_m || 0;
      
      // For change metrics, use weighted average
      if (item.lep_k_m_to_m_change !== null && item.lep_k !== null && item.lep_k > 0) {
        cityData.lep_k_m_to_m_change = 
          (cityData.lep_k_m_to_m_change || 0) * cityData.count + (item.lep_k_m_to_m_change || 0);
        cityData.lep_k_m_to_m_change /= (cityData.count + 1);
      }
      
      if (item.lep_m_m_to_m_change !== null && item.lep_m !== null && item.lep_m > 0) {
        cityData.lep_m_m_to_m_change = 
          (cityData.lep_m_m_to_m_change || 0) * cityData.count + (item.lep_m_m_to_m_change || 0);
        cityData.lep_m_m_to_m_change /= (cityData.count + 1);
      }
      
      if (item.lep_k_y_on_y_change !== null && item.lep_k !== null && item.lep_k > 0) {
        cityData.lep_k_y_on_y_change = 
          (cityData.lep_k_y_on_y_change || 0) * cityData.count + (item.lep_k_y_on_y_change || 0);
        cityData.lep_k_y_on_y_change /= (cityData.count + 1);
      }
      
      if (item.lep_m_y_on_y_change !== null && item.lep_m !== null && item.lep_m > 0) {
        cityData.lep_m_y_on_y_change = 
          (cityData.lep_m_y_on_y_change || 0) * cityData.count + (item.lep_m_y_on_y_change || 0);
        cityData.lep_m_y_on_y_change /= (cityData.count + 1);
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

export default useDataAggregationLepto;