// HealthFacilityService.ts - Handle health facility API interactions
import appConfig from "../../configs/app.config";
import ApiService from "../ApiService";

// Define types
export interface HealthFacility {
  id_faskes: number;
  nama_faskes: string;
  tipe_faskes: string;
  provinsi: string;
  kabupaten: string;
  kecamatan: string;
  address?: string | undefined;
  lat: number;
  lon: number;
  url: string;
  owner: string;
}

export interface HealthFacilityMetadata {
  page: number;
  per_page: number;
  total_pages: number;
  total_records: number;
  has_next: boolean;
  has_prev: boolean;
  filters: Record<string, any>;
  distinct_values: {
    provinces: string[];
    districts: string[];
    subdistricts: string[];
    facility_types: string[];
  };
}

export interface HealthFacilityResponse {
  success: boolean;
  data: HealthFacility[];
  error?: string;
}

export interface PaginatedFacilityResponse {
  success: boolean;
  data: HealthFacility[];
  meta: HealthFacilityMetadata;
  error?: string;
}

export interface SingleHealthFacilityResponse {
  success: boolean;
  data: HealthFacility;
  error?: string;
}

export interface CreateFacilityData {
  nama_faskes: string;
  tipe_faskes: string;
  provinsi: string;
  kabupaten: string;
  kecamatan: string;
  address?: string | undefined;
  lat: number;
  lon: number;
  url: string;
  owner: string;
}

export interface UpdateFacilityData {
  nama_faskes?: string;
  tipe_faskes?: string;
  provinsi?: string;
  kabupaten?: string;
  kecamatan?: string;
  address?: string | undefined;
  lat: number;
  lon: number;
  url: string;
  owner: string;
}

export interface LocationParams {
  provinsi?: string;
  kabupaten?: string;
  kecamatan?: string;
}

export interface FacilityQueryParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  nama_faskes?: string;
  provinsi?: string;
  kabupaten?: string;
  kecamatan?: string;
  tipe_faskes?: string;
}

const baseUrl = `${appConfig.backendApiUrl}`;

export const HealthFacilityService = {
  // Get all health facilities
  async getAllFacilities(): Promise<HealthFacilityResponse> {
    const res = await ApiService.fetchData<undefined, HealthFacilityResponse>({
      url: `${baseUrl}/facility`,
      method: 'GET',
    });
    return res.data;
  },

  // Metode baru untuk mendapatkan fasilitas dengan paginasi
  async getPaginatedFacilities(params: FacilityQueryParams = {}): Promise<PaginatedFacilityResponse> {
    const queryParams = new URLSearchParams();
    
    // Pagination params
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params.sort_order) queryParams.append('sort_order', params.sort_order);
    
    // Filter params
    if (params.nama_faskes) queryParams.append('nama_faskes', params.nama_faskes);
    if (params.provinsi) queryParams.append('provinsi', params.provinsi);
    if (params.kabupaten) queryParams.append('kabupaten', params.kabupaten);
    if (params.kecamatan) queryParams.append('kecamatan', params.kecamatan);
    if (params.tipe_faskes) queryParams.append('tipe_faskes', params.tipe_faskes);
    
    const queryString = queryParams.toString();
    const url = `${baseUrl}/facility/paginated${queryString ? `?${queryString}` : ''}`;
    
    const res = await ApiService.fetchData<undefined, PaginatedFacilityResponse>({
      url,
      method: 'GET',
    });
    return res.data;
  },

  // Get facility by ID
  async getFacilityById(facilityId: number): Promise<SingleHealthFacilityResponse> {
    const res = await ApiService.fetchData<undefined, SingleHealthFacilityResponse>({
      url: `${baseUrl}/facility/${facilityId}`,
      method: 'GET',
    });
    return res.data;
  },

  // Create new facility
  async createFacility(facilityData: CreateFacilityData): Promise<SingleHealthFacilityResponse> {
    const res = await ApiService.fetchData<CreateFacilityData, SingleHealthFacilityResponse>({
      url: `${baseUrl}/facility`,
      method: 'POST',
      data: facilityData,
    });
    return res.data;
  },

  // Update existing facility
  async updateFacility(facilityId: number, facilityData: UpdateFacilityData): Promise<SingleHealthFacilityResponse> {
    const res = await ApiService.fetchData<UpdateFacilityData, SingleHealthFacilityResponse>({
      url: `${baseUrl}/facility/${facilityId}`,
      method: 'PUT',
      data: facilityData,
    });
    return res.data;
  },

  // Delete facility
  async deleteFacility(facilityId: number): Promise<{ success: boolean; data: { deleted: boolean }; error?: string }> {
    const res = await ApiService.fetchData<undefined, { success: boolean; data: { deleted: boolean }; error?: string }>({
      url: `${baseUrl}/facility/${facilityId}`,
      method: 'DELETE',
    });
    return res.data;
  },

  // Get facilities by location
  async getFacilitiesByLocation(params: LocationParams): Promise<HealthFacilityResponse> {
    const res = await ApiService.fetchData<undefined, HealthFacilityResponse>({
      url: `${baseUrl}/location`,
      method: 'GET',
      params: params as Record<string, string>,
    });
    return res.data;
  },

  // Get facilities by type
  async getFacilitiesByType(facilityType: string): Promise<HealthFacilityResponse> {
    const res = await ApiService.fetchData<undefined, HealthFacilityResponse>({
      url: `${baseUrl}/facility/type/${facilityType}`,
      method: 'GET',
    });
    return res.data;
  },
};