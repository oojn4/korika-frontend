export interface City {
  id: string
  city_code: string
  province_code: string
  name: string
}

export interface MasterCityResponse {
  status: 'success' | 'failed'
  timestamp: string
  data: City[]
}

export interface Country {
  id: string
  country_code: string
  name: string
}

export interface MasterCountryResponse {
  status: 'success' | 'failed'
  timestamp: string
  data: Country[]
}

export interface Province {
  id: string
  province_code: string
  name: string
}

export interface MasterProvinceResponse {
  status: 'success' | 'failed';
  timestamp: string
  data: Province[]
}

export interface OfficeCategory {
  id: string
  name: string
  abbr: string
}

export interface MasterOfficeCategoryResponse {
  status: 'success' | 'failed'
  timestamp: string
  data: OfficeCategory[]
}

export interface Major {
  id: string
  name: string
  abbr: string
}

export interface MasterMajorResponse {
  status: 'success' | 'failed'
  timestamp: string
  data: Major[]
}

export interface University {
  id: string
  name: string
  abbr: string
}

export interface MasterUniversityResponse {
  status: 'success' | 'failed'
  timestamp: string
  data: University[]
}