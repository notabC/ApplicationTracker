import React from 'react';
import { observer } from 'mobx-react-lite';
import { Mail, Clock } from 'lucide-react';
import { Email } from '@/core/interfaces/services/IEmailService';

interface Props {
  email: Email;
  onClick: () => void;
}

export const EmailCard: React.FC<Props> = observer(({ email, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="group bg-[#282c34] rounded-lg overflow-hidden cursor-pointer
                 border border-gray-800/50 hover:border-gray-700/50
                 hover:bg-[#2d313a] transition-all duration-200"
    >
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="bg-blue-500/10 p-2 rounded-lg">
            <Mail className="h-4 w-4 text-blue-400 flex-shrink-0" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-white font-medium text-sm truncate leading-tight">
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
            {email.date}
          </div>
        </div>
      </div>
    </div>
  );
});