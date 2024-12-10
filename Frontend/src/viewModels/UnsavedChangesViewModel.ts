// src/presentation/viewModels/UnsavedChangesViewModel.ts
import { makeAutoObservable, runInAction } from 'mobx';
import { IViewModelUpdateField } from '@/domain/interfaces';
import { Application } from '@/domain/interfaces/IApplication';
import { UnsavedChangesModel } from '@/domain/models/UnsavedChangesModel';
import { RootStore } from '@/viewModels/RootStore';
import { inject } from 'inversify';
import { SERVICE_IDENTIFIERS } from '@/di/container';

export class UnsavedChangesViewModel {
  showNotification = false;
  private model: UnsavedChangesModel;

  constructor(
    @inject(SERVICE_IDENTIFIERS.RootStore) rootStore: RootStore,
  ) {
    this.model = new UnsavedChangesModel(rootStore);
    makeAutoObservable(this);
  }

  trackChange(id: string, field: keyof Application, value: any, originalValue: any, viewModel: IViewModelUpdateField) {
    this.model.trackChange(id, field, value, originalValue, viewModel);
    runInAction(() => {
      this.showNotification = this.model.hasUnsavedChanges;
    });
  }

  async saveChanges() {
    await this.model.applyChanges();
    runInAction(() => {
      this.showNotification = false;
    });
  }

  discardChanges() {
    this.model.discardAllChanges();
    runInAction(() => {
      this.showNotification = false;
    });
  }

  get hasUnsavedChanges() {
    return this.model.hasUnsavedChanges;
  }
}
