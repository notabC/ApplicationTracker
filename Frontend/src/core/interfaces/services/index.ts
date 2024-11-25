import { Application } from '@/core/domain/models/Application';

export interface IApplicationService {
  getApplications(): Promise<Application[]>;
  setApplications(applications: Application[]): void;
  updateApplication(id: string, updates: Partial<Application>): Promise<Application>;
  addApplication(application: Application): Promise<Application>;
  deleteApplication(id: string): void;
  getApplicationById(id: string): Promise<Application | undefined>;
}

// a viewmodel that can update fields of an application
export interface IViewModelUpdateField {
  updateField(applicationId: string, field: keyof Application, value: any): void;
}