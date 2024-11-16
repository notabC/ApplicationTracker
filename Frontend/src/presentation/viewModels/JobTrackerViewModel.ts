// src/presentation/viewModels/JobTrackerViewModel.ts
import { injectable, inject } from "inversify";
import { makeObservable, observable, action, computed } from 'mobx';
import type { IApplicationService, IWorkflowService } from '@/core/interfaces/services';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';
import type { Application } from '@/core/domain/models/Application';
import { mockApplications } from '@/core/services/mockData';
import type { Email, IEmailService } from '@/core/interfaces/services/IEmailService';

@injectable()
export class JobTrackerViewModel {
  @observable searchTerm: string = '';
  @observable activeFilters: string[] = [];
  @observable isFilterExpanded: boolean = false;
  @observable selectedApplication: Application | null = null;
  @observable showAddModal: boolean = false;
  @observable showImportModal: boolean = false;
  @observable showWorkflowModal: boolean = false;
  @observable isGmailModalOpen: boolean = false;
  @observable emails: Email[] = [];
  @observable selectedEmail: Email | null = null;
  @observable showEmailProcessingModal: boolean = false;
  @observable private _applications: Application[] = [];

  constructor(
    @inject(SERVICE_IDENTIFIERS.ApplicationService) private applicationService: IApplicationService,
    @inject(SERVICE_IDENTIFIERS.WorkflowService) private workflowService: IWorkflowService,
    @inject(SERVICE_IDENTIFIERS.EmailService) private emailService: IEmailService,
  ) {
    makeObservable(this);
    this.applicationService.setApplications(mockApplications);
    this.loadApplications();
    this.loadEmails();
  }

  @computed
  get workflowStages() {
    return this.workflowService.getStages();
  }

  @action
  setSearchTerm(term: string) {
    this.searchTerm = term;
  }

  @action
  toggleFilter(filter: string) {
    if (this.activeFilters.includes(filter)) {
      this.activeFilters = this.activeFilters.filter(f => f !== filter);
    } else {
      this.activeFilters.push(filter);
    }
  }

  @action
  toggleFilterExpanded() {
    this.isFilterExpanded = !this.isFilterExpanded;
  }

  @computed
  get filteredApplications() {
    return this.applicationService.getApplications().filter(app => 
      (app.company.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
       app.position.toLowerCase().includes(this.searchTerm.toLowerCase())) &&
      (this.activeFilters.length === 0 || this.activeFilters.some(filter => app.tags.includes(filter)))
    );
  }

  getApplicationsByStage(stageName: string) {
    return this.filteredApplications.filter(app => app.stage === stageName);
  }

  @action
  handleStageChange = (applicationId: string, newStage: string) => {
    const application = this.applicationService.getApplications()
      .find(app => app.id === applicationId);
    
    if (application) {
      this.applicationService.updateApplication(applicationId, {
        ...application,
        stage: newStage,
        lastUpdated: new Date().toISOString().split('T')[0]
      });
    }
  };

  @action
  selectApplication(application: Application) {
    this.selectedApplication = application;
  }

  @action
  clearSelectedApplication() {
    this.selectedApplication = null;
  }

  @action
  showAddApplicationModal() {
    this.showAddModal = true;
  }

  @action
  showImportGmailModal() {
    this.showImportModal = true;
  }

  @action
  showEditWorkflowModal() {
    this.showWorkflowModal = true;
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
  setShowWorkflowModal(show: boolean) {
    this.showWorkflowModal = show;
  }

  @action
  setIsGmailModalOpen(show: boolean) {
    this.isGmailModalOpen = show;
  }

  @action
  private loadEmails(): void {
    this.emails = this.emailService.getEmails();
    console.log('Loaded Emails:', this.emails); // Debugging
  }
  
  @action
  addEmails(newEmails: Email[]): void {
    this.emailService.addEmails(newEmails);
    this.loadEmails();
  }
  
  @action
  markEmailsAsProcessed(emailIds: string[]): void {
    this.emailService.markAsProcessed(emailIds);
    this.loadEmails();
  }
  
  @computed
  get unprocessedEmails(): Email[] {
    return this.emails.filter(email => !email.processed);
  }

  @action
  selectEmail(email: Email | null): void {
    this.selectedEmail = email;
    if (email) {
      this.showEmailProcessingModal = true;
    }
  }

  @action
  closeEmailProcessingModal(): void {
    this.showEmailProcessingModal = false;
    this.selectedEmail = null;
  }

  @action
  async processEmail(application: Application | null, emailId: string): Promise<void> {
    if (application) {
      // Update existing application
      this.applicationService.updateApplication(application.id, application);
    }

    // Mark email as processed
    await this.emailService.markAsProcessed([emailId]);
    
    // Refresh data
    this.loadEmails();
    this.loadApplications();
    
    // Close modal
    this.closeEmailProcessingModal();
  }

  @action
  private loadApplications(): void {
    this._applications = this.applicationService.getApplications();
  }

  @computed
  get applications(): Application[] {
    return this._applications;
  }

  @action
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

  @computed
  get currentApplicationIndex(): number {
    if (!this.selectedApplication) return -1;
    const stageApps = this.getApplicationsByStage(this.selectedApplication.stage);
    return stageApps.findIndex(app => app.id === this.selectedApplication?.id);
  }

  @computed
  get totalApplicationsInCurrentStage(): number {
    if (!this.selectedApplication) return 0;
    return this.getApplicationsByStage(this.selectedApplication.stage).length;
  }
}
