import apiClient from './client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: 'CREATOR' | 'BACKER' | 'MENTOR' | 'ADMIN';
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isVerified: boolean;
  };
}

export const authApi = {
  login: (credentials: LoginCredentials) =>
    apiClient.post<any, AuthResponse>('/auth/login', credentials),

  register: (data: RegisterData) =>
    apiClient.post<any, AuthResponse>('/auth/register', data),

  verifyToken: (token: string) =>
    apiClient.post('/auth/verify-token', { token }),

  getMe: () => apiClient.get('/users/me'),
};
