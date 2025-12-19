'use client';

import React, { useState } from 'react';
import type { Requirement } from '@/types/requirement';
import { Textarea } from '@/components/UI/Textarea';
import { Input } from '@/components/UI/Input';
import { Button } from '@/components/UI/Button';
import { validateDescription, validateEffort } from '@/lib/validation/requirementValidation';

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
  const [isEditing, setIsEditing] = useState(false);
  const [editDescription, setEditDescription] = useState(requirement.description);
  const [editEffort, setEditEffort] = useState(requirement.effort.toString());
  const [descriptionError, setDescriptionError] = useState('');
  const [effortError, setEffortError] = useState('');

  const handleEdit = () => {
    setEditDescription(requirement.description);
    setEditEffort(requirement.effort.toString());
    setDescriptionError('');
    setEffortError('');
    setIsEditing(true);
  };

  const handleSave = () => {
    const descValidation = validateDescription(editDescription);
    const effortValidation = validateEffort(editEffort);

    if (!descValidation.valid) {
      setDescriptionError(descValidation.error || '');
      return;
    }
    if (!effortValidation.valid) {
      setEffortError(effortValidation.error || '');
      return;
    }

    onEdit({
      description: descValidation.value as string,
      effort: effortValidation.value as number,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setDescriptionError('');
    setEffortError('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <tr className="border-b border-gray-200 bg-gray-50">
        <td className="px-3 py-4">
          <input
            type="checkbox"
            checked={requirement.isActive}
            disabled
            className="w-5 h-5 cursor-not-allowed accent-[#667eea]"
          />
        </td>
        <td colSpan={3} className="px-3 py-4">
          <div className="flex gap-3 items-start">
            <div className="flex-1">
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={500}
                rows={2}
                error={descriptionError}
                showError={!!descriptionError}
              />
            </div>
            <div className="w-28">
              <Input
                type="number"
                value={editEffort}
                onChange={(e) => setEditEffort(e.target.value)}
                onKeyDown={handleKeyDown}
                step="0.1"
                min="0.1"
                max="1000"
                error={effortError}
                showError={!!effortError}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} size="small">
                Save
              </Button>
              <Button onClick={handleCancel} variant="secondary" size="small">
                Cancel
              </Button>
            </div>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr
      className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
        !requirement.isActive ? 'opacity-50' : ''
      }`}
    >
      <td className="px-3 py-4 w-12">
        <input
          type="checkbox"
          checked={requirement.isActive}
          onChange={onToggleStatus}
          className="w-5 h-5 cursor-pointer accent-[#667eea]"
        />
      </td>
      <td className="px-3 py-4 text-gray-800 break-words">{requirement.description}</td>
      {effortColumnVisible && (
        <td className="px-3 py-4 text-gray-800 w-28">{requirement.effort.toFixed(2)}</td>
      )}
      <td className="px-3 py-4 w-36">
        <div className="flex gap-2">
          <button
            onClick={handleEdit}
            className="px-3 py-1.5 bg-gray-100 text-[#667eea] rounded-lg text-sm font-semibold hover:bg-blue-50 transition-all"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 transition-all"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
