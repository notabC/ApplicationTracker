import { Application } from '@/core/domain/models/Application';
import { Workflow, WorkflowStage } from '@/core/domain/models/Workflow';

export interface IApplicationService {
  getApplications(): Application[];
  setApplications(applications: Application[]): void;
  updateApplication(id: string, updates: Partial<Application>): void;
  addApplication(application: Application): void;
  deleteApplication(id: string): void;
  getApplicationById(id: string): Application | undefined;
}

export interface IWorkflowService {
  getWorkflow(): Workflow;
  updateWorkflow(workflow: Workflow): void;
  getStages(): WorkflowStage[];
  getColorForStage(stageId: string): string;
}