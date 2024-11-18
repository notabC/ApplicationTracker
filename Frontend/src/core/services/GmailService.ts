import { injectable } from 'inversify';
import type { IGmailService, IGmailImportOptions, IGmailEmail } from '../interfaces/services/IGmailService';
import { makeObservable, observable, action, runInAction } from 'mobx';
import { ApiClient } from '../api/apiClient';
import { API_ENDPOINTS } from '../api/endpoints';

const USER_ID_KEY = 'gmail_user_id';
const AUTH_STATE_KEY = 'gmail_auth_state';

@injectable()
export class GmailService implements IGmailService {
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
      console.error('Gmail auth error:', error);
      return false;
    } finally {
      runInAction(() => {
        this.isAuthenticating = false;
      });
    }
  }

  async fetchEmails(options: IGmailImportOptions): Promise<IGmailEmail[]> {
    const userId = localStorage.getItem(USER_ID_KEY);
    if (!userId) throw new Error('Not authenticated');

    try {
      return await ApiClient.get<IGmailEmail[]>(API_ENDPOINTS.GMAIL.EMAILS, {
        user_id: userId,
        tags: options.labels,
        start_date: options.startDate,
        end_date: options.endDate,
        search_query: options.keywords,
        limit: 50
      });
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    }
  }

  async markAsProcessed(emailIds: string[]): Promise<void> {
    console.log('Marking emails as processed:', emailIds);
  }
}