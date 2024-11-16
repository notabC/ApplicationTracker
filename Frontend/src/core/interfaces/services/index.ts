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
  getWorkflow(): Workflow;
  updateWorkflow(workflow: Workflow): void;
  getStages(): WorkflowStage[];
  getColorForStage(stageId: string): string;
  getStageById(stageId: string): WorkflowStage | undefined;
}

// a viewmodel that can update fields of an application
export interface IViewModelUpdateField {
  updateField(applicationId: string, field: keyof Application, value: any): void;
}