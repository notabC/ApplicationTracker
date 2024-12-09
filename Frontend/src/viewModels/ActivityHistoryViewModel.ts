// src/presentation/viewModels/ActivityHistoryViewModel.ts
import { makeAutoObservable, reaction } from 'mobx';
import { inject, injectable } from 'inversify';
import { SERVICE_IDENTIFIERS } from '@/di/identifiers';
import type { Application } from '@/domain/interfaces/IApplication';
import { ActivityHistoryModel } from '@/domain/models/ActivityHistoryModel';
import { RootStore } from '@/presentation/viewModels/RootStore';
import { ActivityLog } from '@/domain/interfaces/IActivityHistory';

interface UIState {
  searchTerm: string;
  dateRange: {
    start?: string;
    end?: string;
  };
  expandedLogIds: Set<string>;
  isLoading: boolean;
  error: string | null;
}

@injectable()
export class ActivityHistoryViewModel {
  private model: ActivityHistoryModel;
  private uiState: UIState = {
    searchTerm: '',
    dateRange: {},
    expandedLogIds: new Set<string>(),
    isLoading: false,
    error: null,
  };

  constructor(
    @inject(SERVICE_IDENTIFIERS.RootStore) 
    private rootStore: RootStore
  ) {
    // Create model instance directly
    this.model = new ActivityHistoryModel(this.rootStore);
    makeAutoObservable(this);
    this.initialize();
  }

  private initialize(): void {
    this.model.initialize(this.rootStore.applications);
    
    // Set up reaction for application changes
    reaction(
      () => this.rootStore.applications.slice(),
      (applications) => {
        this.model.updateLogs(applications);
      }
    );
  }

  // Rest of the implementation remains the same...
  get searchTerm(): string {
    return this.uiState.searchTerm;
  }

  get dateRange(): { start?: string; end?: string } {
    return this.uiState.dateRange;
  }

  get isLoading(): boolean {
    return this.uiState.isLoading;
  }

  get error(): string | null {
    return this.uiState.error;
  }

  get filteredLogs(): ActivityLog[] {
    const dateFiltered = this.model.filterLogsByDateRange(
      this.dateRange.start ? new Date(this.dateRange.start) : null,
      this.dateRange.end ? new Date(this.dateRange.end) : null
    );

    return this.model.filterLogsBySearchTerm(dateFiltered, this.searchTerm);
  }

  setSearchTerm(term: string): void {
    this.uiState.searchTerm = term;
  }

  setDateRange(start?: string, end?: string): void {
    this.uiState.dateRange = { start, end };
  }

  toggleLogExpansion(logId: string): void {
    if (this.uiState.expandedLogIds.has(logId)) {
      this.uiState.expandedLogIds.delete(logId);
    } else {
      this.uiState.expandedLogIds.add(logId);
    }
  }

  isLogExpanded(logId: string): boolean {
    return this.uiState.expandedLogIds.has(logId);
  }

  formatDate(timestamp: string): string {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  getApplicationDetails(applicationId: string): Application | undefined {
    return this.model.getApplicationDetails(applicationId);
  }
}