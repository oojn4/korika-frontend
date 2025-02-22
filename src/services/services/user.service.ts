import { SignInResponse } from "../../@types/auth";
import appConfig from "../../configs/app.config";
import ApiService from "../../services/ApiService";

// Define types
export interface User {
  id: number;
  full_name: string;
  email: string;
  access_level: string;
  id_faskes?: number;
}

export interface UserResponse {
  success: boolean;
  data: User[];
  error?: string;
}

export interface SingleUserResponse {
  success: boolean;
  data: User;
  error?: string;
}

export interface CreateUserData {
  full_name: string;
  email: string;
  password: string;
  access_level: string;
  id_faskes?: number;
}

export interface UpdateUserData {
  full_name?: string;
  email?: string;
  password?: string;
  access_level?: string;
  id_faskes?: number;
}
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
  async getAllUsers(): Promise<UserResponse> {
    const res = await ApiService.fetchData<undefined, UserResponse>({
      url: `${baseUrl}/users`,
      method: 'GET',
    });
    return res.data;
  },

  // Get user by ID
  async getUserById(userId: number): Promise<SingleUserResponse> {
    const res = await ApiService.fetchData<undefined, SingleUserResponse>({
      url: `${baseUrl}/users/${userId}`,
      method: 'GET',
    });
    return res.data;
  },

  // Create new user
  async createUser(userData: CreateUserData): Promise<SingleUserResponse> {
    const res = await ApiService.fetchData<CreateUserData, SingleUserResponse>({
      url: `${baseUrl}/users`,
      method: 'POST',
      data: userData,
    });
    return res.data;
  },

  // Update existing user
  async updateUser(userId: number, userData: UpdateUserData): Promise<SingleUserResponse> {
    const res = await ApiService.fetchData<UpdateUserData, SingleUserResponse>({
      url: `${baseUrl}/users/${userId}`,
      method: 'PUT',
      data: userData,
    });
    return res.data;
  },

  // Delete user
  async deleteUser(userId: number): Promise<{ success: boolean; data: { deleted: boolean }; error?: string }> {
    const res = await ApiService.fetchData<undefined, { success: boolean; data: { deleted: boolean }; error?: string }>({
      url: `${baseUrl}/users/${userId}`,
      method: 'DELETE',
    });
    return res.data;
  },

  // Get users by access level
  async getUsersByAccessLevel(accessLevel: string): Promise<UserResponse> {
    const res = await ApiService.fetchData<undefined, UserResponse>({
      url: `${baseUrl}/users/access-level/${accessLevel}`,
      method: 'GET',
    });
    return res.data;
  },

  // Get user by email
  async getUserByEmail(email: string): Promise<SingleUserResponse> {
    const res = await ApiService.fetchData<undefined, SingleUserResponse>({
      url: `${baseUrl}/users/email/${email}`,
      method: 'GET',
    });
    return res.data;
  },
}