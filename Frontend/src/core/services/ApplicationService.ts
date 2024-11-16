import { injectable } from 'inversify';
import { makeObservable, observable, action } from 'mobx';
import type { Application } from '../domain/models/Application';
import { IApplicationService } from '../interfaces/services';
import { ApiClient } from '../api/apiClient';
import { API_ENDPOINTS } from '../api/endpoints';

@injectable()
export class ApplicationService implements IApplicationService {
  @observable private applications: Application[] = [];

  constructor() {
    makeObservable(this);
    console.log(this.applications.length);
  }

  @action
  setApplications(applications: Application[]) {
    this.applications = applications;
  }

  // getApplications() {
  //   return this.applications;
  // }

  @action
  async getApplications(): Promise<Application[]> {
    try {
      return await ApiClient.get<Application[]>(API_ENDPOINTS.APPLICATIONS.BASE);
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
  async addApplication(application: Application): Promise<Application> {
    try {
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
  async updateApplication(id: string, updates: Partial<Application>): Promise<Application> {
    try {
      console.log('updates', updates);
      return await ApiClient.put<Application>(
        API_ENDPOINTS.APPLICATIONS.BY_ID(id),
        updates
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
    try {
      await ApiClient.delete(API_ENDPOINTS.APPLICATIONS.BY_ID(id));
    } catch (error) {
      console.error(`Failed to delete application ${id}:`, error);
      throw error;
    }
  }

  // Private helper method to persist applications to localStorage
  // private persistApplications() {
  //   try {
  //     localStorage.setItem('applications', JSON.stringify(this.applications));
  //   } catch (error) {
  //     console.error('Failed to persist applications:', error);
  //   }
  // }

  // // Private helper method to load applications from localStorage
  // private loadPersistedApplications() {
  //   try {
  //     const persisted = localStorage.getItem('applications');
  //     if (persisted) {
  //       this.applications = JSON.parse(persisted);
  //     }
  //   } catch (error) {
  //     console.error('Failed to load persisted applications:', error);
  //   }
  // }
}