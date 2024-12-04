// src/views/components/gmailImportModal/EmailItem.tsx
import React from 'react';
import { ChevronRight } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { IGmailEmail } from '@/core/interfaces/services/IGmailService';
import { GmailImportViewModel } from '../../../viewModels/GmailImportViewModel';

interface EmailItemProps {
  email: IGmailEmail;
  viewModel: GmailImportViewModel;
}

const EmailItem: React.FC<EmailItemProps> = observer(({ email, viewModel }) => (
  <div
    key={email.id}
    className="bg-[#282c34] rounded-xl border border-gray-800/50
               hover:border-gray-700/50 transition-all duration-200
               mb-4"
  >
    <div className="p-4">
      <div className="flex items-start gap-4">
        <input
          type="checkbox"
          checked={viewModel.selectedEmails.has(email.id)}
          onChange={() => viewModel.toggleEmailSelection(email.id)}
          className="mt-1.5 w-5 h-5 rounded-lg border-gray-700 text-blue-500 
                   focus:ring-blue-500/30 bg-gray-800"
        />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-3">
            <h4 className="text-sm font-medium text-white leading-snug">
              {email.subject}
            </h4>
            <button
              onClick={() => viewModel.toggleEmailExpansion(email.id)}
              className="p-2 hover:bg-gray-700/50 rounded-lg shrink-0"
            >
              <ChevronRight
                className={`h-5 w-5 text-gray-400 transform transition-transform
                duration-200 ${
                  viewModel.expandedEmails.has(email.id) ? 'rotate-90' : ''
                }`}
              />
            </button>
          </div>
          <div className="flex flex-col gap-1 mt-2">
            <span className="text-xs text-gray-400">{email.sender}</span>
            <span className="text-xs text-gray-500">{email.date}</span>
          </div>
          <div className="mt-2 text-xs text-gray-300 line-clamp-2 leading-relaxed">
            {email.body}
          </div>
        </div>
      </div>
    </div>

    {viewModel.expandedEmails.has(email.id) && (
      <div className="px-4 pb-4 border-t border-gray-800/50 mt-2">
        <div className="bg-[#1a1d24] rounded-xl p-4 mt-4">
          <p className="text-sm text-gray-300 whitespace-pre-line break-words leading-relaxed">
            {email.body}
          </p>
        </div>
      </div>
    )}
  </div>
));

export default EmailItem;
