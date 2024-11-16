import { injectable } from 'inversify';
import { makeObservable, observable, action } from 'mobx';
import type { Application } from '../domain/models/Application';
import { IApplicationService } from '../interfaces/services';

@injectable()
export class ApplicationService implements IApplicationService {
  @observable private applications: Application[] = [];

  constructor() {
    makeObservable(this);
  }

  @action
  setApplications(applications: Application[]) {
    this.applications = applications;
  }

  getApplications() {
    return this.applications;
  }

  getApplicationById(id: string): Application | undefined {
    return this.applications.find(app => app.id === id);
  }

  @action
  addApplication(application: Application) {
    // Ensure unique ID
    // const maxId = Math.max(0, ...this.applications.map(app => app.id));
    const newApplication = {
      ...application,
      id: application.id,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    this.applications.push(newApplication);

    // Log to console for debugging
    console.log('Added new application:', newApplication);
    console.log('Current applications:', this.applications);

    // Here you would typically also sync with backend/storage
    this.persistApplications();

    return newApplication;
  }

  @action
  updateApplication(id: string, updates: Partial<Application>) {
    const index = this.applications.findIndex(app => app.id === id);
    if (index !== -1) {
      this.applications[index] = {
        ...this.applications[index],
        ...updates,
        lastUpdated: new Date().toISOString().split('T')[0]
      };

      // Here you would typically also sync with backend/storage
      this.persistApplications();
    }
  }

  @action
  deleteApplication(id: string) {
    this.applications = this.applications.filter(app => app.id !== id);
    
    // Here you would typically also sync with backend/storage
    this.persistApplications();
  }

  // Private helper method to persist applications to localStorage
  private persistApplications() {
    try {
      localStorage.setItem('applications', JSON.stringify(this.applications));
    } catch (error) {
      console.error('Failed to persist applications:', error);
    }
  }

  // Private helper method to load applications from localStorage
  private loadPersistedApplications() {
    try {
      const persisted = localStorage.getItem('applications');
      if (persisted) {
        this.applications = JSON.parse(persisted);
      }
    } catch (error) {
      console.error('Failed to load persisted applications:', error);
    }
  }
}