// src/views/components/gmailImportModal/GmailImportModal.tsx
import React from 'react';
import { observer } from 'mobx-react-lite';
import { Mail, X } from 'lucide-react';
import { container } from '../../../di/container';
import { GmailImportViewModel } from '../../../viewModels/GmailImportViewModel';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';

import SelectionHeader from './SelectionHeader';
import SelectionFooter from './SelectionFooter';
import EmailList from './EmailList';
import Filters from './Filters';
import Processing from './Processing';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const GmailImportModal: React.FC<Props> = observer(({ isOpen, onClose }) => {
  const viewModel = container.get<GmailImportViewModel>(SERVICE_IDENTIFIERS.GmailImportViewModel);

  if (!isOpen) return null;

  const handleClose = () => {
    viewModel.reset();
    onClose();
  };

  const renderContent = () => {
    if (viewModel.step === 'filters') {
      return <Filters viewModel={viewModel} />;
    }

    if (viewModel.step === 'processing') {
      return <Processing />;
    }

    if (viewModel.step === 'selection') {
      return (
        <div className="flex flex-col h-full">
          <SelectionHeader
            currentPage={viewModel.currentPage}
            hasNextPage={viewModel.hasNextPage}
            isAllSelected={viewModel.isCurrentPageAllSelected}
            onPageChange={(page: number) => viewModel.goToPage(page)}
            isLoading={viewModel.loadingState.isLoading}
            onSelectAll={viewModel.selectAllCurrentPage}
          />
          <EmailList viewModel={viewModel} />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
      <div
        className="bg-[#1a1d24] w-full h-[100dvh] sm:h-auto sm:rounded-2xl sm:max-w-2xl sm:max-h-[85vh] 
                     overflow-hidden flex flex-col border-t sm:border border-gray-800/50"
      >
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-gray-800/50">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4 sm:gap-3">
              <div className="bg-blue-500/10 p-3 rounded-xl">
                <Mail className="h-6 w-6 text-blue-400" />
              </div>
              <h2 className="text-xl font-medium text-white">Import from Gmail</h2>
            </div>
            <button onClick={handleClose} className="p-3 hover:bg-gray-800/50 rounded-xl">
              <X className="h-6 w-6 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden overflow-y-auto">{renderContent()}</div>

        {/* Error Display */}
        {viewModel.error && (
          <div className="px-6 py-4 bg-red-500/10 border-t border-red-500/20">
            <p className="text-sm text-red-400">{viewModel.error}</p>
          </div>
        )}

        {/* Selection Footer */}
        {viewModel.step === 'selection' && (
          <SelectionFooter
            selectedCount={viewModel.selectedEmails.size}
            onImport={async () => {
              const success = await viewModel.importAndCheckSuccess();
              if (success) {
                handleClose();
              }
            }}
            isLoading={viewModel.loadingState.isLoading}
          />
        )}
      </div>
    </div>
  );
});

export default GmailImportModal;