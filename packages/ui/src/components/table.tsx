import React from 'react';

export interface ColumnDef<T> {
  header: string;
  accessorKey: keyof T | ((row: T) => React.ReactNode);
  cell?: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No records found.',
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full p-8 text-center text-slate-500">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB]"></div>
        <p className="mt-2 text-sm">Loading records...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full p-8 text-center border border-dashed border-slate-200 rounded-lg text-slate-400">
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-[#F7F9FC]">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row, rowIdx) => (
            <tr key={row.id ? String(row.id) : rowIdx} className="hover:bg-slate-50 transition-colors">
              {columns.map((col, colIdx) => {
                let cellContent: React.ReactNode;
                if (col.cell) {
                  cellContent = col.cell(row);
                } else if (typeof col.accessorKey === 'function') {
                  cellContent = col.accessorKey(row);
                } else {
                  cellContent = String(row[col.accessorKey] ?? '');
                }
                return (
                  <td key={colIdx} className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {cellContent}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
