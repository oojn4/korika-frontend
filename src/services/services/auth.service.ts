import { SignInCredential, SignInResponse } from "../../@types/auth";
import appConfig from "../../configs/app.config";
import ApiService from "../../services/ApiService";

const baseUrl = `${appConfig.backendApiUrl}`;

export const AuthService = { 
  async signIn(email: string, password: string): Promise<SignInResponse> {
    const res = await ApiService.fetchData<SignInCredential, SignInResponse>({
      url: `${baseUrl}/signin`,
      method: 'POST',
      data: {email, password}
    })
    return res.data;
  },
  
}
