import { injectable, inject } from 'inversify';
import { makeAutoObservable, observable, action, computed } from 'mobx';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';
import { AddApplicationModel } from '@/domain/models/AddApplicationModel';
import { RootStore } from '@/presentation/viewModels/RootStore';

@injectable()
export class AddApplicationViewModel {
  @observable formData: AddApplicationModel;
  @observable availableTags: string[] = ['frontend', 'backend', 'fullstack'];
  @observable isSubmitting: boolean = false;
  @observable error: string | null = null;
  @observable submissionSuccessful: boolean = false;

  constructor(
    @inject(SERVICE_IDENTIFIERS.RootStore) private rootStore: RootStore
  ) {
    makeAutoObservable(this);
    this.formData = new AddApplicationModel(this.rootStore);
  }

  @computed
  get hasErrors(): boolean {
    return this.formData.hasErrors;
  }

  @computed
  get fieldErrors(): Record<string, string> {
    return this.formData.fieldErrors;
  }

  @action
  updateField(field: keyof AddApplicationModel, value: string | string[]) {
    this.formData.updateField(field, value);
  }

  @action
  toggleTag(tag: string) {
    this.formData.toggleTag(tag);
  }

  @action
  toggleAddTagInput() {
    const newTag = prompt('Enter a new tag:');
    if (newTag && !this.availableTags.includes(newTag.trim())) {
      this.availableTags.push(newTag.trim());
      this.formData.toggleTag(newTag.trim());
    }
  }

  @action
  async handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    this.isSubmitting = true;
    this.error = null;

    try {
      await this.formData.handleSubmit();
      this.submissionSuccessful = true;
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Failed to add application';
      console.error('Failed to add application:', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  resetForm() {
    this.formData.resetForm();
    this.error = null;
    this.submissionSuccessful = false;
  }

  @action
  validateForm(): boolean {
    return this.formData.validateForm();
  }
}