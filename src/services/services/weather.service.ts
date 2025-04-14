import { WeatherResponse } from "../../@types/dashboard";
import appConfig from "../../configs/app.config";
import ApiService from "../ApiService";

const baseUrl = `${appConfig.backendApiUrl}`;
export const WeatherService = {
  async fetchWeatherData(params: string): Promise<WeatherResponse> {
    try {
      // Use the pre-formatted parameter string
      const params1 = params ? params : `adm1=31`;
      const url = `${baseUrl}/get-weather?params=${params1}`
      // Make the actual API call to BMKG
      const response = await ApiService.fetchData<undefined, any>({
        url,
        method: 'GET',
        headers: {
          'Accept': 'application/json'
          // Add any other headers that might be required
        }
      });
      
      // If successful, return the data
      if (response && response.data) {
        return {
          success: true,
          data: response.data
        };
      } else {
        throw new Error('Failed to fetch weather data');
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
      
      // Return a failure response
      return {
        success: false,
        data: null
      };
    }
  },
  
 
};