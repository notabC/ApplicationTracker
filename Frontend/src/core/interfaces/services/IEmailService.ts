// src/core/interfaces/services/IEmailService.ts
export interface IEmailService {
  getEmails(): Promise<Email[]>;
  addEmails(emails: Email[]): Promise<void>;
  markAsProcessed(emailIds: string[]): Promise<void>;
}
  
  export interface Email {
    id: string;
    subject: string;
    body: string;
    date: string;
    sender: string;
    processed: boolean;
  }
