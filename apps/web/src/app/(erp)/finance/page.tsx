import React from 'react';
import { EmptyState } from '@/components/common/empty-state';

export default function FinancePage() {
  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Finance & Project Profitability</h1>
          <p className="text-xs text-slate-500 mt-0.5">Milestone invoicing, customer payments, government subsidies, and project margin analysis</p>
        </div>
      </div>

      <EmptyState
        title="Finance Module Scaffolded"
        description="Phase 0 foundation established. Tax invoices, payment reconciliation, and cost tracking will be implemented in Phase 7."
      />
    </div>
  );
}
