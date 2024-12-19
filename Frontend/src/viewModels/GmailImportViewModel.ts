// src/presentation/viewModels/GmailImportViewModel.ts
import { computed, observable, action, makeObservable, runInAction } from 'mobx';
import { inject, injectable } from 'inversify';
import { SERVICE_IDENTIFIERS } from '../di/identifiers';
import type { IGmailEmail, IGmailImportOptions } from '../domain/interfaces/IGmailService';
import GmailImportModel from '@/domain/models/GmailImportModel';
import { ApiClient } from '@/infrastructure/api/apiClient';

@injectable()
export class GmailImportViewModel {
  @observable
  public newLabel: string = '';

  @observable
  private _isGmailLinked: boolean = false; // Tracks if Gmail is linked

  constructor(
    @inject(SERVICE_IDENTIFIERS.GmailImportModel) private model: GmailImportModel
  ) {
    makeObservable(this);
    this.checkGmailLinked();
  }

  @computed
  get step(): GmailImportModel['step'] {
    return this.model.step;
  }

  @computed
  get emails(): IGmailEmail[] {
    return this.model.emails;
  }

  @computed
  get selectedEmails(): Set<string> {
    return this.model.selectedEmails;
  }

  @computed
  get expandedEmails(): Set<string> {
    return this.model.expandedEmails;
  }

  @computed
  get filters(): IGmailImportOptions {
    return this.model.filters;
  }

  @computed
  get loadingState() {
    return this.model.loadingState;
  }

  @computed
  get isLoading(): boolean {
    return this.model.loadingState.isLoading;
  }

  @computed
  get error(): string | null {
    return this.model.error;
  }

  @computed
  get currentPage(): number {
    return this.model.currentPage;
  }

  @computed
  get hasNextPage(): boolean {
    return this.model.hasNextPage;
  }

  @computed
  get isAllSelected(): boolean {
    return this.model.isAllSelected;
  }

  @computed
  get hasSelectedEmails(): boolean {
    return this.model.hasSelectedEmails;
  }

  @computed
  get isCurrentPageAllSelected(): boolean {
    return this.model.isCurrentPageAllSelected;
  }

  @computed
  get isGmailLinked(): boolean {
    return this._isGmailLinked;
  }

  @action.bound
  addLabel(): void {
    const trimmedLabel = this.newLabel.trim();
    if (trimmedLabel && !this.filters.labels.includes(trimmedLabel)) {
      this.updateFilter('labels', [...this.filters.labels, trimmedLabel]);
      this.newLabel = '';
    }
  }

  @action.bound
  removeLabel(labelToRemove: string): void {
    this.updateFilter(
      'labels',
      this.filters.labels.filter(label => label !== labelToRemove)
    );
  }

  @action.bound
  async importAndCheckSuccess(): Promise<boolean> {
    await this.importSelected();
    return !this.error;
  }

  @action.bound
  reset(): void {
    this.newLabel = '';
    this.model.reset();
  }

  @action.bound
  updateFilter<K extends keyof IGmailImportOptions>(
    key: K,
    value: IGmailImportOptions[K]
  ): void {
    this.model.updateFilter(key, value);
  }

  @action.bound
  toggleEmailExpansion(emailId: string): void {
    this.model.toggleEmailExpansion(emailId);
  }

  @action.bound
  toggleEmailSelection(emailId: string): void {
    this.model.toggleEmailSelection(emailId);
  }

  @action.bound
  selectAllEmails(selected: boolean): void {
    this.model.selectAllEmails(selected);
  }

  @action.bound
  selectAllCurrentPage(selected: boolean): void {
    this.model.selectAllCurrentPage(selected);
  }

  @action.bound
  async handleMainButtonClick(): Promise<void> {
    if (!this._isGmailLinked) {
      // Link Gmail Account
      await this.startGmailLinking();
    } else {
      // Import from Gmail
      await this.proceedWithImport();
    }
  }

  async importSelected(): Promise<void> {
    return this.model.importSelected();
  }

  async loadNextPage(): Promise<void> {
    return this.model.loadNextPage();
  }

  async goToPage(page: number): Promise<void> {
    return this.model.goToPage(page);
  }

  async fetchEmails(pageToken?: string, targetPage: number = 1): Promise<void> {
    return this.model.fetchEmails(pageToken, targetPage);
  }

  /**
   * Check if Gmail is linked by calling /api/gmail/check-auth
   * If isAuthenticated = true, Gmail is linked. Otherwise not linked.
   */
  @action.bound
  async checkGmailLinked(): Promise<void> {
    try {
      const response = await ApiClient.get<{isAuthenticated: boolean, user?: any}>('/api/gmail/check-auth');
      runInAction(() => {
        this._isGmailLinked = response.isAuthenticated;
      });
    } catch (error) {
      console.error('Error checking Gmail linked status:', error);
      runInAction(() => {
        this._isGmailLinked = false;
      });
    }
  }

  /**
   * Start Gmail linking flow
   * Checks if user_id is in localStorage, else redirect to /login
   * If present, call /api/gmail/auth/url?state={user_id}, then redirect
   */
  @action.bound
  async startGmailLinking(): Promise<void> {
    const userId = localStorage.getItem('gmail_user_id');
    if (!userId) {
      // User not logged in or no user_id stored, redirect to /login
      window.location.href = '/login';
      return;
    }

    try {
      const response = await ApiClient.get<{ url: string }>('/api/gmail/auth/url', { state: userId });
      // Redirect to Google's OAuth URL
      window.location.href = response.url;
    } catch (error) {
      console.error('Error fetching Gmail auth URL:', error);
      // optionally set an error message
      // this.model.setError('Unable to start Gmail linking process.');
    }
  }

  /**
   * Called when user chooses to proceed with importing if Gmail is already linked
   * e.g., move to selection step or fetch emails
   */
  @action.bound
  async proceedWithImport(): Promise<void> {
    // For example, fetch emails and move to selection step:
    await this.fetchEmails();
    this.model.step = 'selection'; // if the model supports changing step directly
  }
}
