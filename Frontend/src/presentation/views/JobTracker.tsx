// src/presentation/views/JobTracker.tsx
import React from 'react';
import { observer } from 'mobx-react-lite';
import { Search, SlidersHorizontal, PlusCircle, Mail, Settings2 } from 'lucide-react';
import { container } from '@/di/container';
import { JobTrackerViewModel } from '@/presentation/viewModels/JobTrackerViewModel';
import { ApplicationCard } from '@/presentation/components/ApplicationCard';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';
import { AddApplicationModal } from '@/presentation/components/modals/AddApplicationModal';
import { GmailImportModal } from '@/presentation/components/modals/GmailImportModal';
import { EmailCard } from '../components/EmailCard';
import { EmailProcessingModal } from '../components/modals/EmailProcessingModal';
import { ApplicationModal } from '../components/modals/ApplicationModal';

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
              Add Application
            </button>
            <button 
              onClick={() => viewModel.setIsGmailModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
              <Mail className="h-4 w-4" />
              Import from Gmail
            </button>
            <button 
              onClick={() => viewModel.showEditWorkflowModal()}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
              <Settings2 className="h-4 w-4" />
              Edit Workflow
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
            <div key={stage.id} className="flex-none w-[280px] sm:w-80">
              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-white">{stage.name}</h3>
                  <span className={`px-2 py-1 bg-${stage.color}-700 text-${stage.color}-300 text-sm rounded-full`}>
                    {stage.name === 'Unassigned'
                      ? viewModel.unprocessedEmails.length
                      : viewModel.getApplicationsByStage(stage.name).length}
                  </span>
                </div>

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
                    viewModel.getApplicationsByStage(stage.name).map(application => (
                      <ApplicationCard
                        key={application.id}
                        application={application}
                        onStageChange={viewModel.handleStageChange}
                        onClick={() => viewModel.selectApplication(application)}
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
            onProcess={(application, emailId) => viewModel.processEmail(application, emailId)}
            applications={viewModel.applications}
            workflow={viewModel.workflowStages}
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
      </div>
    </div>
  );
});
