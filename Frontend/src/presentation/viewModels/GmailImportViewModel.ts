// src/presentation/viewModels/GmailImportViewModel.ts
import { action, makeAutoObservable, observable, runInAction } from 'mobx';
import { inject, injectable } from 'inversify';
import type { IGmailService, IGmailEmail, IGmailImportOptions } from '../../core/interfaces/services/IGmailService';
import { SERVICE_IDENTIFIERS } from '../../core/constants/identifiers';
import { JobTrackerViewModel } from './JobTrackerViewModel';
import type { IAuthService } from '@/core/interfaces/auth/IAuthService';
import { Email } from '@/core/interfaces/services/IEmailService';

export type ImportStep = 'filters' | 'processing' | 'selection';

type LoadingState = {
  isLoading: boolean;
  pageLoading: Set<number>;
};

@injectable()
export class GmailImportViewModel {
  @observable step: ImportStep = 'filters';
  @observable emails: IGmailEmail[] = [];
  @observable selectedEmails = new Set<string>();
  @observable expandedEmails = new Set<string>();
  @observable filters: IGmailImportOptions = {
    labels: [],
    keywords: '',
    startDate: '',
    endDate: ''
  };
  @observable loadingState: LoadingState = {
    isLoading: false,
    pageLoading: new Set<number>()
  };
  @observable error: string | null = null;

  // Pagination-related observables
  @observable currentPage: number = 1;
  @observable pageCache: Record<number, IGmailEmail[]> = {}; // Cache emails by page number
  @observable hasNextPage: boolean = false;
  @observable currentPageToken: string | null = null;

  constructor(
    @inject(SERVICE_IDENTIFIERS.GmailService) private gmailService: IGmailService,
    @inject(SERVICE_IDENTIFIERS.JobTrackerViewModel) private jobTrackerViewModel: JobTrackerViewModel,
    @inject(SERVICE_IDENTIFIERS.AuthService) private authService: IAuthService
  ) {
    makeAutoObservable(this);
  }

  async importSelected(): Promise<void> {
    if (!this.authService.isAuthenticated) {
      throw new Error('User not authenticated');
    }
    
    const selectedEmailData = this.emails.filter(email => 
      this.selectedEmails.has(email.id)
    );

    try {
      const userId = localStorage.getItem('gmail_user_id');
      if (!userId || !this.authService.userEmail) {
        throw new Error('User ID or email not found');
      }
      // Convert Gmail emails to your application's email format
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

      // Add emails to JobTrackerViewModel
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

  toggleEmailExpansion(emailId: string) {
    if (this.expandedEmails.has(emailId)) {
      this.expandedEmails.delete(emailId);
    } else {
      this.expandedEmails.add(emailId);
    }
  }

  // Filter updates
  @action
  updateFilter<K extends keyof IGmailImportOptions>(
    key: K,
    value: IGmailImportOptions[K]
  ) {
    this.filters[key] = value;
  }

  // Load the next page
  @action
  async loadNextPage() {
    if (this.hasNextPage && !this.loadingState.pageLoading.has(this.currentPage + 1)) {
      await this.goToPage(this.currentPage + 1);
    }
  }

  // Navigate to a specific page
  @action
  async goToPage(page: number) {
    if (page < 1) return;

    // If the page is cached, use it
    if (this.pageCache[page]) {
      this.currentPage = page;
      this.emails = this.pageCache[page];
      return;
    }

    // Fetch the next page using the currentPageToken
    if (page === this.currentPage + 1 && this.hasNextPage) {
      await this.fetchEmails(this.currentPageToken ?? undefined, page);
    }
  }

  // Computed property to check if all emails are selected
  get isAllSelected() {
    if (!this.emails || this.emails.length === 0) {
      return false;
    }
    return this.selectedEmails.size === this.emails.length;
  }

  // Selection methods
  @action
  selectAllEmails(selected: boolean) {
    if (selected) {
      this.selectedEmails = new Set(this.emails.map(email => email.id));
    } else {
      this.selectedEmails.clear();
    }
  }

  @action
  toggleEmailSelection(emailId: string) {
    if (this.selectedEmails.has(emailId)) {
      this.selectedEmails.delete(emailId);
    } else {
      this.selectedEmails.add(emailId);
    }
  }

  // Fetch emails with optional pageToken and targetPage
  @action
  async fetchEmails(pageToken?: string, targetPage: number = 1) {
    // Add the target page to loading set
    this.loadingState.pageLoading.add(targetPage);
    this.loadingState.isLoading = true;
    
    try {
      const response = await this.gmailService.fetchEmails({
        ...this.filters,
        pageToken,
      });

      runInAction(() => {
        if (targetPage === 1) {
          this.emails = response.emails || [];
        } else {
          this.emails = response.emails || [];
        }
        this.currentPageToken = response.nextPageToken;
        this.hasNextPage = response.hasMore;
        this.currentPage = targetPage;

        // Cache the results for this page
        this.pageCache[this.currentPage] = response.emails || [];

        this.step = 'selection';
        this.error = null;
      });
    } catch (error) {
      runInAction(() => {
        this.error = 'Failed to fetch emails';
        this.step = 'filters';
        this.emails = []; // Reset to empty array on error
      });
    } finally {
      runInAction(() => {
        // Remove the target page from loading set
        this.loadingState.pageLoading.delete(targetPage);
        this.loadingState.isLoading = false;
      });
    }
  }

  @action
  reset() {
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
  }

  // Computed property to check if any emails are selected
  get hasSelectedEmails() {
    return this.selectedEmails.size > 0;
  }

  // Additional Computed Property for Current Page Selection
  get isCurrentPageAllSelected() {
    if (this.emails.length === 0) return false;
    return this.emails.every(email => this.selectedEmails.has(email.id));
  }

  // Action to select/deselect all emails on the current page
  @action
  selectAllCurrentPage(selected: boolean) {
    if (selected) {
      this.emails.forEach(email => this.selectedEmails.add(email.id));
    } else {
      this.emails.forEach(email => this.selectedEmails.delete(email.id));
    }
  }
}
