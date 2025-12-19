import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'medium',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'font-semibold rounded-xl transition-all duration-300 ease-in-out';

  const variantClasses = {
    primary: 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white hover:shadow-lg hover:-translate-y-0.5',
    secondary: 'bg-white text-gray-600 border-2 border-gray-200 hover:bg-gray-50',
    danger: 'bg-white text-red-600 border-2 border-red-200 hover:bg-red-50 hover:border-red-300',
  };

  const sizeClasses = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg',
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
