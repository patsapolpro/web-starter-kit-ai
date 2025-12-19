'use client';

import React, { useState } from 'react';
import type { Requirement } from '@/types/requirement';
import { RequirementRow } from './RequirementRow';
import { Modal } from '@/components/UI/Modal';
import { useLanguage } from '@/hooks/useLanguage';

interface RequirementsListProps {
  requirements: Requirement[];
  effortColumnVisible: boolean;
  onToggleStatus: (id: number) => void;
  onEdit: (id: number, updates: Partial<Requirement>) => void;
  onDelete: (id: number) => void;
}

export function RequirementsList({
  requirements,
  effortColumnVisible,
  onToggleStatus,
  onEdit,
  onDelete,
}: RequirementsListProps) {
  const { t } = useLanguage();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const activeCount = requirements.filter((r) => r.isActive).length;
  const inactiveCount = requirements.length - activeCount;

  const handleDeleteClick = (id: number) => {
    setDeleteTargetId(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteTargetId) {
      onDelete(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  return (
    <>
      <section className="animate-fade-in-up flex-1 flex flex-col min-h-0">
        <div className="glass rounded-2xl lg:rounded-3xl shadow-soft-lg border border-white/60 overflow-hidden flex-1 flex flex-col">
          {/* Section Header */}
          <div className="px-5 py-4 lg:px-6 lg:py-5 border-b border-gray-100/80 bg-gradient-to-r from-white/50 to-transparent">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center">
                <div className="w-10 h-10 lg:w-11 lg:h-11 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center mr-3 shadow-soft">
                  <i className="fa-solid fa-list-check text-primary-600 text-sm lg:text-base"></i>
                </div>
                <div>
                  <h2 className="text-lg lg:text-xl font-bold text-gray-800">{t('requirements.title')}</h2>
                  <p className="text-xs lg:text-sm text-gray-500 mt-0.5">
                    <span className="font-semibold text-gray-700">{requirements.length}</span> {t('requirements.totalRequirements')}
                  </p>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-success-50 rounded-full">
                  <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-semibold text-success-600">{activeCount} {t('requirements.active')}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-xs font-semibold text-gray-600">{inactiveCount} {t('requirements.inactive')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto flex-1 overflow-y-auto">
            {requirements.length === 0 ? (
              <div className="px-6 py-12 lg:py-16 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-gray-100 to-gray-200/80 rounded-2xl mb-5 shadow-soft">
                  <i className="fa-solid fa-inbox text-gray-400 text-3xl lg:text-4xl"></i>
                </div>
                <h3 className="text-lg lg:text-xl font-bold text-gray-800 mb-2">{t('requirements.emptyTitle')}</h3>
                <p className="text-sm lg:text-base text-gray-500 max-w-md mx-auto">
                  {t('requirements.emptyMessage')}
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50/95 to-gray-50/90 sticky top-0 z-10 backdrop-blur-sm shadow-sm">
                  <tr>
                    <th className="px-5 lg:px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-24">
                      <div className="flex items-center gap-2">
                        <i className="fa-solid fa-toggle-on text-primary-400"></i>
                        {t('requirements.status')}
                      </div>
                    </th>
                    <th className="px-5 lg:px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <i className="fa-solid fa-file-lines text-primary-400"></i>
                        {t('requirements.description')}
                      </div>
                    </th>
                    {effortColumnVisible && (
                      <th className="px-5 lg:px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-28">
                        <div className="flex items-center gap-2">
                          <i className="fa-solid fa-clock text-accent-400"></i>
                          {t('requirements.effort')}
                        </div>
                      </th>
                    )}
                    <th className="px-5 lg:px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider w-40">
                      <div className="flex items-center justify-end gap-2">
                        <i className="fa-solid fa-wrench text-gray-400"></i>
                        {t('requirements.actions')}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requirements.map((req) => (
                    <RequirementRow
                      key={req.id}
                      requirement={req}
                      effortColumnVisible={effortColumnVisible}
                      onToggleStatus={() => onToggleStatus(req.id)}
                      onEdit={(updates) => onEdit(req.id, updates)}
                      onDelete={() => handleDeleteClick(req.id)}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={t('modal.deleteTitle')}
        message={t('modal.deleteMessage')}
        confirmText={t('modal.deleteConfirm')}
        cancelText={t('modal.deleteCancel')}
        onConfirm={handleConfirmDelete}
        variant="danger"
      />
    </>
  );
}
