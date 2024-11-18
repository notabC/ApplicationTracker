import { injectable } from 'inversify';
import type { IGmailService, IGmailImportOptions, IGmailEmail } from '../interfaces/services/IGmailService';
import { makeObservable, observable, action, runInAction } from 'mobx';
import { ApiClient } from '../api/apiClient';
import { API_ENDPOINTS } from '../api/endpoints';

const USER_ID_KEY = 'gmail_user_id';

@injectable()
export class GmailService implements IGmailService {
  @observable isAuthenticated = false;
  @observable userEmail: string | null = null;
  private authWindow: Window | null = null;

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
      const userId = crypto.randomUUID();
      localStorage.setItem(USER_ID_KEY, userId);
      
      const response = await ApiClient.get<{ url: string }>(
        API_ENDPOINTS.GMAIL.AUTH_URL,
        { user_id: userId }
      );

      this.authWindow = window.open(response.url, '_blank', 'width=600,height=600');
      
      return new Promise((resolve) => {
        const handleMessage = async (event: MessageEvent) => {
          if (event.data.type === 'GMAIL_AUTH_SUCCESS') {
            window.removeEventListener('message', handleMessage);
            this.authWindow?.close();
            this.authWindow = null;
            await this.checkAuthentication();
            resolve(true);
          }
        };

        window.addEventListener('message', handleMessage);
      });
    } catch (error) {
      console.error('Gmail auth error:', error);
      return false;
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