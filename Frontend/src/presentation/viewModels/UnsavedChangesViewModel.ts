// src/presentation/viewModels/UnsavedChangesViewModel.ts
import { makeAutoObservable, runInAction } from 'mobx';
import { injectable, inject } from 'inversify';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';
import type { IViewModelUpdateField } from '@/core/interfaces/services';
import { RootStore } from './RootStore';
import { Application } from '@/core/domain/models/Application';

interface Change {
  id: string;
  field: keyof Application;
  value: any;
  originalValue: any;
  viewModel: IViewModelUpdateField;
}

@injectable()
export class UnsavedChangesViewModel {
  unsavedChanges: Map<string, Change> = new Map();
  showNotification: boolean = false;

  constructor(
    @inject(SERVICE_IDENTIFIERS.RootStore) private rootStore: RootStore,
  ) {
    makeAutoObservable(this);
  }

  trackChange(id: string, field: keyof Application, value: any, originalValue: any, viewModel: IViewModelUpdateField) {
    const change = { id, field, value, originalValue, viewModel };
    this.unsavedChanges.set(`${id}-${field}`, change); // Use compound key to track multiple fields per application
    this.showNotification = true;
  }

  async saveChanges() {
    console.log('Starting saveChanges...');
    const changesArray = Array.from(this.unsavedChanges.values());
    
    // Group changes by application ID
    const changesById = changesArray.reduce<Record<string, any>>((acc, change) => {
      if (!acc[change.id]) {
        // Get current application data
        const currentApp = this.rootStore.getApplicationById(change.id);
        if (!currentApp) {
          console.error(`Application with id ${change.id} not found`);
          return acc;
        }
        // Start with current application data
        acc[change.id] = { ...currentApp };
      }
      
      // Update the specific field
      acc[change.id][change.field] = change.value;
      
      // Ensure datetime fields are in the correct format
      if (change.field === 'dateApplied' || change.field === 'lastUpdated') {
        acc[change.id][change.field] = new Date(change.value).toISOString();
      }
      
      return acc;
    }, {});

    // Save each application's changes
    for (const [id, updatedApp] of Object.entries(changesById)) {
      try {
        console.log(`Saving changes for application ${id}:`, updatedApp);
        await this.rootStore.updateApplication(updatedApp);
        console.log(`Successfully saved changes for application ${id}`);
      } catch (error) {
        console.error(`Failed to save changes for application ${id}:`, error);
      }
    }

    runInAction(() => {
      this.unsavedChanges.clear();
      this.showNotification = false;
    });
  }

  discardChanges() {
    // Revert all changes
    this.unsavedChanges.forEach(change => {
      change.viewModel.updateField(change.id, change.field, change.originalValue);
    });
    
    runInAction(() => {
      this.unsavedChanges.clear();
      this.showNotification = false;
    });
  }

  get hasUnsavedChanges() {
    return this.unsavedChanges.size > 0;
  }
}