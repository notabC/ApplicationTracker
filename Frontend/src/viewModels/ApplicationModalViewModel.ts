// src/presentation/viewModels/ApplicationModalViewModel.ts
import { makeAutoObservable, computed, action, observable } from 'mobx';
import { inject, injectable } from 'inversify';
import { SERVICE_IDENTIFIERS } from '@/di/identifiers';
import type { Application } from '@/domain/interfaces/IApplication';
import type { IViewModelUpdateField } from '@/domain/interfaces';
import { ApplicationModel } from '@/domain/models/ApplicationModel';
import { UnsavedChangesViewModel } from './UnsavedChangesViewModel';

@injectable()
export class ApplicationModalViewModel implements IViewModelUpdateField {
  @observable showStageSelect = false;
  @observable expandedLogs = new Set<string>();
  @observable unsavedChanges: Partial<Application> = {};

  constructor(
    @inject(SERVICE_IDENTIFIERS.ApplicationModel) private applicationModel: ApplicationModel,
    @inject(SERVICE_IDENTIFIERS.UnsavedChangesViewModel) private unsavedChangesVM: UnsavedChangesViewModel
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

  /**
   * Handles field changes by delegating tracking to UnsavedChangesViewModel.
   * @param application The current application.
   * @param field The field being updated.
   * @param value The new value for the field.
   * @param trackChanges Whether to track this change.
   */
  @action
  handleFieldChange(
    application: Application,
    field: keyof Application,
    value: any,
    trackChanges: boolean = false
  ): void {
    if (trackChanges) {
      const originalValue = application[field];
      this.unsavedChangesVM.trackChange(
        application.id.toString(),
        field,
        value,
        originalValue,
        this
      );
    }
    this.updateField(application.id, field, value);
  }

  /**
   * Updates the local unsavedChanges state.
   * @param _applicationId The ID of the application being updated.
   * @param field The field to update.
   * @param value The new value for the field.
   */
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

  /**
   * Saves all unsaved changes by delegating to ApplicationModel.
   * @param application The current application.
   */
  @action
  async saveChanges(application: Application): Promise<void> {
    if (!this.hasUnsavedChanges) return;

    await this.applicationModel.updateApplication(
      application.id,
      this.unsavedChanges
    );
    this.discardChanges();
  }

  /**
   * Handles stage changes by delegating to ApplicationModel.
   * @param application The current application.
   * @param newStage The new stage to set.
   */
  @action
  async handleStageChange(
    application: Application,
    newStage: string
  ): Promise<void> {
    await this.applicationModel.createStageChangeLog(application, newStage);
    this.setShowStageSelect(false);
  }

  /**
   * Discards all unsaved changes.
   */
  @action
  discardChanges(): void {
    this.unsavedChanges = {};
    this.unsavedChangesVM.discardChanges();
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

  /**
   * Resets the ViewModel state.
   */
  reset(): void {
    this.showStageSelect = false;
    this.expandedLogs.clear();
    this.unsavedChanges = {};
  }
}
