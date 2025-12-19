'use client';

import React, { useState } from 'react';
import { Textarea } from '@/components/UI/Textarea';
import { Button } from '@/components/UI/Button';
import { validateDescription, validateEffort } from '@/lib/validation/requirementValidation';
import { useLanguage } from '@/hooks/useLanguage';

interface RequirementFormProps {
  onAddRequirement: (description: string, effort: number) => void;
}

export function RequirementForm({ onAddRequirement }: RequirementFormProps) {
  const { t } = useLanguage();
  const [description, setDescription] = useState('');
  const [effort, setEffort] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [effortError, setEffortError] = useState('');

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Clear previous errors
    setDescriptionError('');
    setEffortError('');

    // Validate description
    const descValidation = validateDescription(description);
    if (!descValidation.valid) {
      setDescriptionError(descValidation.error || '');
      return;
    }

    // Validate effort
    const effortValidation = validateEffort(effort);
    if (!effortValidation.valid) {
      setEffortError(effortValidation.error || '');
      return;
    }

    // Both validations passed
    if (descValidation.value && effortValidation.value !== undefined) {
      onAddRequirement(descValidation.value, effortValidation.value);

      // Clear form
      setDescription('');
      setEffort('');
    }
  };

  return (
    <section className="animate-fade-in-up-delay-3">
      <div className="glass rounded-2xl lg:rounded-3xl shadow-soft-lg p-5 lg:p-6 border border-white/60">
        {/* Section Header */}
        <div className="flex items-center mb-5">
          <div className="w-10 h-10 lg:w-11 lg:h-11 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center mr-3 shadow-glow">
            <i className="fa-solid fa-plus text-white text-sm lg:text-base"></i>
          </div>
          <div>
            <h2 className="text-lg lg:text-xl font-bold text-gray-800">{t('form.addTitle')}</h2>
            <p className="text-xs lg:text-sm text-gray-500 mt-0.5">{t('form.addSubtitle')}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Description Field */}
          <div>
            <label htmlFor="requirement-description" className="text-xs lg:text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
              <i className="fa-solid fa-file-lines text-primary-500 text-xs"></i>
              {t('form.descriptionLabel')}
              <span className="text-danger-500">{t('form.required')}</span>
            </label>
            <Textarea
              id="requirement-description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setDescriptionError('');
              }}
              rows={3}
              maxLength={500}
              showCharCount
              currentLength={description.length}
              placeholder={t('form.descriptionPlaceholder')}
              error={descriptionError}
            />
          </div>

          {/* Effort Field */}
          <div>
            <label htmlFor="effort-value" className="text-xs lg:text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
              <i className="fa-solid fa-clock text-accent-500 text-xs"></i>
              {t('form.effortLabel')}
              <span className="text-danger-500">{t('form.required')}</span>
            </label>
            <input
              type="number"
              id="effort-value"
              value={effort}
              onChange={(e) => {
                setEffort(e.target.value);
                setEffortError('');
              }}
              step="0.01"
              min="0"
              max="1000"
              className="w-full px-4 py-3 text-sm lg:text-base border-2 border-gray-200/80 rounded-xl focus:outline-none focus:border-accent-400 focus:ring-4 focus:ring-accent-100 transition-smooth bg-white/70 backdrop-blur-sm placeholder:text-gray-400"
              placeholder={t('form.effortPlaceholder')}
            />
            {effortError && (
              <div className="mt-2 p-3 bg-danger-50 border border-danger-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-circle-exclamation text-danger-500 text-sm"></i>
                  <span className="text-xs lg:text-sm text-danger-700 font-medium">{effortError}</span>
                </div>
              </div>
            )}
          </div>

          {/* Add Button */}
          <Button type="submit" className="w-full">
            <i className="fa-solid fa-plus"></i>
            <span>{t('form.addButton')}</span>
          </Button>
        </form>
      </div>
    </section>
  );
}
