import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  label?: string;
}

export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <div
      className="flex items-center gap-3 cursor-pointer select-none"
      onClick={onChange}
    >
      {label && <span className="text-gray-700 text-sm font-medium">{label}</span>}
      <div
        className={`
          w-12 h-6 rounded-full relative transition-all duration-300
          ${checked ? 'bg-[#667eea]' : 'bg-gray-300'}
        `}
      >
        <div
          className={`
            absolute top-0.5 w-5 h-5 bg-white rounded-full
            shadow-md transition-all duration-300
            ${checked ? 'left-[26px]' : 'left-0.5'}
          `}
        />
      </div>
    </div>
  );
}
