// src/presentation/views/JobTracker.tsx
import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Search, SlidersHorizontal, PlusCircle, Mail, Settings2, Clock, LineChart, MoreVertical } from 'lucide-react';
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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-6 max-w-full bg-[#1a1d21] min-h-screen">
      <div className="mx-auto">
        {/* Header with consistent button styling */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Job Application Tracker</h1>
          
          {/* Mobile: All buttons visible with updated colors */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:hidden">
            {/* Add Button */}
            <button 
              onClick={() => viewModel.setShowAddModal(true)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-800 text-green-400 rounded-lg transition-colors hover:bg-green-900 hover:text-gray-200 text-sm"
            >
              <PlusCircle className="h-4 w-4 text-green-400" />
              <span className="font-medium">Add</span>
            </button>

            {/* Import Button */}
            <button 
              onClick={() => viewModel.setIsGmailModalOpen(true)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-800 text-blue-400 rounded-lg transition-colors hover:bg-blue-900 hover:text-gray-200 text-sm"
            >
              <Mail className="h-4 w-4 text-blue-400" />
              <span className="font-medium">Import</span>
            </button>

            {/* Edit Button */}
            <button 
              onClick={() => viewModel.showEditWorkflowModal()}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-800 text-rose-400 rounded-lg transition-colors hover:bg-rose-900 hover:text-gray-200 text-sm"
            >
              <Settings2 className="h-4 w-4 text-rose-400" />
              <span className="font-medium">Edit</span>
            </button>

            {/* History Button */}
            <button 
              onClick={() => viewModel.setShowHistory(true)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-800 text-amber-400 rounded-lg transition-colors hover:bg-amber-900 hover:text-gray-200 text-sm"
            >
              <Clock className="h-4 w-4 text-amber-400" />
              <span className="font-medium">History</span>
            </button>

            {/* Stats Button */}
            <button 
              onClick={() => window.location.href = '/analytics'}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-800 text-purple-400 rounded-lg transition-colors hover:bg-purple-900 hover:text-gray-200 text-sm"
            >
              <LineChart className="h-4 w-4 text-purple-400" />
              <span className="font-medium">Stats</span>
            </button>
          </div>

          {/* Desktop: Add button + dropdown */}
          <div className="hidden sm:flex items-center gap-3 z-50">
            <button 
              onClick={() => viewModel.setShowAddModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-green-900 text-green-400 transition-all"
            >
              <PlusCircle className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium">Add Application</span>
            </button>

            <div className="relative">
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center w-9 h-9 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-all"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-1">
                  <button 
                    onClick={() => {
                      viewModel.setIsGmailModalOpen(true);
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-blue-400"
                  >
                    <Mail className="h-4 w-4 text-blue-400" />
                    Import from Gmail
                  </button>
                  
                  <button 
                    onClick={() => {
                      viewModel.showEditWorkflowModal();
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-rose-400"
                  >
                    <Settings2 className="h-4 w-4 text-rose-400" />
                    Edit Workflow
                  </button>
                  
                  <button 
                    onClick={() => {
                      viewModel.setShowHistory(true);
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-amber-400"
                  >
                    <Clock className="h-4 w-4 text-amber-400" />
                    Activity History
                  </button>
                  
                  <button 
                    onClick={() => {
                      window.location.href = '/analytics';
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-purple-400"
                  >
                    <LineChart className="h-4 w-4 text-purple-400" />
                    View Analytics
                  </button>
                </div>
              )}
            </div>
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
