// File: src/core/services/ApplicationService.ts
import { injectable } from 'inversify';
import { makeObservable, observable, action } from 'mobx';
import { Application } from '../domain/models/Application';
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

  @action
  updateApplication(id: number, updates: Partial<Application>) {
    const index = this.applications.findIndex(app => app.id === id);
    if (index !== -1) {
      this.applications[index] = { ...this.applications[index], ...updates };
    }
  }
}