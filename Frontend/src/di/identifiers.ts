// src/core/constants/identifiers.ts
export const SERVICE_IDENTIFIERS = {
  ApplicationService: Symbol.for('ApplicationService'),
  WorkflowService: Symbol.for('WorkflowService'),
  JobTrackerViewModel: Symbol.for('JobTrackerViewModel'),
  AddApplicationViewModel: Symbol.for('AddApplicationViewModel'),
  GmailService: Symbol.for('GmailService'),
  GmailImportViewModel: Symbol.for('GmailImportViewModel'),
  EmailService: Symbol.for('EmailService'),
  EmailProcessingViewModel: Symbol.for('EmailProcessingViewModel'),
  ApplicationModalViewModel: Symbol.for('ApplicationModalViewModel'),
  DragDropViewModel: Symbol.for('DragDropViewModel'),
  UnsavedChangesService: Symbol.for('UnsavedChangesService'),
  UnsavedChangesViewModel: Symbol.for('UnsavedChangesViewModel'),
  WorkflowEditorViewModel: Symbol.for('WorkflowEditorViewModel'),
  AnalyticsService: Symbol.for('AnalyticsService'),
  AnalyticsViewModel: Symbol.for('AnalyticsViewModel'),
  ApplicationRepository: Symbol.for('ApplicationRepository'),
  ActivityHistoryViewModel: Symbol('ActivityHistoryViewModel'),
  RootStore: Symbol('RootStore'),
  AuthService: Symbol('AuthService'),
  AuthViewModel: Symbol('AuthViewModel'),
  ProtectedFeatureViewModel: Symbol('ProtectedFeatureViewModel'),
  ApplicationModel: Symbol('ApplicationModel'),
  GmailImportModel: Symbol('GmailImportModel'),
  PrivateRouteViewModel: Symbol('PrivateRouteViewModel'),
  ResetPasswordViewModel: Symbol('ResetPasswordViewModel'),
  // OST Identifiers
  OSTService: Symbol.for('OSTService'),
  OSTOnboardingViewModel: Symbol.for('OSTOnboardingViewModel'),
  OSTApplicationService: Symbol.for('OSTApplicationService'), // Add if needed later
  OSTApplicationViewModel: Symbol.for('OSTApplicationViewModel'), // Add if needed later
  ReasoningService: Symbol.for('ReasoningService')
};
