// src/core/interfaces/services/IGmailService.ts
export interface IGmailImportOptions {
    labels: string[];
    keywords: string;
    startDate: string;
    endDate: string;
  }
  
  export interface IGmailEmail {
    id: string;
    title: string;
    body: string;
    date: string;
    from: string;
    processed: boolean;
  }
  
  export interface IGmailService {
    authenticate(): Promise<boolean>;
    fetchEmails(options: IGmailImportOptions): Promise<IGmailEmail[]>;
    markAsProcessed(emailIds: string[]): Promise<void>;
  }
  

  
  
  
  