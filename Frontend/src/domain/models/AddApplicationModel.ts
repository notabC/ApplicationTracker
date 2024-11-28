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
  }

  toggleTag(tag: string): void {
    if (this.tags.includes(tag)) {
      this.tags = this.tags.filter(t => t !== tag);
    } else {
      this.tags.push(tag);
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
    const requiredFields: Array<keyof AddApplicationModel> = ['company', 'position'];
    for (const field of requiredFields) {
      if (typeof this[field] === 'string' && !this[field].trim()) {
        return false;
      }
    }
    return true;
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

    // Replace with your actual submission logic, e.g., API call
    await this.rootStore.addApplication(newApplication);
  }
}
