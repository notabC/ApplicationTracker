// File: src/core/domain/models/Application.ts
export interface Application {
    id: number;
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
    id: number;
    date: string;
    fromStage: string | null;
    toStage: string;
    message: string;
    source: string;
    emailId?: number;
    emailTitle?: string;
    emailBody?: string;
  }
