// src/core/services/EmailService.ts
import { injectable } from "inversify";
import { Email, IEmailService } from "../interfaces/services/IEmailService";
import { IGmailEmail } from "../interfaces/services/IGmailService";
import { makeObservable, observable, action } from 'mobx';

@injectable()
export class EmailService implements IEmailService {
  private readonly STORAGE_KEY = 'emails';

  @observable
  private emails: Email[] = [];

  // Optional: Define mock emails as defaults
  private mockEmails: IGmailEmail[] = [
    {
      id: '1',
      title: 'Thank you for applying to Software Engineer position at Meta',
      body: 'Dear Candidate,\n\nThank you for applying to the Software Engineer position at Meta. We have received your application and will review it carefully. If your qualifications match our needs, we will contact you for further information.\n\nBest regards,\nMeta Recruiting Team',
      date: '2024-03-15',
      from: 'recruiting@meta.com',
      processed: false
    },
    // Add more mock emails if necessary
  ];

  constructor() {
    makeObservable(this);
    this.clearLocalStorage(); // Uncomment to reset stored emails
    this.loadEmails();
  }

  @action
  private clearLocalStorage(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  @action
  private loadEmails(): void {
    const storedEmails = localStorage.getItem(this.STORAGE_KEY);
    if (storedEmails) {
      try {
        this.emails = JSON.parse(storedEmails);
      } catch (e) {
        console.error('Failed to parse emails from localStorage', e);
        // Fallback to mockEmails if parsing fails
        this.emails = this.mockEmails.map(email => ({  
          id: email.id,
          title: email.title,
          body: email.body,
          date: email.date,
          from: email.from,
          processed: email.processed
        }));
      }
    } else {
      // Initialize with mockEmails if no data in localStorage
      this.emails = this.mockEmails.map(email => ({  
        id: email.id,
        title: email.title,
        body: email.body,
        date: email.date,
        from: email.from,
        processed: email.processed
      }));
    }
    console.log('Loaded emails:', this.emails.length);
  }

  @action
  getEmails(): Email[] {
    return this.emails;
  }

  @action
  addEmails(emails: Email[]): void {
    this.emails.push(...emails);
    this.saveEmails();
  }

  @action
  markAsProcessed(emailIds: string[]): void {
    this.emails = this.emails.map(email => ({
      ...email,
      processed: email.processed || emailIds.includes(email.id)
    }));
    this.saveEmails();
  }

  @action
  private saveEmails(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.emails));
  }
}
