import { Application } from "@/domain/interfaces/IApplication";

// src/domain/repositories/ApplicationRepository.ts
export interface IApplicationRepository {
    getApplications(): Application[];
  }
  