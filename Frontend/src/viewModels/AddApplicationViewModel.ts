import { injectable, inject } from 'inversify';
import { makeAutoObservable, observable, action, computed, runInAction } from 'mobx';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';
import { Application } from '@/core/domain/models/Application';
import { RootStore } from '@/presentation/viewModels/RootStore';

interface FormData {
  company: string;
  position: string;
  type: string;
  tags: string[];
  description: string;
  salary: string;
  location: string;
  notes: string;
}

@injectable()
export class AddApplicationViewModel {
  @observable formData: FormData = {
    company: '',
    position: '',
    type: 'frontend',
    tags: ['frontend'],
    description: '',
    salary: '',
    location: '',
    notes: ''
  };

  @observable availableTags: string[] = ['frontend', 'backend', 'fullstack'];

  @observable isSubmitting: boolean = false;
  @observable error: string | null = null;
  @observable submissionSuccessful: boolean = false;
  @observable fieldErrors: Record<string, string> = {};

  // Define required fields
  private requiredFields: Array<keyof FormData> = ['company', 'position'];

  constructor(
    @inject(SERVICE_IDENTIFIERS.RootStore) private rootStore: RootStore
  ) {
    makeAutoObservable(this);
  }

  @computed
  get hasErrors(): boolean {
    return Object.values(this.fieldErrors).some(error => error !== '');
  }

  @action
  validateForm(): boolean {
    const errors: Record<string, string> = {};

    this.requiredFields.forEach(field => {
      const value = this.formData[field];
      if (typeof value === 'string' && !value.trim()) {
        errors[field] = `${this.capitalize(field)} is required`;
      }
    });

    // Additional validations
    // Example: Validate salary range format
    if (this.formData.salary.trim()) {
      const salaryPattern = /^\$\d{1,3}(,\d{3})*(\.\d{2})?\s*-\s*\$\d{1,3}(,\d{3})*(\.\d{2})?$/;
      if (!salaryPattern.test(this.formData.salary)) {
        errors.salary = 'Salary range format is invalid (e.g., $80,000 - $100,000)';
      }
    }

    this.fieldErrors = errors;
    return Object.keys(errors).length === 0;
  }

  @action
  clearFieldError(field: keyof FormData) {
    if (this.fieldErrors[field]) {
      const { [field]: removedError, ...rest } = this.fieldErrors;
      this.fieldErrors = rest;
    }
  }

  @action
  updateField(field: keyof FormData, value: string | string[]) {
    this.formData = {
      ...this.formData,
      [field]: value
    };
    // Clear error for the field being updated
    this.clearFieldError(field);
  }

  @action
  toggleTag(tag: string) {
    if (this.formData.tags.includes(tag)) {
      this.formData.tags = this.formData.tags.filter(t => t !== tag);
    } else {
      this.formData.tags.push(tag);
    }
  }

  @action
  toggleAddTagInput() {
    // Implement logic to add a new tag input if needed
    // For example, prompt the user to enter a new tag
    const newTag = prompt('Enter a new tag:');
    if (newTag && !this.availableTags.includes(newTag.trim())) {
      this.availableTags.push(newTag.trim());
      this.formData.tags.push(newTag.trim());
    }
  }

  @action
  async handleSubmit(_e: React.FormEvent): Promise<void> {
    this.isSubmitting = true;
    this.error = null;

    try {
      const currentDate = new Date().toISOString().split('T')[0];
      
      const newApplication: Application = {
        id: Date.now().toString(),
        ...this.formData,
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

      // Replace with your actual submission logic, e.g., API call
      await this.rootStore.addApplication(newApplication);

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
    this.formData = {
      company: '',
      position: '',
      type: 'frontend',
      tags: ['frontend'],
      description: '',
      salary: '',
      location: '',
      notes: ''
    };
    this.fieldErrors = {};
    this.error = null;
    this.submissionSuccessful = false;
  }

  // Helper method to capitalize field names
  private capitalize(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }
}
