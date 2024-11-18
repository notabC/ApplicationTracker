import { injectable } from 'inversify';
import type { IGmailService, IGmailImportOptions, IGmailEmail } from '../interfaces/services/IGmailService';
import { makeObservable } from 'mobx';
import { ApiClient } from '../api/apiClient';
import { API_ENDPOINTS } from '../api/endpoints';
import { Email } from '../interfaces/services/IEmailService';

@injectable()
export class GmailService implements IGmailService {
  // Mock data for development
  private mockEmails: IGmailEmail[] = [
    {
      id: '2',
      subject: 'Thank you for applying to Software Engineer position at Meta',
      body: 'Dear Candidate,\n\nThank you for applying...',
      date: '2024-03-15',
      sender: 'recruiting@meta.com',
      processed: false
    },
    // ... more mock emails
  ];

  constructor() {
    makeObservable(this);
    this.loadMockEmails();
  }

  async loadMockEmails() {
    const params = {
      tags: ['important'],
      start_date: new Date('2024-01-01'),
      search_query: 'job application',
      limit: 50
    };
    this.mockEmails = await ApiClient.get<Email[]>(API_ENDPOINTS.GMAIL.EMAILS, { user_id: 'abc', params });
    console.log('Loaded mock emails:', this.mockEmails);
  }

  async authenticate(): Promise<boolean> {
    // Real implementation would use Google OAuth
    console.log('Authenticating with Gmail...');
    return new Promise(resolve => setTimeout(() => resolve(true), 1000));
  }

  async fetchEmails(options: IGmailImportOptions): Promise<IGmailEmail[]> {
    console.log('Fetching emails with options:', options);
    // Real implementation would call Gmail API
    return new Promise(resolve => {
      setTimeout(() => {
        const filtered = this.mockEmails.filter(email => {
          const matchesKeywords = options.keywords ? 
            email.subject.toLowerCase().includes(options.keywords.toLowerCase()) : 
            true;
          const matchesDate = (!options.startDate || email.date >= options.startDate) &&
                            (!options.endDate || email.date <= options.endDate);
          return matchesKeywords && matchesDate;
        });
        resolve(filtered);
      }, 1500);
    });
  }

  async markAsProcessed(emailIds: string[]): Promise<void> {
    console.log('Marking emails as processed:', emailIds);
    // Real implementation would update Gmail labels/flags
    this.mockEmails = this.mockEmails.map(email => ({
      ...email,
      processed: emailIds.includes(email.id)
    }));
  }
}