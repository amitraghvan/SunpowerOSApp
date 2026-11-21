import React from 'react';
import { EmptyState } from '@/components/common/empty-state';

export default function CrmPage() {
  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">CRM & Solar Lead Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Commercial pipeline, customer inquiries, and lead qualification</p>
        </div>
      </div>

      <EmptyState
        title="CRM Business Module Scaffolded"
        description="Phase 0 foundation established. Lead ingestion, pipeline stages, and contact records will be implemented in Phase 1."
      />
    </div>
  );
}
