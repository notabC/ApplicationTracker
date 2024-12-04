// src/presentation/viewModels/GmailImportViewModel.ts
import { computed } from 'mobx';
import { inject, injectable } from 'inversify';
import { SERVICE_IDENTIFIERS } from '../core/constants/identifiers';
import type { IGmailEmail, IGmailImportOptions } from '../core/interfaces/services/IGmailService';
import * as GmailImportModel from '@/domain/models/GmailImportModel';

@injectable()
export class GmailImportViewModel {
  constructor(
    @inject(SERVICE_IDENTIFIERS.GmailImportModel) private model: GmailImportModel.GmailImportModel
  ) {}

  @computed
  get step(): GmailImportModel.ImportStep {
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

  // Action delegates
  async importSelected(): Promise<void> {
    return this.model.importSelected();
  }

  toggleEmailExpansion(emailId: string): void {
    this.model.toggleEmailExpansion(emailId);
  }

  updateFilter<K extends keyof IGmailImportOptions>(
    key: K,
    value: IGmailImportOptions[K]
  ): void {
    this.model.updateFilter(key, value);
  }

  loadNextPage(): Promise<void> {
    return this.model.loadNextPage();
  }

  goToPage(page: number): Promise<void> {
    return this.model.goToPage(page);
  }

  fetchEmails(pageToken?: string, targetPage: number = 1): Promise<void> {
    return this.model.fetchEmails(pageToken, targetPage);
  }

  reset(): void {
    this.model.reset();
  }

  selectAllEmails(selected: boolean): void {
    this.model.selectAllEmails(selected);
  }

  toggleEmailSelection(emailId: string): void {
    this.model.toggleEmailSelection(emailId);
  }

  selectAllCurrentPage(selected: boolean): void {
    this.model.selectAllCurrentPage(selected);
  }
}