// src/presentation/components/StageColumn/StageColumn.tsx
import { observer } from 'mobx-react-lite';
import type { WorkflowStage } from '@/core/domain/models/Workflow';
import type { Application } from '@/core/domain/models/Application';
import type { JobTrackerViewModel } from '@/presentation/viewModels/JobTrackerViewModel';
import { DragEvent } from 'react';
import { PlusCircle } from 'lucide-react';
import { EmailCard } from './EmailCard';
import { ApplicationCard } from './ApplicationCard';

interface Props {
  stage: WorkflowStage;
  applications: Application[];
  viewModel: JobTrackerViewModel;
}

export const StageColumn = observer(({ stage, applications, viewModel }: Props) => {
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    viewModel.dragDropVM.setDragOverStage(stage.id);
  };

  const handleDragLeave = () => {
    viewModel.dragDropVM.setDragOverStage(null);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    await viewModel.dragDropVM.handleDrop(stage.name);
  };

  return (
    <div className="flex-none w-[280px] sm:w-80">
      <div 
        className={`bg-gray-800 rounded-xl p-4 border border-gray-700 transition-colors duration-200
                   ${viewModel.dragDropVM.isDraggingOver(stage.id) ? 'bg-gray-750 border-blue-500' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Stage Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-white">{stage.name}</h3>
          <span className={`px-2 py-1 text-gray-300 text-sm rounded-full`}>
            {stage.name === 'Unassigned'
              ? viewModel.unprocessedEmails.length
              : viewModel.getApplicationsByStage(stage.name).length}
          </span>
        </div>

        {/* Applications List */}
        <div className="flex flex-col gap-3">
          {stage.name === 'Unassigned' ? (
            viewModel.unprocessedEmails.map(email => (
              <EmailCard
                key={email.id}
                email={email}
                onClick={() => viewModel.selectEmail(email)}
              />
            ))
          ) : (
            applications.map(application => (
              <ApplicationCard
                key={application.id}
                application={application}
                viewModel={viewModel}
              />
            ))
          )}
          
          {/* Add Application Button (optional for each stage) */}
          {stage.name !== 'Unassigned' && (
            <button
              onClick={() => viewModel.setShowAddModal(true)}
              className="w-full flex items-center justify-center gap-2 py-2 text-gray-400 
                         hover:text-gray-200 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              Add Application
            </button>
          )}
        </div>
      </div>
    </div>
  );
});
