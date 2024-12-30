// src/core/interfaces/services/IEmailService.ts
export interface IEmailService {
  getEmails(): Promise<Email[]>;
  addEmails(emails: Email[]): Promise<void>;
  markAsProcessed(emailIds: string[]): Promise<void>;
  resetAllEmails(): Promise<void>;
}
  
  export interface Email {
    user_id: string;
    user_email: string;
    id: string;
    subject: string;
    body: string;
    date: string;
    sender: string;
    processed: boolean;
  }
