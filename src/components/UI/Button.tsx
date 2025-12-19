import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseClasses = 'font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2';

  const variantClasses = {
    primary: 'bg-gradient-to-r from-primary-600 via-primary-600 to-accent-600 hover:from-primary-700 hover:via-primary-700 hover:to-accent-700 text-white shadow-glow hover:shadow-glow-lg',
    secondary: 'bg-white border border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm hover:shadow',
    danger: 'bg-danger-600 hover:bg-danger-700 text-white shadow-sm hover:shadow-lg',
    success: 'bg-success-500 hover:bg-success-600 text-white shadow-md hover:shadow-lg',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-3 text-base',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
