// src/di/container.ts
import { Container } from 'inversify';
import { ApplicationService } from '@/core/services/ApplicationService';
import { WorkflowService } from '@/core/services/WorkflowService';
import { JobTrackerViewModel } from '@/presentation/viewModels/JobTrackerViewModel';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';
import { IApplicationService } from '@/core/interfaces/services';
import { AddApplicationViewModel } from '@/presentation/viewModels/AddApplicationViewModel';
import { GmailImportViewModel } from '@/presentation/viewModels/GmailImportViewModel';
import { GmailService } from '@/core/services/GmailService';
import { EmailService } from '@/core/services/EmailService';
import { EmailProcessingViewModel } from '@/presentation/viewModels/EmailProcessingViewModel';
import { ApplicationModalViewModel } from '@/presentation/viewModels/ApplicationModalViewModel';
import { DragDropViewModel } from '@/presentation/viewModels/DragDropViewModel';
import { UnsavedChangesViewModel } from '@/presentation/viewModels/UnsavedChangesViewModel';
import { IApplicationRepository } from '@/domain/repositories/ApplicationRepository';
import { MockApplicationRepository } from '@/domain/repositories/MockApplicationRepository';
import { IAnalyticsService } from '@/core/interfaces/services/IAnalyticsService';
import { AnalyticsService } from '@/core/services/AnalyticsService';
import { AnalyticsViewModel } from '@/presentation/viewModels/AnalyticsViewModel';
import { RootStore } from '@/presentation/viewModels/RootStore';
import { AuthViewModel } from '@/presentation/viewModels/AuthViewModel';
import { AuthService } from '@/core/services/AuthService';
import { ProtectedFeatureViewModel } from '@/presentation/viewModels/ProtectedFeatureViewModel';
import { WorkflowEditorViewModel } from '@/viewModels/WorkflowEditorViewModel';
import { ActivityHistoryViewModel } from '@/viewModels/ActivityHistoryViewModel';
import { IWorkflowService } from '@/domain/interfaces/IWorkflow';

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

container.bind<UnsavedChangesViewModel>(SERVICE_IDENTIFIERS.UnsavedChangesViewModel)
  .to(UnsavedChangesViewModel)
  .inSingletonScope();

container.bind<WorkflowEditorViewModel>(SERVICE_IDENTIFIERS.WorkflowEditorViewModel)
  .to(WorkflowEditorViewModel)
  .inSingletonScope();

container.bind<IApplicationRepository>(SERVICE_IDENTIFIERS.ApplicationRepository)
  .to(MockApplicationRepository)
  .inSingletonScope();

container.bind<IAnalyticsService>(SERVICE_IDENTIFIERS.AnalyticsService)
  .to(AnalyticsService)
  .inSingletonScope();

container.bind<AnalyticsViewModel>(SERVICE_IDENTIFIERS.AnalyticsViewModel)
  .to(AnalyticsViewModel)
  .inSingletonScope();

container.bind<ActivityHistoryViewModel>(SERVICE_IDENTIFIERS.ActivityHistoryViewModel)
  .to(ActivityHistoryViewModel)
  .inSingletonScope();

container.bind<RootStore>(SERVICE_IDENTIFIERS.RootStore)
  .to(RootStore)
  .inSingletonScope();

container.bind<AuthService>(SERVICE_IDENTIFIERS.AuthService)
  .to(AuthService)
  .inSingletonScope();

container.bind<AuthViewModel>(SERVICE_IDENTIFIERS.AuthViewModel)
  .to(AuthViewModel)
  .inSingletonScope();

container.bind<ProtectedFeatureViewModel>(SERVICE_IDENTIFIERS.ProtectedFeatureViewModel)
  .to(ProtectedFeatureViewModel)
  .inTransientScope();
  
export { SERVICE_IDENTIFIERS };
