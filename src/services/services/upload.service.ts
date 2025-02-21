import appConfig from "../../configs/app.config";
import ApiService from "../ApiService";

const baseUrl = `${appConfig.backendApiUrl}`;
// Define the upload result type from the API
export interface UploadResult {
  health_facility_added: number;
  health_facility_existed: number;
  malaria_data_added: number;
  malaria_data_updated: number;
  errors: string[];
}

export interface UploadResponse {
  message: string;
  result: UploadResult;
}

// Interface for malaria data row
export interface MalariaDataRow {
  id_faskes: string;
  bulan: number;
  tahun: number;
  provinsi: string;
  kabupaten: string;
  kecamatan: string;
  nama_faskes?: string;
  owner?: string;
  tipe_faskes?: string;
  address?: string;
  url?: string;
  lat?: number;
  lon?: number;
  [key: string]: any; // For other malaria-specific fields
}

export const UploadService = { 
   // Upload malaria data
   async uploadMalariaData(data: MalariaDataRow[]): Promise<UploadResponse> {
    const res = await ApiService.fetchData<{ data: MalariaDataRow[] }, UploadResponse>({
      url: `${baseUrl}/upload`,
      method: 'POST',
      data: { data }
    });
    return res.data;
  },
}