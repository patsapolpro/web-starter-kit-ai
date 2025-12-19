'use client';

import React, { useState } from 'react';
import type { Requirement } from '@/types/requirement';
import { Toggle } from '@/components/UI/Toggle';
import { validateDescription, validateEffort } from '@/lib/validation/requirementValidation';
import { useLanguage } from '@/hooks/useLanguage';

interface RequirementRowProps {
  requirement: Requirement;
  effortColumnVisible: boolean;
  onToggleStatus: () => void;
  onEdit: (updates: Partial<Requirement>) => void;
  onDelete: () => void;
}

export function RequirementRow({
  requirement,
  effortColumnVisible,
  onToggleStatus,
  onEdit,
  onDelete,
}: RequirementRowProps) {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [editDescription, setEditDescription] = useState(requirement.description);
  const [editEffort, setEditEffort] = useState(requirement.effort.toString());

  const handleEdit = () => {
    setEditDescription(requirement.description);
    setEditEffort(requirement.effort.toString());
    setIsEditing(true);
  };

  const handleSave = () => {
    // Validate
    const descValidation = validateDescription(editDescription);
    const effortValidation = validateEffort(editEffort);

    if (!descValidation.valid || !effortValidation.valid) {
      alert('Please fix validation errors');
      return;
    }

    // Save
    onEdit({
      description: descValidation.value,
      effort: effortValidation.value,
    });

    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditDescription(requirement.description);
    setEditEffort(requirement.effort.toString());
    setIsEditing(false);
  };

  return (
    <tr
      className={`group hover:bg-primary-50/50 transition-all duration-200 border-b border-gray-50/50 last:border-0 ${
        requirement.isActive ? '' : 'opacity-60 bg-gray-50/80'
      } ${isEditing ? 'bg-primary-50 ring-2 ring-inset ring-primary-200 z-10' : ''}`}
    >
      {/* Status Toggle */}
      <td className="px-5 lg:px-6 py-4 align-top w-24">
        {!isEditing ? (
          <Toggle checked={requirement.isActive} onChange={onToggleStatus} label="Toggle requirement status" />
        ) : (
          <span className="text-xs text-gray-400 font-medium ml-1">{t('form.editing')}</span>
        )}
      </td>

      {/* Description */}
      <td className="px-5 lg:px-6 py-4 align-top">
        {!isEditing ? (
          <p className="text-gray-800 font-medium text-sm lg:text-base leading-relaxed break-words">
            {requirement.description}
          </p>
        ) : (
          <div>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full px-4 py-3 text-sm lg:text-base border-2 border-primary-300 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all bg-white shadow-sm resize-none placeholder:text-gray-400"
              rows={3}
              maxLength={500}
              placeholder={t('form.descriptionPlaceholder')}
            />
            <div className="text-xs text-gray-400 mt-1.5 text-right font-medium">
              {editDescription.length}/500
            </div>
          </div>
        )}
      </td>

      {/* Effort */}
      {effortColumnVisible && (
        <td className="px-5 lg:px-6 py-4 align-top w-28">
          {!isEditing ? (
            <span className="inline-flex items-center px-3 py-1 bg-accent-100 text-accent-700 font-bold text-sm lg:text-base rounded-lg">
              {requirement.effort.toFixed(2)}
            </span>
          ) : (
            <input
              type="number"
              value={editEffort}
              onChange={(e) => setEditEffort(e.target.value)}
              className="w-full px-3 py-2 text-sm lg:text-base border-2 border-accent-300 rounded-xl focus:outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-100 transition-all bg-white shadow-sm"
              step="0.01"
              min="0"
              max="1000"
              placeholder="0.00"
            />
          )}
        </td>
      )}

      {/* Actions */}
      <td className="px-5 lg:px-6 py-4 text-right align-top w-40">
        {!isEditing ? (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={handleEdit}
              className="px-3 py-1.5 bg-white border border-gray-200 hover:border-primary-300 text-gray-600 hover:text-primary-600 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow opacity-80 group-hover:opacity-100 transform hover:scale-105 active:scale-95"
            >
              <i className="fa-solid fa-pen text-xs"></i>
              <span className="text-xs lg:text-sm font-medium hidden sm:inline">{t('form.editButton')}</span>
            </button>
            <button
              onClick={onDelete}
              className="px-3 py-1.5 bg-white border border-gray-200 hover:border-danger-300 text-gray-600 hover:text-danger-600 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow opacity-80 group-hover:opacity-100 transform hover:scale-105 active:scale-95"
            >
              <i className="fa-solid fa-trash text-xs"></i>
              <span className="text-xs lg:text-sm font-medium hidden sm:inline">{t('form.deleteButton')}</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 items-end">
            <button
              onClick={handleSave}
              className="w-full px-3 py-2 bg-success-500 hover:bg-success-600 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
            >
              <i className="fa-solid fa-check text-xs"></i>
              <span className="text-sm font-bold">{t('form.saveButton')}</span>
            </button>
            <button
              onClick={handleCancel}
              className="w-full px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow"
            >
              <i className="fa-solid fa-xmark text-xs"></i>
              <span className="text-sm font-medium">{t('form.cancelButton')}</span>
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
