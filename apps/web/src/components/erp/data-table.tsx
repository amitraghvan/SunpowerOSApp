'use client';

import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Search,
  Filter,
  CheckSquare,
  Square
} from 'lucide-react';
import { EmptyState } from './empty-state';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  className?: string;
  render?: (row: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T | ((row: T) => string);
  searchPlaceholder?: string;
  searchFields?: (keyof T)[];
  onRowClick?: (row: T) => void;
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  onEmptyAction?: () => void;
  emptyActionLabel?: string;
  selectable?: boolean;
  selectedKeys?: string[];
  onSelectionChange?: (keys: string[]) => void;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyField,
  searchPlaceholder = 'Search records...',
  searchFields,
  onRowClick,
  pageSize = 15,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no records matching your current filter criteria.',
  onEmptyAction,
  emptyActionLabel,
  selectable = false,
  selectedKeys = [],
  onSelectionChange,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const getRowKey = (row: T): string => {
    if (typeof keyField === 'function') return keyField(row);
    return String(row[keyField]);
  };

  // Filter
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();

    return data.filter((row) => {
      if (searchFields && searchFields.length > 0) {
        return searchFields.some((f) => {
          const val = row[f];
          return val != null && String(val).toLowerCase().includes(term);
        });
      }
      return Object.values(row).some(
        (val) => val != null && String(val).toLowerCase().includes(term)
      );
    });
  }, [data, searchTerm, searchFields]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sortOrder === 'asc' ? 1 : -1;
      if (bVal == null) return sortOrder === 'asc' ? -1 : 1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return sortOrder === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filteredData, sortField, sortOrder]);

  // Paginate
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key: string) => {
    if (sortField === key) {
      if (sortOrder === 'asc') setSortOrder('desc');
      else {
        setSortField(null);
        setSortOrder('asc');
      }
    } else {
      setSortField(key);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    if (selectedKeys.length === paginatedData.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(paginatedData.map(getRowKey));
    }
  };

  const handleSelectRow = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onSelectionChange) return;
    if (selectedKeys.includes(key)) {
      onSelectionChange(selectedKeys.filter((k) => k !== key));
    } else {
      onSelectionChange([...selectedKeys, key]);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#DEE2E6] shadow-2xs overflow-hidden">
      {/* Table Control Bar */}
      <div className="p-3 border-b border-[#DEE2E6] bg-[#FAFBFD] flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6C757D]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[#DEE2E6] text-xs text-[#212529] focus:outline-none focus:ring-1 focus:ring-[#714B67] bg-white"
          />
        </div>

        <div className="text-xs text-[#6C757D] font-tabular">
          Showing <strong>{sortedData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> –{' '}
          <strong>{Math.min(currentPage * pageSize, sortedData.length)}</strong> of{' '}
          <strong>{sortedData.length}</strong> records
        </div>
      </div>

      {/* Main Table */}
      {paginatedData.length === 0 ? (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          onAction={onEmptyAction}
          actionLabel={emptyActionLabel}
          className="border-0 shadow-none my-6"
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="erp-table">
            <thead>
              <tr>
                {selectable && (
                  <th className="w-10 text-center">
                    <button onClick={handleSelectAll} className="text-[#6C757D]">
                      {selectedKeys.length === paginatedData.length && paginatedData.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-[#714B67]" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                )}
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && handleSort(col.key)}
                    className={`${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.sortable ? 'cursor-pointer hover:bg-slate-100 select-none' : ''} ${col.className || ''}`}
                  >
                    <div className={`inline-flex items-center gap-1.5 ${col.align === 'right' ? 'justify-end' : ''}`}>
                      <span>{col.header}</span>
                      {col.sortable && (
                        <ArrowUpDown
                          className={`w-3 h-3 ${sortField === col.key ? 'text-[#714B67]' : 'text-slate-300'}`}
                        />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, idx) => {
                const key = getRowKey(row);
                const isSelected = selectedKeys.includes(key);

                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`${onRowClick ? 'cursor-pointer' : ''} ${isSelected ? 'bg-purple-50/40' : ''}`}
                  >
                    {selectable && (
                      <td className="w-10 text-center" onClick={(e) => handleSelectRow(key, e)}>
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#714B67] inline" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300 inline" />
                        )}
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.className || ''}`}
                      >
                        {col.render ? col.render(row, idx) : String(row[col.key] ?? '—')}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-3 border-t border-[#DEE2E6] bg-[#FAFBFD] flex items-center justify-between text-xs text-[#6C757D]">
          <div>
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </div>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded border border-[#DEE2E6] bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 text-[#212529]"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded border border-[#DEE2E6] bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 text-[#212529]"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
