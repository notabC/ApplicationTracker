// src/core/interfaces/services/IEmailService.ts
export interface IEmailService {
    getEmails(): Email[];
    addEmails(emails: Email[]): void;
    markAsProcessed(emailIds: string[]): void;
  }
  
  export interface Email {
    id: string;
    title: string;
    body: string;
    date: string;
    from: string;
    processed: boolean;
  }
