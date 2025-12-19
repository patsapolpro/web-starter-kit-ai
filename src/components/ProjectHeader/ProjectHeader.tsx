'use client';

import React, { useState } from 'react';
import { Input } from '@/components/UI/Input';
import { Button } from '@/components/UI/Button';
import { validateProjectName } from '@/lib/validation/projectValidation';

interface ProjectHeaderProps {
  projectName: string;
  onProjectNameUpdate: (newName: string) => void;
  onClearAllClick: () => void;
}

export function ProjectHeader({
  projectName,
  onProjectNameUpdate,
  onClearAllClick,
}: ProjectHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(projectName);
  const [error, setError] = useState('');

  const handleEditClick = () => {
    setEditValue(projectName);
    setError('');
    setIsEditing(true);
  };

  const handleSave = () => {
    const validation = validateProjectName(editValue);
    if (!validation.valid) {
      setError(validation.error || '');
      return;
    }

    onProjectNameUpdate(editValue);
    setIsEditing(false);
    setError('');
  };

  const handleCancel = () => {
    setEditValue(projectName);
    setError('');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl px-8 py-6 shadow-xl mb-5">
      <div className="flex items-center justify-between flex-wrap gap-5">
        {!isEditing ? (
          <div
            className="flex items-center gap-3 cursor-pointer hover:bg-[#667eea]/10 px-3 py-2 rounded-lg transition-all group"
            onClick={handleEditClick}
          >
            <h1 className="text-3xl font-bold text-gray-800">{projectName}</h1>
            <span className="text-xl opacity-50 group-hover:opacity-100 transition-opacity">✏️</span>
          </div>
        ) : (
          <div className="flex items-center gap-3 flex-1 max-w-2xl">
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Project name"
              maxLength={100}
              error={error}
              showError={!!error}
              className="flex-1"
              autoFocus
            />
            <Button onClick={handleSave} size="small">
              Save
            </Button>
            <Button onClick={handleCancel} variant="secondary" size="small">
              Cancel
            </Button>
          </div>
        )}

        <button
          onClick={onClearAllClick}
          className="px-5 py-2.5 bg-white text-red-600 border-2 border-red-200 rounded-lg text-sm font-semibold hover:bg-red-50 hover:border-red-300 transition-all"
        >
          🗑️ Clear All Data
        </button>
      </div>
    </div>
  );
}
