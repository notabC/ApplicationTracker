// src/domain/models/GmailImportModel.ts
import { makeAutoObservable, runInAction } from 'mobx';
import type { IAuthService } from '@/core/interfaces/auth/IAuthService';
import { Email } from '@/core/interfaces/services/IEmailService';
import { injectable, inject } from 'inversify';
import { JobTrackerViewModel } from '@/presentation/viewModels/JobTrackerViewModel';
import type { IGmailEmail, IGmailImportOptions, IGmailService } from '@/core/interfaces/services/IGmailService';
import { SERVICE_IDENTIFIERS } from '@/di/container';

export type ImportStep = 'filters' | 'processing' | 'selection';

type LoadingState = {
  isLoading: boolean;
  pageLoading: Set<number>;
};

@injectable()
export class GmailImportModel {
  step: ImportStep = 'filters';
  emails: IGmailEmail[] = [];
  selectedEmails = new Set<string>();
  expandedEmails = new Set<string>();
  filters: IGmailImportOptions = {
    labels: [],
    keywords: '',
    startDate: '',
    endDate: ''
  };
  loadingState: LoadingState = {
    isLoading: false,
    pageLoading: new Set<number>()
  };
  error: string | null = null;
  currentPage: number = 1;
  pageCache: Record<number, IGmailEmail[]> = {};
  hasNextPage: boolean = false;
  currentPageToken: string | null = null;

  constructor(
    @inject(SERVICE_IDENTIFIERS.GmailService) private gmailService: IGmailService,
    @inject(SERVICE_IDENTIFIERS.AuthService) private authService: IAuthService,
    @inject(SERVICE_IDENTIFIERS.JobTrackerViewModel) private jobTrackerViewModel: JobTrackerViewModel
  ) {
    makeAutoObservable(this);
  }

  async importSelected(): Promise<void> {
    if (!this.authService.isAuthenticated) {
      throw new Error('User not authenticated');
    }
    
    try {
      const userId = localStorage.getItem('gmail_user_id');
      if (!userId || !this.authService.userEmail) {
        throw new Error('User ID or email not found');
      }

      const selectedEmailData = this.emails.filter(email => 
        this.selectedEmails.has(email.id)
      );

      const emailsToAdd = selectedEmailData.map(email => ({
        id: email.id,
        subject: email.subject,
        body: email.body,
        date: email.date,
        sender: email.sender,
        processed: false,
        user_id: userId,
        user_email: this.authService.userEmail
      })) as Email[];

      this.jobTrackerViewModel.addEmails(emailsToAdd);

      runInAction(() => {
        this.selectedEmails.clear();
        this.expandedEmails.clear();
        this.step = 'filters';
      });
    } catch (error) {
      runInAction(() => {
        this.error = 'Failed to import emails';
      });
    }
  }

  toggleEmailExpansion(emailId: string): void {
    if (this.expandedEmails.has(emailId)) {
      this.expandedEmails.delete(emailId);
    } else {
      this.expandedEmails.add(emailId);
    }
  }

  updateFilter<K extends keyof IGmailImportOptions>(
    key: K,
    value: IGmailImportOptions[K]
  ): void {
    this.filters[key] = value;
  }

  async loadNextPage(): Promise<void> {
    if (this.hasNextPage && !this.loadingState.pageLoading.has(this.currentPage + 1)) {
      await this.goToPage(this.currentPage + 1);
    }
  }

  async goToPage(page: number): Promise<void> {
    if (page < 1) return;

    if (this.pageCache[page]) {
      runInAction(() => {
        this.currentPage = page;
        this.emails = this.pageCache[page];
      });
      return;
    }

    if (page === this.currentPage + 1 && this.hasNextPage) {
      await this.fetchEmails(this.currentPageToken ?? undefined, page);
    }
  }

  async fetchEmails(pageToken?: string, targetPage: number = 1): Promise<void> {
    this.loadingState.pageLoading.add(targetPage);
    this.loadingState.isLoading = true;
    
    try {
      const response = await this.gmailService.fetchEmails({
        ...this.filters,
        pageToken,
      });

      runInAction(() => {
        this.emails = response.emails || [];
        this.currentPageToken = response.nextPageToken;
        this.hasNextPage = response.hasMore;
        this.currentPage = targetPage;
        this.pageCache[this.currentPage] = response.emails || [];
        this.step = 'selection';
        this.error = null;
      });
    } catch (error) {
      runInAction(() => {
        this.error = 'Failed to fetch emails';
        this.step = 'filters';
        this.emails = [];
      });
    } finally {
      runInAction(() => {
        this.loadingState.pageLoading.delete(targetPage);
        this.loadingState.isLoading = false;
      });
    }
  }

  reset(): void {
    runInAction(() => {
      this.step = 'filters';
      this.emails = [];
      this.selectedEmails.clear();
      this.expandedEmails.clear();
      this.currentPage = 1;
      this.pageCache = {};
      this.currentPageToken = null;
      this.hasNextPage = false;
      this.filters = {
        labels: [],
        keywords: '',
        startDate: '',
        endDate: ''
      };
      this.loadingState = {
        isLoading: false,
        pageLoading: new Set<number>()
      };
      this.error = null;
    });
  }

  selectAllEmails(selected: boolean): void {
    if (selected) {
      this.selectedEmails = new Set(this.emails.map(email => email.id));
    } else {
      this.selectedEmails.clear();
    }
  }

  toggleEmailSelection(emailId: string): void {
    if (this.selectedEmails.has(emailId)) {
      this.selectedEmails.delete(emailId);
    } else {
      this.selectedEmails.add(emailId);
    }
  }

  selectAllCurrentPage(selected: boolean): void {
    if (selected) {
      this.emails.forEach(email => this.selectedEmails.add(email.id));
    } else {
      this.emails.forEach(email => this.selectedEmails.delete(email.id));
    }
  }

  get isAllSelected(): boolean {
    return this.emails.length > 0 && this.selectedEmails.size === this.emails.length;
  }

  get hasSelectedEmails(): boolean {
    return this.selectedEmails.size > 0;
  }

  get isCurrentPageAllSelected(): boolean {
    return this.emails.length > 0 && this.emails.every(email => this.selectedEmails.has(email.id));
  }
}