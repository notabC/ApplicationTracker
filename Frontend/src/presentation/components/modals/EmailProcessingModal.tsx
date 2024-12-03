import React from 'react';
import { observer } from 'mobx-react-lite';
import { container } from '@/di/container';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';
import { EmailProcessingViewModel } from '@/viewModels/EmailProcessingViewModel';
import type { Email } from '@/core/interfaces/services/IEmailService';
import { X, Mail, Search, BuildingIcon, Briefcase } from 'lucide-react';

interface Props {
  email: Email;
  onClose: () => void;
}

export const EmailProcessingModal: React.FC<Props> = observer(({
  email,
  onClose
}) => {
  const viewModel = container.get<EmailProcessingViewModel>(SERVICE_IDENTIFIERS.EmailProcessingViewModel);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#1a1d24] rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-800/50">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/10 p-2 rounded-xl">
              <Mail className="h-5 w-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-medium text-white">Process Email</h2>
          </div>
          <button 
            onClick={() => { viewModel.reset(); onClose(); }} 
            className="p-2 hover:bg-gray-800/50 rounded-xl transition-colors duration-200"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Email Content */}
          <div className="p-6 border-b border-gray-800/50 bg-[#20242b]">
            <h3 className="text-lg font-medium text-white mb-3">{email.subject}</h3>
            <div className="relative">
              <p className={`text-gray-300 text-sm leading-relaxed ${
                !viewModel.isBodyExpanded ? 'line-clamp-3' : ''
              }`}>
                {email.body}
              </p>
              {email.body.length > 150 && (
                <button
                  onClick={() => viewModel.toggleBodyExpanded()}
                  className="text-blue-400 text-sm hover:text-blue-300 mt-2 transition-colors duration-200"
                >
                  {viewModel.isBodyExpanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          </div>

          {/* Search Section */}
          <div className="p-6 space-y-6">
            {/* Input Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                  <BuildingIcon className="h-4 w-4" />
                  Company Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={viewModel.searchInput.company}
                    onChange={(e) => viewModel.setSearchInput({ company: e.target.value })}
                    placeholder="e.g., TechCorp"
                    className="w-full px-4 py-3 bg-[#20242b] border border-gray-800/50 
                             rounded-xl text-white placeholder-gray-500 
                             focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30
                             transition-all duration-200"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Position
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={viewModel.searchInput.position}
                    onChange={(e) => viewModel.setSearchInput({ position: e.target.value })}
                    placeholder="e.g., Frontend Developer"
                    className="w-full px-4 py-3 bg-[#20242b] border border-gray-800/50 
                             rounded-xl text-white placeholder-gray-500 
                             focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30
                             transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Matched Applications */}
            {(viewModel.searchInput.company || viewModel.searchInput.position) && (
              <div className="space-y-4">
                {viewModel.matchedApplications.map(app => (
                  <div 
                    key={app.id} 
                    className="bg-[#20242b] rounded-xl border border-gray-800/50 overflow-hidden
                             hover:border-gray-700/50 transition-all duration-200"
                  >
                    <div className="p-4">
                      <h3 className="text-lg font-medium text-white mb-1">{app.company}</h3>
                      <p className="text-sm text-gray-400 mb-3">{app.position}</p>
                      
                      {/* Available Stages */}
                      <div className="grid grid-cols-2 gap-2">
                        {viewModel.availableStages(app.stage).map(stage => (
                          <button
                            key={stage}
                            onClick={async () => {
                              try {
                                viewModel.handleEmailUpdateApplication(app, stage, email);
                              } catch (error) {
                                console.error('Error processing email:', error);
                              }
                            }}
                            className="px-4 py-2 text-sm text-gray-300 
                                     bg-gray-800/50 hover:bg-gray-700/50 
                                     border border-gray-700/50 hover:border-gray-600/50
                                     rounded-lg transition-all duration-200"
                          >
                            Move to {stage}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {viewModel.matchedApplications.length === 0 && (
                  <div className="text-center py-8">
                    <div className="inline-flex p-3 bg-blue-500/10 rounded-xl mb-4">
                      <Search className="h-6 w-6 text-blue-400" />
                    </div>
                    <p className="text-gray-400 mb-4">No matching applications found</p>
                    <button
                      onClick={() => {
                        viewModel.createNewApplication(email);
                        onClose();
                      }}
                      className="px-6 py-2.5 bg-blue-500/10 text-blue-400
                               hover:bg-blue-500/20 rounded-xl
                               border border-blue-500/20 hover:border-blue-500/30
                               transition-all duration-200"
                    >
                      Create New Application
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});