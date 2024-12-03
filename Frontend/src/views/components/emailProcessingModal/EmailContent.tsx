// src/views/components/EmailProcessingModal/EmailContent.tsx
import { observer } from 'mobx-react-lite';

interface EmailContentProps {
  subject: string;
  body: string;
  isBodyExpanded: boolean;
  onToggleBody: () => void;
}

export const EmailContent = observer(({ subject, body, isBodyExpanded, onToggleBody }: EmailContentProps) => (
  <div className="p-6 border-b border-gray-800/50 bg-[#20242b]">
    <h3 className="text-lg font-medium text-white mb-3">{subject}</h3>
    <div className="relative">
      <p className={`text-gray-300 text-sm leading-relaxed ${!isBodyExpanded ? 'line-clamp-3' : ''}`}>
        {body}
      </p>
      {body.length > 150 && (
        <button
          onClick={onToggleBody}
          className="text-blue-400 text-sm hover:text-blue-300 mt-2 transition-colors duration-200"
        >
          {isBodyExpanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  </div>
));
