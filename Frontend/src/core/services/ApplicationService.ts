// src/core/services/ApplicationService.ts
import { injectable, inject } from 'inversify';
import { makeObservable, observable, action } from 'mobx';
import type { Application, ApplicationCreate } from '../domain/models/Application';
import { IApplicationService } from '../interfaces/services';
import type { IAuthService } from '../interfaces/auth/IAuthService';
import { ApiClient } from '../api/apiClient';
import { API_ENDPOINTS } from '../api/endpoints';
import { SERVICE_IDENTIFIERS } from '../constants/identifiers';

@injectable()
export class ApplicationService implements IApplicationService {
  @observable private _applications: Application[] = [];

  constructor(
    @inject(SERVICE_IDENTIFIERS.AuthService) private authService: IAuthService
  ) {
    makeObservable(this);
  }

  get applications() {
    return this._applications;
  }

  @action
  setApplications(applications: Application[]) {
    this._applications = applications;
  }

  @action
  async getApplications(): Promise<Application[]> {
    try {
      const applications = await ApiClient.get<Application[]>(API_ENDPOINTS.APPLICATIONS.BASE);
      this.setApplications(applications);
      return applications;
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      throw error;
    }
  }

  @action
  async getApplicationById(id: string): Promise<Application> {
    try {
      return await ApiClient.get<Application>(API_ENDPOINTS.APPLICATIONS.BY_ID(id));
    } catch (error) {
      console.error(`Failed to fetch application ${id}:`, error);
      throw error;
    }
  }

  @action
  async addApplication(applicationData: ApplicationCreate): Promise<Application> {
    if (!this.authService.isAuthenticated) {
      throw new Error('User not authenticated');
    }

    try {
      const userId = localStorage.getItem('gmail_user_id');
      if (!userId || !this.authService.userEmail) {
        throw new Error('User ID or email not found');
      }

      const application: Omit<Application, 'id'> = {
        ...applicationData,
        user_id: userId,
        user_email: this.authService.userEmail,
        lastUpdated: new Date().toISOString(),
        logs: [],
        description: applicationData.description ?? '',
        salary: applicationData.salary ?? '',
        location: applicationData.location ?? '',
        notes: applicationData.notes ?? ''
      };

      return await ApiClient.post<Application>(
        API_ENDPOINTS.APPLICATIONS.BASE, 
        application
      );
    } catch (error) {
      console.error('Failed to create application:', error);
      throw error;
    }
  }

  @action
  async updateApplication(id: string, updates: Partial<ApplicationCreate>): Promise<Application> {
    if (!this.authService.isAuthenticated) {
      throw new Error('User not authenticated');
    }

    try {
      const userId = localStorage.getItem('gmail_user_id');
      if (!userId || !this.authService.userEmail) {
        throw new Error('User ID or email not found');
      }

      const updateData = {
        ...updates,
        lastUpdated: new Date().toISOString()
      };

      return await ApiClient.put<Application>(
        API_ENDPOINTS.APPLICATIONS.BY_ID(id),
        updateData
      );
    } catch (error) {
      if (error instanceof Error && 'response' in error) {
        console.error(`Failed to update application ${id}:`, error, (error as any).response.data);
      } else {
        console.error(`Failed to update application ${id}:`, error);
      }
      throw error;
    }
  }

  @action
  async deleteApplication(id: string): Promise<void> {
    if (!this.authService.isAuthenticated) {
      throw new Error('User not authenticated');
    }

    try {
      await ApiClient.delete(API_ENDPOINTS.APPLICATIONS.BY_ID(id));
    } catch (error) {
      console.error(`Failed to delete application ${id}:`, error);
      throw error;
    }
  }
}
