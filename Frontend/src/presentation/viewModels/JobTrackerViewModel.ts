// File: src/presentation/viewModels/JobTrackerViewModel.ts
import { injectable, inject } from 'inversify';
import { makeObservable, observable, action, computed } from 'mobx';
import type { IApplicationService, IWorkflowService } from '@/core/interfaces/services';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';
import type { Application } from '@/core/domain/models/Application';
import { mockApplications } from '@/core/services/mockData';

@injectable()
export class JobTrackerViewModel {
  @observable searchTerm: string = '';
  @observable activeFilters: string[] = [];
  @observable isFilterExpanded: boolean = false;
  @observable selectedApplication: Application | null = null;
  @observable showAddModal: boolean = false;
  @observable showImportModal: boolean = false;
  @observable showWorkflowModal: boolean = false;

  constructor(
    @inject(SERVICE_IDENTIFIERS.ApplicationService) private applicationService: IApplicationService,
    @inject(SERVICE_IDENTIFIERS.WorkflowService) private workflowService: IWorkflowService
  ) {
    makeObservable(this);
    this.applicationService.setApplications(mockApplications);
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
  handleStageChange = (applicationId: number, newStage: string) => {
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
}