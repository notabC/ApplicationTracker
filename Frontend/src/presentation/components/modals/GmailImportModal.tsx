// src/presentation/components/modals/GmailImportModal.tsx
import React from 'react';
import { observer } from 'mobx-react-lite';
import { container } from '../../../di/container';
import { GmailImportViewModel } from '../../viewModels/GmailImportViewModel';
import { Mail, Search, Filter, Loader, X, Check, ChevronRight } from 'lucide-react';
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

  // New asynchronous handler for importing emails
  const handleImport = async () => {
    await viewModel.importSelected();
    if (!viewModel.error) {
      handleClose();
    }
    // If there's an error, it will be displayed within the modal
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Import from Gmail</h2>
            </div>
            <button 
              onClick={handleClose}
              className="p-2 hover:bg-gray-800 rounded-lg"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {viewModel.step === 'auth' && (
            <div className="p-6 text-center">
              <Mail className="h-16 w-16 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Connect your Gmail account
              </h3>
              <p className="text-gray-400 mb-6">
                We'll help you import your job application emails automatically
              </p>
              <button
                onClick={() => viewModel.authenticate()}
                disabled={viewModel.isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 
                         bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {viewModel.isLoading ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                Sign in with Gmail
              </button>
              {viewModel.error && (
                <div className="mt-4 text-red-500 text-sm">
                  {viewModel.error}
                </div>
              )}
            </div>
          )}

          {viewModel.step === 'filters' && (
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Gmail Labels
                </label>
                <div className="space-y-2">
                  {['Job Applications', 'Interviews', 'Recruiters', 'Job Offers'].map((label) => (
                    <label key={label} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={viewModel.filters.labels.includes(label)}
                        onChange={(e) => {
                          const updatedLabels = e.target.checked
                            ? [...viewModel.filters.labels, label]
                            : viewModel.filters.labels.filter(l => l !== label);
                          viewModel.updateFilter('labels', updatedLabels);
                        }}
                        className="rounded border-gray-600 text-blue-600 focus:ring-blue-600 bg-gray-800"
                      />
                      <span className="text-gray-200">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Keywords
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={viewModel.filters.keywords}
                    onChange={(e) => viewModel.updateFilter('keywords', e.target.value)}
                    placeholder="e.g., job offer, application, interview..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border-none rounded-lg 
                             text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={viewModel.filters.startDate}
                    onChange={(e) => viewModel.updateFilter('startDate', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border-none rounded-lg 
                             text-white focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={viewModel.filters.endDate}
                    onChange={(e) => viewModel.updateFilter('endDate', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border-none rounded-lg 
                             text-white focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <button
                onClick={() => viewModel.fetchEmails()}
                disabled={viewModel.isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 
                         bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {viewModel.isLoading ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Filter className="h-4 w-4" />
                )}
                Import Emails
              </button>
              {viewModel.error && (
                <div className="mt-4 text-red-500 text-sm">
                  {viewModel.error}
                </div>
              )}
            </div>
          )}

          {viewModel.step === 'processing' && (
            <div className="p-6 text-center">
              <Loader className="h-8 w-8 text-blue-400 mx-auto mb-4 animate-spin" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Importing emails...
              </h3>
              <p className="text-gray-400">This may take a few moments</p>
            </div>
          )}

          {viewModel.step === 'selection' && (
            <div className="flex flex-col h-full">
              <div className="p-3 border-b border-gray-800">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={viewModel.isAllSelected}
                    onChange={(e) => viewModel.selectAllEmails(e.target.checked)}
                    className="rounded border-gray-600 text-blue-600 focus:ring-blue-600 bg-gray-800"
                  />
                  <span className="text-sm text-gray-200">Select All</span>
                </label>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {viewModel.emails.map((email) => (
                  <div 
                    key={email.id} 
                    className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700"
                  >
                    <div className="p-3">
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={viewModel.selectedEmails.has(email.id)}
                          onChange={() => viewModel.toggleEmailSelection(email.id)}
                          className="mt-1 rounded border-gray-600 text-blue-600 
                                   focus:ring-blue-600 bg-gray-800"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mt-1">
                            <h4 className="text-sm font-medium text-white truncate">{email.subject}</h4>
                            <button
                              onClick={() => viewModel.toggleEmailExpansion(email.id)}
                              className="p-1 hover:bg-gray-700 rounded-lg flex-shrink-0"
                            >
                              <ChevronRight 
                                className={`h-4 w-4 text-gray-400 transform transition-transform 
                                          ${viewModel.expandedEmails.has(email.id) ? 'rotate-90' : ''}`}
                              />
                            </button>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-gray-400">{email.sender}</span>
                            <span className="text-xs text-gray-500">{email.date}</span>
                          </div>
                          <div className={`mt-2 text-xs text-gray-300 ${
                            viewModel.expandedEmails.has(email.id) 
                              ? '' 
                              : 'line-clamp-2'
                          }`}>
                            {email.body}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expandable email content */}
                    {viewModel.expandedEmails.has(email.id) && (
                      <div className="px-4 pb-4 pt-2 border-t border-gray-700 mt-2">
                        <div className="bg-gray-900 rounded-lg p-3">
                          <p className="text-sm text-gray-300 whitespace-pre-line">
                            {email.body}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {viewModel.hasSelectedEmails && (
                <div className="p-3 border-t border-gray-800 bg-gray-900">
                  <button
                    onClick={handleImport} // Updated handler
                    disabled={viewModel.isLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 
                             bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {viewModel.isLoading ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Import Selected ({viewModel.selectedEmails.size}) Emails
                  </button>
                </div>
              )}
              {viewModel.error && (
                <div className="mt-4 text-red-500 text-sm px-3">
                  {viewModel.error}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
