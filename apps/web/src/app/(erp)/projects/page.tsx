import React from 'react';
import { EmptyState } from '@/components/common/empty-state';

export default function ProjectsPage() {
  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Solar EPC Projects</h1>
          <p className="text-xs text-slate-500 mt-0.5">Lifecycle tracking for ~40 monthly 1-5 kW residential and commercial installations</p>
        </div>
      </div>

      <EmptyState
        title="Project Management Module Scaffolded"
        description="Phase 0 foundation established. Project stages, Gantt planning, and work packages will be implemented in Phase 3."
      />
    </div>
  );
}
