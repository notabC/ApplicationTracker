import { injectable, inject } from 'inversify';
import { makeObservable, observable, action, runInAction } from 'mobx';
import type { IApplicationService } from '@/core/interfaces/services';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';
import { Application } from '@/core/domain/models/Application';

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

  @observable availableTags = ['frontend', 'backend', 'fullstack'];
  @observable showAddTagInput = false;
  @observable isSubmitting = false;
  @observable error: string | null = null;

  // New observable to track submission success
  @observable submissionSuccessful: boolean = false;

  constructor(
    @inject(SERVICE_IDENTIFIERS.ApplicationService) 
    private applicationService: IApplicationService
  ) {
    makeObservable(this);
  }

  @action
  handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    this.isSubmitting = true;
    this.error = null;
    this.submissionSuccessful = false; // Reset submission status

    try {
      const currentDate = new Date().toISOString().split('T')[0];
      
      const newApplication: Application = {
        id: Date.now().toString(), // temporary ID, will be replaced by service
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

      await this.applicationService.addApplication(newApplication);

      runInAction(() => {
        this.resetForm();
        this.submissionSuccessful = true; // Indicate success
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
  };

  @action
  updateField(field: keyof FormData, value: string | string[]) {
    this.formData = {
      ...this.formData,
      [field]: value
    };
  }

  @action
  toggleTag(tag: string) {
    const tags = this.formData.tags.includes(tag)
      ? this.formData.tags.filter(t => t !== tag)
      : [...this.formData.tags, tag];
    
    this.updateField('tags', tags);
    if (tags.length > 0) {
      this.updateField('type', tags[0]);
    }
  }

  @action
  toggleAddTagInput() {
    this.showAddTagInput = !this.showAddTagInput;
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
    this.error = null;
  }

  @action
  resetSubmissionStatus() {
    this.submissionSuccessful = false;
  }
}
