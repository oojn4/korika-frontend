import { ActionIcon, Badge, Box, Button, Group, Paper, Select, SimpleGrid, Space, Tabs, Text, ThemeIcon, Title } from '@mantine/core';
import { MonthPickerInput } from '@mantine/dates';
import { IconAlertCircle, IconArticle, IconChartBar, IconChartLine, IconCloud, IconDashboard, IconInfoCircle, IconMap, IconMedicalCross, IconTable } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { BMKGWeatherResponse, DataDBD, DBDAggregateDataItem, DBDRawDataItem, Master } from '../../@types/dashboard';
import EnhancedMapVisualizationDBD from '../../components/DBDMapVisualization/EnhancedMapVisualizationDBD';
import EarlyWarningSystemDBD from '../../components/EarlyWarningSystemDBD/EarlyWarningSystemDBD';
import KPICard from '../../components/KPICard/KPICard'; // Assumed new component
import Statbox from '../../components/Statbox/Statbox';
import TableRawDataDBD from '../../components/TableRawData/TableRawDataDBD';
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
  code: string;       // Regular code
  bmkgCode: string;   // BMKG code
  name: string;       // Name
}

const DBDPage = () => {
  const [aggregateData, setAggregateData] = useState<DBDAggregateDataItem[]>([]);
  const [mergedData, setMergedData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [rawData, setRawData] = useState<DBDRawDataItem[]>([]);
  const [weatherData, setWeatherData] = useState<BMKGWeatherResponse | null>(null);
  const [filteredWeatherData, setFilteredWeatherData] = useState<BMKGWeatherResponse | null>(null);
  
    const [earlyWarningData,setEarlyWarningData] = useState<DataDBD[]>([])
  const [activeTab, setActiveTab] = useState<string | null>('dashboard');
  const [provinceMapping, setProvinceMapping] = useState<CodeMapping[]>([]);
  const [cityMapping, setCityMapping] = useState<CodeMapping[]>([]);
  const [province, setProvince] = useState<string>('00');
  const [city, setCity] = useState<string>('');
  const [monthYear, setMonthYear] = useState<string>('');
  const [predictedMonthYear, setPredictedMonthYear] = useState<string>('');
  const [textStatbox, setTextStatbox] = useState<TextStatBox[]>([]);
  
  // Date Picker States
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  
  // State for provinces dropdown
  const [provinces, setProvinces] = useState<any[]>([]);
  
  // State for cities dropdown
  const [cities, setCities] = useState<any[]>([]);
  const [hasData, setHasData] = useState<boolean>(true);
  const [filterMonth, setFilterMonth] = useState<Date | null>(null);
  
  // KPI Indicators
  const [kpiData, setKpiData] = useState({
    totalCases: 0,
    totalDeaths: 0,
    caseFatalityRate: 0,
    totalRate: 0, // m_to_m change for cases
    deathRate: 0, // m_to_m change for deaths
    yoyChangeCase: 0,
    yoyChangeDeath: 0
  });
  const [showWeatherWidget, setShowWeatherWidget] = useState<boolean>(true);

  

  const getProvinceBMKGCode = (provinceCode: string): string => {
    if (provinceCode === '00') return '00';
    const province = provinceMapping.find(p => p.code === provinceCode);
    return province ? province.bmkgCode : provinceCode;
  };
  
  const getCityBMKGCode = (cityCode: string): string => {
    if (!cityCode) return '';
    const city = cityMapping.find(c => c.code === cityCode);
    return city ? city.bmkgCode : cityCode;
  };

  const handleFetchEarlyWarning = async () => {
    try {
      const response = await DashboardService.indexWarningDBD();
      if (response.success) {
        setEarlyWarningData(response.data);
      }
      } catch (error) {
      return;
    }
  };
  
  // Function to fetch provinces list
  const handleFetchProvinces = async () => {
    try {
      const response = await DashboardService.fetchProvinces();
      
      // Store the mapping data
      const mappingData: CodeMapping[] = [
        { code: '00', bmkgCode: '00', name: 'TOTAL' },
        ...response.data.map((item: any) => ({
          code: item.code,
          bmkgCode: item.bmkg,
          name: item.name,
        })),
      ];
      
      setProvinceMapping(mappingData);
      
      // Create dropdown items
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
  const handleProvinceChange = (value: string) => {
    setProvince(value || '00');
    
    // If selecting TOTAL, clear city selection
    if (value === '00') {
      setCities([{ value: '', label: 'ALL' }]);
      setCity('');
    } else {
      // Otherwise fetch the cities for the selected province
      handleFetchCities(value);
    }
  };
  
  // Function to handle city change
  const handleCityChange = (value: string) => {
    setCity(value || '');
  };
  
  const handleFetchCities = async (provinceCode: string) => {
    try {
      if (provinceCode === '00') {
        setCities([{ value: '', label: 'ALL' }]);
        setCityMapping([]);
        setCity('');
        return;
      }
      
      const response = await DashboardService.fetchCities(provinceCode);
      
      // Store mapping data
      const mappingData: CodeMapping[] = [
        { code: '', bmkgCode: '', name: 'ALL' },
        ...response.data.map((item: any) => ({
          code: item.code,
          bmkgCode: item.bmkg || item.code,
          name: item.name,
        })),
      ];
      
      setCityMapping(mappingData);
      
      // Create dropdown items
      const arrayCities: ComboboxItem[] = [
        { value: '', label: 'ALL' },
        ...response.data.map((item: Master) => ({
          value: item.code,
          label: item.name,
        })),
      ];
      
      setCities(arrayCities);
      setCity('');
    } catch (error) {
      setCities([{ value: '', label: 'ALL' }]);
      setCityMapping([]);
      setCity('');
      return;
    }
  };
  
  // Function to fetch weather data
  const handleFetchWeatherData = async () => {
    try {
      // Use BMKG codes for weather API
      let provinceCode = province;
      let cityCode = city;
      let response = null;
      if (province && province !== '00') {
        // Convert to BMKG code
        provinceCode = getProvinceBMKGCode(province);
        response = await WeatherService.fetchWeatherData(
          `adm1=${provinceCode}`
        );
      } else {
        provinceCode = '';
      }
      
      if (city) {
        // Convert to BMKG code
        cityCode = getCityBMKGCode(city);
        const formattedCityCode = cityCode.replace(/^(\d{2})(\d{2})$/, '$1.$2');
        response = await WeatherService.fetchWeatherData(
          `adm2=${formattedCityCode}`
        );
      } else {
        cityCode = '';
      }
      
      
      
      if (response?.success === true) {
        setWeatherData(response?.data);
      } else {
        setWeatherData(null);
      }
    } catch (error) {
      setWeatherData(null);
      return;
    }
  };


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
  
  // Function to fetch aggregate data
  const handleFetchAggregateData = async () => {
    try {
      const start = startDate ? startDate.getFullYear().toString() + "-" + (startDate.getMonth() + 1).toString() : '';
      const end = endDate ? endDate.getFullYear().toString() + "-" + (endDate.getMonth() + 1).toString() : '';
  
      const response = await DashboardService.indexAggregateDataDBD(
        province || '00',
        city || '',
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
          resetKPIData();
        } else {
          setHasData(true);
          const updatedData = response.data.map((item: { month: any; year: any; }) => ({
            ...item,
            monthYear: `${item.month}-${item.year}`,
          }));
          setAggregateData(updatedData);
          
          // Extract KPI data from the latest data point
          updateKPIData(updatedData);
        }
      }
    } catch (error) {
      setHasData(false);
      resetKPIData();
      return;
    }
  };
  
  // Reset KPI data to defaults
  const resetKPIData = () => {
    setKpiData({
      totalCases: 0,
      totalDeaths: 0,
      caseFatalityRate: 0,
      totalRate: 0,
      deathRate: 0,
      yoyChangeCase: 0,
      yoyChangeDeath: 0
    });
  };
  
  // Update KPI data based on the latest aggregate data
  const updateKPIData = (data: DBDAggregateDataItem[]) => {
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
    const totalCases = latestData.dbd_p || 0;
    const totalDeaths = latestData.dbd_m || 0;
    
    // Case fatality rate
    const caseFatalityRate = totalCases > 0 ? (totalDeaths / totalCases) * 100 : 0;
    
    // Monthly change rates
    const totalRate = latestData.dbd_p_m_to_m_change || 0;
    const deathRate = latestData.dbd_m_m_to_m_change || 0;
    
    // Year on year changes
    const yoyChangeCase = latestData.dbd_p_y_on_y_change || 0;
    const yoyChangeDeath = latestData.dbd_m_y_on_y_change || 0;
    
    // Set the updated KPI data
    setKpiData({
      totalCases,
      totalDeaths,
      caseFatalityRate,
      totalRate,
      deathRate,
      yoyChangeCase,
      yoyChangeDeath
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
  
      // Call API with monthYear filter
      const response = await DashboardService.indexRawDataDBD(
        provinceParam,
        city || '',
        monthYear
      );
      
      if (response.success === true) {
        const updatedData = response.data.map((item: { month: any; year: any; }) => ({
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
  useEffect(() => {
    handleFetchEarlyWarning();
  }, [earlyWarningData]);
  // Effect untuk handle perubahan filter
  useEffect(() => {
    if (province && province !== '00') {
      if (!weatherData) {
        
        // If no data exists, fetch province data
        handleFetchWeatherData();
      } else {
        if (city) {
          // If only city is selected (no district), filter by city
          setFilteredWeatherData(getCityAggregateData(weatherData, city));
        } else {
          // If only province is selected (no city/district), show province aggregate
          setFilteredWeatherData(getProvinceAggregateData(weatherData));
        }
      }
    }
  }, [province, city, weatherData]);
  
  // Get filtered data for a specific chart
  const getChartData = () => {
    return filteredData.length > 0 ? filteredData : mergedData;
  };
  
  // Fetch provinces on component mount
  useEffect(() => {
    handleFetchProvinces();
  }, []);
  
  // Initialize cities with ALL options on component mount
  useEffect(() => {
    // When component mounts, ensure the cities dropdown has the ALL option
    if (province === '00') {
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
  }, [province, city]);
  
  // Fetch raw data when filters change
  useEffect(() => {
    handleFetchRawData();
  }, [province, city, filterMonth]); 
  
  // Fetch weather data when location filters change
  useEffect(() => {
    handleFetchWeatherData();
  }, [province, city]);
  
  // Process aggregate data to create merged dataset and initialize date pickers
  useEffect(() => {
    if (aggregateData?.length) {
      // Filter actual and predicted data
      const actualData = aggregateData.filter((item) => item.status === 'actual');
      const predictedData = aggregateData.filter((item) => item.status === 'predicted');
      
      // Find the latest actual data point
      const maxActualItem = actualData.reduce<DBDAggregateDataItem | null>((maxItem, currentItem) => {
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
        new Set([...actualData, ...predictedData].map((d: any) => d.monthYear))
      ).sort((a: string, b: string) => {
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
      
      // Create the merged data structure for charts
      const mergedData = allMonthYears.map((monthYear) => {
        // Find the items for this monthYear
        const actualItem = actualData.find((item: any) => item.monthYear === monthYear);
        const predictedItem = predictedData.find((item: any) => item.monthYear === monthYear);
        
        // Create base object with monthYear
        const result: any = { monthYear };
        
        // For actual data
        if (actualItem) {
          Object.keys(actualItem).forEach(key => {
            if (key !== 'monthYear') {
              // Add with actual_ prefix
              result[`actual_${key}`] = actualItem[key as keyof DBDAggregateDataItem];
            }
          });
        }
        
        // For predicted data
        if (predictedItem) {
          Object.keys(predictedItem).forEach(key => {
            if (key !== 'monthYear') {
              // Add with predicted_ prefix
              result[`predicted_${key}`] = predictedItem[key as keyof DBDAggregateDataItem];
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
          (item) => item.status === 'predicted' && item.year === nextYear && item.month === nextMonth
        );
        
        const predictedMonthYearTemp = nextMonthPredictedData.length > 0 
          ? `${nextMonthPredictedData[0]?.month.toString()}-${nextMonthPredictedData[0]?.year.toString()}` 
          : '';
        
        setPredictedMonthYear(predictedMonthYearTemp);
        
        // Generate text statbox data
        const mappedData = nextMonthPredictedData.map((predictedItem) => {
          return Object.keys(predictedItem)
            .filter((key) => typeof predictedItem[key as keyof DBDAggregateDataItem] === 'number')
            .map((attribute) => {
              const yonyKey = `${attribute}_y_on_y_change`;
              const mtomKey = `${attribute}_m_to_m_change`;
              return {
                label: `predicted_${attribute}`,
                count: typeof predictedItem[attribute as keyof DBDAggregateDataItem] === 'number' 
                  ? predictedItem[attribute as keyof DBDAggregateDataItem] as number
                  : 0,
                y_on_y: typeof predictedItem[yonyKey as keyof DBDAggregateDataItem] === 'number' 
                  ? (predictedItem[yonyKey as keyof DBDAggregateDataItem] as number) 
                  : null,
                m_to_m: typeof predictedItem[mtomKey as keyof DBDAggregateDataItem] === 'number' 
                  ? (predictedItem[mtomKey as keyof DBDAggregateDataItem] as number) 
                  : null,
                color: (Number(predictedItem[attribute as keyof DBDAggregateDataItem]) ?? 0) >= 0 ? 'green' : 'red',
                color_y_on_y: (Number(predictedItem[yonyKey as keyof DBDAggregateDataItem]) ?? 0) <= 0 ? 'green' : 'red',
                color_m_to_m: (Number(predictedItem[mtomKey as keyof DBDAggregateDataItem]) ?? 0) <= 0 ? 'green' : 'red',
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
          <ActionIcon
            variant="light"
            color="red"
            radius="xl"
            size="lg"
            title="Informasi KPI"
          >
            <IconInfoCircle size={20} />
          </ActionIcon>
        </Group>
      </Paper>
      <SimpleGrid cols={{ base: 2, xs: 2, md: 4 }} spacing="md">
        <KPICard 
          title="Total Kasus DBD"
          value={kpiData.totalCases}
          icon={<IconAlertCircle size={24} />}
          color="red"
          footer={<Group>
            <Text c="dimmed" size="sm">Dibandingkan Bulan Lalu</Text>
            <Badge color={kpiData.totalRate < 0 ? "green" : "red"}>{kpiData.totalRate.toFixed(1)}%</Badge>
          </Group>}
          description={null}
        />
        
        <KPICard 
          title="Total Kematian dengan DBD"
          value={kpiData.totalDeaths}
          icon={<IconMedicalCross size={24} />}
          color="red"
          footer={<Group>
            <Text c="dimmed" size="sm">Dibandingkan Bulan Lalu</Text>
            <Badge color={kpiData.deathRate < 0 ? "green" : "red"}>{kpiData.deathRate.toFixed(1)}%</Badge>
          </Group>}
          description={null}
        />
        
        <KPICard 
          title="Case Fatality Rate"
          value={`${kpiData.caseFatalityRate.toFixed(2)}%`}
          icon={<IconChartBar size={24} />}
          color="orange"
          footer={<Group>
            <Text c="dimmed" size="sm">Target: &lt;0.5%</Text>
            <Badge color={kpiData.caseFatalityRate < 0.5 ? "green" : "red"}>
              {kpiData.caseFatalityRate < 0.5 ? "Tercapai" : "Belum Tercapai"}
            </Badge>
          </Group>}
          description={null}
        />
        
        <KPICard 
          title="Tren Tahunan"
          value={kpiData.yoyChangeCase > 0 ? "Meningkat" : "Menurun"}
          icon={<IconChartLine size={24} />}
          color={kpiData.yoyChangeCase < 0 ? "green" : "red"}
          footer={<Group>
            <Text c="dimmed" size="sm">Perubahan YoY</Text>
            <Badge color={kpiData.yoyChangeCase < 0 ? "green" : "red"}>{kpiData.yoyChangeCase.toFixed(1)}%</Badge>
          </Group>}
          description={null}
        />
      </SimpleGrid>
      </>
    );
  };

  

  // Render main dashboard content
  const renderDashboardContent = () => {
    const formattedPredictionDate = predictedMonthYear ? convertDateFormat(predictedMonthYear) : 'N/A';
  
    return (
      <>
        {renderKPICards()}
        
        <Space h="md" />
        
        <Paper withBorder p="md" radius="md" my="md" bg="orange.0">
          <Group>
            <div>
              <Title order={4}>Tren dan Prediksi DBD</Title>
              <Text size="sm" color="dimmed">
                Menampilkan data historis dan prediksi hingga {formattedPredictionDate}
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
            }>
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
              title="Kasus DBD (DBD_P)"
              icon={IconArticle}
              data={getChartData()}
              textStatbox={textStatbox}
              dataKey="monthYear"
              series={[
                { name: 'predicted_dbd_p', color: 'grey' },
                { name: 'actual_dbd_p', color: 'red.6' },
              ]}
              isCollapsible
            />
          </Box>
          
          <Box>
            <Statbox
              title="Kematian dengan DBD (DBD_M)"
              icon={IconArticle}
              data={getChartData()}
              textStatbox={textStatbox}
              dataKey="monthYear"
              series={[
                { name: 'predicted_dbd_m', color: 'grey' },
                { name: 'actual_dbd_m', color: 'red.9' },
              ]}
              isCollapsible
            />
          </Box>
        </SimpleGrid>
        
        <Space h="lg" />
        
        {/* <SimpleGrid cols={{ base: 1, xs: 2, md: 2 }}>
          <Box>
            <Statbox
              title="Perubahan MTM Kasus (DBD_P)"
              icon={IconArticle}
              data={getChartData("MTM Kasus")}
              textStatbox={textStatbox}
              dataKey="monthYear"
              series={[
                { name: 'predicted_dbd_p_m_to_m_change', color: 'grey' },
                { name: 'actual_dbd_p_m_to_m_change', color: 'orange.6' },
              ]}
              isCollapsible
            />
          </Box>
          
          <Box>
            <Statbox
              title="Perubahan MTM Kematian (DBD_M)"
              icon={IconArticle}
              data={getChartData("MTM Kematian")}
              textStatbox={textStatbox}
              dataKey="monthYear"
              series={[
                { name: 'predicted_dbd_m_m_to_m_change', color: 'grey' },
                { name: 'actual_dbd_m_m_to_m_change', color: 'orange.9' },
              ]}
              isCollapsible
            />
          </Box>
        </SimpleGrid>
        
        <Space h="lg" />
        
        <SimpleGrid cols={{ base: 1, xs: 2, md: 2 }}>
          <Box>
            <Statbox
              title="Perubahan YOY Kasus (DBD_P)"
              icon={IconArticle}
              data={getChartData("YOY Kasus")}
              textStatbox={textStatbox}
              dataKey="monthYear"
              series={[
                { name: 'predicted_dbd_p_y_on_y_change', color: 'grey' },
                { name: 'actual_dbd_p_y_on_y_change', color: 'blue.6' },
              ]}
              isCollapsible
            />
          </Box>
          
          <Box>
            <Statbox
              title="Perubahan YOY Kematian (DBD_M)"
              icon={IconArticle}
              data={getChartData("YOY Kematian")}
              textStatbox={textStatbox}
              dataKey="monthYear"
              series={[
                { name: 'predicted_dbd_m_y_on_y_change', color: 'grey' },
                { name: 'actual_dbd_m_y_on_y_change', color: 'blue.9' },
              ]}
              isCollapsible
            />
          </Box>
        </SimpleGrid> */}
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
        
        <TableRawDataDBD
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
      <EnhancedMapVisualizationDBD
        data={rawData} 
        predictedMonthYear={getTimeInfoLabel(filterMonth, predictedMonthYear)} 
      />
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
            <Title order={4}>Korelasi Data Iklim dengan Kasus Lepto</Title>
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
              title="Curah Hujan dan Total Kasus DBD"
              icon={IconArticle}
              data={getChartData()}
              textStatbox={textStatbox}
              dataKey="monthYear"
              series={[
                { name: 'actual_hujan_mean', color: 'indigo.6', yAxisId:'right' },
                { name: 'actual_dbd_m', color: 'red.6', yAxisId:'left' },
              ]}
              isCollapsible
              useDualAxis={true}
              leftAxisLabel="Kasus DBD"
              rightAxisLabel="Curah Hujan"
            />
          </Box>
          
          <Box>
            <Statbox
              title="Suhu dan Total Kasus DBD"
              icon={IconArticle}
              data={getChartData()}
              textStatbox={textStatbox}
              dataKey="monthYear"
              series={[
                { name: 'actual_tm_mean', color: 'orange.6', yAxisId:'right' },
                { name: 'actual_dbd_m', color: 'red.6', yAxisId:'left' },
              ]}
              isCollapsible
              useDualAxis={true}
              leftAxisLabel="Kasus DBD"
              rightAxisLabel="Suhu"
            />
          </Box>
        </SimpleGrid>
        
        <Space h="lg" />
        
        <SimpleGrid cols={{ base: 1, xs: 2, md: 2 }}>
        <Box>
            <Statbox
              title="Kelembapan Relatif dan Total Kasus DBD"
              icon={IconArticle}
              data={getChartData()}
              textStatbox={textStatbox}
              dataKey="monthYear"
              series={[
                { name: 'actual_rh_mean', color: 'green.6', yAxisId:'right' },
                { name: 'actual_dbd_m', color: 'red.6', yAxisId:'left' },
              ]}
              isCollapsible
              useDualAxis={true}
              leftAxisLabel="Kasus DBD"
              rightAxisLabel="Kelembapan Relatif"
            />
          </Box>
          <Box>
            <Statbox
              title="Kecepatan Angin dan Total Kasus DBD"
              icon={IconArticle}
              data={getChartData()}
              textStatbox={textStatbox}
              dataKey="monthYear"
              series={[
                { name: 'actual_max_value_10v', color: 'yellow.6', yAxisId:'right' },
                { name: 'actual_dbd_m', color: 'red.6', yAxisId:'left' },
              ]}
              isCollapsible
              useDualAxis={true}
              leftAxisLabel="Kasus DBD"
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

  return (
    <div className={classes.root}>
      <Title order={1}>Dashboard Monitoring DBD (Demam Berdarah Dengue)</Title>
      <Space h="lg" />
      <EarlyWarningSystemDBD data={earlyWarningData} latestActualMonthYear={monthYear}/>
      
      {/* All filters in one Paper */}
      <Paper withBorder p="md" radius="md" mb="md">
        <SimpleGrid cols={{ base: 1, sm: 4, md: 4 }} spacing="md">
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
            No data available for the selected filters. Please adjust your selection.
          </Text>
        </Paper>
      ) : (
        <>
          {/* Tab navigation */}
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

export default DBDPage;