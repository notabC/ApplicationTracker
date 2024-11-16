import { injectable } from 'inversify';
import type { IGmailService, IGmailImportOptions, IGmailEmail } from '../interfaces/services/IGmailService';

@injectable()
export class GmailService implements IGmailService {
  // Mock data for development
  private mockEmails: IGmailEmail[] = [
    {
      id: '2',
      title: 'Thank you for applying to Software Engineer position at Meta',
      body: 'Dear Candidate,\n\nThank you for applying...',
      date: '2024-03-15',
      from: 'recruiting@meta.com',
      processed: false
    },
    // ... more mock emails
  ];

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
            email.title.toLowerCase().includes(options.keywords.toLowerCase()) : 
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