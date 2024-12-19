// src/views/components/gmailImportModal/GmailImportModal.tsx
import React from 'react';
import { observer } from 'mobx-react-lite';
import { Mail, X, Loader } from 'lucide-react';
import { container } from '../../../di/container';
import { GmailImportViewModel } from '../../../viewModels/GmailImportViewModel';
import { SERVICE_IDENTIFIERS } from '@/di/identifiers';

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

    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-gray-400 text-sm">No step selected. Please start linking Gmail.</p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
      <div
        className="
          bg-gradient-to-br from-[#1e2128] to-[#16181d]
          w-full h-[100dvh] sm:h-auto sm:rounded-2xl sm:max-w-2xl sm:max-h-[85vh] 
          overflow-hidden flex flex-col border-t sm:border border-[#232732]/10
          shadow-[8px_8px_16px_#111316,-8px_-8px_16px_#232732]
          transition-all duration-200
        "
      >
        {/* Header */}
        <div className="
          p-6 sm:p-8 border-b border-[#232732]/20
          bg-[#1a1d24]
          transition-all duration-200
        ">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4 sm:gap-3">
              <div 
                className="
                  bg-blue-500/10 p-3 rounded-xl
                  shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
                "
              >
                <Mail className="h-6 w-6 text-blue-400" />
              </div>
              <h2 className="text-xl font-medium text-white">Import from Gmail</h2>
            </div>
            <button 
              onClick={handleClose}
              className="
                p-3 rounded-xl
                bg-[#1a1d24] border border-[#232732]/20
                shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]
                hover:shadow-[6px_6px_12px_#111316,-6px_-6px_12px_#232732]
                active:shadow-[inset_4px_4px_8px_#111316,inset_-4px_-4px_8px_#232732]
                hover:border-cyan-500/30
                transition-all duration-200
              "
            >
              <X className="h-6 w-6 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden overflow-y-auto">
          {renderContent()}
        </div>

        {/* Error Display */}
        {viewModel.error && (
          <div className="
            px-6 py-4 bg-red-500/10 border-t border-red-500/20
            shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
            transition-all duration-200
          ">
            <p className="text-sm text-red-400">{viewModel.error}</p>
          </div>
        )}

        {/* Footer Logic */}
        {viewModel.step === 'filters' && (
          <div className="
            p-6 bg-[#1a1d24] border-t border-[#232732]/20
            flex justify-end gap-3
          ">
            <button
              onClick={viewModel.handleMainButtonClick}
              disabled={viewModel.loadingState.isLoading}
              className="
                px-4 py-3 rounded-xl
                bg-gradient-to-r from-cyan-500/10 to-cyan-500/5
                border border-cyan-500/20
                text-cyan-400 font-medium text-sm
                shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]
                hover:shadow-[6px_6px_12px_#111316,-6px_-6px_12px_#232732]
                hover:bg-cyan-500/20 hover:border-cyan-500/30
                active:shadow-[inset_4px_4px_8px_#111316,inset_-4px_-4px_8px_#232732]
                transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {viewModel.loadingState.isLoading ? (
                <Loader className="h-5 w-5 animate-spin text-cyan-400" />
              ) : (
                viewModel.isGmailLinked ? 'Import from Gmail' : 'Link Gmail Account'
              )}
            </button>
          </div>
        )}

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
