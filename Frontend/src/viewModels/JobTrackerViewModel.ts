// src/presentation/viewModels/JobTrackerViewModel.ts
import { injectable, inject } from "inversify";
import { makeAutoObservable } from 'mobx';
import { SERVICE_IDENTIFIERS } from '@/di/identifiers';
import type { Application } from '@/domain/interfaces/IApplication';
import type { IEmailService } from '@/domain/interfaces/IEmailService';
import { RootStore } from './RootStore';
import { WorkflowEditorViewModel } from "@/viewModels/WorkflowEditorViewModel";
import { JobTrackerModel, ApplicationViewData } from '@/domain/models/JobTrackerModel';
import type { Email } from '@/domain/interfaces/IEmailService';
import { ApplicationModel } from "@/domain/models/ApplicationModel";

@injectable()
export class JobTrackerViewModel {
  isFilterExpanded: boolean = false;
  selectedApplicationId: string | null = null;
  showAddModal: boolean = false;
  showImportModal: boolean = false;
  showWorkflowModal: boolean = false;
  isGmailModalOpen: boolean = false;
  selectedEmailId: string | null = null;
  showEmailProcessingModal: boolean = false;
  showHistory: boolean = false;
  menuOpen: boolean = false;

  public model: JobTrackerModel;

  constructor(
    @inject(SERVICE_IDENTIFIERS.WorkflowEditorViewModel) private workflowEditorViewModel: WorkflowEditorViewModel,
    @inject(SERVICE_IDENTIFIERS.RootStore) private rootStore: RootStore,
    @inject(SERVICE_IDENTIFIERS.EmailService) private emailService: IEmailService,
    @inject(SERVICE_IDENTIFIERS.ApplicationModel) private applicationModel: ApplicationModel,
  ) {
    this.model = new JobTrackerModel(this.rootStore, this.emailService);
    makeAutoObservable(this);
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

  getAvailableStages(currentStage: string): string[] {
    return this.applicationModel.getAvailableStages(currentStage);
  }

  setSearchTerm(term: string): void {
    this.model.setSearchTerm(term);
  }

  get activeFilters(): string[] {
    return this.model.activeFilters;
  }

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

  setSelectedApplicationById(id: string | null) {
    this.selectedApplicationId = id;
  }

  get selectedApplication(): Application | null {
    return this.selectedApplicationId
      ? this.filteredApplications.find(app => app.id === this.selectedApplicationId) || null
      : null;
  }

  setShowAddModal(show: boolean) {
    this.showAddModal = show;
  }

  setShowImportModal(show: boolean) {
    this.showImportModal = show;
  }

  setIsGmailModalOpen(show: boolean) {
    this.isGmailModalOpen = show;
  }

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

  closeEmailProcessingModal(): void {
    this.showEmailProcessingModal = false;
    this.selectedEmailId = null;
  }

  async processEmail(emailId: string): Promise<void> {
    await this.model.processEmail(emailId);
    this.closeEmailProcessingModal();
  }

  addEmails(newEmails: Email[]): void {
    this.model.addEmails(newEmails);
  }

  markEmailsAsProcessed(emailIds: string[]): void {
    this.model.markEmailsAsProcessed(emailIds);
  }

  setShowHistory(show: boolean): void {
    this.showHistory = show;
  }

  toggleFilterExpanded() {
    this.isFilterExpanded = !this.isFilterExpanded;
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

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
  beginDrag(application: Application) {
    this.model.beginDrag(application);
  }

  endDrag() {
    this.model.endDrag();
  }

  dragOverStage(stageId: string) {
    this.model.dragOverStage(stageId);
  }

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
  openStageSelectorForApplication(applicationId: string) {
    this.model.openStageSelectorForApplication(applicationId);
  }

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
}