// src/presentation/viewModels/ApplicationModalViewModel.ts
import { makeAutoObservable, computed, action, observable } from 'mobx';
import { inject, injectable } from 'inversify';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';
import type { Application } from '@/core/domain/models/Application';
import type { IViewModelUpdateField } from '@/core/interfaces/services';
import { ApplicationModel } from '@/domain/models/ApplicationModel';

@injectable()
export class ApplicationModalViewModel implements IViewModelUpdateField {
  @observable showStageSelect = false;
  @observable expandedLogs = new Set<string>();
  @observable unsavedChanges: Partial<Application> = {};

  constructor(
    @inject(SERVICE_IDENTIFIERS.ApplicationModel) private applicationModel: ApplicationModel
  ) {
    makeAutoObservable(this);
  }

  @action
  setShowStageSelect(show: boolean): void {
    this.showStageSelect = show;
  }

  @action
  toggleLogExpansion(logId: string): void {
    if (this.expandedLogs.has(logId)) {
      this.expandedLogs.delete(logId);
    } else {
      this.expandedLogs.add(logId);
    }
  }

  @action
  updateField<K extends keyof Application>(
    _applicationId: string,
    field: K,
    value: Application[K]
  ): void {
    this.unsavedChanges = {
      ...this.unsavedChanges,
      [field]: value
    };
  }

  @action
  async saveChanges(application: Application): Promise<void> {
    if (!this.hasUnsavedChanges) return;

    const updates: Partial<Application> = {
      ...this.unsavedChanges,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    await this.applicationModel.updateApplication(application.id, updates);
    this.discardChanges();
  }

  @action
  async handleStageChange(
    application: Application,
    newStage: string
  ): Promise<void> {
    await this.applicationModel.createStageChangeLog(application, newStage);
    this.setShowStageSelect(false);
  }

  @action
  discardChanges(): void {
    this.unsavedChanges = {};
  }

  @computed
  get hasUnsavedChanges(): boolean {
    return Object.keys(this.unsavedChanges).length > 0;
  }

  getAvailableStages(currentStage: string): string[] {
    return this.applicationModel.getAvailableStages(currentStage);
  }

  getStageColor(stageName: string): string {
    return this.applicationModel.getStageColor(stageName);
  }

  formatDate(date: string): string {
    return this.applicationModel.formatDate(date);
  }

  reset(): void {
    this.showStageSelect = false;
    this.expandedLogs.clear();
    this.unsavedChanges = {};
  }
}
