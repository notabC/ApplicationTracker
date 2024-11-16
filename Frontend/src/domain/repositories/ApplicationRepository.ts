// src/domain/repositories/ApplicationRepository.ts
export interface IApplicationRepository {
    getApplications(): Application[];
  }
  
  export interface Application {
    id: string;
    stage: string;
    type: string;
    dateApplied: string; // ISO date string
    lastUpdated: string; // ISO date string
    // Add other relevant fields
  }
  