// File: src/di/container.ts
import { Container } from 'inversify';
import { ApplicationService } from '@/core/services/ApplicationService';
import { WorkflowService } from '@/core/services/WorkflowService';
import { JobTrackerViewModel } from '@/presentation/viewModels/JobTrackerViewModel';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';
import { IApplicationService, IWorkflowService } from '@/core/interfaces/services';
import { AddApplicationViewModel } from '@/presentation/viewModels/AddApplicationViewModel';
import { GmailImportViewModel } from '@/presentation/viewModels/GmailImportViewModel';
import { GmailService } from '@/core/services/GmailService';
import { EmailService } from '@/core/services/EmailService';
import { EmailProcessingViewModel } from '@/presentation/viewModels/EmailProcessingViewModel';
import { ApplicationModalViewModel } from '@/presentation/viewModels/ApplicationModalViewModel';
import { DragDropViewModel } from '@/presentation/viewModels/DragDropViewModel';

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

container.bind<AddApplicationViewModel>(SERVICE_IDENTIFIERS.AddApplicationViewModel)
  .to(AddApplicationViewModel)
  .inSingletonScope();

container.bind<GmailImportViewModel>(SERVICE_IDENTIFIERS.GmailImportViewModel)
  .to(GmailImportViewModel)
  .inSingletonScope();

container.bind<GmailService>(SERVICE_IDENTIFIERS.GmailService)
  .to(GmailService)
  .inSingletonScope();

container.bind<EmailService>(SERVICE_IDENTIFIERS.EmailService)
  .to(EmailService)
  .inSingletonScope();

container.bind<EmailProcessingViewModel>(SERVICE_IDENTIFIERS.EmailProcessingViewModel)
  .to(EmailProcessingViewModel)
  .inSingletonScope();

container.bind<ApplicationModalViewModel>(SERVICE_IDENTIFIERS.ApplicationModalViewModel)
  .to(ApplicationModalViewModel)
  .inSingletonScope();

container.bind<DragDropViewModel>(SERVICE_IDENTIFIERS.DragDropViewModel)
  .to(DragDropViewModel)
  .inSingletonScope();