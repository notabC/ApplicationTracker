// src/presentation/components/GmailImportModal.tsx
import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { 
  Mail, Loader, X, ChevronRight, ChevronLeft, Check,
  Tag, Search, Calendar, KeyRound, Filter
} from 'lucide-react';
import { container } from '../../../di/container';
import { GmailImportViewModel } from '../../viewModels/GmailImportViewModel';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';

// SelectionHeader Component
const SelectionHeader: React.FC<{
  currentPage: number;
  hasNextPage: boolean;
  isAllSelected: boolean;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  onSelectAll: (selected: boolean) => void;
}> = ({
  currentPage,
  hasNextPage,
  isAllSelected,
  onPageChange,
  isLoading,
  onSelectAll
}) => (
  <div className="sticky top-0 z-10 bg-[#1a1d24]/95 backdrop-blur-sm border-b border-gray-800/50">
    <div className="p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={isAllSelected}
          onChange={(e) => onSelectAll(e.target.checked)}
          className="w-5 h-5 rounded-lg border-gray-700 text-blue-500 focus:ring-blue-500/30 bg-gray-800"
        />
        <span className="text-base text-gray-400">Select All</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 bg-[#282c34] rounded-lg border border-gray-800/50 hover:border-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-400 hover:text-gray-300 transition-all duration-200"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-base text-gray-400 min-w-[4rem] text-center">
            Page {currentPage}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNextPage}
            className="p-2 bg-[#282c34] rounded-lg border border-gray-800/50 hover:border-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-400 hover:text-gray-300 transition-all duration-200"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
    
    {/* Loading Indicator */}
    {isLoading && (
      <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-12">
        <div className="bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20 
                        backdrop-blur-sm flex items-center gap-2">
              <Loader className="h-5 w-5 text-blue-400 animate-spin" />
              <span className="text-sm text-blue-400">Loading...</span>
            </div>
      </div>
    )}
  </div>
);

// SelectionFooter Component
const SelectionFooter: React.FC<{
  selectedCount: number;
  onImport: () => void;
  isLoading: boolean;
}> = ({ selectedCount, onImport, isLoading }) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <button
        onClick={onImport}
        disabled={isLoading}
        className="flex items-center gap-2 px-6 py-2.5 
                  bg-blue-800/80 backdrop-blur-sm
                  border border-gray-700/30
                  rounded-full shadow-lg 
                  transition-all duration-200 
                  disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="h-5 w-5 rounded-full 
                        flex items-center justify-center">
          {isLoading ? (
            <Loader className="h-4 w-4 animate-spin text-blue-400" />
          ) : (
            <Check className="h-4 w-4 text-blue-400" />
          )}
        </div>
        <span className="text-base text-gray-200 font-medium">
          Import {selectedCount} {selectedCount === 1 ? 'email' : 'emails'}
        </span>
      </button>
    </div>
  );
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const GmailImportModal: React.FC<Props> = observer(({ isOpen, onClose }) => {
  const viewModel = container.get<GmailImportViewModel>(SERVICE_IDENTIFIERS.GmailImportViewModel);
  const [newLabel, setNewLabel] = useState('');

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

  const handleAddLabel = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLabel.trim() && !viewModel.filters.labels.includes(newLabel.trim())) {
      viewModel.updateFilter('labels', [...viewModel.filters.labels, newLabel.trim()]);
      setNewLabel('');
    }
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    viewModel.updateFilter(
      'labels',
      viewModel.filters.labels.filter(label => label !== labelToRemove)
    );
  };

  // Handler for Selecting/Deselecting All on Current Page
  const handleSelectAllCurrentPage = (selected: boolean) => {
    viewModel.selectAllCurrentPage(selected);
  };

  // Computed value to check if all emails on the current page are selected
  const isCurrentPageAllSelected = viewModel.isCurrentPageAllSelected;

  const renderEmailItem = (email: any) => (
    <div 
      key={email.id} 
      className="bg-[#282c34] rounded-xl border border-gray-800/50
                 hover:border-gray-700/50 transition-all duration-200
                 mb-4"
    >
      <div className="p-4">
        <div className="flex items-start gap-4"> {/* Increased gap for better spacing */}
          <input
            type="checkbox"
            checked={viewModel.selectedEmails.has(email.id)}
            onChange={() => viewModel.toggleEmailSelection(email.id)}
            className="mt-1.5 w-5 h-5 rounded-lg border-gray-700 text-blue-500 
                     focus:ring-blue-500/30 bg-gray-800"
          />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start gap-3"> {/* Added gap */}
              <h4 className="text-sm font-medium text-white leading-snug">
                {email.subject}
              </h4>
              <button
                onClick={() => viewModel.toggleEmailExpansion(email.id)}
                className="p-2 hover:bg-gray-700/50 rounded-lg shrink-0"
              >
                <ChevronRight className={`h-5 w-5 text-gray-400 transform transition-transform
                  duration-200 ${viewModel.expandedEmails.has(email.id) ? 'rotate-90' : ''}`} /> {/* Increased icon size */}
              </button>
            </div>
            <div className="flex flex-col gap-1 mt-2"> {/* Stack sender and date vertically */}
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
  );

  const renderEmailList = () => (
    <div className="flex-1 overflow-y-auto p-4 space-y-6 relative">
  
      {/* Email List */}
      <div className={viewModel.loadingState.isLoading ? "opacity-50 pointer-events-none transition-opacity duration-200" : ""}>
        {viewModel.emails.map(renderEmailItem)}
      </div>
      
      {/* No Results State */}
      {viewModel.emails.length === 0 && !viewModel.loadingState.isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-400">No emails found matching your criteria</p>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    if (viewModel.step === 'filters') {
      return (
        <div className="p-6 space-y-6 sm:p-8"> {/* Responsive padding */}
          <div>
            <div className="flex items-center gap-3 mb-4 text-base text-gray-400"> {/* Increased gap and text size */}
              <Tag className="h-5 w-5" /> {/* Increased icon size */}
              Gmail Labels
            </div>

            {/* Selected Labels Display */}
            <div className="mb-4 flex flex-wrap gap-3">
              {viewModel.filters.labels.map((label) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-4 py-2 
                           bg-[#282c34] rounded-lg border border-gray-800/50
                           group"
                >
                  <span className="text-base text-gray-300">{label}</span> {/* Increased text size */}
                  <button
                    onClick={() => handleRemoveLabel(label)}
                    className="text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    <X className="h-4 w-4" /> {/* Increased icon size */}
                  </button>
                </div>
              ))}
            </div>

            {/* Label Input */}
            <div className="mb-4">
              <form onSubmit={handleAddLabel}>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" /> {/* Increased icon size */}
                  <input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="Type a label name and press Enter..."
                    className="w-full pl-12 pr-4 py-3 bg-[#282c34] rounded-xl
                             border border-gray-800/50 
                             text-white placeholder-gray-500
                             focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30
                             transition-all duration-200"
                  />
                </div>
              </form>
            </div>

            {/* Preset Labels */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3"> {/* Responsive grid */}
              {['Job Applications', 'Interviews', 'Recruiters', 'Job Offers'].map((label) => (
                <label
                  key={label}
                  className="flex items-center gap-3 p-4
                           bg-[#282c34] rounded-xl border border-gray-800/50
                           hover:border-gray-700/50 transition-all duration-200
                           cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={viewModel.filters.labels.includes(label)}
                    onChange={(e) => {
                      const updatedLabels = e.target.checked
                        ? [...viewModel.filters.labels, label]
                        : viewModel.filters.labels.filter(l => l !== label);
                      viewModel.updateFilter('labels', updatedLabels);
                    }}
                    className="w-5 h-5 rounded-lg border-gray-700 text-blue-500 
                             focus:ring-blue-500/30 bg-gray-800"
                  />
                  <span className="text-base text-gray-300 group-hover:text-gray-200 transition-colors">
                    {label}
                  </span> {/* Increased text size */}
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4 text-base text-gray-400"> {/* Increased gap and text size */}
              <KeyRound className="h-5 w-5" /> {/* Increased icon size */}
              Keywords
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" /> {/* Increased icon size */}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6"> {/* Responsive grid */}
            {[
              { label: 'Start Date', value: viewModel.filters.startDate, key: 'startDate' },
              { label: 'End Date', value: viewModel.filters.endDate, key: 'endDate' }
            ].map((field) => (
              <div key={field.key}>
                <div className="flex items-center gap-3 mb-4 text-base text-gray-400"> {/* Increased gap and text size */}
                  <Calendar className="h-5 w-5" /> {/* Increased icon size */}
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
            disabled={viewModel.loadingState.isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3
                     bg-blue-500/10 text-blue-400 rounded-xl
                     border border-blue-500/20 hover:border-blue-500/30
                     hover:bg-blue-500/20
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200"
          >
            {viewModel.loadingState.isLoading ? (
              <Loader className="h-5 w-5 animate-spin" />
            ) : (
              <Filter className="h-5 w-5" /> 
            )}
            <span className="text-base">Import Emails</span> {/* Increased text size */}
          </button>
        </div>
      );
    }

    if (viewModel.step === 'processing') {
      return (
        <div className="p-12 text-center sm:p-16"> {/* Increased padding for better spacing */}
          <div className="bg-blue-500/10 w-20 h-20 sm:w-24 sm:h-24 rounded-xl mx-auto mb-6 
                       flex items-center justify-center">
            <Loader className="h-10 w-10 sm:h-12 sm:w-12 text-blue-400 animate-spin" /> {/* Increased icon size */}
          </div>
          <h3 className="text-2xl font-medium text-white mb-2"> {/* Increased text size */}
            Importing emails...
          </h3>
          <p className="text-gray-400 text-base"> {/* Increased text size */}
            This may take a few moments
          </p>
        </div>
      );
    }

    if (viewModel.step === 'selection') {
      return (
        <div className="flex flex-col h-full">
          {/* Selection Header */}
          <SelectionHeader
            currentPage={viewModel.currentPage}
            hasNextPage={viewModel.hasNextPage}
            isAllSelected={isCurrentPageAllSelected}
            onPageChange={(page: number) => viewModel.goToPage(page)} // Wrapper function to preserve 'this'
            isLoading={viewModel.loadingState.isLoading}
            onSelectAll={handleSelectAllCurrentPage}
          />
          {/* Email List */}
          {renderEmailList()}
        </div>
      );
    }

    return null; // Fallback in case none of the steps match
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50"> {/* Changed alignment for mobile */}
      <div className="bg-[#1a1d24] w-full h-[100dvh] sm:h-auto sm:rounded-2xl sm:max-w-2xl sm:max-h-[85vh] 
                   overflow-hidden flex flex-col border-t sm:border border-gray-800/50"> {/* Full height on mobile, rounded corners on desktop */}
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-gray-800/50">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4 sm:gap-3"> {/* Increased gap */}
              <div className="bg-blue-500/10 p-3 rounded-xl"> {/* Increased padding */}
                <Mail className="h-6 w-6 text-blue-400" /> {/* Increased icon size */}
              </div>
              <h2 className="text-xl font-medium text-white">Import from Gmail</h2> {/* Consistent text size */}
            </div>
            <button 
              onClick={handleClose}
              className="p-3 hover:bg-gray-800/50 rounded-xl"
            >
              <X className="h-6 w-6 text-gray-400" /> {/* Increased icon size */}
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

        {/* Selection Footer */}
        <SelectionFooter 
          selectedCount={viewModel.selectedEmails.size} 
          onImport={handleImport} 
          isLoading={viewModel.loadingState.isLoading}
        />
      </div>
    </div>
  );
});

export default GmailImportModal;
