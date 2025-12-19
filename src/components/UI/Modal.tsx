'use client';

import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  variant?: 'danger' | 'warning' | 'info';
  icon?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  variant = 'info',
  icon = '⚠️',
}: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-2xl p-10 max-w-md w-full shadow-2xl animate-scale-in">
        <div className="text-center">
          <div className="text-5xl mb-5">{icon}</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">{title}</h3>
          <p className="text-gray-600 text-base leading-relaxed mb-8">{message}</p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white text-gray-600 border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-all"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`
                flex-1 px-6 py-3 rounded-xl font-semibold transition-all
                ${variant === 'danger' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:shadow-lg text-white'}
              `}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
