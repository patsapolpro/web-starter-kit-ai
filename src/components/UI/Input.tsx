import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
          {props.required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          className={`w-full ${icon ? 'pl-12' : 'pl-4'} pr-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 bg-white/50 backdrop-blur-sm ${
            error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-100' : ''
          } ${className}`}
          {...props}
        />
      </div>
      {error && (
        <div className="mt-2 p-3 bg-danger-50 border border-danger-200 rounded-lg">
          <div className="flex items-start">
            <i className="fa-solid fa-circle-exclamation text-danger-500 mt-0.5 mr-2"></i>
            <span className="text-sm text-danger-700 font-medium">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}
