// src/core/api/apiClient.ts
import axios, { AxiosInstance, AxiosError } from 'axios';

export class ApiClient {
  private static instance: AxiosInstance;

  private static getInstance(): AxiosInstance {
    if (!ApiClient.instance) {
      ApiClient.instance = axios.create({
        baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      // Request interceptor
      ApiClient.instance.interceptors.request.use(
        (config) => {
          // You can add auth token here when implementing auth
          // const token = localStorage.getItem('token');
          // if (token) {
          //   config.headers.Authorization = `Bearer ${token}`;
          // }
          return config;
        },
        (error) => Promise.reject(error)
      );

      // Response interceptor
      ApiClient.instance.interceptors.response.use(
        (response) => response,
        (error: AxiosError) => {
          if (error.response?.status === 401) {
            // Handle unauthorized access
            // Example: router.push('/login');
          }
          return Promise.reject(error);
        }
      );
    }

    return ApiClient.instance;
  }

  static async get<T>(url: string, params?: object): Promise<T> {
    const response = await this.getInstance().get<T>(url, { params });
    return response.data;
  }

  static async post<T>(url: string, data?: object): Promise<T> {
    const response = await this.getInstance().post<T>(url, data);
    return response.data;
  }

  static async put<T>(url: string, data?: object): Promise<T> {
    const response = await this.getInstance().put<T>(url, data);
    return response.data;
  }

  static async delete<T>(url: string): Promise<T> {
    const response = await this.getInstance().delete<T>(url);
    return response.data;
  }

  static async patch<T>(url: string, data?: object): Promise<T> {
    const response = await this.getInstance().patch<T>(url, data);
    return response.data;
  }
}