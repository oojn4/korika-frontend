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
}

export interface HealthFacilityResponse {
  success: boolean;
  data: HealthFacility[];
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
}

export interface UpdateFacilityData {
  nama_faskes?: string;
  tipe_faskes?: string;
  provinsi?: string;
  kabupaten?: string;
  kecamatan?: string;
  address?: string | undefined;
}

export interface LocationParams {
  provinsi?: string;
  kabupaten?: string;
  kecamatan?: string;
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
      url: `${baseUrl}/${facilityId}`,
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
      url: `${baseUrl}/facility/location`,
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