import { ActionIcon, Badge, Box, Button, Group, Paper, Select, SimpleGrid, Space, Tabs, Text, ThemeIcon, Title } from '@mantine/core';
import { MonthPickerInput } from '@mantine/dates';
import { IconAlertCircle, IconArticle, IconBabyCarriage, IconChartLine, IconCloud, IconDashboard, IconHeartPlus, IconMap, IconMedicalCross, IconTable } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { AggregateData, AggregateDataResponse, BMKGWeatherResponse, DataMalaria, Master, RawDataResponse } from '../../@types/dashboard';
import EarlyWarningSystemMalaria from '../../components/EarlyWarningSystemMalaria/EarlyWarningSystemMalaria';
import KPICard from '../../components/KPICard/KPICard'; // Assumed new component
import EnhancedMapVisualization from '../../components/MapVisualization/EnhancedMapVisualization';
import Statbox from '../../components/Statbox/Statbox';
import TableRawData from '../../components/TableRawData/TableRawData';
import WeatherWidget from '../../components/WeatherWidget/WeatherWidget';
import { DashboardService } from '../../services/services/dashboard.service';
import { WeatherService } from '../../services/services/weather.service'; // Assumed new service
import classes from './Dashboard.module.css';

type ComboboxItem = {
  value: String;
  label: String;
};

type TextStatBox = {
  label: string;
  count: number | null;
  color: string;
  y_on_y: number | null;
  m_to_m: number | null;
  color_y_on_y: string;
  color_m_to_m: string;
};



interface CodeMapping {
  code: string;       // Regular province code
  bmkgCode: string;   // BMKG province code
  name: string;       // Province name
}
const MalariaPage = () => {
  const [aggregateData, setAggregateData] = useState<any[]>([]);
  const [mergedData, setMergedData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>('dashboard');
  // Add this state variable with your other state declarations
  const [provinceMapping, setProvinceMapping] = useState<CodeMapping[]>([]);
  // Add these state variables with your other state declarations
  const [cityMapping, setCityMapping] = useState<CodeMapping[]>([]);
  const [districtMapping, setDistrictMapping] = useState<CodeMapping[]>([]);
  const [province, setProvince] = useState<string>('00');
  const [district, setDistrict] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [monthYear, setMonthYear] = useState<string>('');
  const [predictedMonthYear, setPredictedMonthYear] = useState<string>('');
  const [textStatbox, setTextStatbox] = useState<TextStatBox[]>([]);
  const [earlyWarningData,setEarlyWarningData] = useState<DataMalaria[]>([])
  
  // Date Picker States
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  
  // State for provinces dropdown
  const [provinces, setProvinces] = useState<any[]>([]);
  
  // State for districts dropdown
  const [districts, setDistricts] = useState<any[]>([]);
  
  // State for subdistricts dropdown
  const [cities, setCities] = useState<any[]>([]);
  const [hasData, setHasData] = useState<boolean>(true);
  const [filterMonth, setFilterMonth] = useState<Date | null>(null);
  
  const [showWeatherWidget, setShowWeatherWidget] = useState(true);
  const [allWeatherData, setAllWeatherData] = useState<BMKGWeatherResponse | null>(null); 
  const [filteredWeatherData, setFilteredWeatherData] = useState<BMKGWeatherResponse | null>(null);
  // KPI Indicators
  const [kpiData, setKpiData] = useState({
    totalCases: 0,
    totalRate: 0,
    positivityRate: 0,
    fatalityRate: 0,
    indigenousTransmission: 0,
    inducedTransmissionRate: 0,
    atRiskPopulation: 0,
    treatmentCoverage: 0,
    ageDistribution: 0,
    pregnantWomenCases: 0,
    pregnantWomenPercentage: 0,
    childrenUnder5Cases: 0,
    childrenUnder5Percentage: 0
  });

  // Add this helper function before your component functions
  const getProvinceBMKGCode = (provinceCode: string): string => {
    // Default case for "TOTAL"
    if (provinceCode === '00') return '00';
    
    // Find the matching province in mapping
    const province = provinceMapping.find(p => p.code === provinceCode);
    return province ? province.bmkgCode : provinceCode; // Fallback to province code if not found
  };
  // Add these helper functions alongside your getBMKGCode function
  const getCityBMKGCode = (cityCode: string): string => {
    if (!cityCode) return '';
    
    const city = cityMapping.find(c => c.code === cityCode);
    return city ? city.bmkgCode : cityCode;
  };

  const getDistrictBMKGCode = (districtCode: string): string => {
    if (!districtCode) return '';
    
    const district = districtMapping.find(d => d.code === districtCode);
    return district ? district.bmkgCode : districtCode;
  };

  const handleFetchEarlyWarning = async () => {
    try {
      const response = await DashboardService.indexWarningMalaria();
      if (response.success) {
        setEarlyWarningData(response.data);
      }
      } catch (error) {
      return;
    }
  };
  

  const handleFetchProvinces = async () => {
    try {
      const response = await DashboardService.fetchProvinces();
      
      // Store the complete mapping data for use in weather service
      const mappingData: CodeMapping[] = [
        { code: '00', bmkgCode: '00', name: 'TOTAL' },
        ...response.data.map((item: any) => ({
          code: item.code,
          bmkgCode: item.bmkg,
          name: item.name,
        })),
      ];
      
      setProvinceMapping(mappingData);
      
      // Create the dropdown items as before
      const arrayProvinces: ComboboxItem[] = [
        { value: '00', label: 'TOTAL' },
        ...response.data.map((item: Master) => ({
          value: item.code,
          label: item.name,
        })),
      ];
      
      setProvinces(arrayProvinces);
    } catch (error) {
      return;
    }
  };
  
  // Function to handle province change
  // Function to handle province change
  const handleProvinceChange = (value: string) => {
    setProvince(value || '00');
    setAllWeatherData(null);
    setFilteredWeatherData(null);
    setCityMapping([]);
    setDistrictMapping([]);
    
    // If selecting TOTAL, set district to ALL DISTRICTS
    if (value === '00') {
      setDistricts([{ value: '', label: 'ALL' }]);
      setDistrict('');
      
      // Also clear subdistricts
      setCities([{ value: '', label: 'ALL' }]);
      setCity('');
    } else {
      // Otherwise fetch the districts for the selected province
      handleFetchCities(value);
      
      // Clear subdistricts when province changes
      setDistricts([{ value: '', label: 'ALL' }]);
      setDistrict('');
    }
  };
  
  // Update your handleCityChange function
  const handleCityChange = (value: string) => {
    setCity(value || '');
    
    // If a specific city is selected, fetch city-specific weather data
    if (value && province && province !== '00') {
      handleFetchCityWeatherData(province, value);
    } else if (allWeatherData) {
      // If "ALL" is selected, revert to province-level data
      setFilteredWeatherData(getProvinceAggregateData(allWeatherData));
    }
    
    // When city changes, update districts
    if (value === '') {
      // If ALL is selected, clear districts
      setDistricts([{ value: '', label: 'ALL' }]);
      setDistrictMapping([]);
      setDistrict('');
    } else {
      // Otherwise fetch districts for the selected city
      handleFetchDistricts(value);
    }
  };
  
  // Add a district change handler
  const handleDistrictChange = (value: string) => {
    setDistrict(value || '');
    
    // If a specific district is selected, fetch district-specific weather data
    if (value && province && province !== '00' && city) {
      handleFetchDistrictWeatherData(province, city, value);
    } else if (city && allWeatherData) {
      // If reverting to city level, filter by city
      filterWeatherDataByCity(allWeatherData, city);
    }
  };
  // Function to fetch districts list based on selected province
  // Update your handleFetchCities function
  const handleFetchCities = async (provinceCode: string) => {
    try {
      if (provinceCode === '00') {
        // If "TOTAL" is selected, set cities to only ALL option
        setCities([{ value: '', label: 'ALL' }]);
        setCityMapping([]);
        setCity('');
        return;
      }
      
      const response = await DashboardService.fetchCities(provinceCode);
      
      // Store the complete mapping data for cities
      const mappingData: CodeMapping[] = [
        { code: '', bmkgCode: '', name: 'ALL' },
        ...response.data.map((item: any) => ({
          code: item.code,
          bmkgCode: item.bmkg || item.code, // Use bmkg code if available, otherwise fallback to regular code
          name: item.name,
        })),
      ];
      
      setCityMapping(mappingData);
      
      // Create the dropdown items
      const arrayCities: ComboboxItem[] = [
        { value: '', label: 'ALL' },
        ...response.data.map((item: Master) => ({
          value: item.code,
          label: item.name,
        })),
      ];
      
      setCities(arrayCities);
      setCity(''); // Reset selected city when province changes
    } catch (error) {
      setCities([{ value: '', label: 'ALL' }]);
      setCityMapping([]);
      setCity('');
      return;
    }
  };
  
  const handleFetchDistricts = async (cityCode: string) => {
    try {
      if (cityCode === '') {
        // If "ALL DISTRICTS" is selected, set subdistricts to only ALL SUBDISTRICTS option
        setDistricts([{ value: '', label: 'ALL' }]);
        setDistrictMapping([]);
        setDistrict('');
        return;
      }
      
      const response = await DashboardService.fetchDistricts(cityCode);
      
      // Store the mapping data for districts
      const mappingData: CodeMapping[] = [
        { code: '', bmkgCode: '', name: 'ALL' },
        ...response.data.map((item: any) => ({
          code: item.code,
          bmkgCode: item.bmkg || item.code, // Use bmkg code if available
          name: item.name,
        })),
      ];
      
      setDistrictMapping(mappingData);
      
      const arrayDistricts: ComboboxItem[] = [
        { value: '', label: 'ALL' },
        ...response.data.map((item: Master) => ({
          value: item.code,
          label: item.name,
        })),
      ];
      
      setDistricts(arrayDistricts);
      setDistrict(''); // Reset selected subdistrict when district changes
    } catch (error) {
      setDistricts([{ value: '', label: 'ALL' }]);
      setDistrictMapping([]);
      setDistrict('');
      return;
    }
  };
  
  // Replace your existing handleFetchProvinceWeatherData function with this
  const handleFetchProvinceWeatherData = async (provinceCode: string) => {
    try {
      
      if (provinceCode && provinceCode !== '00') {
        // Get the BMKG code for the selected province
        const bmkgCode = getProvinceBMKGCode(provinceCode);
        
        // Use the BMKG code for weather API
        const params = `adm1=${bmkgCode}`;
        
        
        const response = await WeatherService.fetchWeatherData(params);
        
        if (response.success === true && response.data) {
          // Store all data
          setAllWeatherData(response.data);
          
          // If no city filter, show province aggregate data
          if (!city) {
            setFilteredWeatherData(getProvinceAggregateData(response.data));
          } else {
            // If city filter exists, apply filter
            filterWeatherDataByCity(response.data, city);
          }
        } else {
          setAllWeatherData(null);
          setFilteredWeatherData(null);
        }
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setAllWeatherData(null);
      setFilteredWeatherData(null);
    } finally {
    }
  };

  // Function to fetch city-specific weather data that includes kecamatan-level data
  const handleFetchCityWeatherData = async (provinceCode: string, cityCode: string) => {
    try {
      
      if (!provinceCode || provinceCode === '00' || !cityCode) {
        return;
      }
      
      // Get the BMKG codes
      const bmkgCityCode = getCityBMKGCode(cityCode);
      
      // Format city code for API (e.g., 1801 -> 18.01)
      const formattedCityCode = bmkgCityCode.replace(/^(\d{2})(\d{2})$/, '$1.$2');
      
      // Build API parameters for city-level request
      const params = `adm2=${formattedCityCode}`;
      
      
      
      const response = await WeatherService.fetchWeatherData(params);
      
      if (response.success === true && response.data) {
        // Update all data states
        setAllWeatherData(response.data);
        
        // If no district filter, show city data
        if (!district) {
          // Find the city data in the response
          const cityData = response.data.data.find(location => 
            location.lokasi.adm2 === formattedCityCode
          );
          
          if (cityData) {
            const filteredData = {
              lokasi: response.data.lokasi,
              data: [cityData]
            };
            setFilteredWeatherData(filteredData);
          } else {
            setFilteredWeatherData(response.data);
          }
        } else {
          // If district is selected, filter by district
          filterWeatherDataByDistrict(response.data, district);
        }
      } else {
        console.error("Failed to fetch city weather data");
        setAllWeatherData(null);
        setFilteredWeatherData(null);
      }
    } catch (error) {
      console.error('Error fetching city weather data:', error);
      setAllWeatherData(null);
      setFilteredWeatherData(null);
    } finally {
    }
  };

  // Function to fetch district-specific weather data
  const handleFetchDistrictWeatherData = async (provinceCode: string, cityCode: string, districtCode: string) => {
    try {
      
      if (!provinceCode || provinceCode === '00' || !cityCode || !districtCode) {
        return;
      }
      
      // Get the BMKG codes
      const bmkgDistrictCode = getDistrictBMKGCode(districtCode);
      
      // Format codes for API
      const formattedDistrictCode = bmkgDistrictCode.replace(/^(\d{2})(\d{2})(\d{2})$/, '$1.$2.$3');
      
      // Build API parameters for district-level request
      const params = `adm3=${formattedDistrictCode}`;
      
      
      
      const response = await WeatherService.fetchWeatherData(params);
      
      if (response.success === true && response.data) {
        // Update all data states
        setAllWeatherData(response.data);
        
        // Find the district data in the response
        const districtData = response.data.data.find(location => 
          location.lokasi.adm3 === formattedDistrictCode
        );
        
        if (districtData) {
          const filteredData = {
            lokasi: response.data.lokasi,
            data: [districtData]
          };
          setFilteredWeatherData(filteredData);
        } else {
          setFilteredWeatherData(response.data);
        }
      } else {
        console.error("Failed to fetch district weather data");
        setAllWeatherData(null);
        setFilteredWeatherData(null);
      }
    } catch (error) {
      console.error('Error fetching district weather data:', error);
      setAllWeatherData(null);
      setFilteredWeatherData(null);
    } finally {
    }
  };
// Filter data berdasarkan kode kabupaten/kota
  const filterWeatherDataByCity = (weatherData: BMKGWeatherResponse, cityCode: string) => {
    if (!weatherData || !weatherData.data || !cityCode) {
      setFilteredWeatherData(null);
      return;
    }
    
    // Get the BMKG code for the city
    const bmkgCityCode = getCityBMKGCode(cityCode);
    
    // Format kode kabupaten untuk perbandingan (misal 1801 -> 18.01)
    const formattedCityCode = bmkgCityCode.replace(/^(\d{2})(\d{2})$/, '$1.$2');
    
    
    
    // Cari data kabupaten/kota yang sesuai
    const cityData = weatherData.data.find(location => 
      location.lokasi.adm2 === formattedCityCode
    );
    
    if (cityData) {
      // Buat struktur data yang sama dengan response API asli
      const filteredData = {
        lokasi: weatherData.lokasi,
        data: [cityData]
      };
      
      setFilteredWeatherData(filteredData);
    } else {
      setFilteredWeatherData(null);
    }
  };

  // Filter data berdasarkan kode kecamatan
  const filterWeatherDataByDistrict = (weatherData: BMKGWeatherResponse, districtCode: string) => {
    if (!weatherData || !weatherData.data || !districtCode) {
      setFilteredWeatherData(null);
      return;
    }
    
    // Get the BMKG code for the district
    const bmkgDistrictCode = getDistrictBMKGCode(districtCode);
    
    // Format kode kecamatan untuk perbandingan (misal 180101 -> 18.01.01)
    const formattedDistrictCode = bmkgDistrictCode.replace(/^(\d{2})(\d{2})(\d{2})$/, '$1.$2.$3');
    
    
    
    // Cari data kecamatan yang sesuai
    const districtData = weatherData.data.find(location => 
      location.lokasi.adm3 === formattedDistrictCode
    );
    
    if (districtData) {
      // Buat struktur data yang sama dengan response API asli
      const filteredData = {
        lokasi: weatherData.lokasi,
        data: [districtData]
      };
      
      setFilteredWeatherData(filteredData);
    } else {
      setFilteredWeatherData(null);
    }
  };
  // Fungsi untuk menghasilkan data agregat provinsi (rata-rata atau range)
  const getProvinceAggregateData = (weatherData: any): any | null => {
    if (!weatherData || !weatherData.data || weatherData.data.length === 0) {
      return null;
    }
    
    const allCities = weatherData.data;
    let minTemp = Infinity, maxTemp = -Infinity;
    let minHumidity = Infinity, maxHumidity = -Infinity;
    let minRainfall = Infinity, maxRainfall = -Infinity;
    let minWindSpeed = Infinity, maxWindSpeed = -Infinity;
    let minCloudCover = Infinity, maxCloudCover = -Infinity;
    let visibilityCounts: Record<string, number> = {};
    let mostCommonVisibility = null;
    let maxVisibilityCount = 0;
    
    // Hitung statistik dari semua kota
    allCities.forEach((city: { cuaca: string | any[]; }) => {
      if (city.cuaca && city.cuaca.length > 0 && city.cuaca[0].length > 0) {
        const forecast = city.cuaca[0][0];
        
        // Update min/max for ranges
        minTemp = Math.min(minTemp, forecast.t);
        maxTemp = Math.max(maxTemp, forecast.t);
        
        minHumidity = Math.min(minHumidity, forecast.hu);
        maxHumidity = Math.max(maxHumidity, forecast.hu);
        
        const rainfall = forecast.tp || 0;
        minRainfall = Math.min(minRainfall, rainfall);
        maxRainfall = Math.max(maxRainfall, rainfall);
        
        const windSpeed = forecast.ws || 0;
        minWindSpeed = Math.min(minWindSpeed, windSpeed);
        maxWindSpeed = Math.max(maxWindSpeed, windSpeed);
        
        const cloudCover = forecast.tcc || 0;
        minCloudCover = Math.min(minCloudCover, cloudCover);
        maxCloudCover = Math.max(maxCloudCover, cloudCover);
        
        // Count visibility frequencies for mode
        const visibility = forecast.visibility || 'normal';
        visibilityCounts[visibility] = (visibilityCounts[visibility] || 0) + 1;
        
        if (visibilityCounts[visibility] > maxVisibilityCount) {
          maxVisibilityCount = visibilityCounts[visibility];
          mostCommonVisibility = visibility;
        }
      }
    });
    
    if (minTemp === Infinity) return null;
    
    // Format the range or single values as strings with units
    const tempStr = minTemp === maxTemp 
      ? `${Math.round(minTemp * 10) / 10}°C` 
      : `${Math.round(minTemp * 10) / 10}°C - ${Math.round(maxTemp * 10) / 10}°C`;
  
    const humidityStr = minHumidity === maxHumidity 
      ? `${Math.round(minHumidity)}%` 
      : `${Math.round(minHumidity)}% - ${Math.round(maxHumidity)}%`;
  
    const rainfallStr = minRainfall === maxRainfall 
      ? `${Math.round(minRainfall * 10) / 10} mm` 
      : `${Math.round(minRainfall * 10) / 10} mm - ${Math.round(maxRainfall * 10) / 10} mm`;
  
    const windSpeedStr = minWindSpeed === maxWindSpeed 
      ? `${Math.round(minWindSpeed * 10) / 10} km/h` 
      : `${Math.round(minWindSpeed * 10) / 10} km/h - ${Math.round(maxWindSpeed * 10) / 10} km/h`;
  
    const cloudCoverStr = minCloudCover === maxCloudCover 
      ? `${Math.round(minCloudCover)}%` 
      : `${Math.round(minCloudCover)}% - ${Math.round(maxCloudCover)}%`;
    
    // Buat representasi provinsi dengan range dan mode
    const provinceData = {
      lokasi: weatherData.lokasi,
      data: [{
        lokasi: {
          provinsi: weatherData.lokasi.provinsi,
          kotkab: `Seluruh ${weatherData.lokasi.provinsi}`,
          adm1: weatherData.lokasi.adm1,
          lon: weatherData.lokasi.lon,
          lat: weatherData.lokasi.lat,
          timezone: weatherData.lokasi.timezone,
        },
        cuaca: [[{
          // Save individual min/max values for calculations
          t_min: Math.round(minTemp * 10) / 10,
          t_max: Math.round(maxTemp * 10) / 10,
          // Use string values with appropriate formatting
          t: tempStr,
          
          hu_min: Math.round(minHumidity),
          hu_max: Math.round(maxHumidity),
          hu: humidityStr,
          
          tp_min: Math.round(minRainfall * 10) / 10,
          tp_max: Math.round(maxRainfall * 10) / 10,
          tp: rainfallStr,
          
          ws_min: Math.round(minWindSpeed * 10) / 10,
          ws_max: Math.round(maxWindSpeed * 10) / 10,
          ws: windSpeedStr,
          
          tcc_min: Math.round(minCloudCover),
          tcc_max: Math.round(maxCloudCover),
          tcc: cloudCoverStr,
          
          // Gunakan mode untuk jarak pandang
          visibility: mostCommonVisibility,
          
          local_datetime: allCities[0].cuaca[0][0].local_datetime,
          analysis_date: allCities[0].cuaca[0][0].analysis_date
        }]]
      }]
    };
    
    return provinceData;
  };

  const getCityAggregateData = (weatherData: any, cityCode: string): any | null => {
    if (!weatherData || !weatherData.data || weatherData.data.length === 0 || !cityCode) {
      return null;
    }
    
    // Get BMKG city code and format it
    const bmkgCityCode = getCityBMKGCode(cityCode);
    const formattedCityCode = bmkgCityCode.replace(/^(\d{2})(\d{2})$/, '$1.$2');
    // Find the city data first
    const cityLocation = weatherData.data.find((loc: any) => 
      loc.lokasi.adm2 === formattedCityCode
    );
    
    // If we don't have this city, return null
    if (!cityLocation) {
      console.warn(`City with code ${formattedCityCode} not found in weather data`);
      return null;
    }
    
    // Get city name from the found location
    const cityName = cityLocation.lokasi.kotkab;
    
    // Find all districts/kecamatan under this city
    const allDistricts = weatherData.data.filter((loc: any) => 
      loc.lokasi.adm2 === formattedCityCode && loc.lokasi.adm3
    );
    
    // If no districts found, return the city data directly
    if (allDistricts.length === 0) {
      // For consistency, add units to single values
      if (cityLocation.cuaca && cityLocation.cuaca.length > 0 && cityLocation.cuaca[0].length > 0) {
        const forecast = cityLocation.cuaca[0][0];
        
        // Store min/max values but keep original values with units
        forecast.t_min = forecast.t;
        forecast.t_max = forecast.t;
        forecast.t = `${forecast.t}°C`;
        
        forecast.hu_min = forecast.hu;
        forecast.hu_max = forecast.hu;
        forecast.hu = `${forecast.hu}%`;
        
        forecast.tp_min = forecast.tp || 0;
        forecast.tp_max = forecast.tp || 0;
        forecast.tp = `${forecast.tp || 0} mm`;
        
        forecast.ws_min = forecast.ws || 0;
        forecast.ws_max = forecast.ws || 0;
        forecast.ws = `${forecast.ws || 0} km/h`;
        
        forecast.tcc_min = forecast.tcc || 0;
        forecast.tcc_max = forecast.tcc || 0;
        forecast.tcc = `${forecast.tcc || 0}%`;
      }
      
      return {
        lokasi: weatherData.lokasi,
        data: [cityLocation]
      };
    }
    
    // Initialize range variables
    let minTemp = Infinity, maxTemp = -Infinity;
    let minHumidity = Infinity, maxHumidity = -Infinity;
    let minRainfall = Infinity, maxRainfall = -Infinity;
    let minWindSpeed = Infinity, maxWindSpeed = -Infinity;
    let minCloudCover = Infinity, maxCloudCover = -Infinity;
    let visibilityCounts: Record<string, number> = {};
    let mostCommonVisibility = null;
    let maxVisibilityCount = 0;
    
    // Calculate ranges from all districts
    allDistricts.forEach((district: { cuaca: string | any[]; }) => {
      if (district.cuaca && district.cuaca.length > 0 && district.cuaca[0].length > 0) {
        const forecast = district.cuaca[0][0];
        
        minTemp = Math.min(minTemp, forecast.t);
        maxTemp = Math.max(maxTemp, forecast.t);
        
        minHumidity = Math.min(minHumidity, forecast.hu);
        maxHumidity = Math.max(maxHumidity, forecast.hu);
        
        const rainfall = forecast.tp || 0;
        minRainfall = Math.min(minRainfall, rainfall);
        maxRainfall = Math.max(maxRainfall, rainfall);
        
        const windSpeed = forecast.ws || 0;
        minWindSpeed = Math.min(minWindSpeed, windSpeed);
        maxWindSpeed = Math.max(maxWindSpeed, windSpeed);
        
        const cloudCover = forecast.tcc || 0;
        minCloudCover = Math.min(minCloudCover, cloudCover);
        maxCloudCover = Math.max(maxCloudCover, cloudCover);
        
        // Count visibility frequencies for mode
        const visibility = forecast.visibility || 'normal';
        visibilityCounts[visibility] = (visibilityCounts[visibility] || 0) + 1;
        
        if (visibilityCounts[visibility] > maxVisibilityCount) {
          maxVisibilityCount = visibilityCounts[visibility];
          mostCommonVisibility = visibility;
        }
      }
    });
    
    // If no valid forecast data found, use the city data directly
    if (minTemp === Infinity) {
      return {
        lokasi: weatherData.lokasi,
        data: [cityLocation]
      };
    }
    
    // Format the range or single values as strings with units
    const tempStr = minTemp === maxTemp 
      ? `${Math.round(minTemp * 10) / 10}°C` 
      : `${Math.round(minTemp * 10) / 10}°C - ${Math.round(maxTemp * 10) / 10}°C`;
  
    const humidityStr = minHumidity === maxHumidity 
      ? `${Math.round(minHumidity)}%` 
      : `${Math.round(minHumidity)}% - ${Math.round(maxHumidity)}%`;
  
    const rainfallStr = minRainfall === maxRainfall 
      ? `${Math.round(minRainfall * 10) / 10} mm` 
      : `${Math.round(minRainfall * 10) / 10} mm - ${Math.round(maxRainfall * 10) / 10} mm`;
  
    const windSpeedStr = minWindSpeed === maxWindSpeed 
      ? `${Math.round(minWindSpeed * 10) / 10} km/h` 
      : `${Math.round(minWindSpeed * 10) / 10} km/h - ${Math.round(maxWindSpeed * 10) / 10} km/h`;
  
    const cloudCoverStr = minCloudCover === maxCloudCover 
      ? `${Math.round(minCloudCover)}%` 
      : `${Math.round(minCloudCover)}% - ${Math.round(maxCloudCover)}%`;
    // Create city representation with ranges or single values
    const cityData = {
      lokasi: weatherData.lokasi,
      data: [{
        lokasi: {
          provinsi: weatherData.lokasi.provinsi,
          kotkab: cityName,
          adm1: weatherData.lokasi.adm1,
          adm2: formattedCityCode,
          lon: cityLocation.lokasi.lon,
          lat: cityLocation.lokasi.lat,
          timezone: weatherData.lokasi.timezone,
        },
        cuaca: [[{
          // Save individual min/max values for calculations
          t_min: Math.round(minTemp * 10) / 10,
          t_max: Math.round(maxTemp * 10) / 10,
          t: tempStr,
          
          hu_min: Math.round(minHumidity),
          hu_max: Math.round(maxHumidity),
          hu: humidityStr,
          
          tp_min: Math.round(minRainfall * 10) / 10,
          tp_max: Math.round(maxRainfall * 10) / 10,
          tp: rainfallStr,
          
          ws_min: Math.round(minWindSpeed * 10) / 10,
          ws_max: Math.round(maxWindSpeed * 10) / 10,
          ws: windSpeedStr,
          
          tcc_min: Math.round(minCloudCover),
          tcc_max: Math.round(maxCloudCover),
          tcc: cloudCoverStr,
          
          // Use mode for visibility
          visibility: mostCommonVisibility,
          
          local_datetime: allDistricts[0].cuaca[0][0].local_datetime,
          analysis_date: allDistricts[0].cuaca[0][0].analysis_date
        }]]
      }]
    };
    
    return cityData;
  };

  const getDistrictAggregateData = (weatherData: any, districtCode: string): any | null => {
    if (!weatherData || !weatherData.data || weatherData.data.length === 0 || !districtCode) {
      return null;
    }
    
    // Get BMKG district code and format it
    const bmkgDistrictCode = getDistrictBMKGCode(districtCode);
    const formattedDistrictCode = bmkgDistrictCode.replace(/^(\d{2})(\d{2})(\d{2})$/, '$1.$2.$3');
    
    // Find the district data
    const districtLocation = weatherData.data.find((loc: any) => 
      loc.lokasi.adm3 === formattedDistrictCode
    );
    
    // If we don't have this district, return null
    if (!districtLocation) {
      console.warn(`District with code ${formattedDistrictCode} not found in weather data`);
      return null;
    }
    
    // Get district name from the found location
    const districtName = districtLocation.lokasi.kecamatan;
    
    // Find all villages/desa under this district
    const allVillages = weatherData.data.filter((loc: any) => 
      loc.lokasi.adm3 === formattedDistrictCode && loc.lokasi.adm4
    );
    
    // If no villages found, return the district data directly
    if (allVillages.length === 0) {
      // For consistency, add units to single values
      if (districtLocation.cuaca && districtLocation.cuaca.length > 0 && districtLocation.cuaca[0].length > 0) {
        const forecast = districtLocation.cuaca[0][0];
        
        // Store min/max values but keep original values with units
        forecast.t_min = forecast.t;
        forecast.t_max = forecast.t;
        forecast.t = `${forecast.t}°C`;
        
        forecast.hu_min = forecast.hu;
        forecast.hu_max = forecast.hu;
        forecast.hu = `${forecast.hu}%`;
        
        forecast.tp_min = forecast.tp || 0;
        forecast.tp_max = forecast.tp || 0;
        forecast.tp = `${forecast.tp || 0} mm`;
        
        forecast.ws_min = forecast.ws || 0;
        forecast.ws_max = forecast.ws || 0;
        forecast.ws = `${forecast.ws || 0} km/h`;
        
        forecast.tcc_min = forecast.tcc || 0;
        forecast.tcc_max = forecast.tcc || 0;
        forecast.tcc = `${forecast.tcc || 0}%`;
      }
      
      return {
        lokasi: weatherData.lokasi,
        data: [districtLocation]
      };
    }
    
    // Initialize range variables
    let minTemp = Infinity, maxTemp = -Infinity;
    let minHumidity = Infinity, maxHumidity = -Infinity;
    let minRainfall = Infinity, maxRainfall = -Infinity;
    let minWindSpeed = Infinity, maxWindSpeed = -Infinity;
    let minCloudCover = Infinity, maxCloudCover = -Infinity;
    let visibilityCounts: Record<string, number> = {};
    let mostCommonVisibility = null;
    let maxVisibilityCount = 0;
    
    // Calculate ranges from all villages
    allVillages.forEach((village: { cuaca: string | any[]; }) => {
      if (village.cuaca && village.cuaca.length > 0 && village.cuaca[0].length > 0) {
        const forecast = village.cuaca[0][0];
        
        minTemp = Math.min(minTemp, forecast.t);
        maxTemp = Math.max(maxTemp, forecast.t);
        
        minHumidity = Math.min(minHumidity, forecast.hu);
        maxHumidity = Math.max(maxHumidity, forecast.hu);
        
        const rainfall = forecast.tp || 0;
        minRainfall = Math.min(minRainfall, rainfall);
        maxRainfall = Math.max(maxRainfall, rainfall);
        
        const windSpeed = forecast.ws || 0;
        minWindSpeed = Math.min(minWindSpeed, windSpeed);
        maxWindSpeed = Math.max(maxWindSpeed, windSpeed);
        
        const cloudCover = forecast.tcc || 0;
        minCloudCover = Math.min(minCloudCover, cloudCover);
        maxCloudCover = Math.max(maxCloudCover, cloudCover);
        
        // Count visibility frequencies for mode
        const visibility = forecast.visibility || 'normal';
        visibilityCounts[visibility] = (visibilityCounts[visibility] || 0) + 1;
        
        if (visibilityCounts[visibility] > maxVisibilityCount) {
          maxVisibilityCount = visibilityCounts[visibility];
          mostCommonVisibility = visibility;
        }
      }
    });
    
    // If no valid forecast data found, use the district data directly
    if (minTemp === Infinity) {
      return {
        lokasi: weatherData.lokasi,
        data: [districtLocation]
      };
    }
    
    // Format the range or single values as strings with units
    const tempStr = minTemp === maxTemp 
      ? `${Math.round(minTemp * 10) / 10}°C` 
      : `${Math.round(minTemp * 10) / 10}°C - ${Math.round(maxTemp * 10) / 10}°C`;
  
    const humidityStr = minHumidity === maxHumidity 
      ? `${Math.round(minHumidity)}%` 
      : `${Math.round(minHumidity)}% - ${Math.round(maxHumidity)}%`;
  
    const rainfallStr = minRainfall === maxRainfall 
      ? `${Math.round(minRainfall * 10) / 10} mm` 
      : `${Math.round(minRainfall * 10) / 10} mm - ${Math.round(maxRainfall * 10) / 10} mm`;
  
    const windSpeedStr = minWindSpeed === maxWindSpeed 
      ? `${Math.round(minWindSpeed * 10) / 10} km/h` 
      : `${Math.round(minWindSpeed * 10) / 10} km/h - ${Math.round(maxWindSpeed * 10) / 10} km/h`;
  
    const cloudCoverStr = minCloudCover === maxCloudCover 
      ? `${Math.round(minCloudCover)}%` 
      : `${Math.round(minCloudCover)}% - ${Math.round(maxCloudCover)}%`;
    
    // Create district representation with ranges or single values
    const districtData = {
      lokasi: weatherData.lokasi,
      data: [{
        lokasi: {
          provinsi: weatherData.lokasi.provinsi,
          kotkab: districtLocation.lokasi.kotkab,
          kecamatan: districtName,
          adm1: weatherData.lokasi.adm1,
          adm2: districtLocation.lokasi.adm2,
          adm3: formattedDistrictCode,
          lon: districtLocation.lokasi.lon,
          lat: districtLocation.lokasi.lat,
          timezone: weatherData.lokasi.timezone,
        },
        cuaca: [[{
          // Save individual min/max values for calculations
          t_min: Math.round(minTemp * 10) / 10,
          t_max: Math.round(maxTemp * 10) / 10,
          t: tempStr,
          
          hu_min: Math.round(minHumidity),
          hu_max: Math.round(maxHumidity),
          hu: humidityStr,
          
          tp_min: Math.round(minRainfall * 10) / 10,
          tp_max: Math.round(maxRainfall * 10) / 10,
          tp: rainfallStr,
          
          ws_min: Math.round(minWindSpeed * 10) / 10,
          ws_max: Math.round(maxWindSpeed * 10) / 10,
          ws: windSpeedStr,
          
          tcc_min: Math.round(minCloudCover),
          tcc_max: Math.round(maxCloudCover),
          tcc: cloudCoverStr,
          
          // Use mode for visibility
          visibility: mostCommonVisibility,
          
          local_datetime: allVillages[0].cuaca[0][0].local_datetime,
          analysis_date: allVillages[0].cuaca[0][0].analysis_date
        }]]
      }]
    };
    
    return districtData;
  };
  useEffect(() => {
    handleFetchEarlyWarning();
  }, [earlyWarningData]);
// Effect untuk handle perubahan filter
useEffect(() => {
  if (province && province !== '00') {
    if (!allWeatherData) {
      
      // If no data exists, fetch province data
      handleFetchProvinceWeatherData(province);
    } else {
      if (district) {
        // If district is selected, filter by district
        setFilteredWeatherData(getDistrictAggregateData(allWeatherData, district));
      } else if (city) {
        // If only city is selected (no district), filter by city
        setFilteredWeatherData(getCityAggregateData(allWeatherData, city));
      } else {
        // If only province is selected (no city/district), show province aggregate
        setFilteredWeatherData(getProvinceAggregateData(allWeatherData));
      }
    }
  }
}, [province, city, district, allWeatherData]);
  // Function to fetch aggregate data
  const handleFetchAggregateData = async () => {
    const start = startDate ? startDate.getFullYear().toString() + "-" + (startDate.getMonth() + 1).toString() : '';
    const end = endDate ? endDate.getFullYear().toString() + "-" + (endDate.getMonth() + 1).toString() : '';

    const response: AggregateDataResponse = await DashboardService.indexAggregateDataMalaria(
      province || '00',
      city || '',
      district || '',
      start,
      end
    );
    
    if (response.success === true) {
      if (response.data.length === 0) {
        setAggregateData([]);
        setMergedData([]);
        setFilteredData([]);
        setTextStatbox([]);
        setHasData(false);
        setKpiData({
          totalCases: 0,
          totalRate: 0,
          positivityRate: 0,
          fatalityRate: 0,
          indigenousTransmission: 0,
          inducedTransmissionRate: 0,
          atRiskPopulation: 0,
          treatmentCoverage: 0,
          ageDistribution: 0,
          pregnantWomenCases: 0,
          pregnantWomenPercentage: 0,
          childrenUnder5Cases: 0,
          childrenUnder5Percentage: 0
        });
      } else {
        setHasData(true);
        const updatedData = response.data.map((item) => ({
          ...item,
          monthYear: `${item.month}-${item.year}`,
        }));
        setAggregateData(updatedData);
        
        // Extract KPI data from the latest data point
        // This is a simplified example, you might need a more complex logic
        updateKPIData(updatedData);
      }
    }
  };
  
  // Update KPI data based on the latest aggregate data
  const updateKPIData = (data: any[]) => {
    // Find the most recent actual data
    const actualData = data.filter(item => item.status === 'actual');
    
    if (actualData.length === 0) return;
    
    // Sort by year and month to get the latest data
    actualData.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
    
    const latestData = actualData[0];
    
    // Calculate KPIs
    const totalCases = latestData.tot_pos;
    
    const totalTests = totalCases * 5; // Assuming a test-to-case ratio of 5:1
    const totalRate = latestData.tot_pos_m_to_m_change || 0;
    const positivityRate = totalTests > 0 ? (totalCases / totalTests) * 100 : 0;
    
    const fatalityRate = totalCases > 0 ? (latestData.kematian_malaria / totalCases) * 100 : 0;
    
    const indigenousTransmission = latestData.penularan_indigenus || 0;
    const inducedTransmissionRate = latestData.penularan_indigenus_m_to_m_change || 0;
    
    // Extract cases for children under 5
    const childrenUnder5Cases = latestData.pos_0_4 || 0;
    
    // Calculate percentage of children under 5 among total cases
    const childrenUnder5Percentage = totalCases > 0 ? (childrenUnder5Cases / totalCases) * 100 : 0;
    
    // Get pregnant women cases
    const pregnantWomenCases = latestData.hamil_pos || 0;
    
    // Calculate percentage of pregnant women among total cases
    const pregnantWomenPercentage = totalCases > 0 ? (pregnantWomenCases / totalCases) * 100 : 0;
    
    const ageDistribution = 0;
    // These values would typically come from different data sources
    // Here they're just example placeholders
    const atRiskPopulation = 100000;
    const treatmentCoverage = 85;
    
    // Set the updated KPI data
    setKpiData({
      totalCases,
      totalRate,
      positivityRate,
      fatalityRate,
      indigenousTransmission,
      inducedTransmissionRate,
      atRiskPopulation,
      treatmentCoverage,
      ageDistribution,
      pregnantWomenCases,
      pregnantWomenPercentage,
      childrenUnder5Cases,
      childrenUnder5Percentage,
    });
  };
  
  const handleFetchRawData = async () => {
    try {
      // Format dates for API request
      let monthYear = '';
      if (filterMonth) {
        const year = filterMonth.getFullYear();
        const month = filterMonth.getMonth() + 1; // JavaScript months are 0-indexed
        monthYear = `${year}-${String(month).padStart(2, '0')}`;
      }
      
      // Use the same parameters as aggregate data for location
      let provinceParam = province || '';
      if (province === '00') {
        provinceParam = ''; // Use default for total (empty)
      }
  
      // Call API with monthYear filter (without status)
      const response: RawDataResponse = await DashboardService.indexRawDataMalaria(
        provinceParam,
        city || '',
        district || '',
        monthYear,
        '' // Not using status as a parameter
      );
      
      if (response.success === true) {
        const updatedData = response.data.map((item) => ({
          ...item,
          monthYear: `${item.month}-${item.year}`,
        }));
        setRawData(updatedData);
      } else {
        // Handle error
        setRawData([]);
        console.error("Failed to fetch raw data");
      }
    } catch (error) {
      setRawData([]);
      return;
    }
  };
  
  // Function to convert "1-2023" format to "January-2023" format
  function convertDateFormat(dateString: string) {
    const parts = dateString.split('-');
    
    if (parts.length !== 2) {
      return "Invalid date format";
    }
    
    const monthNum = parseInt(parts[0], 10);
    const year = parts[1];
    
    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    
    if (monthNum < 1 || monthNum > 12) {
      return "Invalid month number";
    }
    
    const monthName = monthNames[monthNum - 1];
    return `${monthName}-${year}`;
  }
  
  const getTimeInfoLabel = (filterMonth: Date | null, predictedMonthYear: string) => {
    // If there's a specific month/year filter, use that
    if (filterMonth) {
      const month = filterMonth.getMonth() + 1;
      const year = filterMonth.getFullYear();
      const formattedDate = convertDateFormat(`${month}-${year}`);
      
      // Get status from the obtained data
      const matchingData = rawData.find(item => 
        item.year === year && item.month === month
      );
      
      // Use status from found data or default to 'Data'
      const statusText = matchingData ? 
        (matchingData.status === 'actual' ? 'Aktual' : 'Prediksi') : 
        'Data';
        
      return `${statusText} untuk ${formattedDate}`;
    } 
    // Default - show prediction data
    else {
      return `Data Prediksi (${convertDateFormat(predictedMonthYear)})`;
    }
  };
  
  // Handle date changes
  const handleDateChange = () => {
    if (startDate || endDate) {
      // Trigger data fetch when dates change
      handleFetchAggregateData();
      handleFetchRawData();
    }
  };
  
  // Get filtered data for a specific chart
  const getChartData = () => {
    return filteredData.length > 0 ? filteredData : mergedData;
  };
  
  // Fetch provinces on component mount
  useEffect(() => {
    handleFetchProvinces();
    
  }, []);
  
  // Initialize districts and subdistricts with ALL options on component mount
  useEffect(() => {
    // When component mounts, ensure the districts dropdown has the ALL DISTRICTS option
    if (province === '00') {
      setDistricts([{ value: '', label: 'ALL' }]);
      setCities([{ value: '', label: 'ALL' }]);
    }
  }, []);
  
  // Effect for date changes
  useEffect(() => {
    if (startDate || endDate) {
      handleDateChange();
    }
  }, [startDate, endDate]);
  
  // Fetch aggregate data when filters change
  useEffect(() => {
    handleFetchAggregateData();
  }, [province, city, district]);
  
  // Fetch raw data when filters change
  useEffect(() => {
    handleFetchRawData();
  }, [province, city, district, filterMonth]); 
 
  // Process aggregate data to create merged dataset and initialize date pickers
  useEffect(() => {
    if (aggregateData?.length) {
      // Filter actual and predicted data
      const actualData = aggregateData.filter((item) => item.status === 'actual');
      const predictedData = aggregateData.filter((item) => item.status === 'predicted');
      
      // Find the latest actual data point
      const maxActualItem = actualData.reduce<AggregateData | null>((maxItem, currentItem) => {
        if (
          maxItem === null ||
          currentItem.year > maxItem.year ||
          (currentItem.year === maxItem.year && currentItem.month > maxItem.month)
        ) {
          return currentItem;
        }
        return maxItem;
      }, null);
      
      // Store latest actual month/year
      const monthYearTemp = maxActualItem ? `${maxActualItem.month.toString()}-${maxActualItem.year.toString()}` : '';
      setMonthYear(monthYearTemp);
      
      // Get all unique monthYear values, sorted chronologically
      const allMonthYears = Array.from(
        new Set([...actualData, ...predictedData].map((d) => d.monthYear))
      ).sort((a, b) => {
        const [aMonth, aYear] = a.split('-').map(Number);
        const [bMonth, bYear] = b.split('-').map(Number);
        return aYear === bYear ? aMonth - bMonth : aYear - bYear;
      });
      
      // Create date map for the month picker
      const newDateMap = allMonthYears.map((dateStr, index) => {
        const [month, year] = dateStr.split('-').map(Number);
        return { 
          date: new Date(year, month - 1, 1),
          index,
          value: dateStr
        };
      });
      
      
      // Initialize date picker values
      if (newDateMap.length > 0 && !startDate && !endDate) {
        setStartDate(newDateMap[0].date);
        setEndDate(newDateMap[newDateMap.length - 1].date);
      }
      
      // Create the merged data structure
      const mergedData = allMonthYears.map((monthYear) => {
        // Find the items for this monthYear
        const actualItem = actualData.find((item) => item.monthYear === monthYear);
        const predictedItem = predictedData.find((item) => item.monthYear === monthYear);
        
        // Create base object with monthYear
        const result: any = { monthYear };
        
        // For actual data
        if (actualItem) {
          Object.keys(actualItem).forEach(key => {
            if (key !== 'monthYear') {
              // Add with actual_ prefix
              result[`actual_${key}`] = actualItem[key];
            }
          });
        }
        
        // For predicted data
        if (predictedItem) {
          Object.keys(predictedItem).forEach(key => {
            if (key !== 'monthYear') {
              // Add with predicted_ prefix
              result[`predicted_${key}`] = predictedItem[key];
            }
          });
        }
        
        return result;
      });
      
      // Create visual continuity between actual and predicted data
      if (maxActualItem) {
        const latestActualMonthYear = `${maxActualItem.month}-${maxActualItem.year}`;
        
        // Find the entry for the latest actual month
        const latestActualEntry = mergedData.find(item => item.monthYear === latestActualMonthYear);
        
        if (latestActualEntry) {
          // Copy actual values to predicted for metrics that should connect
          Object.keys(latestActualEntry).forEach(key => {
            if (key.startsWith('actual_') && !key.includes('status') && !key.includes('monthYear')) {
              // Get the base metric name (without prefix)
              const metricName = key.replace('actual_', '');
              
              // Create the predicted key name
              const predictedKey = `predicted_${metricName}`;
              
              // Copy the value to create the connection point
              latestActualEntry[predictedKey] = latestActualEntry[key];
            }
          });
        }
      }
      
      setMergedData(mergedData);
      setFilteredData(mergedData); // Initialize filtered data with all data
      
      // Find the predicted data for the next month after the latest actual
      if (maxActualItem) {
        const nextMonth = maxActualItem.month === 12 ? 1 : maxActualItem.month + 1;
        const nextYear = maxActualItem.month === 12 ? maxActualItem.year + 1 : maxActualItem.year;
        
        const nextMonthPredictedData = predictedData.filter(
          (item) => item.status === 'predicted' && item?.year === nextYear && item?.month === nextMonth
        );
        
        const predictedMonthYearTemp = nextMonthPredictedData.length > 0 
          ? `${nextMonthPredictedData[0]?.month.toString()}-${nextMonthPredictedData[0]?.year.toString()}` 
          : '';
        
        setPredictedMonthYear(predictedMonthYearTemp);
        
        // Generate text statbox data
        const mappedData = nextMonthPredictedData.map((predictedItem) => {
          return Object.keys(predictedItem)
            .filter((key) => typeof predictedItem[key] === 'number')
            .map((attribute) => {
              const yonyKey = `${attribute}_y_on_y_change`;
              const mtomKey = `${attribute}_m_to_m_change`;
              return {
                label: `predicted_${attribute}`,
                count: predictedItem[attribute] ?? null,
                y_on_y: predictedItem[yonyKey as keyof AggregateData] ?? null,
                m_to_m: predictedItem[mtomKey as keyof AggregateData] ?? null,
                color: (predictedItem[attribute] ?? 0) >= 0 ? 'green' : 'red',
                color_y_on_y: (predictedItem[yonyKey as keyof AggregateData] ?? 0) <= 0 ? 'green' : 'red',
                color_m_to_m: (predictedItem[mtomKey as keyof AggregateData] ?? 0) <= 0 ? 'green' : 'red',
              };
            });
        });
  
        // Flatten array if there are multiple predicted items
        const flattenedMappedData = mappedData.flat();
  
        // Set textStatbox state
        setTextStatbox(flattenedMappedData);
      }
    }
  }, [aggregateData]);

  const renderKPICards = () => {
    const formattedLastUpdateDate = monthYear ? convertDateFormat(monthYear) : 'N/A';
  
    return (
      <>
      <Paper withBorder p="md" radius="md" mb="md" bg="blue.0">
        <Group>
          <div>
            <Title order={4}>Indikator Kinerja Utama (KPI)</Title>
            <Text size="sm" color="dimmed">
              Data aktual terakhir: {formattedLastUpdateDate}
            </Text>
            
          </div>
          <Badge 
            size="lg" 
            color="blue" 
            radius="sm"
            leftSection={
              <ThemeIcon color="blue" size={14} radius="xl" variant="filled">
                <IconChartLine size={8} />
              </ThemeIcon>
            }
          >
            Data Aktual
          </Badge>
        </Group>
      </Paper>
      <SimpleGrid cols={{ base: 2, xs: 3, md: 5 }} spacing="md">
        <KPICard 
          title="Total Kasus"
          value={kpiData.totalCases}
          icon={<IconAlertCircle size={24} />}
          color="red"
          footer={<Group>
            <Text c="dimmed" size="sm">Dibandingkan Bulan Lalu</Text>
            <Badge color={kpiData.totalRate < 0 ? "green" : "red"}>{kpiData.totalRate.toFixed(1)}%</Badge>
          </Group>} description={null}        />
        
        {/* <KPICard 
          title="Tingkat Positivitas"
          value={`${kpiData.positivityRate.toFixed(1)}%`}
          icon={<IconChartBar size={24} />}
          color="blue"
          footer={<Group>
            <Text c="dimmed" size="sm">Target: &lt;5%</Text>
            <Badge color={kpiData.positivityRate < 5 ? "green" : "red"}>
              {kpiData.positivityRate < 5 ? "Tercapai" : "Belum Tercapai"}
            </Badge>
          </Group>} description={null}        /> */}
        
        <KPICard 
          title="Tingkat Kematian"
          value={`${kpiData.fatalityRate.toFixed(2)}%`}
          icon={<IconMedicalCross size={24} />}
          color="red"
          footer={<Group>
            <Text c="dimmed" size="sm">Target: &lt;0.5%</Text>
            <Badge color={kpiData.fatalityRate < 0.5 ? "green" : "red"}>
              {kpiData.fatalityRate < 0.5 ? "Tercapai" : "Belum Tercapai"}
            </Badge>
          </Group>} description={null}        />
        
        <KPICard 
          title="Penularan Lokal"
          value={kpiData.indigenousTransmission}
          icon={<IconMap size={24} />}
          color="orange"
          footer={<Group>
            <Text c="dimmed" size="sm">Dibandingkan Bulan Lalu</Text>
            <Badge color={kpiData.inducedTransmissionRate < 0 ? "green" : "red"}>{kpiData.inducedTransmissionRate.toFixed(1)}%</Badge>
          </Group>} description={null}        />
        
        <KPICard 
          title="Kasus Balita"
          value={kpiData.childrenUnder5Cases}
          icon={<IconBabyCarriage size={24} />}
          color="cyan"
          footer={<Group>
            <Text c="dimmed" size="sm">Persentase dari Total</Text>
            <Badge color="blue">{kpiData.childrenUnder5Percentage.toFixed(1)}%</Badge>
          </Group>} description={null}        />
        
        <KPICard 
          title="Kasus Ibu Hamil"
          value={kpiData.pregnantWomenCases}
          icon={<IconHeartPlus size={24} />}
          color="pink"
          footer={<Group>
            <Text c="dimmed" size="sm">Persentase dari Total</Text>
            <Badge color="pink">{kpiData.pregnantWomenPercentage.toFixed(1)}%</Badge>
          </Group>} description={null}        />
        
        {/* <KPICard 
          title="Populasi Berisiko"
          value={`${(kpiData.atRiskPopulation / 1000).toFixed(0)}K`}
          icon={<IconUsers size={24} />}
          color="indigo"
          footer={<Group>
            <Text c="dimmed" size="sm">Status</Text>
            <Badge color="orange">Sedang</Badge>
          </Group>} description={null}        />
        
        <KPICard 
          title="Cakupan Pengobatan"
          value={`${kpiData.treatmentCoverage}%`}
          icon={<IconMedicalCross size={24} />}
          color="green"
          footer={<Group>
            <Text c="dimmed" size="sm">Target: 80%</Text>
            <Badge color={kpiData.treatmentCoverage >= 80 ? "green" : "red"}>
              {kpiData.treatmentCoverage >= 80 ? "Tercapai" : "Belum Tercapai"}
            </Badge>
          </Group>} description={null}        /> */}
          </SimpleGrid>
          </>
      );
    };


  // Render main dashboard content
  const renderDashboardContent = () => {
    // const formattedPredictionDate = predictedMonthYear ? convertDateFormat(predictedMonthYear) : 'N/A';
    const formattedStartDate = startDate ? convertDateFormat(`${(startDate.getMonth()+1).toString()}-${startDate.getFullYear().toString()}`) : 'N/A';
    const formattedEndDate = endDate ? convertDateFormat(`${(endDate.getMonth()+1).toString()}-${endDate.getFullYear().toString()}`) : 'N/A';
  
    return (
      <>
        {renderKPICards()}
        
        <Space h="md" />
        
        <Paper withBorder p="md" radius="md" my="md" bg="orange.0">
        <Group>
          <div>
            <Title order={4}>Tren dan Prediksi</Title>
            <Text size="sm" color="dimmed">
              Menampilkan data historis dan prediksi dari {formattedStartDate} sampai dengan {formattedEndDate}
            </Text>
          </div>
          <Badge 
            size="lg" 
            color="grey" 
            radius="sm"
            leftSection={
              <ThemeIcon color="grey" size={14} radius="xl" variant="filled">
                <IconChartLine size={8} />
              </ThemeIcon>
            }
          >
            Data Prediksi
          </Badge>
        </Group>
        <Text size="xs" mt="xs" style={{ fontStyle: 'italic' }}>
          Grafik menampilkan data aktual (warna solid) dan prediksi (warna abu-abu)
        </Text>
      </Paper>
        <SimpleGrid cols={{ base: 1, xs: 2, md: 2 }}>
          <Box>
            <Statbox
              title="Total Kasus Malaria Berdasarkan Pemeriksaan"
              icon={IconArticle}
              data={getChartData()}
              textStatbox={textStatbox}
              dataKey="monthYear"
              series={[
                { name: 'predicted_konfirmasi_lab_mikroskop', color: 'grey' },
                { name: 'predicted_konfirmasi_lab_rdt', color: 'grey' },
                { name: 'predicted_konfirmasi_lab_pcr', color: 'grey' },
                { name: 'predicted_tot_pos', color: 'grey' },
                
                { name: 'actual_konfirmasi_lab_mikroskop', color: 'indigo.6' },
                { name: 'actual_konfirmasi_lab_rdt', color: 'blue.6' },
                { name: 'actual_konfirmasi_lab_pcr', color: 'teal.6' },
                { name: 'actual_tot_pos', color: 'red.6' },
              ]}
              isCollapsible
            />
          </Box>
          
          <Box>
            <Statbox
              title="Total Kasus Malaria Berdasarkan Kelompok Umur"
              icon={IconArticle}
              data={getChartData()}
              textStatbox={textStatbox}
              dataKey="monthYear"
              series={[
                { name: 'predicted_pos_0_4', color: 'grey' },
                { name: 'predicted_pos_5_14', color: 'grey' },
                { name: 'predicted_pos_15_64', color: 'grey' },
                { name: 'predicted_pos_diatas_64', color: 'grey' },
                { name: 'predicted_tot_pos', color: 'grey' },
                { name: 'actual_pos_0_4', color: '#FFC1CC' },
                { name: 'actual_pos_5_14', color: '#87CEEB' },
                { name: 'actual_pos_15_64', color: '#50C878' },
                { name: 'actual_pos_diatas_64', color: '#E6E6FA' },
                { name: 'actual_tot_pos', color: 'red.6' },
              ]}
              isCollapsible
            />
          </Box>
        </SimpleGrid>
        
        <Space h="lg" />
        
        <SimpleGrid cols={{ base: 1, xs: 2, md: 2 }}>
          <Box>
            <Statbox
              title="Total Kasus Malaria dan Ibu Hamil dengan Malaria"
              icon={IconArticle}
              data={getChartData()}
              textStatbox={textStatbox}
              dataKey="monthYear"
              series={[
                { name: 'predicted_hamil_pos', color: 'grey',yAxisId:'right' },
                { name: 'predicted_tot_pos', color: 'grey',yAxisId:'left' },
                { name: 'actual_hamil_pos', color: 'blue.6',yAxisId:'right' },
                { name: 'actual_tot_pos', color: 'red.6',yAxisId:'left' },
              ]}
              isCollapsible
              useDualAxis={false}
              // leftAxisLabel="Kasus Malaria"
              // rightAxisLabel="Ibu Hamil dengan Malaria"
            />
          </Box>
          <Box>
            <Statbox
              title="Total Kasus Malaria dan Kematian dengan Malaria"
              icon={IconArticle}
              data={getChartData()}
              textStatbox={textStatbox}
              dataKey="monthYear"
              series={[
                { name: 'predicted_kematian_malaria', color: 'grey',yAxisId:'right' },
                { name: 'predicted_tot_pos', color: 'grey',yAxisId:'left' },
                { name: 'actual_kematian_malaria', color: 'teal.6',yAxisId:'right' },
                { name: 'actual_tot_pos', color: 'red.6',yAxisId:'left' },
              ]}
              isCollapsible
              useDualAxis={false}
              // leftAxisLabel="Kasus Malaria"
              // rightAxisLabel="Kematian dengan Malaria"
            />
          </Box>
          
          {/* <Box>
            <Statbox
              title="Penggunaan Obat"
              icon={IconArticle}
              data={getChartData()}
              textStatbox={textStatbox}
              dataKey="monthYear"
              series={[
                { name: 'predicted_obat_standar', color: 'grey' },
                { name: 'predicted_obat_nonprogram', color: 'grey' },
                { name: 'predicted_obat_primaquin', color: 'grey' },
                { name: 'actual_obat_standar', color: 'indigo.6' },
                { name: 'actual_obat_nonprogram', color: 'blue.6' },
                { name: 'actual_obat_primaquin', color: 'teal.6' },
              ]}
              isCollapsible
            />
          </Box> */}
        </SimpleGrid>
        
        <Space h="lg" />
        
        <SimpleGrid cols={{ base: 1, xs: 2, md: 2 }}>
          <Box>
            <Statbox
              title="Kasus Malaria Berdasarkan Tipe Parasit"
              icon={IconArticle}
              data={getChartData()}
              textStatbox={textStatbox}
              dataKey="monthYear"
              series={[
                { name: 'predicted_p_pf', color: 'grey' },
                { name: 'predicted_p_pv', color: 'grey' },
                { name: 'predicted_p_others', color: 'grey' },
                // { name: 'predicted_p_po', color: 'grey' },
                // { name: 'predicted_p_pm', color: 'grey' },
                // { name: 'predicted_p_pk', color: 'grey' },
                { name: 'predicted_p_mix', color: 'grey' },
                // { name: 'predicted_tot_pos', color: 'grey' },
                // { name: 'predicted_p_suspek_pk', color: 'grey' },
                { name: 'actual_p_pf', color: 'blue.6' },
                { name: 'actual_p_pv', color: 'yellow.6' },
                { name: 'actual_p_others', color: 'green.6' },
                // { name: 'actual_p_po', color: 'green.6' },
                // { name: 'actual_p_pm', color: 'lime.6' },
                // { name: 'actual_p_pk', color: 'orange.6' },
                { name: 'actual_p_mix', color: 'orange.6' },
                // { name: 'actual_tot_pos', color: 'red.6' },
                // { name: 'actual_p_suspek_pk', color: 'red.6' },
              ]}
              isCollapsible
            />
          </Box>
          
          <Box>
            <Statbox
              title="Kasus Malaria Berdasarkan Origin"
              icon={IconArticle}
              data={getChartData()}
              textStatbox={textStatbox}
              dataKey="monthYear"
              series={[
                { name: 'predicted_penularan_indigenus', color: 'grey' },
                { name: 'predicted_penularan_impor', color: 'grey' },
                { name: 'predicted_penularan_induced', color: 'grey' },
                { name: 'actual_penularan_indigenus', color: 'orange.6' },
                { name: 'actual_penularan_impor', color: 'blue.6' },
                { name: 'actual_penularan_induced', color: 'teal.6' },
              ]}
              isCollapsible
            />
          </Box>
        </SimpleGrid>
      </>
    );
  };
  const renderClimateContent = () => {
    const formattedLastUpdateDate = monthYear ? convertDateFormat(monthYear) : 'N/A';
    return (
      <>
        <Paper withBorder p="md" radius="md" my="md" bg="orange.0">
        <Group>
          <div>
            <Title order={4}>Korelasi Data Iklim dengan Kasus Malaria</Title>
            <Text size="sm" color="dimmed">
              Menampilkan data historis aktual hingga {formattedLastUpdateDate}
            </Text>
          </div>
          <Badge 
            size="lg" 
            color="blue" 
            radius="sm"
            leftSection={
              <ThemeIcon color="blue" size={14} radius="xl" variant="filled">
                <IconChartLine size={8} />
              </ThemeIcon>
            }
          >
            Data Aktual
          </Badge>
        </Group>
        <Text size="xs" mt="xs" style={{ fontStyle: 'italic' }}>
          Grafik menampilkan data aktual (warna solid)
        </Text>
      </Paper>
        <SimpleGrid cols={{ base: 1, xs: 2, md: 2 }}>
          <Box>
            <Statbox
              title="Curah Hujan dan Total Kasus Malaria"
              icon={IconArticle}
              data={getChartData()}
              textStatbox={textStatbox}
              dataKey="monthYear"
              series={[
                { name: 'actual_hujan_mean', color: 'indigo.6', yAxisId:'right' },
                { name: 'actual_tot_pos', color: 'red.6', yAxisId:'left' },
              ]}
              isCollapsible
              useDualAxis={true}
              leftAxisLabel="Kasus Malaria"
              rightAxisLabel="Curah Hujan"
            />
          </Box>
          
          <Box>
            <Statbox
              title="Suhu dan Total Kasus Malaria"
              icon={IconArticle}
              data={getChartData()}
              textStatbox={textStatbox}
              dataKey="monthYear"
              series={[
                { name: 'actual_tm_mean', color: 'orange.6', yAxisId:'right' },
                { name: 'actual_tot_pos', color: 'red.6', yAxisId:'left' },
              ]}
              isCollapsible
              useDualAxis={true}
              leftAxisLabel="Kasus Malaria"
              rightAxisLabel="Suhu"
            />
          </Box>
        </SimpleGrid>
        
        <Space h="lg" />
        
        <SimpleGrid cols={{ base: 1, xs: 2, md: 2 }}>
        <Box>
            <Statbox
              title="Kelembapan Relatif dan Total Kasus Malaria"
              icon={IconArticle}
              data={getChartData()}
              textStatbox={textStatbox}
              dataKey="monthYear"
              series={[
                { name: 'actual_rh_mean', color: 'green.6', yAxisId:'right' },
                { name: 'actual_tot_pos', color: 'red.6', yAxisId:'left' },
              ]}
              isCollapsible
              useDualAxis={true}
              leftAxisLabel="Kasus Malaria"
              rightAxisLabel="Kelembapan Relatif"
            />
          </Box>
          <Box>
            <Statbox
              title="Kecepatan Angin dan Total Kasus Malaria"
              icon={IconArticle}
              data={getChartData()}
              textStatbox={textStatbox}
              dataKey="monthYear"
              series={[
                { name: 'actual_max_value_10v', color: 'yellow.6', yAxisId:'right' },
                { name: 'actual_tot_pos', color: 'red.6', yAxisId:'left' },
              ]}
              isCollapsible
              useDualAxis={true}
              leftAxisLabel="Kasus Malaria"
              rightAxisLabel="Kecepatan Angin"
            />
          </Box>
          
          {/* <Box>
            <Statbox
              title="Penggunaan Obat"
              icon={IconArticle}
              data={getChartData()}
              textStatbox={textStatbox}
              dataKey="monthYear"
              series={[
                { name: 'predicted_obat_standar', color: 'grey' },
                { name: 'predicted_obat_nonprogram', color: 'grey' },
                { name: 'predicted_obat_primaquin', color: 'grey' },
                { name: 'actual_obat_standar', color: 'indigo.6' },
                { name: 'actual_obat_nonprogram', color: 'blue.6' },
                { name: 'actual_obat_primaquin', color: 'teal.6' },
              ]}
              isCollapsible
            />
          </Box> */}
        </SimpleGrid>
        
      </>
    );
  };

  // Render table content
  const renderTableContent = () => {
    return (
      <>
        <Paper withBorder p="md" radius="md">
          <Group mb="md">
            <MonthPickerInput
              label="Filter Bulan/Tahun"
              placeholder="YYYY-MM"
              value={filterMonth}
              onChange={setFilterMonth}
              clearable
              w="auto"
              minDate={startDate || new Date(2019, 0, 1)}
              maxDate={endDate || undefined}
            />
            
            <Button 
              variant="outline" 
              onClick={() => {
                setFilterMonth(null);
              }}
              mt={24} // Align with the fields
            >
              Reset Filter
            </Button>
          </Group>
        </Paper>
        
        <Space h="md" />
        
        <TableRawData
          data={rawData}
          rowsPerPage={10}
          monthYear={getTimeInfoLabel(filterMonth, predictedMonthYear)}
        />
      </>
    );
  };

  // Render map content
  const renderMapContent = () => {
    return (
      <>
       <Paper withBorder p="md" radius="md">
          <Group mb="md">
            <MonthPickerInput
              label="Filter Bulan/Tahun"
              placeholder="YYYY-MM"
              value={filterMonth}
              onChange={setFilterMonth}
              clearable
              w="auto"
              minDate={startDate || new Date(2019, 0, 1)}
              maxDate={endDate || undefined}
            />
            
            <Button 
              variant="outline" 
              onClick={() => {
                setFilterMonth(null);
              }}
              mt={24} // Align with the fields
            >
              Reset Filter
            </Button>
          </Group>
        </Paper>
        
        <Space h="md" />
      <EnhancedMapVisualization 
        data={rawData} 
        predictedMonthYear={getTimeInfoLabel(filterMonth, predictedMonthYear)} 
      />
      </>
    );
  };

  // const dataSistemPeringatanDini = [
  //   // Kasus di daerah eliminasi (DKI Jakarta) dengan kasus indigenous
  //   {
  //     month: 1,
  //     year: 2023,
  //     status: "predicted",
  //     kd_kab: "3171",
  //     kd_prov: "31",
  //     province: "DKI JAKARTA",
  //     city: "JAKARTA PUSAT",
  //     predicted_tot_pos: 5,
  //     predicted_kematian_malaria: 0,
  //     predicted_penularan_indigenus: 1, // Melebihi ambang batas untuk daerah eliminasi (>= 1)
  //     status_endemis: "Eliminasi"
  //   },
    
  //   // Kasus di daerah endemis rendah (Jawa Barat) dengan kasus indigenous tinggi
  //   {
  //     month: 1,
  //     year: 2023,
  //     status: "predicted",
  //     kd_kab: "3273",
  //     kd_prov: "32",
  //     province: "JAWA BARAT",
  //     city: "BANDUNG",
  //     predicted_tot_pos: 15,
  //     predicted_kematian_malaria: 0,
  //     predicted_penularan_indigenus: 4, // Melebihi ambang batas untuk endemis rendah (>= 2)
  //     status_endemis: "Endemis Rendah"
  //   },
    
  //   // Kasus di daerah endemis sedang (Sulawesi Selatan) dengan total kasus tinggi
  //   {
  //     month: 1,
  //     year: 2023,
  //     status: "predicted",
  //     kd_kab: "7371",
  //     kd_prov: "73",
  //     province: "SULAWESI SELATAN",
  //     city: "MAKASSAR",
  //     predicted_tot_pos: 25, // Melebihi ambang batas untuk endemis sedang (>= 2)
  //     predicted_kematian_malaria: 0,
  //     predicted_penularan_indigenus: 15,
  //     status_endemis: "Endemis Sedang"
  //   },
    
  //   // Kasus di daerah endemis tinggi (Papua) dengan tingkat kematian tinggi
  //   {
  //     month: 1,
  //     year: 2023,
  //     status: "predicted",
  //     kd_kab: "9401",
  //     kd_prov: "94",
  //     province: "PAPUA",
  //     city: "JAYAPURA",
  //     predicted_tot_pos: 120, // Melebihi ambang batas untuk endemis tinggi (>= 2)
  //     predicted_kematian_malaria: 1, // Tingkat kematian: 1/120 = 0.83% > 0.5%
  //     predicted_penularan_indigenus: 80,
  //     status_endemis: "Endemis Tinggi III"
  //   },
    
  //   // Kasus di daerah endemis tinggi (Papua) dengan tingkat kematian sangat tinggi
  //   {
  //     month: 1,
  //     year: 2023,
  //     status: "predicted",
  //     kd_kab: "9402",
  //     kd_prov: "94",
  //     province: "PAPUA",
  //     city: "MIMIKA",
  //     predicted_tot_pos: 150,
  //     predicted_kematian_malaria: 3, // Tingkat kematian: 3/150 = 2% > 0.5%
  //     predicted_penularan_indigenus: 95,
  //     status_endemis: "Endemis Tinggi III"
  //   },
    
  //   // Data bulan berikutnya tanpa peringatan (tidak perlu ditampilkan)
  //   {
  //     month: 1,
  //     year: 2023,
  //     status: "predicted",
  //     kd_kab: "3171",
  //     kd_prov: "31",
  //     province: "DKI JAKARTA",
  //     city: "JAKARTA PUSAT",
  //     predicted_tot_pos: 2,
  //     predicted_kematian_malaria: 0,
  //     predicted_penularan_indigenus: 0, // Tidak melebihi ambang batas
  //     status_endemis: "Eliminasi"
  //   },
    
  //   // Data aktual (tidak akan dideteksi oleh sistem peringatan dini karena bukan prediksi)
  //   {
  //     month: 2,
  //     year: 2023,
  //     status: "predicted",
  //     kd_kab: "9401",
  //     kd_prov: "94",
  //     province: "PAPUA",
  //     city: "JAYAPURA",
  //     predicted_tot_pos: 110,
  //     predicted_kematian_malaria: 1,
  //     predicted_penularan_indigenus: 70,
  //     status_endemis: "Endemis Tinggi III"
  //   },
    
  //   // Data prediksi untuk bulan yang sudah lewat (tidak akan dideteksi)
  //   {
  //     month: 1,
  //     year: 2023,
  //     status: "predicted",
  //     kd_kab: "7371",
  //     kd_prov: "73",
  //     province: "SULAWESI SELATAN",
  //     city: "MAKASSAR",
  //     predicted_tot_pos: 30,
  //     predicted_kematian_malaria: 0,
  //     predicted_penularan_indigenus: 18,
  //     status_endemis: "Endemis Sedang"
  //   },
    
  //   // Data prediksi untuk >6 bulan ke depan (tidak akan dideteksi)
  //   {
  //     month: 1,
  //     year: 2023,
  //     status: "predicted",
  //     kd_kab: "3273",
  //     kd_prov: "32",
  //     province: "JAWA BARAT",
  //     city: "BANDUNG",
  //     predicted_tot_pos: 12,
  //     predicted_kematian_malaria: 0,
  //     predicted_penularan_indigenus: 5,
  //     status_endemis: "Endemis Rendah"
  //   }
  // ];
  

  return (
    <div className={classes.root}>
      <Title order={1}>Dashboard Monitoring Malaria</Title>
      <Space h="lg" />
      {/* Warning System */}
      <EarlyWarningSystemMalaria data={earlyWarningData} latestActualMonthYear={monthYear}/>
          
          <Space h="md" />
      {/* All filters in one Paper */}
      <Paper withBorder p="md" radius="md" mb="md">
        <SimpleGrid cols={{ base: 1, sm: 5, md: 5 }} spacing="md">
          <Select
            label="Provinsi"
            name="province"
            value={province}
            onChange={(value) => handleProvinceChange(value || '00')}
            placeholder="Pilih Provinsi"
            data={provinces}
            required
            allowDeselect
            searchable
            defaultValue='00'
          />
          
          <Select
            label="Kabupaten/Kota"
            name="city"
            value={city}
            onChange={(value) => handleCityChange(value || '')}
            placeholder={province === '00' ? "Select province first" : "Pilih Kabupaten/Kota"}
            data={cities}
            // disabled={province === '00'}
            required
            allowDeselect
            searchable
            defaultValue={''}
          />
          
          <Select
            label="Kecamatan"
            name="district"
            value={district}
            onChange={(value) => handleDistrictChange(value || '')}
            placeholder={province === '00' || district === '' ? "Select district first" : "Pilih Kecamatan"}
            data={districts}
            // disabled={(province === '00' || district === '' || districts.length === 0)}
            required
            allowDeselect
            searchable
            defaultValue={''}
          />
          
          <MonthPickerInput 
            label="Periode Awal"
            value={startDate} 
            onChange={setStartDate}
            minDate={new Date(2019, 0, 1)} // 0 = January in JavaScript Date
            maxDate={endDate || undefined}
          />
          

          <MonthPickerInput 
            label="Periode Akhir"
            value={endDate} 
            onChange={setEndDate}
            minDate={startDate || new Date(2019, 0, 1)}
          />
        </SimpleGrid>
      </Paper>

      {!hasData ? (
        <Paper withBorder p="xl" radius="md" mb="lg" bg="gray.0">
          <Text size="lg">
            Tidak ada data tersedia pada wilayah ini.
          </Text>
        </Paper>
      ) : (
        <>

          <Tabs value={activeTab} onChange={setActiveTab} mb="md">
            <Tabs.List>
              <Tabs.Tab value="dashboard">
                <Group>
                  <IconDashboard size={14} />
                  <span>Dashboard</span>
                </Group>
              </Tabs.Tab>
              <Tabs.Tab value="climate">
                <Group>
                  <IconCloud size={14} />
                  <span>Data Iklim</span>
                </Group>
              </Tabs.Tab>
              <Tabs.Tab value="table">
                <Group>
                  <IconTable size={14} />
                  <span>Data Tabel</span>
                </Group>
              </Tabs.Tab>
              <Tabs.Tab value="map">
                <Group>
                  <IconMap size={14} />
                  <span>Visualisasi Peta</span>
                </Group>
              </Tabs.Tab>
            </Tabs.List>
          </Tabs>
          
          {/* Tab content */}
          {activeTab === 'dashboard' && renderDashboardContent()}
          {activeTab === 'climate' && renderClimateContent()}
          {activeTab === 'table' && renderTableContent()}
          {activeTab === 'map' && renderMapContent()}
          {/* Floating Weather Widget */}
    
          {showWeatherWidget ? (
          <WeatherWidget 
            data={filteredWeatherData} 
            onClose={() => setShowWeatherWidget(false)} 
          />
          ) : (
            <ActionIcon
              color="cyan"
              variant="filled"
              radius="xl"
              size="lg"
              style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                zIndex: 1000,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              }}
              onClick={() => setShowWeatherWidget(true)}
              title="Tampilkan info cuaca"
            >
              <IconCloud size={20} />
            </ActionIcon>
          )}
        </>
      )}
    </div>
  );
};

export default MalariaPage;
