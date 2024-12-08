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
        <div 
          key={app.id} 
          className="
            bg-[#1a1d24] rounded-xl border border-[#232732]/20 overflow-hidden 
            shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]
            hover:shadow-[6px_6px_12px_#111316,-6px_-6px_12px_#232732]
            hover:border-cyan-500/30
            transition-all duration-200
          "
        >
          <div className="p-3">
            <h3 className="text-lg font-medium text-white mb-1">{app.company}</h3>
            <p className="text-sm text-gray-400 mb-3">{app.position}</p>
            <div className="flex flex-col sm:grid sm:grid-cols-2 gap-2">
              {availableStages(app.stage).map(stage => (
                <button
                  key={stage}
                  onClick={() => onUpdateApplication(app, stage, email)}
                  className="
                    px-4 py-2.5 text-sm text-gray-300
                    bg-[#1a1d24] border border-[#232732]/20 rounded-lg
                    shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]
                    hover:shadow-[6px_6px_12px_#111316,-6px_-6px_12px_#232732]
                    hover:border-cyan-500/30
                    hover:text-gray-200
                    transition-all duration-200
                    break-words
                  "
                >
                  Move to {stage}
                </button>
              ))}
            </div>
          </div>
        </div>
      ))
    ) : (
      <div className="text-center py-6 px-4">
        <div 
          className="
            inline-flex p-3 bg-blue-500/10 rounded-xl mb-4
            shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
          "
        >
          <Search className="h-6 w-6 text-blue-400" />
        </div>
        <p className="text-gray-400 mb-4">No matching applications found</p>
        <button
          onClick={() => onCreateNew(email)}
          className="
            w-full sm:w-auto px-6 py-2.5 bg-blue-500/10 text-blue-400 rounded-xl 
            border border-blue-500/20
            shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]
            hover:bg-blue-500/20 hover:border-blue-500/30
            hover:shadow-[6px_6px_12px_#111316,-6px_-6px_12px_#232732]
            active:shadow-[inset_4px_4px_8px_#111316,inset_-4px_-4px_8px_#232732]
            transition-all duration-200
          "
        >
          Create New Application
        </button>
      </div>
    )}
  </div>
);