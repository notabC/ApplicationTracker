// src/presentation/viewModels/DragDropViewModel.ts
import { makeAutoObservable, runInAction } from 'mobx';
import { inject, injectable } from 'inversify';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';
import type { Application } from '@/core/domain/models/Application';
import type { RootStore } from './RootStore';

@injectable()
export class DragDropViewModel {
  // Observables
  draggedApplication: Application | null = null;
  dragOverStageName: string | null = null;
  error: string | null = null;

  constructor(
    @inject(SERVICE_IDENTIFIERS.RootStore) private rootStore: RootStore
  ) {
    makeAutoObservable(this);
  }

  /**
   * Sets the application being dragged.
   * @param application The application being dragged or null.
   */
  setDraggedApplication(application: Application | null): void {
    this.draggedApplication = application;
    this.error = null; // Reset error state on new drag
  }

  /**
   * Sets the stage name that is being dragged over.
   * @param stageName The stage name or null.
   */
  setDragOverStage(stageName: string | null): void {
    this.dragOverStageName = stageName;
  }

  /**
   * Handles dropping the dragged application into a new stage.
   * @param stageName The name of the stage where the application is dropped.
   */
  async handleDrop(stageName: string): Promise<void> {
    if (!this.draggedApplication || this.draggedApplication.stage === stageName) {
      return;
    }

    // Create a new log entry for the stage change
    const newLog = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      fromStage: this.draggedApplication.stage,
      toStage: stageName,
      message: `Moved from ${this.draggedApplication.stage} to ${stageName} via drag and drop`,
      source: 'drag-drop',
    };

    const updatedApplication: Application = {
      ...this.draggedApplication,
      stage: stageName,
      lastUpdated: new Date().toISOString().split('T')[0],
      logs: [...this.draggedApplication.logs, newLog],
    };

    try {
      await this.rootStore.updateApplication(updatedApplication);
      runInAction(() => {
        this.draggedApplication = null;
        this.dragOverStageName = null;
        this.error = null;
      });
    } catch (error) {
      runInAction(() => {
        this.error = 'Failed to update application stage.';
        console.error('Failed to update application stage:', error);
      });
    }
  }

  /**
   * Checks if the application is being dragged over the specified stage.
   * @param stageName The stage name to check.
   * @returns True if dragging over the stage, false otherwise.
   */
  isDraggingOver(stageName: string): boolean {
    return this.dragOverStageName === stageName;
  }

  /**
   * Checks if any application is currently being dragged.
   * @returns True if dragging, false otherwise.
   */
  isDragging(): boolean {
    return this.draggedApplication !== null;
  }
}
