import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  showError?: boolean;
}

export function Input({
  label,
  error,
  showError = false,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-gray-700 font-semibold text-sm">
          {label}
        </label>
      )}
      <input
        className={`
          px-4 py-3 border-2 rounded-xl text-base text-black
          transition-all duration-300
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
