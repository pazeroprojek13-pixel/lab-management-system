import apiClient from './client';
import type { AuthResponse, LoginInput, RegisterInput } from '../types';

export const authApi = {
  login: async (data: LoginInput): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterInput): Promise<{ message: string; user: Omit<AuthResponse['user'], 'role'> & { role: string; createdAt: string } }> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  me: async (): Promise<{ user: AuthResponse['user'] }> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};
