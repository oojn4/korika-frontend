import { AggregateDataResponse, EarlyWarningSystemMalariaResponse, RawDataResponse, RegionResponse } from "../../@types/dashboard";
import appConfig from "../../configs/app.config";
import ApiService from "../ApiService";

const baseUrl = `${appConfig.backendApiUrl}`;

export const DashboardService = { 
  async indexAggregateDataMalaria(province : string, city: string,district: string, start_month_year : string, end_month_year: string): Promise<AggregateDataResponse> {
    const res = await ApiService.fetchData<undefined, AggregateDataResponse>({
      url: `${baseUrl}/get-aggregate-data-malaria?province=${province}&city=${city}&district=${district}&start=${start_month_year}&end=${end_month_year}`,
      method: 'GET',
    })
    console.log(res.data);
    return res.data;
  },
  async indexRawDataMalaria(province : string, city: string,district: string, month_year : string, status: string): Promise<RawDataResponse> {
    const res = await ApiService.fetchData<undefined, RawDataResponse>({
      url: `${baseUrl}/get-raw-data-malaria?province=${province}&city=${city}&district=${district}&month_year=${month_year}&status=${status}`,
      headers: { 'Content-Type': 'application/json' },
      method: 'GET',
    })
    return res.data;
  },
  async indexWarningMalaria(): Promise<EarlyWarningSystemMalariaResponse> {
    const res = await ApiService.fetchData<undefined, EarlyWarningSystemMalariaResponse>({
      url: `${baseUrl}/get-warning-malaria`,
      method: 'GET',
    })
    return res.data;
  },
  async fetchProvinces(): Promise<RegionResponse> {
    const res = await ApiService.fetchData<undefined, RegionResponse>({
      url: `${baseUrl}/get-provinces`,
      method: 'GET',
    })
    return res.data;
  },
  async fetchCities(province : string): Promise<RegionResponse> {
    const res = await ApiService.fetchData<undefined, RegionResponse>({
      url: `${baseUrl}/get-cities?province=${province}`,
      method: 'GET',
    })
    return res.data;
  },
  async fetchDistricts(city : string): Promise<RegionResponse> {
    const res = await ApiService.fetchData<undefined, RegionResponse>({
      url: `${baseUrl}/get-districts?city=${city}`,
      method: 'GET',
    })
    return res.data;
  },
  // New method for DBD aggregate data based on backend implementation
  async indexAggregateDataDBD(
    province: string, 
    city?: string, 
    start_month_year?: string, 
    end_month_year?: string
  ): Promise<any> {
    let url = `${baseUrl}/get-aggregate-data-dbd?province=${province}`;
    
    if (city) {
      url += `&city=${city}`;
    }
    
    if (start_month_year && end_month_year) {
      url += `&start=${start_month_year}&end=${end_month_year}`;
    }
    
    const res = await ApiService.fetchData<undefined, any>({
      url: url,
      method: 'GET',
    });
    
    return res.data;
  },
  
  // New method for DBD raw data based on backend implementation
  async indexRawDataDBD(
    province?: string, 
    city?: string, 
    month_year?: string
  ): Promise<any> {
    let url = `${baseUrl}/get-raw-data-dbd`;
    const params = [];
    
    if (province) {
      params.push(`province=${province}`);
    }
    
    if (city) {
      params.push(`city=${city}`);
    }
    
    if (month_year) {
      params.push(`month_year=${month_year}`);
    }
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    const res = await ApiService.fetchData<undefined, any>({
      url: url,
      headers: { 'Content-Type': 'application/json' },
      method: 'GET',
    });
    
    return res.data;
  },
  // New method for DBD aggregate data based on backend implementation
  async indexAggregateDataLepto(
    province: string, 
    city?: string, 
    start_month_year?: string, 
    end_month_year?: string
  ): Promise<any> {
    let url = `${baseUrl}/get-aggregate-data-lepto?province=${province}`;
    
    if (city) {
      url += `&city=${city}`;
    }
    
    if (start_month_year && end_month_year) {
      url += `&start=${start_month_year}&end=${end_month_year}`;
    }
    
    const res = await ApiService.fetchData<undefined, any>({
      url: url,
      method: 'GET',
    });
    
    return res.data;
  },
  
  // New method for Lepto raw data based on backend implementation
  async indexRawDataLepto(
    province?: string, 
    city?: string, 
    month_year?: string
  ): Promise<any> {
    let url = `${baseUrl}/get-raw-data-lepto`;
    const params = [];
    
    if (province) {
      params.push(`province=${province}`);
    }
    
    if (city) {
      params.push(`city=${city}`);
    }
    
    if (month_year) {
      params.push(`month_year=${month_year}`);
    }
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    const res = await ApiService.fetchData<undefined, any>({
      url: url,
      headers: { 'Content-Type': 'application/json' },
      method: 'GET',
    });
    
    return res.data;
  },
}