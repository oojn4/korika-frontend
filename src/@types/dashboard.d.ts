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
  city: string;
  district: string;
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
}

export interface RawDataResponse {
  success: boolean
  data: RawData[]
}

export interface AggregateDataResponse {
  success: boolean
  data: AggregateData[]
}

export interface ProvincesResponse {
  success: boolean
  data: string[]
}
