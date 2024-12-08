// src/views/components/EmailProcessingModal/EmailContent.tsx
import { observer } from 'mobx-react-lite';

interface EmailContentProps {
  subject: string;
  body: string;
  isBodyExpanded: boolean;
  onToggleBody: () => void;
}

export const EmailContent = observer(({ subject, body, isBodyExpanded, onToggleBody }: EmailContentProps) => (
  <div 
    className="
      p-6 border-b border-[#232732]/20 bg-[#1a1d24]
      shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
    "
  >
    <h3 className="text-lg font-medium text-white mb-3">{subject}</h3>
    <div className="relative">
      <p className={`text-gray-300 text-sm leading-relaxed transition-all duration-200 ${!isBodyExpanded ? 'line-clamp-3' : ''}`}>
        {body}
      </p>
      {body.length > 150 && (
        <button
          onClick={onToggleBody}
          className="
            text-blue-400 text-sm hover:text-blue-300 mt-2 transition-colors duration-200 underline
          "
        >
          {isBodyExpanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  </div>
));
