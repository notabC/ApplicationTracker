// src/views/components/gmailImportModal/Filters.tsx
import React from 'react';
import { observer } from 'mobx-react-lite';
import { Tag, Search, KeyRound, Calendar, Loader, Filter, X } from 'lucide-react';
import { GmailImportViewModel } from '../../../viewModels/GmailImportViewModel';

interface FiltersProps {
  viewModel: GmailImportViewModel;
}

const Filters: React.FC<FiltersProps> = observer(({ viewModel }) => (
  <div className="
    p-6 space-y-6 sm:p-8
    bg-gradient-to-br from-[#1e2128] to-[#16181d]
  ">
    <div>
      <div className="flex items-center gap-3 mb-4 text-base text-gray-400">
        <Tag className="h-5 w-5" />
        Gmail Labels
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        {viewModel.filters.labels.map((label) => (
          <div
            key={label}
            className="
              flex items-center gap-2 px-4 py-2 
              bg-[#1a1d24] rounded-lg border border-[#232732]/20
              shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]
              hover:shadow-[6px_6px_12px_#111316,-6px_-6px_12px_#232732]
              hover:border-cyan-500/30
              transition-all duration-200 group
            "
          >
            <span className="text-base text-gray-300">{label}</span>
            <button
              onClick={() => viewModel.removeLabel(label)}
              className="
                text-gray-500 hover:text-gray-300 transition-colors
                p-1 rounded-full
                bg-[#1a1d24] border border-[#232732]/20
                shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
                hover:shadow-[inset_4px_4px_8px_#111316,inset_-4px_-4px_8px_#232732]
              "
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            viewModel.addLabel();
          }}
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={viewModel.newLabel}
              onChange={(e) => (viewModel.newLabel = e.target.value)}
              placeholder="Type a label name and press Enter..."
              className="
                w-full pl-12 pr-4 py-3 bg-[#1a1d24] rounded-xl
                border border-[#232732]/20 
                text-white placeholder-gray-500
                focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30
                transition-all duration-200
                shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
              "
            />
          </div>
        </form>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {['Job Applications', 'Interviews', 'Recruiters', 'Job Offers'].map((label) => (
          <label
            key={label}
            className="
              flex items-center gap-3 p-4
              bg-[#1a1d24] rounded-xl border border-[#232732]/20
              shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]
              hover:shadow-[6px_6px_12px_#111316,-6px_-6px_12px_#232732]
              hover:border-cyan-500/30
              transition-all duration-200 cursor-pointer group
            "
          >
            <input
              type="checkbox"
              checked={viewModel.filters.labels.includes(label)}
              onChange={(e) => {
                const updatedLabels = e.target.checked
                  ? [...viewModel.filters.labels, label]
                  : viewModel.filters.labels.filter((l) => l !== label);
                viewModel.updateFilter('labels', updatedLabels);
              }}
              className="
                w-5 h-5 rounded-lg border-[#232732]/20 text-blue-500 
                focus:ring-blue-500/30 bg-[#1a1d24]
                shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
                transition-all duration-200
              "
            />
            <span className="text-base text-gray-300 group-hover:text-gray-200 transition-colors">
              {label}
            </span>
          </label>
        ))}
      </div>
    </div>

    <div>
      <div className="flex items-center gap-3 mb-4 text-base text-gray-400">
        <KeyRound className="h-5 w-5" />
        Keywords
      </div>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={viewModel.filters.keywords}
          onChange={(e) => viewModel.updateFilter('keywords', e.target.value)}
          placeholder="e.g., job offer, application, interview..."
          className="
            w-full pl-12 pr-4 py-3 bg-[#1a1d24] rounded-xl
            border border-[#232732]/20 
            text-white placeholder-gray-500
            focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30
            transition-all duration-200
            shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
          "
        />
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {[
        { label: 'Start Date', value: viewModel.filters.startDate, key: 'startDate' },
        { label: 'End Date', value: viewModel.filters.endDate, key: 'endDate' },
      ].map((field) => (
        <div key={field.key}>
          <div className="flex items-center gap-3 mb-4 text-base text-gray-400">
            <Calendar className="h-5 w-5" />
            {field.label}
          </div>
          <input
            type="date"
            value={field.value}
            onChange={(e) => viewModel.updateFilter(field.key as any, e.target.value)}
            className="
              w-full px-4 py-3 bg-[#1a1d24] rounded-xl
              border border-[#232732]/20 text-white
              focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30
              transition-all duration-200
              shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
            "
          />
        </div>
      ))}
    </div>

    <button
      onClick={() => viewModel.fetchEmails()}
      disabled={viewModel.loadingState.isLoading}
      className="
        w-full flex items-center justify-center gap-3 px-6 py-3
        bg-blue-500/10 text-blue-400 rounded-xl
        border border-blue-500/20 hover:border-blue-500/30
        hover:bg-blue-500/20
        disabled:opacity-50 disabled:cursor-not-allowed
        shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]
        hover:shadow-[6px_6px_12px_#111316,-6px_-6px_12px_#232732]
        active:shadow-[inset_4px_4px_8px_#111316,inset_-4px_-4px_8px_#232732]
        transition-all duration-200
      "
    >
      {viewModel.loadingState.isLoading ? (
        <Loader className="h-5 w-5 animate-spin" />
      ) : (
        <Filter className="h-5 w-5" />
      )}
      <span className="text-base">Import Emails</span>
    </button>
  </div>
));

export default Filters;
