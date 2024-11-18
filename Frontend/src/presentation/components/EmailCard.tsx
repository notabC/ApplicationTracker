// src/presentation/components/EmailCard/EmailCard.tsx
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
      className="bg-gray-750 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-700 transition-colors"
    >
      <div className="p-4">
        <div className="flex items-start gap-3 mb-2">
          <Mail className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
          <div className="min-w-0">
            <h4 className="text-white font-medium text-sm truncate">{email.subject}</h4>
            <p className="text-gray-400 text-sm mt-1 truncate">{email.body}</p>
          </div>
        </div>
        <div className="flex justify-end items-center">
          <div className="flex items-center text-xs text-gray-400">
            <Clock className="h-3 w-3 mr-1" />
            {email.date}
          </div>
        </div>
      </div>
    </div>
  );
});