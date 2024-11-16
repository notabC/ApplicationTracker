import { Application } from "@/core/domain/models/Application";

// src/domain/repositories/ApplicationRepository.ts
export interface IApplicationRepository {
    getApplications(): Application[];
  }
  