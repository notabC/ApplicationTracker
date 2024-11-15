// File: src/di/container.ts
import { Container } from 'inversify';
import { ApplicationService } from '@/core/services/ApplicationService';
import { WorkflowService } from '@/core/services/WorkflowService';
import { JobTrackerViewModel } from '@/presentation/viewModels/JobTrackerViewModel';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';
import { IApplicationService, IWorkflowService } from '@/core/interfaces/services';

export const container = new Container();

// Register services
container.bind<IApplicationService>(SERVICE_IDENTIFIERS.ApplicationService)
  .to(ApplicationService)
  .inSingletonScope();

container.bind<IWorkflowService>(SERVICE_IDENTIFIERS.WorkflowService)
  .to(WorkflowService)
  .inSingletonScope();

container.bind<JobTrackerViewModel>(SERVICE_IDENTIFIERS.JobTrackerViewModel)
  .to(JobTrackerViewModel)
  .inSingletonScope();