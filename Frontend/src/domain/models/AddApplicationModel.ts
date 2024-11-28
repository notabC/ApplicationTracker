import { makeAutoObservable } from 'mobx';

export class AddApplicationModel {
  company: string = '';
  position: string = '';
  type: string = 'frontend';
  tags: string[] = ['frontend'];
  description: string = '';
  salary: string = '';
  location: string = '';
  notes: string = '';

  constructor() {
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
      if (!this[field].trim()) {
        return false;
      }
    }
    return true;
  }

  deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }
}
