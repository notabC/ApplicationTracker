// src/presentation/providers/UnsavedChangesProvider.tsx
import React, { createContext, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { container } from '@/di/container';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';
import { UnsavedChangesViewModel } from '@/presentation/viewModels/UnsavedChangesViewModel';
import { UnsavedChangesNotification } from '@/presentation/components/UnsavedChangesNotification';
import { IViewModelUpdateField } from '@/core/interfaces/services';

interface UnsavedChangesContextProps {
  trackChange: (id: string, field: keyof any, value: any, originalValue: any, viewModel: IViewModelUpdateField) => void;
}

const UnsavedChangesContext = createContext<UnsavedChangesContextProps | null>(null);

export const useUnsavedChanges = () => {
  const context = useContext(UnsavedChangesContext);
  if (!context) {
    throw new Error('useUnsavedChanges must be used within UnsavedChangesProvider');
  }
  return context;
};

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
