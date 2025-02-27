// MalariaDataService.ts - Handle malaria health facility monthly data API interactions
import appConfig from "../../configs/app.config";
import ApiService from "../ApiService";

// Define types sesuai dengan model database
export interface MalariaMonthlyData {
  id_mhfm: number;
  id_faskes: number;
  bulan: number;
  tahun: number;
  konfirmasi_lab_mikroskop: number | null;
  konfirmasi_lab_rdt: number | null;
  konfirmasi_lab_pcr: number | null;
  total_konfirmasi_lab: number | null;
  pos_0_4: number | null;
  pos_5_14: number | null;
  pos_15_64: number | null;
  pos_diatas_64: number | null;
  tot_pos: number | null;
  kematian_malaria: number | null;
  hamil_pos: number | null;
  p_pf: number | null;
  p_pv: number | null;
  p_po: number | null;
  p_pm: number | null;
  p_pk: number | null;
  p_mix: number | null;
  p_suspek_pk: number | null;
  kasus_pe: number | null;
  obat_standar: number | null;
  obat_nonprogram: number | null;
  obat_primaquin: number | null;
  penularan_indigenus: number | null;
  penularan_impor: number | null;
  penularan_induced: number | null;
  relaps: number | null;
  indikator_pengobatan_standar: number | null;
  indikator_primaquin: number | null;
  indikator_kasus_pe: number | null;
  status: string;
  // Weather data
  hujan_hujan_mean: number | null;
  hujan_hujan_max: number | null;
  hujan_hujan_min: number | null;
  tm_tm_mean: number | null;
  tm_tm_max: number | null;
  tm_tm_min: number | null;
  ss_monthly_mean: number | null;
  ff_x_monthly_mean: number | null;
  ddd_x_monthly_mean: number | null;
  ff_avg_monthly_mean: number | null;
  // Population data
  pop_penduduk_kab: number | null;
}

export interface PaginationMeta {
  page: number;
  per_page: number;
  total_pages: number;
  total_records: number;
  month: number;
  year: number;
  status: string;
  has_next: boolean;
  has_prev: boolean;
  filters: Record<string, any>;
}

export interface MalariaDataResponse {
  success: boolean;
  data: MalariaMonthlyData[];
  error?: string;
}

export interface PaginatedMalariaDataResponse {
  success: boolean;
  data: MalariaMonthlyData[];
  meta: PaginationMeta;
  error?: string;
}

export interface SingleMalariaDataResponse {
  success: boolean;
  data: MalariaMonthlyData;
  error?: string;
}

export interface CreateMalariaData {
  id_faskes: number;
  bulan: number;
  tahun: number;
  konfirmasi_lab_mikroskop?: number;
  konfirmasi_lab_rdt?: number;
  konfirmasi_lab_pcr?: number;
  pos_0_4?: number;
  pos_5_14?: number;
  pos_15_64?: number;
  pos_diatas_64?: number;
  kematian_malaria?: number;
  hamil_pos?: number;
  p_pf?: number;
  p_pv?: number;
  p_po?: number;
  p_pm?: number;
  p_pk?: number;
  p_mix?: number;
  p_suspek_pk?: number;
  obat_standar?: number;
  obat_nonprogram?: number;
  obat_primaquin?: number;
  kasus_pe?: number;
  penularan_indigenus?: number;
  penularan_impor?: number;
  penularan_induced?: number;
  relaps?: number;
  status?: string;
  // Weather data (optional)
  hujan_hujan_mean?: number;
  hujan_hujan_max?: number;
  hujan_hujan_min?: number;
  tm_tm_mean?: number;
  tm_tm_max?: number;
  tm_tm_min?: number;
  ss_monthly_mean?: number;
  ff_x_monthly_mean?: number;
  ddd_x_monthly_mean?: number;
  ff_avg_monthly_mean?: number;
  // Population data (optional)
  pop_penduduk_kab?: number;
}

export interface UpdateMalariaData {
  konfirmasi_lab_mikroskop?: number;
  konfirmasi_lab_rdt?: number;
  konfirmasi_lab_pcr?: number;
  pos_0_4?: number;
  pos_5_14?: number;
  pos_15_64?: number;
  pos_diatas_64?: number;
  tot_pos?: number;
  kematian_malaria?: number;
  hamil_pos?: number;
  p_pf?: number;
  p_pv?: number;
  p_po?: number;
  p_pm?: number;
  p_pk?: number;
  p_mix?: number;
  p_suspek_pk?: number;
  obat_standar?: number;
  obat_nonprogram?: number;
  obat_primaquin?: number;
  kasus_pe?: number;
  penularan_indigenus?: number;
  penularan_impor?: number;
  penularan_induced?: number;
  relaps?: number;
  indikator_pengobatan_standar?: number;
  indikator_primaquin?: number;
  indikator_kasus_pe?: number;
  status?: string;
  // Weather data (optional)
  hujan_hujan_mean?: number;
  hujan_hujan_max?: number;
  hujan_hujan_min?: number;
  tm_tm_mean?: number;
  tm_tm_max?: number;
  tm_tm_min?: number;
  ss_monthly_mean?: number;
  ff_x_monthly_mean?: number;
  ddd_x_monthly_mean?: number;
  ff_avg_monthly_mean?: number;
  // Population data (optional)
  pop_penduduk_kab?: number;
}

export interface QueryParams {
  page?: number;
  per_page?: number;
  month?: number;
  year?: number;
  status?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  id_faskes?: number | string;
  provinsi?: string;
  kabupaten?: string;
  kecamatan?: string;
  tipe_faskes?: string;
}

const baseUrl = `${appConfig.backendApiUrl}`;

export const MalariaDataService = {
  // Get all malaria data (legacy method)
  async getAllMalariaData(): Promise<MalariaDataResponse> {
    const res = await ApiService.fetchData<undefined, MalariaDataResponse>({
      url: `${baseUrl}/malaria`,
      method: 'GET',
    });
    return res.data;
  },

  // Get paginated malaria data with filters
  async getPaginatedMalariaData(params: QueryParams = {}): Promise<PaginatedMalariaDataResponse> {
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params.month) queryParams.append('month', params.month.toString());
    if (params.year) queryParams.append('year', params.year.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params.sort_order) queryParams.append('sort_order', params.sort_order);
    
    // Add filter parameters
    if (params.id_faskes) queryParams.append('id_faskes', params.id_faskes.toString());
    if (params.provinsi) queryParams.append('provinsi', params.provinsi);
    if (params.kabupaten) queryParams.append('kabupaten', params.kabupaten);
    if (params.kecamatan) queryParams.append('kecamatan', params.kecamatan);
    if (params.tipe_faskes) queryParams.append('tipe_faskes', params.tipe_faskes);
    
    const queryString = queryParams.toString();
    const url = `${baseUrl}/malaria/paginated${queryString ? `?${queryString}` : ''}`;
    
    const res = await ApiService.fetchData<undefined, PaginatedMalariaDataResponse>({
      url,
      method: 'GET',
    });
    return res.data;
  },

  // Get malaria data by ID
  async getMalariaDataById(dataId: number): Promise<SingleMalariaDataResponse> {
    const res = await ApiService.fetchData<undefined, SingleMalariaDataResponse>({
      url: `${baseUrl}/malaria/${dataId}`,
      method: 'GET',
    });
    return res.data;
  },

  // Create new malaria data record
  async createMalariaData(malariaData: CreateMalariaData): Promise<SingleMalariaDataResponse> {
    const res = await ApiService.fetchData<CreateMalariaData, SingleMalariaDataResponse>({
      url: `${baseUrl}/malaria`,
      method: 'POST',
      data: malariaData,
    });
    return res.data;
  },

  // Update existing malaria data record
  async updateMalariaData(dataId: number, malariaData: UpdateMalariaData): Promise<SingleMalariaDataResponse> {
    const res = await ApiService.fetchData<UpdateMalariaData, SingleMalariaDataResponse>({
      url: `${baseUrl}/malaria/${dataId}`,
      method: 'PUT',
      data: malariaData,
    });
    return res.data;
  },

  // Delete malaria data record
  async deleteMalariaData(dataId: number): Promise<{ success: boolean; data: { deleted: boolean }; error?: string }> {
    const res = await ApiService.fetchData<undefined, { success: boolean; data: { deleted: boolean }; error?: string }>({
      url: `${baseUrl}/malaria/${dataId}`,
      method: 'DELETE',
    });
    return res.data;
  },

  // Get malaria data by facility and period (month, year)
  async getByFacilityAndPeriod(facilityId: number, month: number, year: number): Promise<SingleMalariaDataResponse> {
    const res = await ApiService.fetchData<undefined, SingleMalariaDataResponse>({
      url: `${baseUrl}/malaria/facility/${facilityId}/period/${month}/${year}`,
      method: 'GET',
    });
    return res.data;
  },

  // Get annual malaria data for a facility
  async getAnnualData(facilityId: number, year: number): Promise<MalariaDataResponse> {
    const res = await ApiService.fetchData<undefined, MalariaDataResponse>({
      url: `${baseUrl}/malaria/facility/${facilityId}/year/${year}`,
      method: 'GET',
    });
    return res.data;
  },
};