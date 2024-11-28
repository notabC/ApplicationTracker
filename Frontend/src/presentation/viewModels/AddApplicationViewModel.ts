import { injectable, inject } from 'inversify';
import { makeAutoObservable, observable, action, computed, runInAction } from 'mobx';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';
import { RootStore } from './RootStore';
import { AddApplicationModel } from '@/domain/models/AddApplicationModel';

@injectable()
export class AddApplicationViewModel {
  @observable formData: AddApplicationModel;

  @observable availableTags: string[] = ['frontend', 'backend', 'fullstack'];

  @observable isSubmitting: boolean = false;
  @observable error: string | null = null;
  @observable submissionSuccessful: boolean = false;
  @observable fieldErrors: Record<string, string> = {};

  // Define required fields
  private requiredFields: Array<keyof AddApplicationModel> = ['company', 'position'];

  constructor(
    @inject(SERVICE_IDENTIFIERS.RootStore) private rootStore: RootStore
  ) {
    makeAutoObservable(this);
    this.formData = new AddApplicationModel(this.rootStore);
  }

  @computed
  get hasErrors(): boolean {
    return Object.values(this.fieldErrors).some(error => error !== '');
  }

  @action
  validateForm(): boolean {
    return this.formData.validateForm();
  }

  @action
  clearFieldError(field: keyof AddApplicationModel) {
    if (this.fieldErrors[field]) {
      const { [field]: removedError, ...rest } = this.fieldErrors;
      this.fieldErrors = rest;
    }
  }

  @action
  updateField(field: keyof AddApplicationModel, value: string | string[]) {
    this.formData.updateField(field, value);
    // Clear error for the field being updated
    this.clearFieldError(field);
  }

  @action
  toggleTag(tag: string) {
    this.formData.toggleTag(tag);
  }

  @action
  toggleAddTagInput() {
    // Implement logic to add a new tag input if needed
    // For example, prompt the user to enter a new tag
    const newTag = prompt('Enter a new tag:');
    if (newTag && !this.availableTags.includes(newTag.trim())) {
      this.availableTags.push(newTag.trim());
      this.formData.toggleTag(newTag.trim());
    }
  }

  @action
  async handleSubmit(_e: React.FormEvent): Promise<void> {
    this.isSubmitting = true;
    this.error = null;

    try {
      await this.formData.handleSubmit();
      runInAction(() => {
        this.submissionSuccessful = true;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Failed to add application';
        console.error('Failed to add application:', error);
      });
    } finally {
      runInAction(() => {
        this.isSubmitting = false;
      });
    }
  }

  @action
  resetForm() {
    this.formData.resetForm();
    this.fieldErrors = {};
    this.error = null;
    this.submissionSuccessful = false;
  }

  // Helper method to capitalize field names
  private capitalize(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }
}
