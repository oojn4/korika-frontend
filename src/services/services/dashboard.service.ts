import { AggregateDataResponse, ProvincesResponse, RawDataResponse } from "../../@types/dashboard";
import appConfig from "../../configs/app.config";
import ApiService from "../ApiService";

const baseUrl = `${appConfig.backendApiUrl}`;

export const DashboardService = { 
  async indexAggregateData(province : string,year : string, month: string): Promise<AggregateDataResponse> {
    const res = await ApiService.fetchData<undefined, AggregateDataResponse>({
      url: `${baseUrl}/get-aggregate-data?province=${province}&year=${year}&month=${month}`,
      method: 'GET',
    })
    return res.data;
  },
  async indexRawData(province : string | null): Promise<RawDataResponse> {
    const res = await ApiService.fetchData<undefined, RawDataResponse>({
      url: `${baseUrl}/get-raw-data?province=${province}`,
      headers: { 'Content-Type': 'application/json' },
      method: 'GET',
    })
    return res.data;
  },
  async fetchProvinces(): Promise<ProvincesResponse> {
    const res = await ApiService.fetchData<undefined, ProvincesResponse>({
      url: `${baseUrl}/get-provinces`,
      method: 'GET',
    })
    return res.data;
  },
}