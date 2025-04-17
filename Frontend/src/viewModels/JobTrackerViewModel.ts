// src/presentation/viewModels/JobTrackerViewModel.ts
import { injectable, inject } from "inversify";
import { makeAutoObservable, observable, action } from 'mobx';
import { SERVICE_IDENTIFIERS } from '@/di/identifiers';
import type { Application } from '@/domain/interfaces/IApplication';
import type { IEmailService } from '@/domain/interfaces/IEmailService';
import { RootStore } from './RootStore';
import { WorkflowEditorViewModel } from "@/viewModels/WorkflowEditorViewModel";
import { JobTrackerModel, ApplicationViewData } from '@/domain/models/JobTrackerModel';
import type { Email } from '@/domain/interfaces/IEmailService';
import { ApplicationModel } from "@/domain/models/ApplicationModel";
import type { IWorkflowService } from "@/domain/interfaces/IWorkflow";

@injectable()
export class JobTrackerViewModel {
  @observable isFilterExpanded: boolean = false;
  @observable selectedApplicationId: string | null = null;
  @observable showAddModal: boolean = false;
  @observable showImportModal: boolean = false;
  @observable showWorkflowModal: boolean = false;
  @observable isGmailModalOpen: boolean = false;
  @observable selectedEmailId: string | null = null;
  @observable showEmailProcessingModal: boolean = false;
  @observable showHistory: boolean = false;
  @observable menuOpen: boolean = false;
  @observable showDeleteAllDataModal: boolean = false;
  @observable showOSTOnboardingModal: boolean = false;

  public model: JobTrackerModel;

  constructor(
    @inject(SERVICE_IDENTIFIERS.WorkflowEditorViewModel) private workflowEditorViewModel: WorkflowEditorViewModel,
    @inject(SERVICE_IDENTIFIERS.RootStore) private rootStore: RootStore,
    @inject(SERVICE_IDENTIFIERS.EmailService) private emailService: IEmailService,
    @inject(SERVICE_IDENTIFIERS.ApplicationModel) private applicationModel: ApplicationModel,
    @inject(SERVICE_IDENTIFIERS.WorkflowService) private workflowService: IWorkflowService
  ) {
    this.model = new JobTrackerModel(this.rootStore, this.emailService, this.workflowService);
    makeAutoObservable(this);
  }

  @action
  setShowOSTOnboardingModal(show: boolean) {
    this.showOSTOnboardingModal = show;
  }

  get isLoading(): boolean {
    return this.model.isLoading;
  }

  get error(): string | null {
    return this.model.error;
  }

  get searchTerm(): string {
    return this.model.searchTerm;
  }

  @action
  setShowDeleteAllDataModal(show: boolean) {
    this.showDeleteAllDataModal = show;
  }

  getAvailableStages(currentStage: string): string[] {
    return this.applicationModel.getAvailableStages(currentStage);
  }

  @action
  setSearchTerm(term: string): void {
    this.model.setSearchTerm(term);
  }

  get activeFilters(): string[] {
    return this.model.activeFilters;
  }

  @action
  toggleFilter(filter: string) {
    this.model.toggleFilter(filter);
  }

  get workflowStages() {
    return this.workflowEditorViewModel.stages;
  }

  get filteredApplications(): Application[] {
    return this.model.filteredApplications;
  }

  getApplicationsByStage(stageName: string): Application[] {
    return this.model.getApplicationsByStage(stageName);
  }

  async handleStageChange(application: Application, newStage: string) {
    await this.model.handleStageChange(application, newStage);
  }

  @action
  setSelectedApplicationById(id: string | null) {
    this.selectedApplicationId = id;
  }

  get selectedApplication(): Application | null {
    return this.selectedApplicationId
      ? this.filteredApplications.find(app => app.id === this.selectedApplicationId) || null
      : null;
  }

  @action
  setShowAddModal(show: boolean) {
    this.showAddModal = show;
  }

  @action
  setShowImportModal(show: boolean) {
    this.showImportModal = show;
  }

  @action
  setIsGmailModalOpen(show: boolean) {
    this.isGmailModalOpen = show;
  }

  @action
  setShowWorkflowModal(show: boolean) {
    if (!show) {
      this.workflowEditorViewModel.closeModal();
    } else {
      this.workflowEditorViewModel.openModal();
    }
    this.showWorkflowModal = show;
  }

  get unprocessedEmails() {
    return this.model.unprocessedEmails;
  }

  get filteredUnprocessedEmails() {
    return this.model.filteredUnprocessedEmails;
  }

  @action
  setSelectedEmailId(id: string | null): void {
    this.selectedEmailId = id;
    this.showEmailProcessingModal = !!id;
  }

  get emails(): Email[] {
    return this.model.emails;
  }

  get selectedEmail() {
    return this.selectedEmailId
      ? this.emails.find(email => email.id === this.selectedEmailId) || null
      : null;
  }

  @action
  closeEmailProcessingModal(): void {
    this.showEmailProcessingModal = false;
    this.selectedEmailId = null;
  }

  async processEmail(emailId: string): Promise<void> {
    await this.model.processEmail(emailId);
    this.closeEmailProcessingModal();
  }

  @action
  addEmails(newEmails: Email[]): void {
    this.model.addEmails(newEmails);
  }

  @action
  markEmailsAsProcessed(emailIds: string[]): void {
    this.model.markEmailsAsProcessed(emailIds);
  }

  @action
  setShowHistory(show: boolean): void {
    this.showHistory = show;
  }

  @action
  toggleFilterExpanded() {
    this.isFilterExpanded = !this.isFilterExpanded;
  }

  @action
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  @action
  navigateApplications(direction: 'prev' | 'next'): void {
    if (!this.selectedApplicationId) return;
    const nextAppId = this.model.getNextApplicationId(this.selectedApplicationId, direction);
    if (nextAppId) {
      this.selectedApplicationId = nextAppId;
    }
  }

  get currentApplicationIndex(): number {
    if (!this.selectedApplicationId) return -1;
    return this.model.getCurrentApplicationIndex(this.selectedApplicationId);
  }

  get totalApplicationsInCurrentStage(): number {
    if (!this.selectedApplicationId) return 0;
    return this.model.getTotalApplicationsInStage(this.selectedApplicationId);
  }

  // Drag and Drop
  @action
  beginDrag(application: Application) {
    this.model.beginDrag(application);
  }

  @action
  endDrag() {
    this.model.endDrag();
  }

  @action
  dragOverStage(stageId: string) {
    this.model.dragOverStage(stageId);
  }

  @action
  leaveStage() {
    this.model.leaveStage();
  }

  async dropOnStage(stageName: string): Promise<void> {
    await this.model.dropOnStage(stageName);
  }

  isStageVisible(stageId: string, fallbackVisible: boolean): boolean {
    return this.model.isStageVisible(stageId, this.workflowStages, fallbackVisible);
  }

  // Stage selector UI methods
  @action
  openStageSelectorForApplication(applicationId: string) {
    this.model.openStageSelectorForApplication(applicationId);
  }

  @action
  closeStageSelector() {
    this.model.closeStageSelector();
  }

  isStageSelectorOpenForApplication(applicationId: string): boolean {
    return this.model.isStageSelectorOpen(applicationId);
  }

  // Retrieve precomputed data for the application
  getApplicationViewData(applicationId: string): ApplicationViewData | null {
    const app = this.filteredApplications.find(a => a.id === applicationId);
    if (!app) return null;
    return this.model.getApplicationViewData(app);
  }

  formatRelativeTime(time: string): string {
    return this.model.formatRelativeTime(time);
  }

  async deleteAllData(): Promise<void> {
    await this.model.deleteAllData();
    // After completion, you might close the modal or show a success message:
    this.setShowDeleteAllDataModal(false);
  }
}