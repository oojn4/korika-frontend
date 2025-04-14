// src/components/MapVisualization/hooks/useDataAggregation.ts
import { useState, useEffect } from 'react';
import _ from 'lodash';
import { RawData } from '../../../@types/dashboard';

export interface AggregatedGeoData {
  province: string;
  city?: string;
  district?: string;
  [key: string]: any;
  facility_count: number;
}

export default function useDataAggregation(data: RawData[]) {
  const [aggregatedProvinceData, setAggregatedProvinceData] = useState<AggregatedGeoData[]>([]);
  const [aggregatedCityData, setAggregatedCityData] = useState<AggregatedGeoData[]>([]);
  const [aggregatedDistrictData, setAggregatedDistrictData] = useState<AggregatedGeoData[]>([]);
  
  // Aggregate data by geographic levels
  useEffect(() => {
    if (data && data.length > 0) {
      // Aggregate by province
      const provinceGroups = _.groupBy(data, 'kd_prov');
      const provinceData = Object.keys(provinceGroups).map(province => {
        const facilities = provinceGroups[province];
        const aggregated = aggregateMetrics(facilities);
        return {
          province,
          ...aggregated,
          facility_count: facilities.length
        };
      });
      setAggregatedProvinceData(provinceData);
      // Aggregate by district (kab/kota)
      const cityGroups = _.groupBy(data, (item: { kd_prov: any; kd_kab: any; }) => `${item.kd_prov}-${item.kd_kab}`);
      const cityData = Object.keys(cityGroups).map(key => {
        const facilities = cityGroups[key];
        const [province, city] = key.split('-');
        const aggregated = aggregateMetrics(facilities);
        return {
          province,
          city,
          ...aggregated,
          facility_count: facilities.length
        };
      });
      setAggregatedCityData(cityData);

      // Aggregate by subdistrict (kecamatan)
      const districtGroups = _.groupBy(data, (item: { kd_prov: any; kd_kab: any; kd_kec: any; }) => `${item.kd_prov}-${item.kd_kab}-${item.kd_kec}`);
      const districtData = Object.keys(districtGroups).map(key => {
        const facilities = districtGroups[key];
        const [province, city, district] = key.split('-');
        const aggregated = aggregateMetrics(facilities);
        return {
          province,
          city,
          district,
          ...aggregated,
          facility_count: facilities.length
        };
      });
      setAggregatedDistrictData(districtData);
    }
  }, [data]);

  // Helper function to aggregate metrics
  const aggregateMetrics = (facilities: RawData[]) => {
    const metrics = ['tot_pos', 'konfirmasi_lab_mikroskop', 'konfirmasi_lab_rdt', 'konfirmasi_lab_pcr', 
      'pos_0_4', 'pos_5_14', 'pos_15_64', 'pos_diatas_64', 'hamil_pos', 'kematian_malaria',
      'p_pf', 'p_pv', 'p_po', 'p_pm', 'p_pk', 'p_mix', 'p_suspek_pk',
      'obat_standar', 'obat_nonprogram', 'obat_primaquin',
      'penularan_indigenus', 'penularan_impor', 'penularan_induced', 'relaps'];
    
    const result: Record<string, number> = {};
    
    metrics.forEach(metric => {
      result[metric] = _.sumBy(facilities, (facility: { [x: string]: any; }) => {
        return facility[metric] || 0;
      });
    });
    
    return result;
  };

  return {
    aggregatedProvinceData,
    aggregatedDistrictData,
    aggregatedCityData
  };
}