// src/presentation/viewModels/UnsavedChangesViewModel.ts
import { makeAutoObservable, runInAction } from 'mobx';
import { injectable, inject } from 'inversify';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';
import type { IApplicationService, IViewModelUpdateField } from '@/core/interfaces/services';

interface Change {
  id: string; // Application ID
  field: any; // Field name
  value: any; // New value
  originalValue: any; // Original value
  viewModel: IViewModelUpdateField; // Reference to the view model that made the change
}

@injectable()
export class UnsavedChangesViewModel {
  unsavedChanges: Map<string, Change> = new Map();
  showNotification: boolean = false;

  constructor(
    @inject(SERVICE_IDENTIFIERS.ApplicationService) private applicationService: IApplicationService,
  ) {
    makeAutoObservable(this);
  }

  // Track a change
  trackChange(id: string, field: keyof any, value: any, originalValue: any, viewModel: IViewModelUpdateField) {
      const change = { id, field, value, originalValue, viewModel };
      this.unsavedChanges.set(id, change);
      this.showNotification = true;
  }

  // Save all changes
  async saveChanges() {
      console.log('Starting saveChanges...');
      const changesArray = Array.from(this.unsavedChanges.values());
      console.log('Changes Array:', changesArray);
  
      // Group changes by application ID
      const changesById: { [key: string]: Partial<any> } = {};
      changesArray.forEach(change => {
        if (!changesById[change.id]) {
          changesById[change.id] = {};
        }
        changesById[change.id][change.field] = change.value;
      });
  
      console.log('Grouped Changes by ID:', changesById);
  
      // Iterate over each application and save changes
      for (const [id, fields] of Object.entries(changesById)) {
        try {
          console.log(`Saving changes for application ${id}:`, fields);
          await this.applicationService.updateApplication(id, fields);
          console.log(`Successfully saved changes for application ${id}`);
        } catch (error) {
          console.error(`Failed to save changes for application ${id}:`, error);
          // Handle error (e.g., show notification)
        }
      }
  
      runInAction(() => {
        this.unsavedChanges.clear();
        this.showNotification = false;
      });
  
      console.log('Finished saveChanges.');
  }

  // Discard all changes
  discardChanges() {
    const viewModel = this.unsavedChanges.values().next().value?.viewModel;
    if (viewModel) {
      const { id, field, originalValue } = this.unsavedChanges.values().next().value!;
      viewModel.updateField(id, field, originalValue);
    }
    this.unsavedChanges.clear();
    this.showNotification = false;
  }

  // Computed property to check if there are unsaved changes
  get hasUnsavedChanges() {
    return this.unsavedChanges.size > 0;
  }
}
