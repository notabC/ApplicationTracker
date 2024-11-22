// src/presentation/views/JobTracker.tsx
import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Search, SlidersHorizontal, PlusCircle, Mail, Settings2, Clock, LineChart, MoreVertical, LogOut } from 'lucide-react';
import { container } from '@/di/container';
import { JobTrackerViewModel } from '@/presentation/viewModels/JobTrackerViewModel';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';
import AddApplicationModal from '@/presentation/components/modals/AddApplicationModal';
import { GmailImportModal } from '@/presentation/components/modals/GmailImportModal';
import { EmailProcessingModal } from '../components/modals/EmailProcessingModal';
import { ApplicationModal } from '../components/modals/ApplicationModal';
import { StageColumn } from '../components/StageColumn'; // Updated import path
import { WorkflowEditorModal } from '../components/modals/WorkflowEditorModal';
import { ActivityHistoryModal } from '../components/modals/ActivityHistoryModal';
import { AuthViewModel } from '../viewModels/AuthViewModel';

export const JobTracker: React.FC = observer(() => {
  const viewModel = container.get<JobTrackerViewModel>(SERVICE_IDENTIFIERS.JobTrackerViewModel);
  const authViewModel = container.get<AuthViewModel>(SERVICE_IDENTIFIERS.AuthViewModel);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-6 max-w-full bg-[#1a1d21] min-h-screen">
      <div className="mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Job Application Tracker
          </h1>
          
          {/* Mobile Actions */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:hidden">
            {[
              { icon: PlusCircle, label: "Add", color: "green", onClick: () => viewModel.setShowAddModal(true) },
              { icon: Mail, label: "Import", color: "blue", onClick: () => viewModel.setIsGmailModalOpen(true) },
              { icon: Settings2, label: "Edit", color: "rose", onClick: () => viewModel.showEditWorkflowModal() },
              { icon: Clock, label: "History", color: "amber", onClick: () => viewModel.setShowHistory(true) },
              { icon: LineChart, label: "Stats", color: "purple", onClick: () => window.location.href = '/analytics' },
              { icon: LogOut, label: "Sign Out", color: "red", onClick: () => authViewModel.signOut() }
            ].map(({ icon: Icon, label, color, onClick }) => (
              <button 
                key={label}
                onClick={onClick}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2
                          bg-gray-800/40 backdrop-blur-sm border border-gray-700/50
                          rounded-xl transition-all duration-200
                          hover:bg-${color}-500/20 hover:border-${color}-500/30
                          group`}
              >
                <Icon className={`h-4 w-4 text-${color}-400 group-hover:text-${color}-300`} />
                <span className={`text-sm font-medium text-${color}-400 group-hover:text-${color}-300`}>
                  {label}
                </span>
              </button>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-3 z-50">
            <button 
              onClick={() => viewModel.setShowAddModal(true)}
              className="flex items-center justify-center gap-2 px-5 py-2.5
                      bg-gradient-to-r from-green-500/10 to-green-500/5
                      hover:from-green-500/20 hover:to-green-500/10
                      border border-green-500/20 hover:border-green-500/30
                      rounded-xl transition-all duration-200 group"
            >
              <PlusCircle className="h-4 w-4 text-green-400 group-hover:text-green-300" />
              <span className="text-sm font-medium text-green-400 group-hover:text-green-300">
                Add Application
              </span>
            </button>

            <div className="relative">
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center w-10 h-10
                        bg-gray-800/40 backdrop-blur-sm border border-gray-700/50
                        rounded-xl transition-all duration-200
                        hover:bg-gray-700/40 hover:border-gray-600/50"
              >
                <MoreVertical className="h-4 w-4 text-gray-400" />
              </button>

              {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-gray-800/95 backdrop-blur-md
                            border border-gray-700/50 rounded-xl shadow-xl
                            divide-y divide-gray-700/50">
                  {[
                    { icon: Mail, label: "Import from Gmail", color: "blue", onClick: () => { viewModel.setIsGmailModalOpen(true); setIsOpen(false); } },
                    { icon: Settings2, label: "Edit Workflow", color: "rose", onClick: () => { viewModel.showEditWorkflowModal(); setIsOpen(false); } },
                    { icon: Clock, label: "Activity History", color: "amber", onClick: () => { viewModel.setShowHistory(true); setIsOpen(false); } },
                    { icon: LineChart, label: "View Analytics", color: "purple", onClick: () => { window.location.href = '/analytics'; setIsOpen(false); } },
                    { icon: LogOut, label: "Sign Out", color: "red", onClick: () => { authViewModel.signOut(); setIsOpen(false); } }
                  ].map(({ icon: Icon, label, color, onClick }) => (
                    <button 
                      key={label}
                      onClick={onClick}
                      className={`flex items-center gap-3 w-full px-4 py-3
                              text-sm text-gray-300 hover:text-${color}-300
                              transition-colors duration-200 group`}
                    >
                      <Icon className={`h-4 w-4 text-${color}-400 group-hover:text-${color}-300`} />
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative my-3">
          <div className=" bg-blue-500/5 rounded-xl "></div>
          <div className="relative flex items-center">
            <Search className="absolute left-4 text-gray-400" />
            <input
              type="text"
              value={viewModel.searchTerm}
              onChange={(e) => viewModel.setSearchTerm(e.target.value)}
              placeholder="Search companies or positions..."
              className="w-full pl-12 pr-4 py-3.5
                      bg-gray-800/40 
                      border border-gray-700/50 focus:border-blue-500/50
                      rounded-xl transition-all duration-200
                      text-white placeholder-gray-400
                      focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            />
          </div>
        </div>

        {/* Stats and Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-4">
          <button
            onClick={() => viewModel.toggleFilterExpanded()}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl
                    transition-all duration-200 ${
              viewModel.isFilterExpanded || viewModel.activeFilters.length > 0
                ? 'bg-blue-500/20 border-blue-500/30 text-blue-300'
                : 'bg-gray-800/40 border-gray-700/50 text-gray-400 hover:text-gray-300'
            } border backdrop-blur-sm`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="text-sm font-medium">
              Filters {viewModel.activeFilters.length > 0 && `(${viewModel.activeFilters.length})`}
            </span>
          </button>

          <div className="flex gap-4 w-full sm:w-auto">
            {[
              { label: "Total Applications", value: viewModel.filteredApplications.length },
              { label: "Active Applications", value: viewModel.filteredApplications.filter(app => app.stage !== 'Rejected').length }
            ].map(({ label, value }) => (
              <div key={label} 
                  className="flex-1 sm:flex-initial p-4
                            bg-gray-800/40 backdrop-blur-sm
                            border border-gray-700/50
                            rounded-xl transition-all duration-200
                            hover:bg-gray-700/40 hover:border-gray-600/50">
                <div className="text-sm text-gray-400">{label}</div>
                <div className="text-2xl font-bold text-white mt-1">{value}</div>
              </div>
            ))}
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
