import React from 'react';
import { AlertCircle } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { AddApplicationViewModel } from '../viewModels/AddApplicationViewModel';

interface InputFieldProps {
  id: keyof AddApplicationViewModel['formData'];
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  required?: boolean;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  error?: string;
}

const InputField: React.FC<InputFieldProps> = observer(({
  id,
  label,
  icon: Icon,
  required = false,
  type,
  value,
  onChange,
  placeholder,
  error = '',
}) => (
  <div className="relative" id={id}>
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${error ? 'text-red-400' : 'text-gray-400'}`} />
        <label className="text-sm font-medium text-gray-400">
          {label} {required && <span className="text-blue-400">*</span>}
        </label>
      </div>
    </div>
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3 bg-[#282c34] rounded-xl text-white
                  border ${error 
                    ? 'border-red-500/50 focus:ring-red-500/30 focus:border-red-500/30' 
                    : 'border-gray-800/50 focus:ring-blue-500/30 focus:border-blue-500/30'
                  }
                  transition-all duration-200
                  placeholder:text-gray-500
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

export default React.memo(InputField);
