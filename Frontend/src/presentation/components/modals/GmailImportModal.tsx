import React from 'react';
import { observer } from 'mobx-react-lite';
import { 
  Mail, Search, Filter, Loader, X, ChevronRight,
  Calendar, Tag, KeyRound, ArrowRight
} from 'lucide-react';
import { container } from '../../../di/container';
import { GmailImportViewModel } from '../../viewModels/GmailImportViewModel';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';

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

  const handleImport = async () => {
    await viewModel.importSelected();
    if (!viewModel.error) {
      handleClose();
    }
  };

  const renderContent = () => {
    if (viewModel.step === 'filters') {
      return (
        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3 text-sm text-gray-400">
              <Tag className="h-4 w-4" />
              Gmail Labels
            </div>
            <div className="grid grid-cols-2 gap-3">
              {['Job Applications', 'Interviews', 'Recruiters', 'Job Offers'].map((label) => (
                <label key={label} className="flex items-center gap-3 p-3
                                          bg-[#282c34] rounded-xl border border-gray-800/50
                                          hover:border-gray-700/50 transition-all duration-200
                                          cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={viewModel.filters.labels.includes(label)}
                    onChange={(e) => {
                      const updatedLabels = e.target.checked
                        ? [...viewModel.filters.labels, label]
                        : viewModel.filters.labels.filter(l => l !== label);
                      viewModel.updateFilter('labels', updatedLabels);
                    }}
                    className="rounded-lg border-gray-700 text-blue-500 
                             focus:ring-blue-500/30 bg-gray-800"
                  />
                  <span className="text-gray-300 group-hover:text-gray-200 transition-colors">
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3 text-sm text-gray-400">
              <KeyRound className="h-4 w-4" />
              Keywords
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={viewModel.filters.keywords}
                onChange={(e) => viewModel.updateFilter('keywords', e.target.value)}
                placeholder="e.g., job offer, application, interview..."
                className="w-full pl-12 pr-4 py-3 bg-[#282c34] rounded-xl
                         border border-gray-800/50 
                         text-white placeholder-gray-500
                         focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30
                         transition-all duration-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Start Date', value: viewModel.filters.startDate, key: 'startDate' },
              { label: 'End Date', value: viewModel.filters.endDate, key: 'endDate' }
            ].map((field) => (
              <div key={field.key}>
                <div className="flex items-center gap-2 mb-3 text-sm text-gray-400">
                  <Calendar className="h-4 w-4" />
                  {field.label}
                </div>
                <input
                  type="date"
                  value={field.value}
                  onChange={(e) => viewModel.updateFilter(field.key as any, e.target.value)}
                  className="w-full px-4 py-3 bg-[#282c34] rounded-xl
                           border border-gray-800/50 text-white
                           focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30
                           transition-all duration-200"
                />
              </div>
            ))}
          </div>

          <button
            onClick={() => viewModel.fetchEmails()}
            disabled={viewModel.isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3
                     bg-blue-500/10 text-blue-400 rounded-xl
                     border border-blue-500/20 hover:border-blue-500/30
                     hover:bg-blue-500/20
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200"
          >
            {viewModel.isLoading ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Filter className="h-4 w-4" />
            )}
            Import Emails
          </button>
        </div>
      );
    }

    if (viewModel.step === 'processing') {
      return (
        <div className="p-12 text-center">
          <div className="bg-blue-500/10 w-16 h-16 rounded-xl mx-auto mb-6 
                       flex items-center justify-center">
            <Loader className="h-8 w-8 text-blue-400 animate-spin" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">
            Importing emails...
          </h3>
          <p className="text-gray-400">This may take a few moments</p>
        </div>
      );
    }

    if (viewModel.step === 'selection') {
      return (
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-800/50">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={viewModel.isAllSelected}
                onChange={(e) => viewModel.selectAllEmails(e.target.checked)}
                className="rounded-lg border-gray-700 text-blue-500 
                         focus:ring-blue-500/30 bg-gray-800"
              />
              <span className="text-sm text-gray-300">Select All</span>
            </label>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {viewModel.emails.map((email) => (
              <div 
                key={email.id} 
                className="bg-[#282c34] rounded-xl border border-gray-800/50
                         hover:border-gray-700/50 transition-all duration-200"
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={viewModel.selectedEmails.has(email.id)}
                      onChange={() => viewModel.toggleEmailSelection(email.id)}
                      className="mt-1.5 rounded-lg border-gray-700 text-blue-500 
                               focus:ring-blue-500/30 bg-gray-800"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium text-white truncate">
                          {email.subject}
                        </h4>
                        <button
                          onClick={() => viewModel.toggleEmailExpansion(email.id)}
                          className="p-1.5 hover:bg-gray-700/50 rounded-lg transition-colors"
                        >
                          <ChevronRight 
                            className={`h-4 w-4 text-gray-400 transform transition-transform
                                    duration-200 ${viewModel.expandedEmails.has(email.id) ? 'rotate-90' : ''}`}
                          />
                        </button>
                      </div>
                      <div className="flex justify-between items-center mt-1.5">
                        <span className="text-xs text-gray-400">{email.sender}</span>
                        <span className="text-xs text-gray-500">{email.date}</span>
                      </div>
                      <div className="mt-2 text-xs text-gray-300 line-clamp-2 leading-relaxed">
                        {email.body}
                      </div>
                    </div>
                  </div>
                </div>

                {viewModel.expandedEmails.has(email.id) && (
                  <div className="px-4 pb-4 border-t border-gray-800/50 mt-2">
                    <div className="bg-[#1a1d24] rounded-xl p-4 mt-4">
                      <p className="text-sm text-gray-300 whitespace-pre-line break-words leading-relaxed">
                        {email.body}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {viewModel.hasSelectedEmails && (
            <div className="sticky bottom-0 left-0 right-0 p-4 border-t border-gray-800/50 
                          bg-[#1a1d24]/80 backdrop-blur-md
                          transform translate-y-0 transition-all duration-200
                          shadow-lg shadow-black/20">
              <div className="max-w-2xl mx-auto flex items-center gap-4">
                <div className="text-sm text-gray-400">
                  {viewModel.selectedEmails.size} emails selected
                </div>
                <button
                  onClick={handleImport}
                  disabled={viewModel.isLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3
                          bg-blue-500/10 text-blue-400 rounded-xl
                          border border-blue-500/20 hover:border-blue-500/30
                          hover:bg-blue-500/20 
                          disabled:opacity-50 disabled:cursor-not-allowed
                          transition-all duration-200"
                >
                  {viewModel.isLoading ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                  Import Selected
                </button>
              </div>
            </div>
          )}

        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#1a1d24] rounded-2xl w-full max-w-2xl max-h-[85vh] 
                   overflow-hidden flex flex-col border border-gray-800/50">
        {/* Header */}
        <div className="p-6 border-b border-gray-800/50">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/10 p-2 rounded-xl">
                <Mail className="h-5 w-5 text-blue-400" />
              </div>
              <h2 className="text-xl font-medium text-white">Import from Gmail</h2>
            </div>
            <button 
              onClick={handleClose}
              className="p-2 hover:bg-gray-800/50 rounded-xl transition-all duration-200"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden overflow-y-auto">
          {renderContent()}
        </div>

        {/* Error Display */}
        {viewModel.error && (
          <div className="px-6 py-4 bg-red-500/10 border-t border-red-500/20">
            <p className="text-sm text-red-400">
              {viewModel.error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
});