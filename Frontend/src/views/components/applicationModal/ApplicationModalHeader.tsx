// src/views/components/applicationModal/ApplicationModalHeader.tsx
import { X, ChevronDown, Building2 } from 'lucide-react';
import type { Application } from '@/core/domain/models/Application';
import type { ApplicationModalViewModel } from '@/viewModels/ApplicationModalViewModel';
import { observer } from 'mobx-react-lite';

interface HeaderProps {
  application: Application;
  updatedApplication: Application;
  viewModel: ApplicationModalViewModel;
  onClose: () => void;
}

export const ApplicationModalHeader = observer(({
  application,
  updatedApplication,
  viewModel,
  onClose
}: HeaderProps) => {
  return (
    <div className="p-6 border-b border-gray-800/50 relative">
      <button 
        onClick={onClose} 
        className="absolute top-6 right-6 p-2 hover:bg-gray-800/50 rounded-xl transition-colors duration-200 z-10"
      >
        <X className="h-5 w-5 text-gray-400" />
      </button>

      <div className="flex gap-4 items-start pr-12">
        <div className="bg-blue-500/10 p-2.5 rounded-xl flex-shrink-0">
          <Building2 className="h-5 w-5 text-blue-400" />
        </div>
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <input
            type="text"
            value={viewModel.unsavedChanges.company ?? updatedApplication.company}
            onChange={(e) => viewModel.handleFieldChange(application, 'company', e.target.value, true)}
            className="text-xl font-medium text-white bg-transparent hover:bg-[#282c34] 
                     px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30
                     transition-all duration-200 w-full"
          />
          <input
            type="text"
            value={viewModel.unsavedChanges.position ?? updatedApplication.position}
            onChange={(e) => viewModel.handleFieldChange(application, 'position', e.target.value, true)}
            className="text-sm text-gray-400 bg-transparent hover:bg-[#282c34]
                     px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30
                     transition-all duration-200 w-full"
          />
        </div>
      </div>

      <button
        onClick={() => viewModel.setShowStageSelect(true)}
        className="mt-4 w-full flex items-center justify-between px-4 py-3 
                 bg-[#282c34] border border-gray-800/50
                 rounded-xl hover:bg-gray-800/50 hover:border-gray-700/50
                 transition-all duration-200 group"
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-blue-400" />
          <span className="text-white font-medium">{updatedApplication.stage}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400 group-hover:text-gray-300">
            Change Status
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-300" />
        </div>
        {/* <ChevronDown className="h-5 w-5 text-gray-400 group-hover:text-gray-300 transition-colors" /> */}
      </button>
    </div>
  );
});
