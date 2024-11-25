// src/viewModels/WorkflowEditorViewModel.ts
import { SERVICE_IDENTIFIERS } from "@/di/container";
import type { IWorkflowService, WorkflowStage } from "@/domain/interfaces/IWorkflow";
import { WorkflowModel } from "@/domain/models/WorkflowModel";
import { injectable, inject } from "inversify";
import { observable, makeAutoObservable, computed, action, runInAction } from "mobx";

@injectable()
export class WorkflowEditorViewModel {
  @observable private workflowModel: WorkflowModel;
  @observable private originalModel: WorkflowModel;
  
  // UI State Only
  @observable expandedStageId: string | null = null;
  @observable isMobile: boolean = false;
  @observable isModalOpen: boolean = false;
  @observable draggedStageId: string | null = null;
  @observable isLoading: boolean = false;
  @observable error: string | null = null;

  constructor(
    @inject(SERVICE_IDENTIFIERS.WorkflowService) private workflowService: IWorkflowService,
  ) {
    makeAutoObservable(this);
    this.workflowModel = new WorkflowModel();
    this.originalModel = new WorkflowModel();
    this.initializeWorkflow();
    this.initializeResponsiveLayout();
  }

  // UI State Getters
  @computed get stages(): WorkflowStage[] {
    return this.workflowModel.getOrderedStages();
  }

  @computed get stageOrder(): string[] {
    return this.workflowModel.getStageOrder();
  }

  @computed get hasUnsavedChanges(): boolean {
    return this.workflowModel.isDirtyState();
  }

  // UI Event Handlers
  @action
  setExpandedStage = (stageId: string | null): void => {
    this.expandedStageId = stageId;
  }

  @action
  startDragging = (stageId: string): void => {
    this.draggedStageId = stageId;
  }

  @action
  handleDrop = (targetId: string): void => {
    if (!this.draggedStageId || this.draggedStageId === targetId) return;
    this.workflowModel.updateStageOrder(this.draggedStageId, targetId);
    this.draggedStageId = null;
  }

  @action
  openModal = (): void => {
    this.isModalOpen = true;
  }

  @action
  closeModal = (): void => {
    if (this.hasUnsavedChanges) {
      this.workflowModel.resetChanges(this.originalModel);
    }
    this.isModalOpen = false;
    this.expandedStageId = null;
  }

  // Delegate to Model

  @action
  updateStage(stageId: string, updates: Partial<WorkflowStage>): void {
    this.workflowModel.updateStage(stageId, updates);
  }

  @action
  deleteStage(stageId: string): void {
    this.workflowModel.deleteStage(stageId);
  }

  @action
  addStage(): void {
    this.workflowModel.addStage('New Stage');
  }

  // API and Data Management
  @action
  private initializeResponsiveLayout(): void {
    const checkMobile = action(() => {
      this.isMobile = window.innerWidth < 768;
    });
    checkMobile();
    window.addEventListener('resize', checkMobile);
  }

  @action
  private async initializeWorkflow(): Promise<void> {
    try {
      this.isLoading = true;
      const workflowDTO = await this.workflowService.getOrCreateWorkflow();
      runInAction(() => {
        this.workflowModel = new WorkflowModel(workflowDTO);
        this.originalModel = this.workflowModel.clone();
      });
    } catch (error) {
      runInAction(() => {
        this.error = 'Failed to initialize workflow';
      });
      console.error('Failed to initialize workflow:', error);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  @action
  async saveWorkflow(): Promise<void> {
    try {
      this.isLoading = true;
      const savedWorkflow = await this.workflowService.updateWorkflow(
        this.workflowModel.toDTO()
      );
      runInAction(() => {
        this.workflowModel = new WorkflowModel(savedWorkflow);
        this.originalModel = new WorkflowModel(savedWorkflow);
        this.error = null;
      });
    } catch (error) {
      runInAction(() => {
        this.error = 'Failed to save workflow';
      });
      throw error;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }
}