import React from 'react';
import { observer } from 'mobx-react-lite';
import { container } from '@/di/container';
import { SERVICE_IDENTIFIERS } from '@/core/constants/identifiers';
import { EmailProcessingViewModel } from '@/presentation/viewModels/EmailProcessingViewModel';
import type { Email } from '@/core/interfaces/services/IEmailService';
import { X } from 'lucide-react';

interface Props {
  email: Email;
  onClose: () => void;
}

export const EmailProcessingModal: React.FC<Props> = observer(({
  email,
  onClose
}) => {
  const viewModel = container.get<EmailProcessingViewModel>(SERVICE_IDENTIFIERS.EmailProcessingViewModel);

  const handleClose = () => {
    viewModel.reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header - Fixed */}
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white">Process Email</h2>
          <button onClick={handleClose} className="p-2 hover:bg-gray-800 rounded-lg">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Email Content Display */}
          <div className="p-6 border-b border-gray-800 bg-gray-800/50">
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
                  className="text-blue-400 text-sm hover:text-blue-300 mt-2"
                >
                  {viewModel.isBodyExpanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          </div>

          {/* Search Inputs and Results */}
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={viewModel.searchInput.company}
                  onChange={(e) => viewModel.setSearchInput({ company: e.target.value })}
                  placeholder="e.g., TechCorp"
                  className="w-full px-4 py-3 bg-gray-800 border-none rounded-lg 
                           text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Position
                </label>
                <input
                  type="text"
                  value={viewModel.searchInput.position}
                  onChange={(e) => viewModel.setSearchInput({ position: e.target.value })}
                  placeholder="e.g., Frontend Developer"
                  className="w-full px-4 py-3 bg-gray-800 border-none rounded-lg 
                           text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Matched Applications */}
            {(viewModel.searchInput.company || viewModel.searchInput.position) && (
              <div className="mt-6 space-y-4">
                {viewModel.matchedApplications.map(app => (
                  <div 
                    key={app.id} 
                    className="bg-gray-800 rounded-lg overflow-hidden"
                  >
                    <div className="p-4">
                      <h3 className="text-lg font-medium text-white mb-1">{app.company}</h3>
                      <p className="text-sm text-gray-400 mb-2">{app.position}</p>
                      
                      {/* Available Stages */}
                      <div className="grid grid-cols-2 gap-1 p-1 bg-gray-750">
                        {viewModel.getAvailableStages(app.stage).map(stage => (
                          <button
                            key={stage}
                            onClick={async () => {
                              try {
                                viewModel.handleEmailUpdateApplication(app, stage, email);
                              } catch (error) {
                                console.error('Error processing email:', error);
                              }
                            }}
                            className="p-2 text-sm text-gray-200 hover:bg-gray-700 rounded-lg"
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
                    <p className="text-gray-400 mb-4">No matching applications found</p>
                    <button
                      onClick={() => {
                        viewModel.createNewApplication(email);
                        onClose();
                      }}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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