import React from 'react';
import { EmptyState } from '@/components/common/empty-state';

export default function InventoryPage() {
  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Inventory & Serial Traceability</h1>
          <p className="text-xs text-slate-500 mt-0.5">Central warehouse, field kits, and QR/barcode serial tracking for panels, inverters & batteries</p>
        </div>
      </div>

      <EmptyState
        title="Inventory Module Scaffolded"
        description="Phase 0 foundation established. Stock movements, warehouse transfers, and serial number registries will be implemented in Phase 4."
      />
    </div>
  );
}
