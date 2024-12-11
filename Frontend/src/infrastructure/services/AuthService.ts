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

    // If a JWT token was previously stored, set it
    const storedToken = localStorage.getItem('jwt_token');
    if (storedToken) {
      ApiClient.setAuthorizationToken(storedToken);
    }

    // Attempt to verify authentication status on initialization
    this.checkAuthentication();
  }

  @action
  async checkAuthentication() {
    // First, check if we just returned from OAuth with a token in the URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      // Store the JWT token and update the ApiClient authorization header
      localStorage.setItem('jwt_token', token);
      ApiClient.setAuthorizationToken(token);

      // Remove the token parameter from the URL so it doesn't get processed again
      const newUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }

    // Now, proceed with the normal auth check using whatever token we have in localStorage
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
      const response = await ApiClient.get<AuthResponse>(API_ENDPOINTS.GMAIL.CHECK_AUTH);
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
      await ApiClient.post(API_ENDPOINTS.GMAIL.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    }

    localStorage.removeItem('jwt_token');
    runInAction(() => {
      this.isAuthenticated = false;
      this.userEmail = null;
      this.userName = null;
    });
  }

  @action
  async authenticate(): Promise<boolean> {
    try {
      runInAction(() => {
        this.isAuthenticating = true;
      });

      // Start the OAuth flow if no token is in the URL
      const response = await ApiClient.get<{ url: string }>(API_ENDPOINTS.GMAIL.AUTH_URL);
      window.location.href = response.url;
      return false; // The user will be redirected, so no immediate boolean needed.
    } catch (error) {
      console.error('Auth error:', error);
      return false;
    } finally {
      runInAction(() => {
        this.isAuthenticating = false;
      });
    }
  }
}