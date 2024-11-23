import { Application } from '@/core/domain/models/Application';
import { Workflow, WorkflowStage } from '@/core/domain/models/Workflow';

export interface IApplicationService {
  getApplications(): Promise<Application[]>;
  setApplications(applications: Application[]): void;
  updateApplication(id: string, updates: Partial<Application>): Promise<Application>;
  addApplication(application: Application): Promise<Application>;
  deleteApplication(id: string): void;
  getApplicationById(id: string): Promise<Application | undefined>;
}

export interface IWorkflowService {
  getOrCreateWorkflow(): Promise<Workflow>;
  getWorkflow(workflowId: string): Promise<Workflow>;
  updateWorkflow(workflow: Workflow): Promise<Workflow>;
  getStages(workflowId: string): Promise<WorkflowStage[]>;
  getColorForStage(workflowId: string, stageId: string): Promise<string>;
  getStageById(workflowId: string, stageId: string): Promise<WorkflowStage | undefined>;
  updateStage(workflowId: string, stageId: string, stage: WorkflowStage): Promise<Workflow>;
  updateStageOrder(workflowId: string, stageOrder: string[]): Promise<Workflow>;
  updateStageVisibility(workflowId: string, stageId: string, visible: boolean): Promise<Workflow>;
}

// a viewmodel that can update fields of an application
export interface IViewModelUpdateField {
  updateField(applicationId: string, field: keyof Application, value: any): void;
}