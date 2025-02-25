import axios from 'axios';
import appConfig from '../configs/app.config';
import { logout } from '../store/slices/authSlice';
import { store } from '../store/store';
import deepParseJson from '../utils/deepParseJson';

const unauthorizedCode = [401];

const BaseService = axios.create({
  timeout: 10000000,
  baseURL: appConfig.backendApiUrl,
});

BaseService.interceptors.request.use(
  (config) => {
    const rawPersistData = localStorage.getItem(appConfig.persistKey);
    const persistData = deepParseJson(rawPersistData);

    let accessToken = (persistData as any)?.auth.session.token;
    if (!accessToken) {
      accessToken = store.getState().auth.access_token 
    }

    // config.headers["X-Authorization"] = appConfig.backendApiKey

    if (accessToken) {  
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

BaseService.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    if (response && unauthorizedCode.includes(response.status)) {
      store.dispatch(logout());
    }

    return Promise.reject(error);
  }
);

export default BaseService;
