// src/core/services/GmailService.ts
import { injectable } from 'inversify';
import type { IGmailService, IGmailImportOptions, IGmailResponse } from '../../domain/interfaces/IGmailService';
import { makeObservable, observable, action, runInAction } from 'mobx';
import { ApiClient } from '../api/apiClient';
import { API_ENDPOINTS } from '../api/endpoints';

const USER_ID_KEY = 'gmail_user_id';
const AUTH_STATE_KEY = 'gmail_auth_state';

@injectable()
export class GmailService implements IGmailService {
  @observable isAuthenticated = false;
  @observable userEmail: string | null = null;
  @observable userName: string | null = null;
  @observable isAuthenticating = false;

  constructor() {
    makeObservable(this);
    this.checkAuthentication();
  }

  @action
  async checkAuthentication() {
    const userId = localStorage.getItem(USER_ID_KEY);
    if (!userId) {
      runInAction(() => {
        this.isAuthenticated = false;
        this.userEmail = null;
        this.userName = null;
      });
      return;
    }

    try {
      const response = await ApiClient.get<{
        isAuthenticated: boolean;
        email: string;
        user: {
          name: string | null;
          email: string;
          created_at: string;
        } | null;
      }>(API_ENDPOINTS.GMAIL.CHECK_AUTH, { user_id: userId });
      
      runInAction(() => {
        this.isAuthenticated = response.isAuthenticated;
        this.userEmail = response.user?.email || null;
        this.userName = response.user?.name || null;
      });
      
      if (!response.isAuthenticated) {
        localStorage.removeItem(USER_ID_KEY);
        localStorage.removeItem(AUTH_STATE_KEY);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      runInAction(() => {
        this.isAuthenticated = false;
        this.userEmail = null;
        this.userName = null;
      });
      localStorage.removeItem(USER_ID_KEY);
      localStorage.removeItem(AUTH_STATE_KEY);
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

      window.location.href = response.url;
      return true;
    } catch (error) {
      console.error('Gmail auth error:', error);
      return false;
    } finally {
      runInAction(() => {
        this.isAuthenticating = false;
      });
    }
  }

  @action
  async fetchEmails(options: IGmailImportOptions): Promise<IGmailResponse> {
      try {
          const queryParams = new URLSearchParams();
          
          options.labels.forEach(label => {
              queryParams.append('tags', label);
          });

          if (options.labels.length === 0) {
              queryParams.append('tags', 'inbox');
          }
          
          queryParams.append('start_date', options.startDate || '');
          queryParams.append('end_date', options.endDate || '');
          queryParams.append('search_query', options.keywords || '');
          queryParams.append('limit', '20');
          
          // Add page token if available
          if (options.pageToken) {
              queryParams.append('page_token', options.pageToken);
          }

          return await ApiClient.get<IGmailResponse>(
              `${API_ENDPOINTS.GMAIL.EMAILS}?${queryParams.toString()}`
          );
      } catch (error) {
          console.error('Error fetching emails:', error);
          throw error;
      }
  }

  @action
  async markAsProcessed(emailIds: string[]): Promise<void> {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated');
    }

    try {
      await ApiClient.post(API_ENDPOINTS.EMAIL.PROCESS, {
        email_ids: emailIds
      });
    } catch (error) {
      console.error('Error marking emails as processed:', error);
      throw error;
    }
  }

  @action
  async signOut(): Promise<void> {
    const userId = localStorage.getItem(USER_ID_KEY);
    if (userId) {
      try {
        await ApiClient.post(`${API_ENDPOINTS.GMAIL.LOGOUT}/${userId}`);
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(AUTH_STATE_KEY);
    
    runInAction(() => {
      this.isAuthenticated = false;
      this.userEmail = null;
      this.userName = null;
    });
  }
}