import { Container } from 'inversify';
import { ApplicationService } from '@/infrastructure/services/ApplicationService';
import { WorkflowService } from '@/infrastructure/services/WorkflowService';
import { JobTrackerViewModel } from '@/viewModels/JobTrackerViewModel';
import { SERVICE_IDENTIFIERS } from '@/di/identifiers';
import { IApplicationService } from '@/domain/interfaces';
import { GmailImportViewModel } from '@/viewModels/GmailImportViewModel';
import { GmailService } from '@/infrastructure/services/GmailService';
import { EmailService } from '@/infrastructure/services/EmailService';
import { EmailProcessingViewModel } from '@/viewModels/EmailProcessingViewModel';
import { IApplicationRepository } from '@/domain/repositories/ApplicationRepository';
import { MockApplicationRepository } from '@/domain/repositories/MockApplicationRepository';
import { IAnalyticsService } from '@/domain/interfaces/IAnalyticsService';
import { AnalyticsService } from '@/infrastructure/services/AnalyticsService';
import { AnalyticsViewModel } from '@/viewModels/AnalyticsViewModel';
import { RootStore } from '@/viewModels/RootStore';
import { AuthViewModel } from '@/viewModels/AuthViewModel';
import { AuthService } from '@/infrastructure/services/AuthService';
import { WorkflowEditorViewModel } from '@/viewModels/WorkflowEditorViewModel';
import { ActivityHistoryViewModel } from '@/viewModels/ActivityHistoryViewModel';
import { IWorkflowService } from '@/domain/interfaces/IWorkflow';
import { AddApplicationViewModel } from '@/viewModels/AddApplicationViewModel';
import { ApplicationModalViewModel } from '@/viewModels/ApplicationModalViewModel';
import { ApplicationModel } from '@/domain/models/ApplicationModel';
import { GmailImportModel } from '@/domain/models/GmailImportModel';
import { PrivateRouteViewModel } from '@/viewModels/PrivateRouteViewModel';
import { UnsavedChangesViewModel } from '@/viewModels/UnsavedChangesViewModel';

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

container.bind<ApplicationModel>(SERVICE_IDENTIFIERS.ApplicationModel)
  .to(ApplicationModel)
  .inTransientScope();

container.bind<GmailImportModel>(SERVICE_IDENTIFIERS.GmailImportModel)
  .to(GmailImportModel)
  .inTransientScope();

container.bind<PrivateRouteViewModel>(SERVICE_IDENTIFIERS.PrivateRouteViewModel)
  .to(PrivateRouteViewModel)
  .inSingletonScope();
  
export { SERVICE_IDENTIFIERS };
