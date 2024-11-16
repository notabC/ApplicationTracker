// src/presentation/viewModels/WorkflowEditorViewModel.ts
import { makeAutoObservable, action, computed, observable } from 'mobx';
import { inject, injectable } from 'inversify';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';
import type { WorkflowStage, Workflow } from '@/core/domain/models/Workflow';
import { UnsavedChangesViewModel } from './UnsavedChangesViewModel';
import type { IWorkflowService } from '@/core/interfaces/services';

@injectable()
export class WorkflowEditorViewModel {
  @observable private _workflow: Workflow;
  @observable draggedStageId: string | null = null;
  @observable isOpen = false;

  constructor(
    @inject(SERVICE_IDENTIFIERS.WorkflowService) private workflowService: IWorkflowService,
    @inject(SERVICE_IDENTIFIERS.UnsavedChangesViewModel) public unsavedChangesViewModel: UnsavedChangesViewModel
  ) {
    makeAutoObservable(this);
    this._workflow = this.workflowService.getWorkflow();
  }

  @computed
  get workflow(): Workflow {
    return this._workflow;
  }

  @action
  setIsOpen(open: boolean): void {
    this.isOpen = open;
    if (!open) {
      this.resetToOriginal();
    }
  }

  @action
  private resetToOriginal(): void {
    this._workflow = this.workflowService.getWorkflow();
    this.draggedStageId = null;
  }

  @action
  updateStageName(stageId: string, name: string): void {
    const stage = this._workflow.stages.find(s => s.id === stageId);
    if (stage && stage.editable !== false) {
      stage.name = name;
    }
  }

  @action
  updateStageVisibility(stageId: string, visible: boolean): void {
    const stageIndex = this._workflow.stages.findIndex(s => s.id === stageId);
    if (stageIndex !== -1) {
      // Create a new reference to trigger reactivity
      this._workflow.stages = [
        ...this._workflow.stages.slice(0, stageIndex),
        { 
          ...this._workflow.stages[stageIndex], 
          visible 
        },
        ...this._workflow.stages.slice(stageIndex + 1)
      ];
    }
  }

  @action
  updateStageColor(stageId: string, color: WorkflowStage['color']): void {
    const stage = this._workflow.stages.find(s => s.id === stageId);
    if (stage && stage.editable !== false) {
      stage.color = color;
    }
  }

  @action
  startDragging(stageId: string): void {
    this.draggedStageId = stageId;
  }

  @action
  handleDrop(targetId: string): void {
    if (!this.draggedStageId || this.draggedStageId === targetId) return;

    const draggedStage = this._workflow.stages.find(s => s.id === this.draggedStageId);
    const targetStage = this._workflow.stages.find(s => s.id === targetId);

    if (!draggedStage || !targetStage || draggedStage.editable === false) return;

    const newOrder = [...this._workflow.stageOrder];
    const draggedIdx = newOrder.indexOf(this.draggedStageId);
    const targetIdx = newOrder.indexOf(targetId);

    newOrder.splice(draggedIdx, 1);
    newOrder.splice(targetIdx, 0, this.draggedStageId);

    this._workflow.stageOrder = newOrder;
    this.draggedStageId = null;
  }

  @action
  addStage(): void {
    const newStage: WorkflowStage = {
      id: `stage-${Date.now()}`,
      name: 'New Stage',
      color: 'gray',
      editable: true,
      visible: true
    };

    this._workflow.stages.push(newStage);
    this._workflow.stageOrder.push(newStage.id);
  }

  @action
  deleteStage(stageId: string): void {
    const stage = this._workflow.stages.find(s => s.id === stageId);
    if (!stage || stage.editable === false) return;

    this._workflow.stages = this._workflow.stages.filter(s => s.id !== stageId);
    this._workflow.stageOrder = this._workflow.stageOrder.filter(id => id !== stageId);
  }

  @action
  async saveWorkflow(): Promise<void> {
    try {
      await this.workflowService.updateWorkflow(this._workflow);
      this.unsavedChangesViewModel.discardChanges();
    } catch (error) {
      console.error('Failed to save workflow:', error);
      throw error;
    }
  }

}

