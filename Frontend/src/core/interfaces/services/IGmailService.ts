// src/core/interfaces/services/IGmailService.ts
    export interface IGmailEmail {
    id: string;
    subject: string;
    body: string;
    date: string;
    sender: string;
    processed: boolean;
  }

  export interface IGmailImportOptions {
    labels: string[];
    keywords: string;
    startDate: string;
    endDate: string;
    pageToken?: string;
}

export interface IGmailResponse {
    emails: IGmailEmail[];
    nextPageToken: string | null;
    hasMore: boolean;
}

export interface IGmailService {
    isAuthenticated: boolean;
    authenticate(): Promise<boolean>;
    fetchEmails(options: IGmailImportOptions): Promise<IGmailResponse>;
    markAsProcessed(emailIds: string[]): Promise<void>;
    checkAuthentication(): Promise<void>;
}