// src/presentation/viewModels/RootStore.ts
import { makeAutoObservable, runInAction } from 'mobx';
import { inject, injectable } from 'inversify';
import { SERVICE_IDENTIFIERS } from '@/di/identifiers';
import type { Application } from '@/domain/interfaces/IApplication';
import type { IApplicationService } from '@/domain/interfaces';

@injectable()
export class RootStore {
  applications: Application[] = [];
  isLoading: boolean = false;
  error: string | null = null;

  constructor(
    @inject(SERVICE_IDENTIFIERS.ApplicationService) 
    private readonly applicationService: IApplicationService
  ) {
    makeAutoObservable(this);
    this.loadApplications();
  }

  /**
   * Loads applications from the ApplicationService.
   */
  async loadApplications(): Promise<void> {
    this.isLoading = true;
    try {
      const applications: Application[] = await this.applicationService.getApplications();
      runInAction(() => {
        this.applications = applications;
        this.error = null;
      });
    } catch (error) {
      runInAction(() => {
        this.error = 'Failed to load applications.';
        console.error('Error loading applications:', error);
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  /**
   * Adds a new application and updates the applications list.
   * @param application The application to add.
   */
  async addApplication(application: Application): Promise<void> {
    this.isLoading = true;
    try {
      await this.applicationService.addApplication(application);
      runInAction(() => {
        this.applications.push(application);
        this.error = null;
      });
    } catch (error) {
      runInAction(() => {
        this.error = 'Failed to add application.';
        console.error('Error adding application:', error);
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  /**
   * Updates an existing application and ensures all observers are notified.
   * @param updatedApp The application with updated data.
   */
  async updateApplication(updatedApp: Application): Promise<void> {
    this.isLoading = true;
    try {
      await this.applicationService.updateApplication(updatedApp.id, updatedApp);
      runInAction(() => {
        const index = this.applications.findIndex(app => app.id === updatedApp.id);
        if (index !== -1) {
          this.applications[index] = updatedApp;
        }
        this.error = null;
      });
    } catch (error) {
      runInAction(() => {
        this.error = 'Failed to update application.';
        console.error('Error updating application:', error);
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  /**
   * Retrieves an application by its ID.
   * @param applicationId The ID of the application to retrieve.
   * @returns The Application object if found, undefined otherwise.
   */
  getApplicationById(applicationId: string): Application | undefined {
    return this.applications.find(app => app.id === applicationId);
  }
}