// src/views/components/gmailImportModal/EmailList.tsx
import React from 'react';
import { observer } from 'mobx-react-lite';
import EmailItem from './EmailItem';
import { GmailImportViewModel } from '../../../viewModels/GmailImportViewModel';

interface EmailListProps {
  viewModel: GmailImportViewModel;
}

const EmailList: React.FC<EmailListProps> = observer(({ viewModel }) => (
  <div className="flex-1 overflow-y-auto p-4 space-y-6 relative">
    <div
      className={
        viewModel.loadingState.isLoading
          ? 'opacity-50 pointer-events-none transition-opacity duration-200'
          : ''
      }
    >
      {viewModel.emails.map((email) => (
        <EmailItem key={email.id} email={email} viewModel={viewModel} />
      ))}
    </div>

    {viewModel.emails.length === 0 && !viewModel.loadingState.isLoading && (
      <div className="text-center py-12">
        <p className="text-gray-400">No emails found matching your criteria</p>
      </div>
    )}
  </div>
));

export default EmailList;
