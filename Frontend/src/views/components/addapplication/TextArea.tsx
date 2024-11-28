import React from 'react';
import { AlertCircle } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { AddApplicationViewModel } from '@/viewmodels/addapplication/AddApplicationViewModel';

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
  <div className="relative" id={id}>
    <div className="flex items-center gap-2 mb-2">
      <Icon className={`h-4 w-4 ${error ? 'text-red-400' : 'text-gray-400'}`} />
      <label className="text-sm font-medium text-gray-400">{label}</label>
    </div>
    <div className="relative">
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-3 bg-[#282c34] rounded-xl text-white
                 border ${error 
                   ? 'border-red-500/50 focus:ring-red-500/30 focus:border-red-500/30' 
                   : 'border-gray-800/50 focus:ring-blue-500/30 focus:border-blue-500/30'
                 }
                 transition-all duration-200
                 placeholder:text-gray-500
                 h-24 resize-none
                 ${error ? 'pr-10' : ''}`}
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
      <div className="absolute -bottom-6 left-0 right-0">
        <p 
          className="text-xs text-red-400 bg-red-500/10 px-3 py-1 rounded-lg inline-block"
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
