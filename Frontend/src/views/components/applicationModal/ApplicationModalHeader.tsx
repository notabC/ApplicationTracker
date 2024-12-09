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
    <div 
      className="
        p-6 border-b border-[#232732]/20 relative
        bg-gradient-to-br from-[#1e2128] to-[#16181d]
      "
    >
      <button 
        onClick={onClose} 
        className="
          absolute top-6 right-6 p-2
          rounded-xl
          bg-[#1a1d24] border border-[#232732]/20
          shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]
          hover:shadow-[6px_6px_12px_#111316,-6px_-6px_12px_#232732]
          active:shadow-[inset_4px_4px_8px_#111316,inset_-4px_-4px_8px_#232732]
          transition-all duration-200
        "
      >
        <X className="h-5 w-5 text-gray-400" />
      </button>

      <div className="flex gap-4 items-start pr-12">
        <div 
          className="
            bg-blue-500/10 p-2.5 rounded-xl flex-shrink-0
            shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
          "
        >
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
        className="
          mt-4 w-full flex items-center justify-between px-4 py-3 
          bg-[#1a1d24] border border-[#232732]/20
          rounded-xl 
          shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]
          hover:shadow-[6px_6px_12px_#111316,-6px_-6px_12px_#232732]
          active:shadow-[inset_4px_4px_8px_#111316,inset_-4px_-4px_8px_#232732]
          transition-all duration-200 group 
        "
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-blue-400" />
          <span className="text-white font-medium">{updatedApplication.stage}</span>
        </div>
        <div className="flex items-center gap-2">
          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-300" />
        </div>
      </button>
    </div>
  );
});
