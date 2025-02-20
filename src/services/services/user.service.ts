import { SignInResponse } from "../../@types/auth";
import appConfig from "../../configs/app.config";
import ApiService from "../../services/ApiService";

const baseUrl = `${appConfig.backendApiUrl}`;

export const UserService = { 
  async register(InputRegistrationData : InputRegistrationData): Promise<SignInResponse> {
    const res = await ApiService.fetchData<InputRegistrationData, SignInResponse>({
      url: `${baseUrl}/signup`,
      method: 'POST',
      data: InputRegistrationData
    })
    return res.data;
  },

}