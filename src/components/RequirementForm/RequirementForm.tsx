'use client';

import React, { useState } from 'react';
import { Textarea } from '@/components/UI/Textarea';
import { Input } from '@/components/UI/Input';
import { Button } from '@/components/UI/Button';
import { validateDescription, validateEffort } from '@/lib/validation/requirementValidation';

interface RequirementFormProps {
  onAddRequirement: (description: string, effort: number) => void;
}

export function RequirementForm({ onAddRequirement }: RequirementFormProps) {
  const [description, setDescription] = useState('');
  const [effort, setEffort] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [effortError, setEffortError] = useState('');
  const [showErrors, setShowErrors] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowErrors(true);

    const descValidation = validateDescription(description);
    const effortValidation = validateEffort(effort);

    if (!descValidation.valid) {
      setDescriptionError(descValidation.error || '');
    } else {
      setDescriptionError('');
    }

    if (!effortValidation.valid) {
      setEffortError(effortValidation.error || '');
    } else {
      setEffortError('');
    }

    if (descValidation.valid && effortValidation.valid) {
      onAddRequirement(descValidation.value as string, effortValidation.value as number);
      setDescription('');
      setEffort('');
      setShowErrors(false);
      setDescriptionError('');
      setEffortError('');
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    if (showErrors) {
      const validation = validateDescription(e.target.value);
      setDescriptionError(validation.valid ? '' : validation.error || '');
    }
  };

  const handleEffortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEffort(e.target.value);
    if (showErrors) {
      const validation = validateEffort(e.target.value);
      setEffortError(validation.valid ? '' : validation.error || '');
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl px-10 py-8 shadow-xl mb-5">
      <h2 className="text-xl font-semibold text-gray-800 mb-5">Add New Requirement</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <Textarea
            label="Requirement Description"
            value={description}
            onChange={handleDescriptionChange}
            placeholder="Enter requirement description"
            maxLength={500}
            rows={3}
            error={descriptionError}
            showError={showErrors && !!descriptionError}
          />
        </div>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Input
              type="number"
              label="Effort"
              value={effort}
              onChange={handleEffortChange}
              placeholder="0.0"
              step="0.1"
              min="0.1"
              max="1000"
              error={effortError}
              showError={showErrors && !!effortError}
            />
          </div>
          <Button type="submit" size="medium">
            Add Requirement
          </Button>
        </div>
      </form>
    </div>
  );
}
