// src/presentation/viewModels/DragDropViewModel.ts
import { makeAutoObservable, action } from 'mobx';
import { inject, injectable } from 'inversify';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';
import type { Application } from '@/core/domain/models/Application';
import type { IApplicationService } from '@/core/interfaces/services';

@injectable()
export class DragDropViewModel {
  draggedApplication: Application | null = null;
  dragOverStageName: string | null = null; // Renamed from dragOverStageId

  constructor(
    @inject(SERVICE_IDENTIFIERS.ApplicationService) private applicationService: IApplicationService
  ) {
    makeAutoObservable(this);
  }

  @action
  setDraggedApplication(application: Application | null): void {
    this.draggedApplication = application;
  }

  @action
  setDragOverStage(stageName: string | null): void { // Changed parameter from stageId to stageName
    this.dragOverStageName = stageName;
  }

  @action
  async handleDrop(stageName: string): Promise<void> { // Changed parameter from stageId to stageName
    if (!this.draggedApplication || this.draggedApplication.stage === stageName) {
      return;
    }

    const updatedApplication: Partial<Application> = {
      stage: stageName,
      lastUpdated: new Date().toISOString().split('T')[0],
      logs: [
        ...this.draggedApplication.logs,
        {
          id: crypto.randomUUID(),
          date: new Date().toISOString().split('T')[0],
          fromStage: this.draggedApplication.stage,
          toStage: stageName,
          message: `Moved from ${this.draggedApplication.stage} to ${stageName} via drag and drop`,
          source: 'drag-drop'
        }
      ]
    };

    await this.applicationService.updateApplication(this.draggedApplication.id, updatedApplication);
    this.draggedApplication = null;
    this.dragOverStageName = null;

  }

  isDraggingOver(stageName: string): boolean { // Changed parameter from stageId to stageName
    return this.dragOverStageName === stageName;
  }

  isDragging(): boolean {
    return this.draggedApplication !== null;
  }
}
