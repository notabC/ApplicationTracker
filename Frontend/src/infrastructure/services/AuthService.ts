// src/core/services/AuthService.ts
import { injectable } from 'inversify';
import { makeObservable, observable, action, runInAction } from 'mobx';
import { ApiClient } from '../api/apiClient';
import { API_ENDPOINTS } from '../api/endpoints';
import { IAuthService } from '../../domain/interfaces/IAuthService';

interface AuthResponse {
  isAuthenticated: boolean;
  email: string;
  user: {
    name: string | null;
    email: string;
    created_at: string;
  } | null;
}

@injectable()
export class AuthService implements IAuthService {
  @observable isAuthenticated = false;
  @observable userEmail: string | null = null;
  @observable userName: string | null = null;
  @observable isAuthenticating = false;

  constructor() {
    makeObservable(this);
    ApiClient.setAuthService(this);

    const storedToken = localStorage.getItem('jwt_token');
    if (storedToken) {
      ApiClient.setAuthorizationToken(storedToken);
    }

    this.checkAuthentication();
  }

  @action
  async checkAuthentication() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      localStorage.setItem('jwt_token', token);
      ApiClient.setAuthorizationToken(token);
      const newUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }

    const storedToken = localStorage.getItem('jwt_token');
    if (!storedToken) {
      runInAction(() => {
        this.isAuthenticated = false;
        this.userEmail = null;
        this.userName = null;
      });
      return;
    }

    try {
      const response = await ApiClient.get<AuthResponse>(API_ENDPOINTS.AUTH.CHECK_AUTH);
      runInAction(() => {
        this.isAuthenticated = response.isAuthenticated;
        this.userEmail = response.user?.email || null;
        this.userName = response.user?.name || null;
      });

      if (!response.isAuthenticated) {
        localStorage.removeItem('jwt_token');
      }
    } catch (e) {
      console.error('Auth check error:', e);
      runInAction(() => {
        this.isAuthenticated = false;
        this.userEmail = null;
        this.userName = null;
      });
      localStorage.removeItem('jwt_token');
    }
  }

  @action
  async signOut() {
    try {
      await ApiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    }

    localStorage.removeItem('jwt_token');
    runInAction(() => {
      this.isAuthenticated = false;
      this.userEmail = null;
      this.userName = null;
    });

    window.location.reload();
  }

  @action
  async login(email: string, password: string): Promise<boolean> {
    try {
      const response = await ApiClient.post<{access_token: string, token_type: string}>(API_ENDPOINTS.AUTH.LOGIN, { email, password });
      const token = response.access_token;
      localStorage.setItem('jwt_token', token);
      ApiClient.setAuthorizationToken(token);
      await this.checkAuthentication();
      return this.isAuthenticated;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  @action
  async register(email: string, password: string, name: string): Promise<boolean> {
    try {
      await ApiClient.post(API_ENDPOINTS.AUTH.REGISTER, { email, password, name });
      // Registration successful
      return true;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  }

  @action
  async authenticate(): Promise<boolean> {
    try {
      runInAction(() => {
        this.isAuthenticating = true;
      });

      const response = await ApiClient.get<{ url: string }>(API_ENDPOINTS.GMAIL.AUTH_URL);
      window.location.href = response.url;
      return false; 
    } catch (error) {
      console.error('Auth error:', error);
      return false;
    } finally {
      runInAction(() => {
        this.isAuthenticating = false;
      });
    }
  }

  // New methods for password reset flow
  @action
  async forgotPassword(email: string): Promise<boolean> {
    try {
      await ApiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
      return true;
    } catch (error) {
      console.error('Forgot password error:', error);
      return false;
    }
  }

  @action
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      await ApiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, new_password: newPassword });
      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      return false;
    }
  }
}