import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Search, SlidersHorizontal, PlusCircle, Mail, Settings2, Clock, LineChart, MoreVertical, LogOut } from 'lucide-react';
import { container } from '@/di/container';
import { JobTrackerViewModel } from '@/presentation/viewModels/JobTrackerViewModel';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';
import { StageColumn } from '../components/StageColumn';
import { AuthViewModel } from '../viewModels/AuthViewModel';
import { WorkflowEditorModal } from '@/views/components/workflow/WorkflowEditorModal';
import { ActivityHistoryModal } from '@/views/components/activityHistory/ActivityHistoryModal';
import AddApplicationModal from '@/views/components/addapplication/AddApplicationModal';
import { ApplicationModal } from '@/views/components/applicationModal/ApplicationModal';
import { EmailProcessingModal } from '@/views/components/emailProcessingModal/EmailProcessingModal';
import GmailImportModal from '@/views/components/gmailImportModal/GmailImportModal';

export const JobTracker: React.FC = observer(() => {
  const viewModel = container.get<JobTrackerViewModel>(SERVICE_IDENTIFIERS.JobTrackerViewModel);
  const authViewModel = container.get<AuthViewModel>(SERVICE_IDENTIFIERS.AuthViewModel);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = [
    { icon: Mail, label: "Import from Gmail", color: "blue", onClick: () => viewModel.setIsGmailModalOpen(true) },
    { icon: Settings2, label: "Edit Workflow", color: "rose", onClick: () => viewModel.showEditWorkflowModal() },
    { icon: Clock, label: "Activity History", color: "amber", onClick: () => viewModel.setShowHistory(true) },
    { icon: LineChart, label: "View Analytics", color: "purple", onClick: () => window.location.href = '/analytics' },
    { icon: LogOut, label: "Sign Out", color: "red", onClick: () => authViewModel.signOut() }
  ];

  return (
    <div className="h-screen flex flex-col bg-[#15171c]"> {/* Darker background */}
      {/* Header */}
      <div className="p-4 space-y-4">
        {/* Title and Actions */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white/90">
            Application Tracker
          </h1>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => viewModel.setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl
                       bg-[#1a1d24] 
                       shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]
                       hover:shadow-[inset_4px_4px_8px_#111316,inset_-4px_-4px_8px_#232732]
                       border border-[#232732]/20 transition-all duration-200
                       group"
            >
              <PlusCircle className="h-4 w-4 text-cyan-400 group-hover:text-cyan-300" />
              <span className="text-sm font-medium text-cyan-400 group-hover:text-cyan-300">Add</span>
            </button>

            <div className="relative">
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-xl bg-[#1a1d24]
                         shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]
                         hover:shadow-[inset_4px_4px_8px_#111316,inset_-4px_-4px_8px_#232732]
                         border border-[#232732]/20 transition-all duration-200"
              >
                <MoreVertical className="h-4 w-4 text-gray-400" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 overflow-hidden z-50
                            bg-[#1a1d24] border border-[#232732]/20 
                            rounded-xl shadow-[8px_8px_16px_#111316,-8px_-8px_16px_#232732]
                            divide-y divide-[#232732]/20">
                  {menuItems.map(({ icon: Icon, label, color, onClick }) => (
                    <button 
                      key={label}
                      onClick={() => {
                        onClick();
                        setMenuOpen(false);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2.5
                              text-sm text-gray-300 hover:text-cyan-300
                              hover:bg-[#111316]
                              transition-all duration-200 group"
                    >
                      <Icon className="h-4 w-4 text-cyan-400 
                                   group-hover:text-cyan-300" />
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={viewModel.searchTerm}
            onChange={(e) => viewModel.setSearchTerm(e.target.value)}
            placeholder="Search companies or positions..."
            className="w-full pl-11 pr-4 py-3 text-base
                     bg-[#1a1d24] border border-[#232732]/20 
                     shadow-[inset_4px_4px_8px_#111316,inset_-4px_-4px_8px_#232732]
                     rounded-xl text-white placeholder-gray-400
                     focus:border-cyan-500/30 focus:ring-2 focus:ring-cyan-500/20
                     transition-all duration-200"
          />
        </div>

        {/* Stats and Filters Row */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="px-4 py-2 bg-[#1a1d24] rounded-xl
                          shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]
                          hover:shadow-[inset_4px_4px_8px_#111316,inset_-4px_-4px_8px_#232732]
                          border border-[#232732]/20 transition-all duration-200">
              <span className="text-gray-400 text-sm">Total:</span>
              <span className="ml-2 text-white font-medium">
                {viewModel.filteredApplications.length}
              </span>
            </div>
            <div className="px-4 py-2 bg-[#1a1d24] rounded-xl
                          shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]
                          hover:shadow-[inset_4px_4px_8px_#111316,inset_-4px_-4px_8px_#232732]
                          border border-[#232732]/20 transition-all duration-200">
              <span className="text-gray-400 text-sm">Active:</span>
              <span className="ml-2 text-white font-medium">
                {viewModel.filteredApplications.filter(app => app.stage !== 'Rejected').length}
              </span>
            </div>
          </div>
          
          <button
            onClick={() => viewModel.toggleFilterExpanded()}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl
                     transition-all duration-200 
                     ${viewModel.isFilterExpanded || viewModel.activeFilters.length > 0
                       ? 'bg-[#1a1d24] border-cyan-500/30 text-cyan-300 shadow-[inset_4px_4px_8px_#111316,inset_-4px_-4px_8px_#232732]'
                       : 'bg-[#1a1d24] border-[#232732]/20 text-gray-400 shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]'
                     } border`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="text-sm font-medium">
              {viewModel.activeFilters.length > 0 ? `Filters (${viewModel.activeFilters.length})` : 'Filters'}
            </span>
          </button>
        </div>
      </div>

      {/* Kanban Section */}
      <div className="flex-1 p-6 flex overflow-hidden">
        <div className="flex-1 h-full overflow-x-auto">
          <div className="flex gap-6 pb-6 h-full">
            {viewModel.workflowStages.map(stage => (
              <StageColumn
                key={stage.id}
                stage={stage}
                applications={viewModel.getApplicationsByStage(stage.name)}
                viewModel={viewModel}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddApplicationModal
        isOpen={viewModel.showAddModal}
        onClose={() => viewModel.setShowAddModal(false)}
      />

      <GmailImportModal
        isOpen={viewModel.isGmailModalOpen}
        onClose={() => viewModel.setIsGmailModalOpen(false)}
      />

      {viewModel.selectedEmail && (
        <EmailProcessingModal
          email={viewModel.selectedEmail}
          onClose={() => viewModel.closeEmailProcessingModal()}
        />
      )}

      {viewModel.selectedApplication && (
        <ApplicationModal
          application={viewModel.selectedApplication}
          onClose={() => viewModel.clearSelectedApplication()}
          onNavigate={(direction) => viewModel.navigateApplications(direction)}
          totalApplications={viewModel.totalApplicationsInCurrentStage}
          currentIndex={viewModel.currentApplicationIndex}
        />
      )}

      <WorkflowEditorModal
        onClose={() => viewModel.setShowWorkflowModal(false)}
      />

      {viewModel.showHistory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden">
            <ActivityHistoryModal onClose={() => viewModel.setShowHistory(false)} />
          </div>
        </div>
      )}
    </div>
  );
});
