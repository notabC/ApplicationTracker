// src/views/components/EmailProcessingModal/EmailProcessingModal.tsx
import React from 'react';
import { observer } from 'mobx-react-lite';
import { container } from '@/di/container';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';
import { EmailProcessingViewModel } from '@/viewModels/EmailProcessingViewModel';
import { EmailProcessingModalHeader } from './EmailProcessingModalHeader';
import { EmailContent } from './EmailContent';
import { SearchFields } from './SearchFields';
import { MatchedApplications } from './MatchedApplications';
import { Email } from '@/core/interfaces/services/IEmailService';

export interface EmailProcessingModalProps {
    email: Email;
    onClose: () => void;
  }
  
export const EmailProcessingModal: React.FC<EmailProcessingModalProps> = observer(({
  email,
  onClose
}) => {
  const viewModel = container.get<EmailProcessingViewModel>(SERVICE_IDENTIFIERS.EmailProcessingViewModel);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#1a1d24] rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-800/50">
        <EmailProcessingModalHeader onClose={onClose} onReset={viewModel.reset} />
        
        <div className="flex-1 overflow-y-auto">
          <EmailContent
            subject={email.subject}
            body={email.body}
            isBodyExpanded={viewModel.isBodyExpanded}
            onToggleBody={viewModel.toggleBodyExpanded}
          />

          <div className="p-6 space-y-6">
            <SearchFields
              companyValue={viewModel.searchInput.company}
              positionValue={viewModel.searchInput.position}
              onCompanyChange={(value) => viewModel.setSearchInput({ company: value })}
              onPositionChange={(value) => viewModel.setSearchInput({ position: value })}
            />

            {(viewModel.searchInput.company || viewModel.searchInput.position) && (
              <MatchedApplications
                applications={viewModel.matchedApplications}
                availableStages={viewModel.availableStages}
                onUpdateApplication={viewModel.handleEmailUpdateApplication}
                onCreateNew={(email) => {
                  viewModel.createNewApplication(email);
                  onClose();
                }}
                email={email}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
});