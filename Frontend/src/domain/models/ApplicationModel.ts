// src/domain/models/ApplicationModel.ts
import { makeAutoObservable } from 'mobx';
import { inject, injectable } from 'inversify';
import { SERVICE_IDENTIFIERS } from '@/di/identifiers';
import type { Application, ApplicationLog } from '@/domain/interfaces/IApplication';
import type { IApplicationService } from '@/domain/interfaces';
import { WorkflowEditorViewModel } from '@/viewModels/WorkflowEditorViewModel';
import { RootStore } from '@/presentation/viewModels/RootStore';

@injectable()
export class ApplicationModel {
  constructor(
    @inject(SERVICE_IDENTIFIERS.ApplicationService) private applicationService: IApplicationService,
    @inject(SERVICE_IDENTIFIERS.WorkflowEditorViewModel) private workflowEditorViewModel: WorkflowEditorViewModel,
    @inject(SERVICE_IDENTIFIERS.RootStore) private rootStore: RootStore
  ) {
    makeAutoObservable(this);
  }

  async updateApplication(applicationId: string, updates: Partial<Application>): Promise<void> {
    const updatedApplication = {
      ...updates,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    await this.applicationService.updateApplication(applicationId, updatedApplication);
  }

  async createStageChangeLog(
    application: Application,
    newStage: string
  ): Promise<Application> {
    const currentDate = new Date().toISOString().split('T')[0];
    const newLog: ApplicationLog = {
      id: crypto.randomUUID(),
      date: currentDate,
      fromStage: application.stage,
      toStage: newStage,
      message: `Status updated from ${application.stage} to ${newStage}`,
      source: 'manual'
    };

    const updatedApplication: Application = {
      ...application,
      stage: newStage,
      lastUpdated: currentDate,
      logs: [...application.logs, newLog]
    };

    await this.rootStore.updateApplication(updatedApplication);
    return updatedApplication;
  }

  getAvailableStages(currentStage: string): string[] {
    const stages = this.workflowEditorViewModel.stages;
    const stage_order = this.workflowEditorViewModel.stageOrder;

    const currentStageObj = stages.find(s => s.name === currentStage);
    if (!currentStageObj) return [];

    const currentIndex = stage_order.indexOf(currentStageObj.id);
    return stages
      .filter(stage => 
        stage.name === 'Rejected' || 
        stage_order.indexOf(stage.id) > currentIndex
      )
      .map(stage => stage.name);
  }

  getStageColor(stageName: string): string {
    const stages = this.workflowEditorViewModel.stages;
    const stage = stages.find(s => s.name === stageName);
    return stage?.color ?? 'gray';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
