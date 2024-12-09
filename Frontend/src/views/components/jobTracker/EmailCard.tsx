import React from 'react';
import { observer } from 'mobx-react-lite';
import { Mail, Clock } from 'lucide-react';
import { Email } from '@/domain/interfaces/IEmailService';
import { JobTrackerViewModel } from '../../../viewModels/JobTrackerViewModel';

interface Props {
  email: Email;
  onClick: () => void;
  viewModel: JobTrackerViewModel;
}

export const EmailCard: React.FC<Props> = observer(({ email, onClick, viewModel }) => {
  return (
    <div
      onClick={onClick}
      className="group 
                bg-gradient-to-br from-[#1e2128] to-[#16181d]
                rounded-xl p-4
                shadow-[8px_8px_16px_#111316,-8px_-8px_16px_#232732]
                hover:shadow-[12px_12px_24px_#111316,-12px_-12px_24px_#232732]
                active:shadow-[inset_8px_8px_16px_#111316,inset_-8px_-8px_16px_#232732]
                border border-[#232732]/10
                transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="bg-gradient-to-br from-[#1c1f26] to-[#15171c] p-2 rounded-lg flex-shrink-0
                     shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
                     border border-[#232732]/10">
          <Mail className="h-4 w-4 text-cyan-400" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-white/90 font-medium text-sm truncate leading-tight">
            {email.subject}
          </h4>
          <p className="text-gray-400 text-sm mt-1.5 truncate leading-relaxed">
            {email.body}
          </p>
        </div>
      </div>
      <div className="flex justify-end items-center">
        <div className="flex items-center text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
          <Clock className="h-3 w-3 mr-1" />
           {viewModel.formatRelativeTime(email.date)}
        </div>
      </div>
    </div>
  );
});