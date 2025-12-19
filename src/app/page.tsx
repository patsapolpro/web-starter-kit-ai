'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProjectHeader } from '@/components/ProjectHeader/ProjectHeader';
import { TotalEffortCard } from '@/components/TotalEffort/TotalEffortCard';
import { RequirementForm } from '@/components/RequirementForm/RequirementForm';
import { RequirementsList } from '@/components/RequirementsList/RequirementsList';
import { Modal } from '@/components/UI/Modal';
import { useProject } from '@/hooks/useProject';
import { useRequirements } from '@/hooks/useRequirements';
import { usePreferences } from '@/hooks/usePreferences';
import { clearAllData } from '@/lib/storage/localStorage';

export default function Home() {
  const router = useRouter();
  const { project, updateProjectName, isLoading } = useProject();
  const {
    requirements,
    addRequirement,
    updateRequirement,
    deleteRequirement,
    toggleStatus,
    totalActiveEffort,
  } = useRequirements();
  const { preferences, updatePreferences } = usePreferences();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [clearAllModalOpen, setClearAllModalOpen] = useState(false);
  const [requirementToDelete, setRequirementToDelete] = useState<string | null>(null);

  // Redirect to setup page if no project exists
  useEffect(() => {
    if (!isLoading && !project) {
      router.push('/setup');
    }
  }, [isLoading, project, router]);

  const handleDeleteClick = (id: string) => {
    setRequirementToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (requirementToDelete) {
      deleteRequirement(requirementToDelete);
      setRequirementToDelete(null);
    }
  };

  const handleConfirmClearAll = () => {
    clearAllData();
    window.location.reload();
  };

  const handleToggleEffortVisibility = () => {
    updatePreferences({
      effortColumnVisible: !preferences.effortColumnVisible,
    });
  };

  // Show loading or empty state while checking for project
  if (isLoading || !project) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] py-8 px-5 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] py-8 px-5">
      <div className="max-w-6xl mx-auto">
        <ProjectHeader
          projectName={project?.name || 'Untitled Project'}
          onProjectNameUpdate={updateProjectName}
          onClearAllClick={() => setClearAllModalOpen(true)}
        />

        <TotalEffortCard
          totalEffort={totalActiveEffort}
          visible={
            preferences.effortColumnVisible || preferences.showTotalWhenEffortHidden
          }
        />

        <RequirementForm onAddRequirement={addRequirement} />

        <RequirementsList
          requirements={requirements}
          effortColumnVisible={preferences.effortColumnVisible}
          onToggleStatus={toggleStatus}
          onEdit={updateRequirement}
          onDelete={handleDeleteClick}
          onToggleEffortVisibility={handleToggleEffortVisibility}
        />

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Delete Requirement"
          message="Are you sure you want to delete this requirement? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleConfirmDelete}
          variant="danger"
          icon="⚠️"
        />

        {/* Clear All Confirmation Modal */}
        <Modal
          isOpen={clearAllModalOpen}
          onClose={() => setClearAllModalOpen(false)}
          title="Clear All Data"
          message="Are you sure you want to clear all data? This action cannot be undone and will delete your project and all requirements."
          confirmText="Clear All"
          cancelText="Cancel"
          onConfirm={handleConfirmClearAll}
          variant="danger"
          icon="🗑️"
        />
      </div>
    </main>
  );
}
