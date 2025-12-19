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
}

export function Modal({
  isOpen,
  onClose,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  variant = 'warning',
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

  const variantStyles = {
    danger: {
      icon: 'fa-trash',
      iconBg: 'from-danger-100 to-danger-200',
      iconColor: 'text-danger-600',
      buttonBg: 'bg-danger-600 hover:bg-danger-700',
    },
    warning: {
      icon: 'fa-exclamation-triangle',
      iconBg: 'from-warning-100 to-warning-200',
      iconColor: 'text-warning-600',
      buttonBg: 'bg-gradient-to-r from-danger-500 to-danger-600 hover:from-danger-600 hover:to-danger-700',
    },
    info: {
      icon: 'fa-info-circle',
      iconBg: 'from-primary-100 to-primary-200',
      iconColor: 'text-primary-600',
      buttonBg: 'bg-primary-600 hover:bg-primary-700',
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="bg-white rounded-2xl lg:rounded-3xl shadow-2xl max-w-md w-full p-6 lg:p-8 transform transition-all animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 mb-6">
          <div
            className={`w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br ${style.iconBg} rounded-xl lg:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-soft`}
          >
            <i className={`fa-solid ${style.icon} ${style.iconColor} text-xl lg:text-2xl`} aria-hidden="true"></i>
          </div>
          <div>
            <h3 id="modal-title" className="text-lg lg:text-xl font-bold text-gray-800 mb-2">
              {title}
            </h3>
            <p className="text-sm lg:text-base text-gray-600 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-smooth"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-3 ${style.buttonBg} text-white font-semibold rounded-xl transition-smooth shadow-soft hover:shadow-soft-lg`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
