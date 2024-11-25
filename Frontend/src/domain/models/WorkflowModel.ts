// src/domain/models/WorkflowModel.ts
import { WorkflowStage, Workflow } from '@/core/domain/models/Workflow';
import { makeAutoObservable } from 'mobx';

export class WorkflowModel {
    private stages: WorkflowStage[] = [];
    private stageOrder: string[] = [];
    private workflowId: string = '';
    private userEmail: string = '';
    private userId: string = '';
    private isDefault: boolean = true;
    private isDirty: boolean = false;
  
    constructor(workflow?: Workflow) {
      makeAutoObservable(this);
      if (workflow) {
        this.initialize(workflow);
      }
    }
  
    private initialize(workflow: Workflow): void {
      this.stages = workflow.stages;
      this.stageOrder = workflow.stage_order;
      this.workflowId = workflow.id;
      this.userEmail = workflow.user_email;
      this.userId = workflow.user_id;
      this.isDefault = workflow.default;
    }

    private markAsChanged(): void {
        this.isDirty = true;
    }
    
    private deepClone<T>(obj: T): T {
        return JSON.parse(JSON.stringify(obj));
    }
  
    getOrderedStages(): WorkflowStage[] {
      return this.stageOrder.map(stageId => {
        const stage = this.stages.find(s => s.id === stageId);
        if (!stage) throw new Error(`Stage with id ${stageId} not found`);
        return stage;
      });
    }

    getStageOrder(): string[] {
        return this.stageOrder;
    }
  
    addStage(name: string): void {
      const newStage: WorkflowStage = {
        id: `stage-${Date.now()}`,
        name,
        color: 'gray',
        editable: true,
        visible: true
      };
      this.stages.push(newStage);
      this.stageOrder.push(newStage.id);
      this.markAsChanged();
    }
  
    deleteStage(stageId: string): void {
      const stage = this.stages.find(s => s.id === stageId);
      if (!stage || stage.editable === false) return;
  
      this.stages = this.stages.filter(s => s.id !== stageId);
      this.stageOrder = this.stageOrder.filter(id => id !== stageId);
      this.markAsChanged();
    }
  
    updateStageOrder(draggedId: string, targetId: string): void {
      const draggedStage = this.stages.find(s => s.id === draggedId);
      if (!draggedStage || draggedStage.editable === false) return;
  
      const draggedIdx = this.stageOrder.indexOf(draggedId);
      const targetIdx = this.stageOrder.indexOf(targetId);
  
      // Modify the array in place for MobX tracking
      const [removed] = this.stageOrder.splice(draggedIdx, 1);
      this.stageOrder.splice(targetIdx, 0, removed);
      this.markAsChanged();
    }
  
    updateStage(stageId: string, updates: Partial<WorkflowStage>): void {
      const stageIndex = this.stages.findIndex(s => s.id === stageId);
      if (stageIndex !== -1 && this.stages[stageIndex].editable !== false) {
        // Modify the array in place for MobX tracking
        this.stages[stageIndex] = {
          ...this.stages[stageIndex],
          ...updates
        };
        this.markAsChanged();
      }
    }
  
    toDTO(): Workflow {
      return {
        stages: this.deepClone(this.stages),
        stage_order: [...this.stageOrder],
        id: this.workflowId,
        user_email: this.userEmail,
        user_id: this.userId,
        default: this.isDefault
      };
    }
  
    clone(): WorkflowModel {
      return new WorkflowModel(this.toDTO());
    }

    resetChanges(originalModel: WorkflowModel): void {
      const original = originalModel.toDTO();
      this.initialize(original);
      this.isDirty = false;
    }
  
    isDirtyState(): boolean {
      return this.isDirty;
    }
}