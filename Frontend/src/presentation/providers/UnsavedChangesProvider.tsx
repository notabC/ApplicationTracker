// src/presentation/providers/UnsavedChangesProvider.tsx
import React, { createContext } from 'react';
import { observer } from 'mobx-react-lite';
import { container } from '@/di/container';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';
import { UnsavedChangesViewModel } from '@/presentation/viewModels/UnsavedChangesViewModel';
import { UnsavedChangesNotification } from '@/presentation/components/UnsavedChangesNotification';
import { IViewModelUpdateField } from '@/core/interfaces/services';
import { Application } from '@/core/domain/models/Application';

interface UnsavedChangesContextProps {
  trackChange: (id: string, field: keyof Application, value: any, originalValue: any, viewModel: IViewModelUpdateField) => void;
}

const UnsavedChangesContext = createContext<UnsavedChangesContextProps | null>(null);

interface Props {
  children: React.ReactNode;
}

export const UnsavedChangesProvider: React.FC<Props> = observer(({ children }) => {
  const unsavedChangesVM = container.get<UnsavedChangesViewModel>(SERVICE_IDENTIFIERS.UnsavedChangesViewModel);

  const handleSave = async () => {
    await unsavedChangesVM.saveChanges();
    // Optionally, show a success notification
  };

  const handleDiscard = () => {
    unsavedChangesVM.discardChanges();
    // Optionally, show a discard confirmation
  };

  return (
    <UnsavedChangesContext.Provider value={{ 
      trackChange: unsavedChangesVM.trackChange.bind(unsavedChangesVM) 
    }}>
      {children}
      <UnsavedChangesNotification
        show={unsavedChangesVM.showNotification}
        hasUnsavedChanges={unsavedChangesVM.hasUnsavedChanges}
        onSave={handleSave}
        onDiscard={handleDiscard}
      />
    </UnsavedChangesContext.Provider>
  );
});
