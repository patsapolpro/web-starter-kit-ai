import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';

interface TotalEffortCardProps {
  totalEffort: number;
  visible: boolean;
}

export function TotalEffortCard({ totalEffort, visible }: TotalEffortCardProps) {
  const { t } = useLanguage();

  if (!visible) return null;

  return (
    <section className="animate-fade-in-up-delay-2">
      <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl shadow-soft-lg">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700"></div>
        {/* Pattern Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15)_0%,transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.1)_0%,transparent_40%)]"></div>

        <div className="relative p-5 lg:p-6 text-white">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 lg:w-12 lg:h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
              <i className="fa-solid fa-chart-line text-white text-lg lg:text-xl"></i>
            </div>
            <h3 className="text-lg lg:text-xl font-bold">{t('effort.title')}</h3>
          </div>

          {/* Total Effort */}
          <div>
            <p className="text-white/70 text-xs lg:text-sm font-medium uppercase tracking-wider mb-1">
              {t('effort.totalActiveEffort')}
            </p>
            <p className="text-4xl lg:text-5xl font-extrabold tracking-tight">{totalEffort.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
