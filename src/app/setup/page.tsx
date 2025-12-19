'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/UI/Input';
import { Button } from '@/components/UI/Button';
import { validateProjectName } from '@/lib/validation/projectValidation';
import { createProject, getProject } from '@/lib/storage/project';
import { useLanguage } from '@/hooks/useLanguage';
import { LanguageToggle } from '@/components/LanguageToggle/LanguageToggle';

export default function SetupPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [projectName, setProjectName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if project already exists, redirect to dashboard
    const existingProject = getProject();
    if (existingProject) {
      router.push('/');
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate
    const validation = validateProjectName(projectName);
    if (!validation.valid) {
      setError(validation.error || '');
      return;
    }

    // Create project
    setIsLoading(true);
    createProject(validation.value || projectName);

    // Redirect to dashboard
    setTimeout(() => {
      router.push('/');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-pink-200/30 to-orange-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-indigo-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-xl">
          {/* Language Toggle - Top Right */}
          <div className="absolute top-4 right-4">
            <LanguageToggle />
          </div>

          {/* Brand Header */}
          <div className="text-center mb-8 animate-fadeIn">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <i className="fa-solid fa-clipboard-list text-white text-2xl"></i>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              {t('app.title')}
            </h1>
            <p className="text-lg text-gray-600 font-medium">{t('app.subtitle')}</p>
          </div>

          {/* Welcome Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-8 border border-white/50">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('setup.title')}</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                type="text"
                value={projectName}
                onChange={(e) => {
                  setProjectName(e.target.value);
                  setError('');
                }}
                placeholder={t('setup.projectNamePlaceholder')}
                maxLength={100}
                required
                error={error}
                icon={<i className="fa-solid fa-folder-open text-gray-400"></i>}
                label={
                  <span className="flex items-center">
                    <i className="fa-solid fa-tag text-indigo-500 mr-2"></i>
                    {t('setup.projectNameLabel')}
                  </span>
                }
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    <span>{t('setup.creating')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('setup.createButton')}</span>
                    <i className="fa-solid fa-arrow-right"></i>
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
