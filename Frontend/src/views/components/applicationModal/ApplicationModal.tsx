import React from 'react';
import { observer } from 'mobx-react-lite';
import { container } from '@/di/container';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';
import { ApplicationModalViewModel } from '@/viewModels/ApplicationModalViewModel';
import type { Application } from '@/core/domain/models/Application';
import { RootStore } from '@/presentation/viewModels/RootStore';
import { ApplicationModalHeader } from './ApplicationModalHeader';
import { ApplicationModalContent } from './ApplicationModalContent';
import { ApplicationModalFooter } from './ApplicationModalFooter';
import { StageSelector } from '@/views/components/StageSelector';

interface Props {
  application: Application;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  totalApplications: number;
  currentIndex: number;
}

export const ApplicationModal: React.FC<Props> = observer(({
  application,
  onClose,
  onNavigate,
  totalApplications,
  currentIndex
}) => {
  const viewModel = container.get<ApplicationModalViewModel>(SERVICE_IDENTIFIERS.ApplicationModalViewModel);
  const rootStore = container.get<RootStore>(SERVICE_IDENTIFIERS.RootStore);
  const updatedApplication = rootStore.getApplicationById(application.id) || application;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div 
        className="
          bg-gradient-to-br from-[#1e2128] to-[#16181d]
          rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col 
          border border-[#232732]/10
          shadow-[8px_8px_16px_#111316,-8px_-8px_16px_#232732]
          transition-all duration-200
        "
      >
        <ApplicationModalHeader 
          application={application}
          updatedApplication={updatedApplication}
          viewModel={viewModel}
          onClose={onClose}
        />
        
        <ApplicationModalContent 
          application={application}
          updatedApplication={updatedApplication}
          viewModel={viewModel}
        />
        
        <ApplicationModalFooter 
          currentIndex={currentIndex}
          totalApplications={totalApplications}
          onNavigate={onNavigate}
        />

        {viewModel.showStageSelect && (
          <StageSelector
            onStageChange={(newStage) => viewModel.handleStageChange(application, newStage)}
            onClose={() => viewModel.setShowStageSelect(false)}
            availableStages={viewModel.getAvailableStages(application.stage)}
          />
        )}
      </div>
    </div>
  );
});