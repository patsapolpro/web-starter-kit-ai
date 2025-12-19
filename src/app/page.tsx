'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProject } from '@/hooks/useProject';
import { useRequirements } from '@/hooks/useRequirements';
import { usePreferences } from '@/hooks/usePreferences';
import { useLanguage } from '@/hooks/useLanguage';
import { ProjectHeader } from '@/components/ProjectHeader/ProjectHeader';
import { RequirementForm } from '@/components/RequirementForm/RequirementForm';
import { RequirementsList } from '@/components/RequirementsList/RequirementsList';
import { TotalEffortCard } from '@/components/TotalEffort/TotalEffortCard';
import { Modal } from '@/components/UI/Modal';
import { clearAll } from '@/lib/storage/localStorage';

export default function HomePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { project, isLoading: projectLoading, updateProjectName } = useProject();
  const {
    requirements,
    isLoading: requirementsLoading,
    addRequirement,
    updateRequirement,
    deleteRequirement,
    toggleStatus,
    totalActiveEffort,
  } = useRequirements();
  const { preferences, updatePreferences } = usePreferences();
  const [clearModalOpen, setClearModalOpen] = useState(false);

  useEffect(() => {
    // Redirect to setup if no project exists
    if (!projectLoading && !project) {
      router.push('/setup');
    }
  }, [project, projectLoading, router]);

  const handleClearAll = () => {
    clearAll();
    router.push('/setup');
  };

  const handleToggleEffortVisibility = () => {
    updatePreferences({ effortColumnVisible: !preferences.effortColumnVisible });
  };

  if (projectLoading || requirementsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/50 to-purple-50/50">
        <div className="text-center">
          <i className="fa-solid fa-spinner fa-spin text-4xl text-primary-500 mb-4"></i>
          <p className="text-gray-600 font-medium">{t('app.loading')}</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return null; // Will redirect to setup
  }

  const showTotalEffort = preferences.effortColumnVisible || preferences.showTotalWhenEffortHidden;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/50 to-purple-50/50 flex flex-col">
        {/* Decorative background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-primary-200/40 to-accent-200/30 rounded-full blur-3xl animate-pulse-soft"></div>
          <div className="absolute top-1/3 -right-32 w-[400px] h-[400px] bg-gradient-to-br from-accent-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-32 left-1/3 w-[450px] h-[450px] bg-gradient-to-br from-indigo-200/30 to-primary-200/30 rounded-full blur-3xl"></div>
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
        </div>

        {/* Header */}
        <ProjectHeader
          projectName={project.name}
          onProjectNameUpdate={updateProjectName}
          onClearAllClick={() => setClearModalOpen(true)}
          onToggleEffortVisibility={handleToggleEffortVisibility}
          effortColumnVisible={preferences.effortColumnVisible}
        />

        {/* Main Content */}
        <main className="relative z-10 flex-1 w-full flex flex-col min-h-0">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 flex-1 flex flex-col w-full min-h-0">
            {/* Dashboard Grid Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 flex-1 min-h-0">
              {/* Main Content Column (8 cols on xl) */}
              <div className="xl:col-span-8 flex flex-col min-h-0">
                <RequirementsList
                  requirements={requirements}
                  effortColumnVisible={preferences.effortColumnVisible}
                  onToggleStatus={toggleStatus}
                  onEdit={updateRequirement}
                  onDelete={deleteRequirement}
                />
              </div>

              {/* Sidebar Column (4 cols on xl) */}
              <div className="xl:col-span-4 space-y-6 lg:space-y-8 overflow-y-auto">
                <TotalEffortCard totalEffort={totalActiveEffort} visible={showTotalEffort} />
                <RequirementForm onAddRequirement={addRequirement} />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Clear All Confirmation Modal */}
      <Modal
        isOpen={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
        title={t('modal.clearTitle')}
        message={t('modal.clearMessage')}
        confirmText={t('modal.clearConfirm')}
        cancelText={t('modal.clearCancel')}
        onConfirm={handleClearAll}
        variant="warning"
      />
    </>
  );
}
