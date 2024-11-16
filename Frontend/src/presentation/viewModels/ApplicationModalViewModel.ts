// src/presentation/viewModels/ApplicationModalViewModel.ts
import { makeAutoObservable, runInAction, computed, action, observable } from 'mobx';
import { inject, injectable } from 'inversify';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';
import type { Application, ApplicationLog } from '@/core/domain/models/Application';
import type { IApplicationService, IViewModelUpdateField, IWorkflowService } from '@/core/interfaces/services';

@injectable()
export class ApplicationModalViewModel implements IViewModelUpdateField {
  @observable showStageSelect = false;
  @observable expandedLogs = new Set<string>();
  @observable unsavedChanges: Partial<Application> = {};

  constructor(
    @inject(SERVICE_IDENTIFIERS.ApplicationService) private applicationService: IApplicationService,
    @inject(SERVICE_IDENTIFIERS.WorkflowService) private workflowService: IWorkflowService
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
    applicationId: string,
    field: K,
    value: Application[K]
  ): void {
    console.log(`Updating field ${field} for application ${applicationId} to ${value}`);
    this.unsavedChanges = {
      ...this.unsavedChanges,
      [field]: value
    };
  }

  @action
  async saveChanges(application: Application): Promise<void> {
    if (Object.keys(this.unsavedChanges).length === 0) return;

    const updatedApplication = {
      ...application,
      ...this.unsavedChanges,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    await this.applicationService.updateApplication(updatedApplication.id, updatedApplication);
    runInAction(() => {
      this.unsavedChanges = {};
    });
  }

  @action
  async handleStageChange(
    application: Application,
    newStage: string
  ): Promise<void> {
    const currentDate = new Date().toISOString().split('T')[0];
    const newLog: ApplicationLog = {
      id: crypto.randomUUID(),
      date: currentDate,
      fromStage: application.stage,
      toStage: newStage,
      message: `Status updated from ${application.stage} to ${newStage}`,
      source: 'manual'
    };

    const updatedApplication = {
      ...application,
      stage: newStage,
      lastUpdated: currentDate,
      logs: [...application.logs, newLog]
    };

    this.applicationService.updateApplication(updatedApplication.id, updatedApplication);
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
    const workflow = this.workflowService.getWorkflow();
    const { stages, stageOrder } = workflow;
    const currentStageObj = stages.find(s => s.name === currentStage);
    if (!currentStageObj) return [];

    const currentIndex = stageOrder.indexOf(currentStageObj.id);
    return stages
      .filter(stage => 
        stage.name === 'Rejected' || 
        stageOrder.indexOf(stage.id) > currentIndex
      )
      .map(stage => stage.name);
  }

  getStageColor(stageName: string): string {
    const workflow = this.workflowService.getWorkflow();
    const stage = workflow.stages.find(s => s.name === stageName);
    
    if (!stage) return 'gray';
    return stage.color;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  reset(): void {
    this.showStageSelect = false;
    this.expandedLogs.clear();
    this.unsavedChanges = {};
  }
}