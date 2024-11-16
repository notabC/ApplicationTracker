// src/presentation/viewModels/JobTrackerViewModel.ts
import { injectable, inject } from "inversify";
import { makeAutoObservable } from 'mobx';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';
import type { Application } from '@/core/domain/models/Application';
import type { IWorkflowService } from '@/core/interfaces/services';
import { DragDropViewModel } from './DragDropViewModel';
import { RootStore } from './RootStore';
import type { Email, IEmailService } from '@/core/interfaces/services/IEmailService';

@injectable()
export class JobTrackerViewModel {
  searchTerm: string = '';
  activeFilters: string[] = [];
  isFilterExpanded: boolean = false;
  selectedApplication: Application | null = null;
  showAddModal: boolean = false;
  showImportModal: boolean = false;
  showWorkflowModal: boolean = false;
  isGmailModalOpen: boolean = false;
  emails: Email[] = [];
  selectedEmail: Email | null = null;
  showEmailProcessingModal: boolean = false;
  showHistory: boolean = false;
  isLoading: boolean = false;
  error: string | null = null;

  constructor(
    @inject(SERVICE_IDENTIFIERS.WorkflowService) private workflowService: IWorkflowService,
    @inject(SERVICE_IDENTIFIERS.DragDropViewModel) private dragDropViewModel: DragDropViewModel,
    @inject(SERVICE_IDENTIFIERS.RootStore) private rootStore: RootStore,
    @inject(SERVICE_IDENTIFIERS.EmailService) private emailService: IEmailService,
  ) {
    makeAutoObservable(this);
    this.loadEmails();
  }

  // Computed Properties
  get workflowStages() {
    return this.workflowService.getStages();
  }

  get applications(): Application[] {
    return this.rootStore.applications;
  }

  get filteredApplications(): Application[] {
    return this.applications.filter(app => 
      (app.company.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
       app.position.toLowerCase().includes(this.searchTerm.toLowerCase())) &&
      (this.activeFilters.length === 0 || this.activeFilters.some(filter => app.tags.includes(filter)))
    );
  }

  getApplicationsByStage(stageName: string): Application[] {
    return this.filteredApplications.filter(app => app.stage === stageName);
  }

  // Actions

  setSearchTerm(term: string) {
    this.searchTerm = term;
  }

  toggleFilter(filter: string) {
    if (this.activeFilters.includes(filter)) {
      this.activeFilters = this.activeFilters.filter(f => f !== filter);
    } else {
      this.activeFilters.push(filter);
    }
  }

  toggleFilterExpanded() {
    this.isFilterExpanded = !this.isFilterExpanded;
  }

  async handleStageChange(application: Application, newStage: string) {
    const newLog = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      fromStage: application.stage,
      toStage: newStage,
      message: `Status updated from ${application.stage} to ${newStage}`,
      source: 'manual',
    };

    const updatedApplication: Application = {
      ...application,
      stage: newStage,
      lastUpdated: new Date().toISOString().split('T')[0],
      logs: [...application.logs, newLog],
    };

    try {
      await this.rootStore.updateApplication(updatedApplication);
      this.error = null;
    } catch (error) {
      this.error = 'Failed to update application stage';
      console.error('Failed to update application stage:', error);
    }
  }

  selectApplication(application: Application) {
    this.selectedApplication = application;
  }

  clearSelectedApplication() {
    this.selectedApplication = null;
  }

  showAddApplicationModal() {
    this.showAddModal = true;
  }

  showImportGmailModal() {
    this.showImportModal = true;
  }

  showEditWorkflowModal() {
    this.showWorkflowModal = true;
  }

  setShowAddModal(show: boolean) {
    this.showAddModal = show;
  }

  setShowImportModal(show: boolean) {
    this.showImportModal = show;
  }

  setShowWorkflowModal(show: boolean) {
    this.showWorkflowModal = show;
  }

  setIsGmailModalOpen(show: boolean) {
    this.isGmailModalOpen = show;
  }

  private loadEmails(): void {
    try {
      const fetchedEmails = this.emailService.getEmails();
      this.emails = fetchedEmails;
      console.log('Loaded Emails:', this.emails); // Debugging
    } catch (error) {
      this.error = 'Failed to load emails';
      console.error('Failed to load emails:', error);
    }
  }

  addEmails(newEmails: Email[]): void {
    try {
      this.emailService.addEmails(newEmails);
      this.loadEmails();
    } catch (error) {
      this.error = 'Failed to add emails';
      console.error('Failed to add emails:', error);
    }
  }

  markEmailsAsProcessed(emailIds: string[]): void {
    try {
      this.emailService.markAsProcessed(emailIds);
      this.loadEmails();
    } catch (error) {
      this.error = 'Failed to mark emails as processed';
      console.error('Failed to mark emails as processed:', error);
    }
  }

  get unprocessedEmails(): Email[] {
    return this.emails.filter(email => !email.processed);
  }

  selectEmail(email: Email | null): void {
    this.selectedEmail = email;
    if (email) {
      this.showEmailProcessingModal = true;
    }
  }

  closeEmailProcessingModal(): void {
    this.showEmailProcessingModal = false;
    this.selectedEmail = null;
  }

  async processEmail(emailId: string): Promise<void> {
    try {
      // Mark email as processed
      await this.emailService.markAsProcessed([emailId]);

      // Refresh emails
      this.loadEmails();

      // Close modal
      this.closeEmailProcessingModal();
      this.error = null;
    } catch (error) {
      this.error = 'Failed to process email';
      console.error('Failed to process email:', error);
    }
  }

  navigateApplications(direction: 'prev' | 'next'): void {
    if (!this.selectedApplication) return;

    const stageApps = this.getApplicationsByStage(this.selectedApplication.stage);
    if (stageApps.length === 0) return;

    const currentIndex = stageApps.findIndex(app => app.id === this.selectedApplication?.id);
    const newIndex = direction === 'next'
      ? (currentIndex + 1) % stageApps.length
      : (currentIndex - 1 + stageApps.length) % stageApps.length;

    this.selectedApplication = stageApps[newIndex];
  }

  get currentApplicationIndex(): number {
    if (!this.selectedApplication) return -1;
    const stageApps = this.getApplicationsByStage(this.selectedApplication.stage);
    return stageApps.findIndex(app => app.id === this.selectedApplication?.id);
  }

  get totalApplicationsInCurrentStage(): number {
    if (!this.selectedApplication) return 0;
    return this.getApplicationsByStage(this.selectedApplication.stage).length;
  }

  // Expose DragDropViewModel for components
  get dragDropVM(): DragDropViewModel {
    return this.dragDropViewModel;
  }

  setShowHistory(show: boolean): void {
    this.showHistory = show;
  }
}
