import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  showError?: boolean;
}

export function Textarea({
  label,
  error,
  showError = false,
  className = '',
  ...props
}: TextareaProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-gray-700 font-semibold text-sm">
          {label}
        </label>
      )}
      <textarea
        className={`
          px-4 py-3 border-2 rounded-xl text-base text-black
          transition-all duration-300 resize-vertical
          focus:outline-none focus:border-[#667eea] focus:ring-4 focus:ring-[#667eea]/10
          ${showError && error ? 'border-red-500' : 'border-gray-200'}
          ${className}
        `}
        {...props}
      />
      {showError && error && (
        <span className="text-red-600 text-sm">{error}</span>
      )}
    </div>
  );
}
