// src/presentation/viewModels/GmailImportViewModel.ts
import { computed, observable, action, makeObservable } from 'mobx';
import { inject, injectable } from 'inversify';
import { SERVICE_IDENTIFIERS } from '../di/identifiers';
import type { IGmailEmail, IGmailImportOptions } from '../domain/interfaces/IGmailService';
import GmailImportModel from '@/domain/models/GmailImportModel';

@injectable()
export class GmailImportViewModel {
  @observable
  public newLabel: string = '';

  constructor(
    @inject(SERVICE_IDENTIFIERS.GmailImportModel) private model: GmailImportModel
  ) {
    makeObservable(this);
  }

  /** Observable and Computed Properties **/

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

  /** Actions **/

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

  /** Delegated Methods **/

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
}

export default GmailImportViewModel;
