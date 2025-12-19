import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  label?: string;
}

export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 shadow-sm hover:shadow ${
        checked ? 'bg-success-500 hover:bg-success-600' : 'bg-gray-300 hover:bg-gray-400'
      }`}
      aria-label={label}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}
