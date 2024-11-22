// src/presentation/viewModels/GmailImportViewModel.ts
import { makeAutoObservable, runInAction } from 'mobx';
import { inject, injectable } from 'inversify';
import type { IGmailService, IGmailEmail, IGmailImportOptions } from '../../core/interfaces/services/IGmailService';
import { SERVICE_IDENTIFIERS } from '../../core/constants/identifiers';
import { JobTrackerViewModel } from './JobTrackerViewModel';
import type { IAuthService } from '@/core/interfaces/auth/IAuthService';
import { Email } from '@/core/interfaces/services/IEmailService';

export type ImportStep = 'filters' | 'processing' | 'selection';

@injectable()
export class GmailImportViewModel {
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
  isLoading = false;
  error: string | null = null;

  constructor(
    @inject(SERVICE_IDENTIFIERS.GmailService) private gmailService: IGmailService,
    @inject(SERVICE_IDENTIFIERS.JobTrackerViewModel) private jobTrackerViewModel: JobTrackerViewModel,
    @inject(SERVICE_IDENTIFIERS.AuthService) private authService: IAuthService
  ) {
    makeAutoObservable(this);
  }
  
  async fetchEmails() {
    this.isLoading = true;
    this.step = 'processing';
    
    try {
      const emails = await this.gmailService.fetchEmails(this.filters);
      runInAction(() => {
        this.emails = emails;
        this.step = 'selection';
        this.error = null;
      });
    } catch (error) {
      runInAction(() => {
        this.error = 'Failed to fetch emails';
        this.step = 'filters';
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
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

  // Email selection methods
  toggleEmailSelection(emailId: string) {
    if (this.selectedEmails.has(emailId)) {
      this.selectedEmails.delete(emailId);
    } else {
      this.selectedEmails.add(emailId);
    }
  }

  toggleEmailExpansion(emailId: string) {
    if (this.expandedEmails.has(emailId)) {
      this.expandedEmails.delete(emailId);
    } else {
      this.expandedEmails.add(emailId);
    }
  }

  selectAllEmails(selected: boolean) {
    if (selected) {
      this.selectedEmails = new Set(this.emails.map(email => email.id));
    } else {
      this.selectedEmails.clear();
    }
  }

  // Filter updates
  updateFilter<K extends keyof IGmailImportOptions>(
    key: K,
    value: IGmailImportOptions[K]
  ) {
    this.filters[key] = value;
  }

  // Reset state
  reset() {
    this.step = 'filters';
    this.emails = [];
    this.selectedEmails.clear();
    this.expandedEmails.clear();
    this.filters = {
      labels: [],
      keywords: '',
      startDate: '',
      endDate: ''
    };
    this.error = null;
  }

  // Computed properties
  get isAllSelected() {
    return this.emails.length > 0 && 
           this.selectedEmails.size === this.emails.length;
  }

  get hasSelectedEmails() {
    return this.selectedEmails.size > 0;
  }
}
