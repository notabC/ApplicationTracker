// src/views/components/gmailImportModal/EmailItem.tsx
import React from 'react';
import { ChevronRight } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { IGmailEmail } from '@/domain/interfaces/IGmailService';
import { GmailImportViewModel } from '../../../viewModels/GmailImportViewModel';

interface EmailItemProps {
  email: IGmailEmail;
  viewModel: GmailImportViewModel;
}

const EmailItem: React.FC<EmailItemProps> = observer(({ email, viewModel }) => (
  <div
    key={email.id}
    className="
      bg-[#1a1d24] rounded-xl border border-[#232732]/20 mb-4
      shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]
      hover:shadow-[6px_6px_12px_#111316,-6px_-6px_12px_#232732]
      hover:border-cyan-500/30
      transition-all duration-200
    "
  >
    <div className="p-4">
      <div className="flex items-start gap-4">
        <input
          type="checkbox"
          checked={viewModel.selectedEmails.has(email.id)}
          onChange={() => viewModel.toggleEmailSelection(email.id)}
          className="
            mt-1.5 w-5 h-5 rounded-lg border-[#232732]/20 text-blue-500 
            focus:ring-blue-500/30 bg-[#1a1d24]
            shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
            transition-all duration-200
          "
        />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-3">
            <h4 className="text-sm font-medium text-white leading-snug">{email.subject}</h4>
            <button
              onClick={() => viewModel.toggleEmailExpansion(email.id)}
              className="
                p-2 rounded-lg
                bg-[#1a1d24] border border-[#232732]/20
                shadow-[4px_4px_8px_#111316,-4px_-4px_8px_#232732]
                hover:shadow-[6px_6px_12px_#111316,-6px_-6px_12px_#232732]
                active:shadow-[inset_4px_4px_8px_#111316,inset_-4px_-4px_8px_#232732]
                hover:border-cyan-500/30
                transition-all duration-200 shrink-0
              "
            >
              <ChevronRight
                className={`
                  h-5 w-5 text-gray-400 transform transition-transform duration-200
                  ${viewModel.expandedEmails.has(email.id) ? 'rotate-90' : ''}
                `}
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
      <div className="px-4 pb-4 border-t border-[#232732]/20 mt-2">
        <div className="
          bg-[#1a1d24] rounded-xl p-4 mt-4
          border border-[#232732]/20
          shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
          transition-all duration-200
        ">
          <p className="text-sm text-gray-300 whitespace-pre-line break-words leading-relaxed">
            {email.body}
          </p>
        </div>
      </div>
    )}
  </div>
));

export default EmailItem;
