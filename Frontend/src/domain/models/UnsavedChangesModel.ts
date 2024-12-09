// src/core/services/UnsavedChangesModel.ts
import { Application } from '@/domain/interfaces/IApplication';
import { IViewModelUpdateField } from '@/domain/interfaces';
import { RootStore } from '@/presentation/viewModels/RootStore';

interface Change {
  id: string;
  field: keyof Application;
  value: any;
  originalValue: any;
  viewModel: IViewModelUpdateField;
}

/**
 * The UnsavedChangesModel handles all the logic related to changes:
 * - Tracking changes
 * - Applying them (saving)
 * - Discarding them
 * 
 * It only deals with data and logic—no UI or React code. The ViewModel will call into this model.
 */
export class UnsavedChangesModel {
  private unsavedChanges: Map<string, Change> = new Map();

  constructor(private rootStore: RootStore) {}

  trackChange(id: string, field: keyof Application, value: any, originalValue: any, viewModel: IViewModelUpdateField) {
    const change = { id, field, value, originalValue, viewModel };
    this.unsavedChanges.set(`${id}-${field}`, change);
  }

  get hasUnsavedChanges(): boolean {
    return this.unsavedChanges.size > 0;
  }

  async applyChanges() {
    const changesArray = Array.from(this.unsavedChanges.values());

    const changesById = changesArray.reduce<Record<string, any>>((acc, change) => {
      if (!acc[change.id]) {
        const currentApp = this.rootStore.getApplicationById(change.id);
        if (!currentApp) return acc;
        acc[change.id] = { ...currentApp };
      }

      acc[change.id][change.field] = change.value;
      if (change.field === 'dateApplied' || change.field === 'lastUpdated') {
        acc[change.id][change.field] = new Date(change.value).toISOString();
      }

      return acc;
    }, {});

    for (const [, updatedApp] of Object.entries(changesById)) {
      await this.rootStore.updateApplication(updatedApp);
    }

    // Clear changes after applying
    this.unsavedChanges.clear();
  }

  discardAllChanges() {
    // Revert all changes
    this.unsavedChanges.forEach(change => {
      change.viewModel.updateField(change.id, change.field, change.originalValue);
    });

    // Clear changes after discarding
    this.unsavedChanges.clear();
  }
}
