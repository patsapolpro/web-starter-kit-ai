import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  showCharCount?: boolean;
  currentLength?: number;
}

export function Textarea({
  label,
  error,
  showCharCount = false,
  currentLength = 0,
  className = '',
  maxLength,
  ...props
}: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
          {props.required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <textarea
          className={`w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 bg-white/50 backdrop-blur-sm resize-none ${
            error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-100' : ''
          } ${className}`}
          maxLength={maxLength}
          {...props}
        />
        {showCharCount && maxLength && (
          <div className="absolute bottom-2.5 right-3 text-xs text-gray-400 font-medium bg-white/80 px-1.5 py-0.5 rounded">
            <span>{currentLength}</span>/{maxLength}
          </div>
        )}
      </div>
      {error && (
        <div className="mt-2 p-3 bg-danger-50 border border-danger-200 rounded-xl">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-circle-exclamation text-danger-500 text-sm"></i>
            <span className="text-sm text-danger-700 font-medium">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}
