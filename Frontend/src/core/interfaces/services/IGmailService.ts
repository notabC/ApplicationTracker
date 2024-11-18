// src/core/interfaces/services/IGmailService.ts
export interface IGmailImportOptions {
    labels: string[];
    keywords: string;
    startDate: string;
    endDate: string;
  }
  
  export interface IGmailEmail {
    id: string;
    subject: string;
    body: string;
    date: string;
    sender: string;
    processed: boolean;
  }

  export interface IGmailService {
    isAuthenticated: boolean;
    authenticate(): Promise<boolean>;
    fetchEmails(options: IGmailImportOptions): Promise<IGmailEmail[]>;
    markAsProcessed(emailIds: string[]): Promise<void>;
    checkAuthentication(): Promise<void>;
  }