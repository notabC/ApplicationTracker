import { makeAutoObservable } from 'mobx';
import { Application } from '@/core/domain/models/Application';
import { RootStore } from '@/presentation/viewModels/RootStore';

export class AddApplicationModel {
  company: string = '';
  position: string = '';
  type: string = 'frontend';
  tags: string[] = ['frontend'];
  description: string = '';
  salary: string = '';
  location: string = '';
  notes: string = '';

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);
  }

  updateField(field: keyof AddApplicationModel, value: string | string[]): void {
    (this[field] as string | string[]) = value;
    this.clearFieldError(field);
  }

  toggleTag(tag: string): void {
    if (this.tags.includes(tag)) {
      this.tags = this.tags.filter(t => t !== tag);
    } else {
      this.tags.push(tag);
    }
  }

  toggleAddTagInput(): void {
    const newTag = prompt('Enter a new tag:');
    if (newTag && !this.tags.includes(newTag.trim())) {
      this.tags.push(newTag.trim());
    }
  }

  resetForm(): void {
    this.company = '';
    this.position = '';
    this.type = 'frontend';
    this.tags = ['frontend'];
    this.description = '';
    this.salary = '';
    this.location = '';
    this.notes = '';
  }

  validateForm(): boolean {
    const errors: Record<string, string> = {};
    const requiredFields: Array<keyof AddApplicationModel> = ['company', 'position'];

    requiredFields.forEach(field => {
      const value = this[field];
      if (typeof value === 'string' && !value.trim()) {
        errors[field] = `${this.capitalize(field)} is required`;
      }
    });

    // Additional validations
    // Example: Validate salary range format
    if (this.salary.trim()) {
      const salaryPattern = /^\$\d{1,3}(,\d{3})*(\.\d{2})?\s*-\s*\$\d{1,3}(,\d{3})*(\.\d{2})?$/;
      if (!salaryPattern.test(this.salary)) {
        errors.salary = 'Salary range format is invalid (e.g., $80,000 - $100,000)';
      }
    }

    this.fieldErrors = errors;
    return Object.keys(errors).length === 0;
  }

  clearFieldError(field: keyof AddApplicationModel): void {
    // Implement logic to clear field error
  }

  deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  async handleSubmit(): Promise<void> {
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

  // Helper method to capitalize field names
  private capitalize(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }
}
