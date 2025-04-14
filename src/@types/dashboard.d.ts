export interface AggregateData {
  [key: string]: number  | null | undefined; // Tambahkan index signature
  hamil_pos: number;
  hamil_pos_m_to_m_change?: number | null;
  hamil_pos_y_on_y_change?: number | null;
  kematian_malaria: number;
  kematian_malaria_m_to_m_change?: number | null;
  kematian_malaria_y_on_y_change?: number | null;
  konfirmasi_lab_mikroskop: number;
  konfirmasi_lab_mikroskop_m_to_m_change?: number | null;
  konfirmasi_lab_mikroskop_y_on_y_change?: number | null;
  konfirmasi_lab_pcr: number;
  konfirmasi_lab_pcr_m_to_m_change?: number | null;
  konfirmasi_lab_pcr_y_on_y_change?: number | null;
  konfirmasi_lab_rdt: number;
  konfirmasi_lab_rdt_m_to_m_change?: number | null;
  konfirmasi_lab_rdt_y_on_y_change?: number | null;
  month: number;
  obat_nonprogram: number;
  obat_nonprogram_m_to_m_change?: number | null;
  obat_nonprogram_y_on_y_change?: number | null;
  obat_primaquin: number;
  obat_primaquin_m_to_m_change?: number | null;
  obat_primaquin_y_on_y_change?: number | null;
  obat_standar: number;
  obat_standar_m_to_m_change?: number | null;
  obat_standar_y_on_y_change?: number | null;
  pos_0_4: number;
  pos_0_4_m_to_m_change?: number | null;
  pos_0_4_y_on_y_change?: number | null;
  pos_15_64: number;
  pos_15_64_m_to_m_change?: number | null;
  pos_15_64_y_on_y_change?: number | null;
  pos_5_14: number;
  pos_5_14_m_to_m_change?: number | null;
  pos_5_14_y_on_y_change?: number | null;
  pos_diatas_64: number;
  pos_diatas_64_m_to_m_change?: number | null;
  pos_diatas_64_y_on_y_change?: number | null;
  province: string;
  tot_pos: number;
  tot_pos_m_to_m_change?: number | null;
  tot_pos_y_on_y_change?: number | null;
  year: number;
}

export interface RawData {
  [key: string]: number  | null | undefined; // Tambahkan index signature
  province: string;
  city: string;
  district: string;
  kd_prov: string;
  kd_kab: string;
  kd_kec: string;
  hamil_pos: number;
  hamil_pos_m_to_m_change?: number | null;
  hamil_pos_y_on_y_change?: number | null;
  id_faskes: number;
  kematian_malaria: number;
  kematian_malaria_m_to_m_change?: number | null;
  kematian_malaria_y_on_y_change?: number | null;
  konfirmasi_lab_mikroskop: number;
  konfirmasi_lab_mikroskop_m_to_m_change?: number | null;
  konfirmasi_lab_mikroskop_y_on_y_change?: number | null;
  konfirmasi_lab_pcr: number;
  konfirmasi_lab_pcr_m_to_m_change?: number | null;
  konfirmasi_lab_pcr_y_on_y_change?: number | null;
  konfirmasi_lab_rdt: number;
  konfirmasi_lab_rdt_m_to_m_change?: number | null;
  konfirmasi_lab_rdt_y_on_y_change?: number | null;
  lat: number;
  lon: number;
  month: number;
  nama_faskes: string;
  obat_nonprogram: number;
  obat_nonprogram_m_to_m_change?: number | null;
  obat_nonprogram_y_on_y_change?: number | null;
  obat_primaquin: number;
  obat_primaquin_m_to_m_change?: number | null;
  obat_primaquin_y_on_y_change?: number | null;
  obat_standar: number;
  obat_standar_m_to_m_change?: number | null;
  obat_standar_y_on_y_change?: number | null;
  owner: string;
  p_mix: number;
  p_mix_m_to_m_change?: number | null;
  p_mix_y_on_y_change?: number | null;
  p_pf: number;
  p_pf_m_to_m_change?: number | null;
  p_pf_y_on_y_change?: number | null;
  p_pk: number;
  p_pk_m_to_m_change?: number | null;
  p_pk_y_on_y_change?: number | null;
  p_pm: number;
  p_pm_m_to_m_change?: number | null;
  p_pm_y_on_y_change?: number | null;
  p_po: number;
  p_po_m_to_m_change?: number | null;
  p_po_y_on_y_change?: number | null;
  p_pv: number;
  p_pv_m_to_m_change?: number | null;
  p_pv_y_on_y_change?: number | null;
  p_suspek_pk: number;
  p_suspek_pk_m_to_m_change?: number | null;
  p_suspek_pk_y_on_y_change?: number | null;
  penularan_impor: number;
  penularan_impor_m_to_m_change?: number | null;
  penularan_impor_y_on_y_change?: number | null;
  penularan_indigenus: number;
  penularan_indigenus_m_to_m_change?: number | null;
  penularan_indigenus_y_on_y_change?: number | null;
  penularan_induced: number;
  penularan_induced_m_to_m_change?: number | null;
  penularan_induced_y_on_y_change?: number | null;
  pos_0_1_f: number;
  pos_0_1_f_m_to_m_change?: number | null;
  pos_0_1_f_y_on_y_change?: number | null;
  pos_0_1_m: number;
  pos_0_1_m_m_to_m_change?: number | null;
  pos_0_1_m_y_on_y_change?: number | null;
  pos_10_14_f: number;
  pos_10_14_f_m_to_m_change?: number | null;
  pos_10_14_f_y_on_y_change?: number | null;
  pos_10_14_m: number;
  pos_10_14_m_m_to_m_change?: number | null;
  pos_10_14_m_y_on_y_change?: number | null;
  pos_15_64_f: number;
  pos_15_64_f_m_to_m_change?: number | null;
  pos_15_64_f_y_on_y_change?: number | null;
  pos_15_64_m: number;
  pos_15_64_m_m_to_m_change?: number | null;
  pos_15_64_m_y_on_y_change?: number | null;
  pos_1_4_f: number;
  pos_1_4_f_m_to_m_change?: number | null;
  pos_1_4_f_y_on_y_change?: number | null;
  pos_1_4_m: number;
  pos_1_4_m_m_to_m_change?: number | null;
  pos_1_4_m_y_on_y_change?: number | null;
  pos_5_9_f: number;
  pos_5_9_f_m_to_m_change?: number | null;
  pos_5_9_f_y_on_y_change?: number | null;
  pos_5_9_m: number;
  pos_5_9_m_m_to_m_change?: number | null;
  pos_5_9_m_y_on_y_change?: number | null;
  pos_diatas_64_f: number;
  pos_diatas_64_f_m_to_m_change?: number | null;
  pos_diatas_64_f_y_on_y_change?: number | null;
  pos_diatas_64_m: number;
  pos_diatas_64_m_m_to_m_change?: number | null;
  pos_diatas_64_m_y_on_y_change?: number | null;
  province: string | null;
  relaps: number;
  relaps_m_to_m_change?: number | null;
  relaps_y_on_y_change?: number | null;
  tipe_faskes: string;
  tot_pos: number;
  tot_pos_m_to_m_change?: number | null;
  tot_pos_y_on_y_change?: number | null;
  url: string;
  year: number;
  status: string;
}

export interface RawDataResponse {
  success: boolean
  data: RawData[]
}

export interface AggregateDataResponse {
  success: boolean
  data: AggregateData[]
}
export interface Master {
  code: string
  name: string
}
export interface RegionResponse {
  success: boolean
  data: Master[]
}

export interface AggregatedGeoData {
  province: string;
  city?: string;
  district?: string;
  tot_pos: number;
  konfirmasi_lab_mikroskop: number;
  konfirmasi_lab_rdt: number;
  konfirmasi_lab_pcr: number;
  pos_0_4: number;
  pos_5_14: number;
  pos_15_64: number;
  pos_diatas_64: number;
  hamil_pos: number;
  kematian_malaria: number;
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
  penularan_indigenus: number;
  penularan_impor: number;
  penularan_induced: number;
  relaps: number;
  facility_count: number;
}

export interface BMKGLocation {
  adm1: string;
  adm2?: string | null;
  adm3?: string | null;
  adm4?: string | null;
  provinsi: string;
  kotkab?: string | null;
  kecamatan?: string | null;
  desa?: string | null;
  lon: number;
  lat: number;
  timezone: string;
  type?: string;
}

export interface BMKGForecast {
  datetime: string;
  utc_datetime: string;
  local_datetime: string;
  t: number;             // temperature in Celsius
  tcc: number;           // cloud cover percentage
  tp: number;            // rainfall in mm
  weather: number;       // weather code
  weather_desc: string;  // weather description in Indonesian
  weather_desc_en: string; // weather description in English
  wd_deg: number;        // wind direction in degrees
  wd: string;            // wind direction abbreviation 
  wd_to: string;         // wind direction "to" abbreviation
  ws: number;            // wind speed in km/h
  hu: number;            // humidity percentage
  vs: number;            // visibility in meters
  vs_text: string;       // visibility text description
  time_index: string;
  analysis_date: string;
  image: string;         // URL to weather icon
}

export interface BMKGLocationData {
  lokasi: BMKGLocation;
  cuaca: BMKGForecast[][];  // Array of arrays - days and forecasts within each day
}

export interface BMKGWeatherResponse {
  lokasi: BMKGLocation;
  data: BMKGLocationData[];
}

// Original WeatherData type
export interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  cloudCover: number;
  warningLevel: 'low' | 'medium' | 'high' | 'none';
  warningMessage: string;
}

// Service response types
export interface WeatherResponse {
  success: boolean;
  data: BMKGWeatherResponse | null;
}

export interface HistoricalWeatherData {
  month: number;
  year: number;
  temperature: number;
  humidity: number;
  rainfall: number;
}

export interface HistoricalWeatherResponse {
  success: boolean;
  data: HistoricalWeatherData[];
}

export interface RiskFactor {
  factor: string;
  impact: 'low' | 'medium' | 'high';
  description: string;
}

export interface RiskAssessmentData {
  riskLevel: 'low' | 'medium' | 'high' | 'unknown';
  factors: RiskFactor[];
  recommendations: string[];
}

export interface RiskAssessmentResponse {
  success: boolean;
  data: RiskAssessmentData;
}

// Add these interfaces to your dashboard.ts types file

// For DBD Aggregate Data Response
export interface DBDAggregateDataItem {
  kd_prov: string;
  kd_kab?: string;
  province: string;
  city?: string;
  year: number;
  month: number;
  status: 'actual' | 'predicted';
  dbd_p: number;
  dbd_m: number;
  dbd_p_m_to_m_change: number | null;
  dbd_m_m_to_m_change: number | null;
  dbd_p_y_on_y_change: number | null;
  dbd_m_y_on_y_change: number | null;
}

export interface DBDAggregateDataResponse {
  data: DBDAggregateDataItem[];
  success: boolean;
}

// For DBD Raw Data Response
export interface DBDRawDataItem {
  kd_prov: string;
  kd_kab: string;
  province: string;
  city: string;
  year: number;
  month: number;
  dbd_p: number;
  dbd_m: number;
  status: 'actual' | 'predicted';
  dbd_p_m_to_m_change: number | null;
  dbd_m_m_to_m_change: number | null;
  dbd_p_y_on_y_change: number | null;
  dbd_m_y_on_y_change: number | null;
}

export interface DBDRawDataResponse {
  data: DBDRawDataItem[];
  metadata: {
    current_filter: {
      year: number;
      month: number;
      status: 'actual' | 'predicted' | null;
    };
    last_actual: {
      year: number;
      month: number;
    };
    first_predicted: {
      year: number;
      month: number;
    };
  };
  success: boolean;
}

// For Lepto Aggregate Data Response
export interface LeptoAggregateDataItem {
  kd_prov: string;
  kd_kab?: string;
  province: string;
  city?: string;
  year: number;
  month: number;
  status: 'actual' | 'predicted';
  lep_k: number;
  lep_m: number;
  lep_k_m_to_m_change: number | null;
  lep_m_m_to_m_change: number | null;
  lep_k_y_on_y_change: number | null;
  lep_m_y_on_y_change: number | null;
}

export interface LeptoAggregateDataResponse {
  data: LeptoAggregateDataItem[];
  success: boolean;
}

// For Lepto Raw Data Response
export interface LeptoRawDataItem {
  kd_prov: string;
  kd_kab: string;
  province: string;
  city: string;
  year: number;
  month: number;
  lep_k: number;
  lep_m: number;
  status: 'actual' | 'predicted';
  lep_k_m_to_m_change: number | null;
  lep_m_m_to_m_change: number | null;
  lep_k_y_on_y_change: number | null;
  lep_m_y_on_y_change: number | null;
}

export interface LeptoRawDataResponse {
  data: LeptoRawDataItem[];
  metadata: {
    current_filter: {
      year: number;
      month: number;
      status: 'actual' | 'predicted' | null;
    };
    last_actual: {
      year: number;
      month: number;
    };
    first_predicted: {
      year: number;
      month: number;
    };
  };
  success: boolean;
}