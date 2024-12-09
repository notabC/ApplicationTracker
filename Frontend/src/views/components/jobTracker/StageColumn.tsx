// src/presentation/views/components/StageColumn.tsx
import { observer } from 'mobx-react-lite';
import type { Application } from '@/core/domain/models/Application';
import type { JobTrackerViewModel } from '@/viewModels/JobTrackerViewModel';
import { DragEvent } from 'react';
import { PlusCircle } from 'lucide-react';
import { EmailCard } from './EmailCard';
import { ApplicationCard } from './ApplicationCard';
import { WorkflowStage } from '@/domain/interfaces/IWorkflow';

interface Props {
  stage: WorkflowStage;
  applications: Application[];
  viewModel: JobTrackerViewModel;
}

export const StageColumn: React.FC<Props> = observer(({ stage, applications, viewModel }) => {

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    // Just calling VM methods, no logic here
    viewModel.dragOverStage(stage.id);
  };

  const handleDragLeave = () => {
    viewModel.leaveStage();
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    await viewModel.dropOnStage(stage.name);
  };

  return (
    <div className="flex-none w-[280px] sm:w-80 h-full flex flex-col">
      <div
        className={`
          bg-[#1a1d24] rounded-2xl
          border border-[#232732]/20
          shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]
          flex flex-col h-full
          transition-all duration-200
          ${viewModel.model.dragOverStageId === stage.id ? 'border-blue-500/50 shadow-blue-500/10' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="
          sticky top-0 z-10 p-4 rounded-t-2xl bg-[#1a1d24]
          border-b border-[#232732]/20
          shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
        ">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-white">{stage.name}</h3>
              <span className="
                px-3 py-1 rounded-full text-sm text-cyan-400 
                bg-[#1a1d24] 
                shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
                border border-[#232732]/20
              ">
                {stage.name === 'Unassigned'
                  ? viewModel.unprocessedEmails.length
                  : applications.length}
              </span>
            </div>

            {stage.name !== 'Unassigned' && (
              <button
                onClick={() => viewModel.setShowAddModal(true)}
                className="
                  p-2 rounded-lg
                  bg-[#1a1d24] border border-[#232732]/20
                  shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]
                  hover:shadow-[6px_6px_12px_#111316,-6px_-6px_12px_#232732]
                  active:shadow-[inset_4px_4px_8px_#111316,inset_-4px_-4px_8px_#232732]
                  hover:border-cyan-500/30
                  transition-all duration-200 group
                "
              >
                <PlusCircle className="h-4 w-4 text-cyan-400 group-hover:text-cyan-300" />
              </button>
            )}
          </div>
        </div>

        <div className="p-4 pt-3 flex-1 flex flex-col gap-3 overflow-auto">
          {stage.name === 'Unassigned' ? (
            viewModel.filteredUnprocessedEmails.map(email => (
              <EmailCard
                key={email.id}
                email={email}
                onClick={() => viewModel.setSelectedEmailId(email.id)}
                viewModel={viewModel}
              />
            ))
          ) : (
            applications.map(application => (
              <ApplicationCard
                key={application.id}
                application={application}
                onSelectApplication={(app) => viewModel.setSelectedApplicationById(app.id)}
                viewModel={viewModel}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
});
