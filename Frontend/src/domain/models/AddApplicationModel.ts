import { makeAutoObservable, observable, action, computed } from 'mobx';
import { Application } from '@/domain/interfaces/IApplication';
import { RootStore } from '@/viewModels/RootStore';

export class AddApplicationModel {
  @observable company: string = '';
  @observable position: string = '';
  @observable type: string = 'frontend';
  @observable tags: string[] = ['frontend'];
  @observable description: string = '';
  @observable salary: string = '';
  @observable location: string = '';
  @observable notes: string = '';
  @observable fieldErrors: Record<string, string> = {};

  private readonly requiredFields: Array<keyof AddApplicationModel> = ['company', 'position'];

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);
  }

  @action
  updateField(field: keyof AddApplicationModel, value: string | string[]): void {
    (this[field] as string | string[]) = value;
    this.clearFieldError(field);
  }

  @action
  toggleTag(tag: string): void {
    if (this.tags.includes(tag)) {
      this.tags = this.tags.filter(t => t !== tag);
    } else {
      this.tags.push(tag);
    }
  }

  @action
  resetForm(): void {
    this.company = '';
    this.position = '';
    this.type = 'frontend';
    this.tags = ['frontend'];
    this.description = '';
    this.salary = '';
    this.location = '';
    this.notes = '';
    this.fieldErrors = {};
  }

  @computed
  get hasErrors(): boolean {
    return Object.values(this.fieldErrors).some(error => error !== '');
  }

  @action
  validateForm(): boolean {
    const errors: Record<string, string> = {};

    // Required fields validation
    this.requiredFields.forEach(field => {
      const value = this[field];
      if (typeof value === 'string' && !value.trim()) {
        errors[field] = `${this.capitalize(field)} is required`;
      }
    });

    // Salary format validation
    if (this.salary.trim()) {
      const salaryPattern = /^\$\d{1,3}(,\d{3})*(\.\d{2})?\s*-\s*\$\d{1,3}(,\d{3})*(\.\d{2})?$/;
      if (!salaryPattern.test(this.salary)) {
        errors.salary = 'Salary range format is invalid (e.g., $80,000 - $100,000)';
      }
    }

    this.fieldErrors = errors;
    return Object.keys(errors).length === 0;
  }

  @action
  clearFieldError(field: keyof AddApplicationModel): void {
    if (this.fieldErrors[field]) {
      const { [field]: removedError, ...rest } = this.fieldErrors;
      this.fieldErrors = rest;
    }
  }

  private capitalize(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  private deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  async handleSubmit(): Promise<void> {
    if (!this.validateForm()) {
      throw new Error('Form validation failed');
    }

    const currentDate = new Date().toISOString().split('T')[0];
    
    const newApplication: Application = {
      id: Date.now().toString(),
      ...this.deepClone(this),
      dateApplied: currentDate,
      stage: 'Resume Submitted',
      lastUpdated: currentDate,
      logs: [{
        id: crypto.randomUUID(),
        date: currentDate,
        fromStage: null,
        toStage: 'Resume Submitted',
        message: 'Application created manually',
        source: 'manual'
      }]
    };
    await this.rootStore.addApplication(newApplication);
  }
}