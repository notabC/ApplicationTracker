// TextArea.tsx
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { AddApplicationViewModel } from '@/viewModels/AddApplicationViewModel';

interface TextAreaProps {
  id: keyof AddApplicationViewModel['formData'];
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  error?: string;
}

const TextArea: React.FC<TextAreaProps> = observer(({
  id,
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  error = '',
}) => (
  <div className="relative space-y-2" id={id}>
    <div className="flex items-center gap-2">
      <Icon className={`h-4 w-4 ${error ? 'text-red-400' : 'text-gray-400'}`} />
      <label className="text-sm font-medium text-gray-400">{label}</label>
    </div>
    <div className="relative">
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`
          w-full px-4 py-3 rounded-xl text-white h-24 resize-none
          bg-[#1a1d24] border transition-all duration-200 placeholder:text-gray-500
          shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
          ${error 
            ? 'border-red-500/50 focus:ring-red-500/30 focus:border-red-500/30 pr-10' 
            : 'border-[#232732]/20 focus:ring-blue-500/30 focus:border-blue-500/30'
          }
        `}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <AlertCircle className="h-5 w-5 text-red-400" />
        </div>
      )}
    </div>
    {error && (
      <div className="-mt-1">
        <p 
          className="
            text-xs text-red-400 bg-red-500/10 px-3 py-1 rounded-lg inline-block
            shadow-[inset_2px_2px_4px_#111316,inset_-2px_-2px_4px_#232732]
          "
          id={`${id}-error`}
          role="alert"
        >
          {error}
        </p>
      </div>
    )}
  </div>
));

export default React.memo(TextArea);
