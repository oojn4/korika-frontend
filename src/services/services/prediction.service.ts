import appConfig from "../../configs/app.config";
import ApiService from "../ApiService";

// Define response types
export interface Facility {
  id_faskes: number;
  nama_faskes: string;
  tipe_faskes: string;
  provinsi: string;
  kabupaten: string;
  kecamatan: string;
}

export interface FacilitiesResponse {
  success: boolean;
  facilities: Facility[];
}

export interface Prediction {
  date: string;
  tahun: number;
  bulan: number;
  id_faskes: number;
  konfirmasi_lab_pcr: number;
  konfirmasi_lab_mikroskop: number;
  konfirmasi_lab_rdt: number;
  total_konfirmasi_lab: number;
  tot_pos: number;
  pos_5_14: number;
  pos_15_64: number;
  pos_diatas_64: number;
  kematian_malaria: number;
  hamil_pos: number;
  obat_standar: number;
  obat_nonprogram: number;
  obat_primaquin: number;
  p_pf: number;
  p_pv: number;
  p_po: number;
  p_pm: number;
  p_pk: number;
  p_mix: number;
  p_suspek_pk: number;
  kasus_pe: number;
  penularan_indigenus: number;
  penularan_impor: number;
  penularan_induced: number;
  relaps: number;
}

export interface PredictionResponse {
  success: boolean;
  facility_id: number;
  predictions: Prediction[];
  plot_url: string;
  filename: string;
}

export interface TrainModelResponse {
  success: boolean;
  message: string;
}

export interface PredictAllResponse {
  success: boolean;
  total_facilities: number;
  successful_predictions: number;
  failed_predictions: number;
  failed_facilities: number[];
  summary_filename: string;
  predictions: Prediction[];
  message?: string;
}

const baseUrl = `${appConfig.backendApiUrl}`;

export const PredictionService = {
  // Fetch facilities based on province and kabupaten
  async fetchFacilities(province?: string, kabupaten?: string): Promise<FacilitiesResponse> {
    let url = `${baseUrl}/get-facilities`;
    const params: string[] = [];
    
    if (province) {
      params.push(`province=${encodeURIComponent(province)}`);
    }
    
    if (kabupaten) {
      params.push(`kabupaten=${encodeURIComponent(kabupaten)}`);
    }
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    const res = await ApiService.fetchData<undefined, FacilitiesResponse>({
      url,
      method: 'GET',
    });
    
    return res.data;
  },
  
  // Make prediction for a facility
  async makePrediction(facilityId: number): Promise<PredictionResponse> {
    const res = await ApiService.fetchData<{ facility_id: number }, PredictionResponse>({
      url: `${baseUrl}/predict`,
      method: 'POST',
      data: { facility_id: facilityId },
    });
    
    return res.data;
  },
  
  // Predict all facilities
  async predictAllFacilities(): Promise<PredictAllResponse> {
    const res = await ApiService.fetchData<undefined, PredictAllResponse>({
      url: `${baseUrl}/predict-all`,
      method: 'POST',
    });
    
    return res.data;
  },
  
  // Train the model
  async trainModel(): Promise<TrainModelResponse> {
    const res = await ApiService.fetchData<undefined, TrainModelResponse>({
      url: `${baseUrl}/train-model`,
      method: 'POST',
    });
    
    return res.data;
  },
  
  // Download prediction file
  async downloadPrediction(filename: string): Promise<Blob> {
    const res = await ApiService.fetchData<undefined, Blob>({
      url: `${baseUrl}/download-prediction/${filename}`,
      method: 'GET',
      responseType: 'blob',
    });
    
    return res.data;
  }
};