import { makeAutoObservable, action, observable, computed, runInAction } from 'mobx';
import { inject, injectable } from 'inversify';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';
import type { WorkflowStage, Workflow } from '@/core/domain/models/Workflow';
import type { IWorkflowService } from '@/core/interfaces/services';

@injectable()
export class WorkflowEditorViewModel {
  @observable private _workflow: Workflow = {
    stages: [],
    stage_order: [],
    default: true,
    id: ''
  };
  @observable private _originalWorkflow: Workflow = {
    stages: [],
    stage_order: [],
    default: true,
    id: ''
  };
  @observable draggedStageId: string | null = null;
  @observable isLoading: boolean = false;
  @observable error: string | null = null;
  @observable hasUnsavedChanges: boolean = false;
  
  constructor(
    @inject(SERVICE_IDENTIFIERS.WorkflowService) private workflowService: IWorkflowService,
  ) {
    makeAutoObservable(this);
    this.initializeWorkflow();
  }

  private async initializeWorkflow(): Promise<void> {
    try {
      this.isLoading = true;
      const workflow = await this.workflowService.getOrCreateWorkflow();
      runInAction(() => {
        this._workflow = workflow;
        this._originalWorkflow = this.deepCloneWorkflow(workflow);
        this.isLoading = false;
        this.hasUnsavedChanges = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = 'Failed to initialize workflow';
        this.isLoading = false;
      });
      console.error('Failed to initialize workflow:', error);
    }
  }

  private deepCloneWorkflow(workflow: Workflow): Workflow {
    return {
      ...workflow,
      stages: workflow.stages.map(stage => ({ ...stage })),
      stage_order: [...workflow.stage_order]
    };
  }

  @computed
  get workflow(): Workflow {
    return this._workflow;
  }

  @computed
  get hasChanges(): boolean {
    return this.hasUnsavedChanges;
  }

  getStages(): WorkflowStage[] {
    return this.workflow.stages;
  }

  private markAsChanged(): void {
    this.hasUnsavedChanges = true;
  }

  @action
  discardChanges(): void {
    if (this.hasUnsavedChanges) {
      this._workflow = this.deepCloneWorkflow(this._originalWorkflow);
      this.hasUnsavedChanges = false;
      this.error = null;
    }
  }

  @action
  startDragging(stageId: string): void {
    this.draggedStageId = stageId;
  }

  @action
  deleteStage(stageId: string): void {
    const stage = this.workflow.stages.find(s => s.id === stageId);
    if (!stage || stage.editable === false) return;

    const updatedStages = this.workflow.stages.filter(s => s.id !== stageId);
    const updatedStageOrder = this.workflow.stage_order.filter(id => id !== stageId);

    this._workflow = {
      ...this.workflow,
      stages: updatedStages,
      stage_order: updatedStageOrder
    };
    this.markAsChanged();
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

    this._workflow = {
      ...this.workflow,
      stages: [...this.workflow.stages, newStage],
      stage_order: [...this.workflow.stage_order, newStage.id]
    };
    this.markAsChanged();
  }

  @action
  updateStageName(stageId: string, name: string): void {
    const stage = this.workflow.stages.find(s => s.id === stageId);
    if (stage && stage.editable !== false) {
      const updatedStages = this.workflow.stages.map(s => 
        s.id === stageId ? { ...s, name } : s
      );
      this._workflow = { ...this.workflow, stages: updatedStages };
      this.markAsChanged();
    }
  }

  @action
  updateStageVisibility(stageId: string, visible: boolean): void {
    const stage = this.workflow.stages.find(s => s.id === stageId);
    if (stage && stage.editable !== false) {
      const updatedStages = this.workflow.stages.map(s => 
        s.id === stageId ? { ...s, visible } : s
      );
      this._workflow = { ...this.workflow, stages: updatedStages };
      this.markAsChanged();
    }
  }

  @action
  updateStageColor(stageId: string, color: WorkflowStage['color']): void {
    const stage = this.workflow.stages.find(s => s.id === stageId);
    if (stage && stage.editable !== false) {
      const updatedStages = this.workflow.stages.map(s => 
        s.id === stageId ? { ...s, color } : s
      );
      this._workflow = { ...this.workflow, stages: updatedStages };
      this.markAsChanged();
    }
  }

  @action
  handleDrop(targetId: string): void {
    if (!this.draggedStageId || this.draggedStageId === targetId) return;

    const draggedStage = this.workflow.stages.find(s => s.id === this.draggedStageId);
    if (!draggedStage || draggedStage.editable === false) return;

    const newOrder = [...this.workflow.stage_order];
    const draggedIdx = newOrder.indexOf(this.draggedStageId);
    const targetIdx = newOrder.indexOf(targetId);

    newOrder.splice(draggedIdx, 1);
    newOrder.splice(targetIdx, 0, this.draggedStageId);

    this._workflow = { ...this.workflow, stage_order: newOrder };
    this.markAsChanged();
    this.draggedStageId = null;
  }

  @action
  async saveWorkflow(): Promise<void> {
    if (!this._workflow) return;

    try {
      this.isLoading = true;
      const savedWorkflow = await this.workflowService.updateWorkflow(this._workflow);
      runInAction(() => {
        this._workflow = savedWorkflow;
        this._originalWorkflow = this.deepCloneWorkflow(savedWorkflow);
        this.isLoading = false;
        this.error = null;
        this.hasUnsavedChanges = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = 'Failed to save workflow';
        this.isLoading = false;
      });
      console.error('Failed to save workflow:', error);
      throw error;
    }
  }

  @action
  resetWorkflow(): void {
    this._workflow = this.deepCloneWorkflow(this._originalWorkflow);
    this.hasUnsavedChanges = false;
    this.error = null;
    this.isLoading = false;
  }
}