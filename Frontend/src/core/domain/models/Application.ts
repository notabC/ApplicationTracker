// File: src/core/domain/models/Application.ts
export interface Application {
    id: string;
    company: string;
    position: string;
    dateApplied: string;
    stage: string;
    type: string;
    tags: string[];
    lastUpdated: string;
    description: string;
    salary: string;
    location: string;
    notes: string;
    logs: ApplicationLog[];
  }
  
  export interface ApplicationLog {
    id: string;
    date: string;
    fromStage: string | null;
    toStage: string;
    message: string;
    source: string;
    emailId?: string;
    emailTitle?: string;
    emailBody?: string;
  }
