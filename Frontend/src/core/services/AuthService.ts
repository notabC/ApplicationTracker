// src/core/services/AuthService.ts
import { injectable } from 'inversify';
import { makeObservable, observable, action, runInAction } from 'mobx';
import { ApiClient } from '../api/apiClient';
import { API_ENDPOINTS } from '../api/endpoints';
import { IAuthService } from '../interfaces/auth/IAuthService';

const USER_ID_KEY = 'gmail_user_id';
const AUTH_STATE_KEY = 'gmail_auth_state';

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
    this.checkAuthentication();
  }

  @action
  async checkAuthentication() {
    const userId = localStorage.getItem('gmail_user_id');
    if (!userId) {
      this.isAuthenticated = false;
      return;
    }

    try {
      const response = await ApiClient.get<AuthResponse>(
        `${API_ENDPOINTS.GMAIL.CHECK_AUTH}?user_id=${userId}`
      );
      
      runInAction(() => {
        this.isAuthenticated = response.isAuthenticated;
        this.userEmail = response.user?.email || null;
        this.userName = response.user?.name || null;
      });
      
      if (!response.isAuthenticated) {
        localStorage.removeItem('gmail_user_id');
      }
    } catch {
      runInAction(() => {
        this.isAuthenticated = false;
        this.userEmail = null;
        this.userName = null;
      });
      localStorage.removeItem('gmail_user_id');
    }
  }

  @action
  async signOut() {
    const userId = localStorage.getItem('gmail_user_id');
    if (userId) {
      try {
        await ApiClient.post(`/api/gmail/logout/${userId}`);
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    localStorage.removeItem('gmail_user_id');
    localStorage.removeItem('gmail_auth_state');
    
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

      const userId = crypto.randomUUID();
      const state = crypto.randomUUID();
      
      localStorage.setItem(USER_ID_KEY, userId);
      localStorage.setItem(AUTH_STATE_KEY, state);
      
      const response = await ApiClient.get<{ url: string }>(
        API_ENDPOINTS.GMAIL.AUTH_URL,
        { user_id: userId, state }
      );

      // Redirect to auth URL instead of opening popup
      window.location.href = response.url;
      return true;
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