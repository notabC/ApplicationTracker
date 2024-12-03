// src/views/components/EmailProcessingModal/MatchedApplications.tsx
import React from 'react';
import { Search } from 'lucide-react';
import type { Email } from '@/core/interfaces/services/IEmailService';
import { Application } from '@/core/domain/models/Application';

interface MatchedApplicationsProps {
  applications: Application[];
  availableStages: (stage: string) => string[];
  onUpdateApplication: (app: Application, stage: string, email: Email) => void;
  onCreateNew: (email: Email) => void;
  email: Email;
}

export const MatchedApplications: React.FC<MatchedApplicationsProps> = ({
  applications,
  availableStages,
  onUpdateApplication,
  onCreateNew,
  email
}) => (
  <div className="space-y-4">
    {applications.length > 0 ? (
      applications.map(app => (
        <div key={app.id} className="bg-[#20242b] rounded-xl border border-gray-800/50 overflow-hidden hover:border-gray-700/50 transition-all duration-200">
          <div className="p-4">
            <h3 className="text-lg font-medium text-white mb-1">{app.company}</h3>
            <p className="text-sm text-gray-400 mb-3">{app.position}</p>
            <div className="grid grid-cols-2 gap-2">
              {availableStages(app.stage).map(stage => (
                <button
                  key={stage}
                  onClick={() => onUpdateApplication(app, stage, email)}
                  className="px-4 py-2 text-sm text-gray-300 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 hover:border-gray-600/50 rounded-lg transition-all duration-200"
                >
                  Move to {stage}
                </button>
              ))}
            </div>
          </div>
        </div>
      ))
    ) : (
      <div className="text-center py-8">
        <div className="inline-flex p-3 bg-blue-500/10 rounded-xl mb-4">
          <Search className="h-6 w-6 text-blue-400" />
        </div>
        <p className="text-gray-400 mb-4">No matching applications found</p>
        <button
          onClick={() => onCreateNew(email)}
          className="px-6 py-2.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-xl border border-blue-500/20 hover:border-blue-500/30 transition-all duration-200"
        >
          Create New Application
        </button>
      </div>
    )}
  </div>
);