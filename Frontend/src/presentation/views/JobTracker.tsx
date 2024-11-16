// src/presentation/views/JobTracker.tsx
import React from 'react';
import { observer } from 'mobx-react-lite';
import { Search, SlidersHorizontal, PlusCircle, Mail, Settings2, Clock, LineChart } from 'lucide-react';
import { container } from '@/di/container';
import { JobTrackerViewModel } from '@/presentation/viewModels/JobTrackerViewModel';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';
import { AddApplicationModal } from '@/presentation/components/modals/AddApplicationModal';
import { GmailImportModal } from '@/presentation/components/modals/GmailImportModal';
import { EmailProcessingModal } from '../components/modals/EmailProcessingModal';
import { ApplicationModal } from '../components/modals/ApplicationModal';
import { StageColumn } from '../components/StageColumn'; // Updated import path
import { WorkflowEditorModal } from '../components/modals/WorkflowEditorModal';
import { ActivityHistoryModal } from '../components/modals/ActivityHistoryModal';

export const JobTracker: React.FC = observer(() => {
  const viewModel = container.get<JobTrackerViewModel>(SERVICE_IDENTIFIERS.JobTrackerViewModel);

  return (
    <div className="p-6 max-w-full bg-[#1a1d21] min-h-screen">
      <div className="mx-auto">
        {/* Header with action buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Job Application Tracker</h1>
          <div className="flex gap-4">
            <button 
              onClick={() => viewModel.setShowAddModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
              <PlusCircle className="h-4 w-4" />
              <span className="hidden lg:inline">Add Application</span>
            </button>
            <button 
              onClick={() => viewModel.setIsGmailModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
              <Mail className="h-4 w-4" />
              <span className="hidden lg:inline">Import from Gmail</span>
            </button>
            <button 
              onClick={() => viewModel.showEditWorkflowModal()}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
              <Settings2 className="h-4 w-4" />
              <span className="hidden lg:inline">Edit Workflow</span>
            </button>
            <button
              onClick={() => viewModel.setShowHistory(true)}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              <Clock className="h-4 w-4" />
              <span className="hidden lg:inline">Activity History</span>
            </button>
            <button 
              onClick={() => window.location.href = '/analytics'}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <LineChart className="h-4 w-4" />
              <span className="hidden lg:inline">View Analytics</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={viewModel.searchTerm}
            onChange={(e) => viewModel.setSearchTerm(e.target.value)}
            placeholder="Search companies or positions..."
            className="w-full pl-12 pr-4 py-3 bg-[#282c34] border-none rounded-xl
                     text-white placeholder-gray-400 focus:ring-2 focus:ring-[#4867d6] outline-none"
          />
        </div>

        {/* Stats and Filters Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="w-full sm:w-auto">
            <button
              onClick={() => viewModel.toggleFilterExpanded()}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                viewModel.isFilterExpanded || viewModel.activeFilters.length > 0
                  ? 'bg-[#4867d6] text-white'
                  : 'bg-[#282c34] text-gray-400 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters {viewModel.activeFilters.length > 0 && `(${viewModel.activeFilters.length})`}
            </button>
          </div>

          {/* Stats Cards */}
          <div className="flex gap-4 w-full sm:w-auto">
            <div className="flex-1 sm:flex-initial bg-[#282c34] rounded-xl p-4">
              <div className="text-sm text-gray-400">Total Applications</div>
              <div className="text-2xl font-bold text-white">
                {viewModel.filteredApplications.length}
              </div>
            </div>
            <div className="flex-1 sm:flex-initial bg-[#282c34] rounded-xl p-4">
              <div className="text-sm text-gray-400">Active Applications</div>
              <div className="text-2xl font-bold text-white">
                {viewModel.filteredApplications.filter(app => app.stage !== 'Rejected').length}
              </div>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 -mx-3 px-3 sm:mx-0 sm:px-0">
          {viewModel.workflowStages.map(stage => (
            <StageColumn
              key={stage.id}
              stage={stage}
              applications={viewModel.getApplicationsByStage(stage.name)}
              viewModel={viewModel}
            />
          ))}
        </div>

        {/* Add Application Modals */}
        <AddApplicationModal
          isOpen={viewModel.showAddModal}
          onClose={() => viewModel.setShowAddModal(false)}
        />

        {/* Import from Gmail Modal */}
        <GmailImportModal
          isOpen={viewModel.isGmailModalOpen}
          onClose={() => viewModel.setIsGmailModalOpen(false)}
        />

        {/* Render EmailProcessingModal */}
        {viewModel.selectedEmail && (
          <EmailProcessingModal
            email={viewModel.selectedEmail}
            onClose={() => viewModel.closeEmailProcessingModal()}
          />
        )}

        {/* Application Modal */}
        {viewModel.selectedApplication && (
          <ApplicationModal
            application={viewModel.selectedApplication}
            onClose={() => viewModel.clearSelectedApplication()}
            onNavigate={(direction) => viewModel.navigateApplications(direction)}
            totalApplications={viewModel.totalApplicationsInCurrentStage}
            currentIndex={viewModel.currentApplicationIndex}
          />
        )}
          
        {/* Workflow Editor Modal */}
        <WorkflowEditorModal
          isOpen={viewModel.showWorkflowModal}
          onClose={() => viewModel.setShowWorkflowModal(false)}
        />
  
        {/* Activity History Modal */}
        {viewModel.showHistory && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden">
              <ActivityHistoryModal onClose={() => viewModel.setShowHistory(false)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
