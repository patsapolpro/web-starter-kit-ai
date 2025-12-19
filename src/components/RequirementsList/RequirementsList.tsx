'use client';

import React from 'react';
import type { Requirement } from '@/types/requirement';
import { RequirementRow } from './RequirementRow';
import { Toggle } from '@/components/UI/Toggle';

interface RequirementsListProps {
  requirements: Requirement[];
  effortColumnVisible: boolean;
  onToggleStatus: (id: string) => void;
  onEdit: (id: string, updates: Partial<Requirement>) => void;
  onDelete: (id: string) => void;
  onToggleEffortVisibility: () => void;
}

export function RequirementsList({
  requirements,
  effortColumnVisible,
  onToggleStatus,
  onEdit,
  onDelete,
  onToggleEffortVisibility,
}: RequirementsListProps) {
  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl px-10 py-8 shadow-xl">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2 className="text-xl font-semibold text-gray-800">Requirements</h2>
        <Toggle
          checked={effortColumnVisible}
          onChange={onToggleEffortVisibility}
          label={effortColumnVisible ? 'Hide Effort' : 'Show Effort'}
        />
      </div>

      {requirements.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4 opacity-50">📝</div>
          <div className="text-lg text-gray-500">
            No requirements yet. Add your first requirement above.
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 w-12">
                  Active
                </th>
                <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">
                  Description
                </th>
                {effortColumnVisible && (
                  <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 w-28">
                    Effort
                  </th>
                )}
                <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 w-36">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {requirements.map((requirement) => (
                <RequirementRow
                  key={requirement.id}
                  requirement={requirement}
                  effortColumnVisible={effortColumnVisible}
                  onToggleStatus={() => onToggleStatus(requirement.id)}
                  onEdit={(updates) => onEdit(requirement.id, updates)}
                  onDelete={() => onDelete(requirement.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
