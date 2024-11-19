// src/core/services/AuthService.ts
import { injectable } from 'inversify';
import { makeObservable, observable, action, runInAction } from 'mobx';
import { ApiClient } from '../api/apiClient';
import { API_ENDPOINTS } from '../api/endpoints';
import { IAuthService } from '../interfaces/auth/IAuthService';

const USER_ID_KEY = 'gmail_user_id';
const AUTH_STATE_KEY = 'gmail_auth_state';

@injectable()
export class AuthService implements IAuthService {
  @observable isAuthenticated = false;
  @observable userEmail: string | null = null;
  @observable isAuthenticating = false;

  constructor() {
    makeObservable(this);
    this.checkAuthentication();
  }

  @action
  async checkAuthentication() {
    const userId = localStorage.getItem(USER_ID_KEY);
    if (!userId) {
      this.isAuthenticated = false;
      return;
    }

    try {
      const response = await ApiClient.get<{isAuthenticated: boolean, email: string}>(
        API_ENDPOINTS.GMAIL.CHECK_AUTH,
        { user_id: userId }
      );
      
      runInAction(() => {
        this.isAuthenticated = response.isAuthenticated;
        this.userEmail = response.email;
      });
      
      if (!response.isAuthenticated) {
        localStorage.removeItem(USER_ID_KEY);
      }
    } catch {
      runInAction(() => {
        this.isAuthenticated = false;
      });
      localStorage.removeItem(USER_ID_KEY);
    }
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

  @action
  signOut() {
    localStorage.removeItem(USER_ID_KEY);
    this.isAuthenticated = false;
  }
}