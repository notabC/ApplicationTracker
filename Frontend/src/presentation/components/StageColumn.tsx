import { observer } from 'mobx-react-lite';
import type { WorkflowStage } from '@/core/domain/models/Workflow';
import type { Application } from '@/core/domain/models/Application';
import type { JobTrackerViewModel } from '@/presentation/viewModels/JobTrackerViewModel';
import { DragEvent } from 'react';
import { PlusCircle } from 'lucide-react';
import { EmailCard } from './EmailCard';
import { ApplicationCard } from './ApplicationCard';
import { container, SERVICE_IDENTIFIERS } from '@/di/container';
import { IWorkflowService } from '@/core/interfaces/services';

interface Props {
  stage: WorkflowStage;
  applications: Application[];
  viewModel: JobTrackerViewModel;
}

export const StageColumn = observer(({ stage, applications, viewModel }: Props) => {
  const workFlowService = container.get<IWorkflowService>(SERVICE_IDENTIFIERS.WorkflowService);
  const currentStage = workFlowService.getStageById(stage.id);
  const isVisible = currentStage?.visible ?? stage.visible;

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

  if (!isVisible) return null;

  return (
    <div className="flex-none w-[280px] sm:w-80">
      <div 
        className={`bg-[#1a1d24] rounded-xl p-4 
                   border border-gray-800/50
                   transition-all duration-200 ease-in-out
                   ${viewModel.dragDropVM.isDraggingOver(stage.id) 
                     ? 'bg-[#1e2128] border-blue-500/50 shadow-lg shadow-blue-500/10' 
                     : 'hover:border-gray-700/50'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Stage Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-white">{stage.name}</h3>
            <span className="px-2.5 py-0.5 bg-[#282c34] text-gray-400 text-sm rounded-full">
              {stage.name === 'Unassigned'
                ? viewModel.unprocessedEmails.length
                : viewModel.getApplicationsByStage(stage.name).length}
            </span>
          </div>
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
          
          {/* Add Application Button */}
          {stage.name !== 'Unassigned' && (
            <button
              onClick={() => viewModel.setShowAddModal(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5
                       text-gray-400 bg-[#282c34] rounded-lg
                       hover:text-gray-200 hover:bg-gray-800
                       transition-all duration-200 group"
            >
              <PlusCircle className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-sm">Add Application</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
});