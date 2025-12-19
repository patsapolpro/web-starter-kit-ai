'use client';

import React, { useState } from 'react';
import { validateProjectName } from '@/lib/validation/projectValidation';
import { useLanguage } from '@/hooks/useLanguage';
import { LanguageToggle } from '@/components/LanguageToggle/LanguageToggle';

interface ProjectHeaderProps {
  projectName: string;
  onProjectNameUpdate: (newName: string) => void;
  onClearAllClick: () => void;
  onToggleEffortVisibility: () => void;
  effortColumnVisible: boolean;
}

export function ProjectHeader({
  projectName,
  onProjectNameUpdate,
  onClearAllClick,
  onToggleEffortVisibility,
  effortColumnVisible,
}: ProjectHeaderProps) {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(projectName);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleEdit = () => {
    setEditValue(projectName);
    setIsEditing(true);
  };

  const handleSave = () => {
    const validation = validateProjectName(editValue);
    if (validation.valid && validation.value) {
      onProjectNameUpdate(validation.value);
      setIsEditing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(projectName);
    }
  };

  return (
    <header className="z-20 glass border-b border-white/50 shadow-soft sticky top-0">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3 lg:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo and Project Name */}
          <div className="flex items-center min-w-0 flex-1">
            <div className="w-10 h-10 lg:w-11 lg:h-11 bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600 rounded-xl flex items-center justify-center mr-3 shadow-glow flex-shrink-0">
              <i className="fa-solid fa-clipboard-list text-white text-lg"></i>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <>
                    <span className="text-base lg:text-lg font-bold text-gray-800 truncate max-w-[200px] sm:max-w-[300px] lg:max-w-none">
                      {projectName}
                    </span>
                    <button
                      onClick={handleEdit}
                      className="text-gray-400 hover:text-primary-600 transition-colors p-1.5 hover:bg-primary-50 rounded-lg flex-shrink-0"
                    >
                      <i className="fa-solid fa-pen text-xs"></i>
                    </button>
                  </>
                ) : (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={handleKeyPress}
                    className="text-base lg:text-lg font-bold text-gray-800 border-2 border-primary-500 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-200"
                    maxLength={100}
                    autoFocus
                  />
                )}
              </div>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            <LanguageToggle />

            <button
              onClick={onToggleEffortVisibility}
              className="px-3 lg:px-4 py-2 bg-white/80 border border-gray-200 rounded-xl text-gray-700 hover:bg-white hover:border-gray-300 hover:shadow-soft transition-smooth flex items-center gap-2 text-sm font-medium"
            >
              <i className={`fa-solid ${effortColumnVisible ? 'fa-eye' : 'fa-eye-slash'} text-gray-500`}></i>
              <span className="hidden lg:inline">{effortColumnVisible ? t('header.hideEffort') : t('header.showEffort')}</span>
            </button>

            <button
              onClick={onClearAllClick}
              className="px-4 lg:px-5 py-2 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl hover:from-primary-700 hover:to-accent-700 transition-smooth flex items-center gap-2 text-sm font-semibold shadow-glow hover:shadow-glow-lg"
            >
              <i className="fa-solid fa-plus"></i>
              <span>{t('header.newProject')}</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <i className="fa-solid fa-ellipsis-vertical text-lg"></i>
          </button>
        </div>

        {/* Mobile Actions */}
        {showMobileMenu && (
          <div className="md:hidden mt-3 pt-3 border-t border-gray-200/50 space-y-2">
            <div className="flex justify-center mb-2">
              <LanguageToggle />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onToggleEffortVisibility();
                  setShowMobileMenu(false);
                }}
                className="px-3 py-2.5 bg-white/80 border border-gray-200 rounded-xl text-gray-700 flex items-center justify-center gap-2 text-sm font-medium"
              >
                <i className={`fa-solid ${effortColumnVisible ? 'fa-eye' : 'fa-eye-slash'} text-gray-500`}></i>
                <span>{effortColumnVisible ? t('header.hideEffort') : t('header.showEffort')}</span>
              </button>
              <button
                onClick={() => {
                  onClearAllClick();
                  setShowMobileMenu(false);
                }}
                className="px-3 py-2.5 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl flex items-center justify-center gap-2 text-sm font-semibold"
              >
                <i className="fa-solid fa-plus"></i>
                <span>{t('header.newProject')}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
