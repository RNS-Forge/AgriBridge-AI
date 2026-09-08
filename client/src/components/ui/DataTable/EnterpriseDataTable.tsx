import React, { useState, useMemo } from 'react';
import { exportToCsv, ExportColumn } from './exportUtils';
import { Switch } from '../Switch/Switch.js';

export interface DataTableTab {
  id: string;
  label: string;
  count?: number;
  badgeColor?: string; // e.g. 'bg-emerald-100 text-emerald-800' or 'bg-amber-100 text-amber-800'
}

export interface DataTableColumn<T = any> {
  key: string;
  header: string;
  sortable?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (item: T, index: number) => React.ReactNode;
  accessor?: (item: T) => any;
}

export interface BulkAction<T = any> {
  label: string;
  icon?: React.ReactNode;
  className?: string;
  onClick: (selectedItems: T[]) => void | Promise<void>;
}

export interface EnterpriseCheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  title?: string;
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
}

export function EnterpriseCheckbox({
  checked,
  indeterminate = false,
  onChange,
  title,
  ariaLabel,
  disabled = false,
  className = '',
}: EnterpriseCheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : checked}
      aria-label={ariaLabel || title || 'Select row'}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onChange();
      }}
      title={title}
      disabled={disabled}
      className={`w-4 h-4 rounded-[4px] flex items-center justify-center transition-all cursor-pointer select-none flex-shrink-0 ${
        checked || indeterminate
          ? 'bg-[#4a2e80] border border-[#4a2e80] text-white shadow-2xs'
          : 'bg-white border border-slate-300 hover:border-[#4a2e80] hover:bg-purple-50/40'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : ''} ${className}`}
    >
      {indeterminate ? (
        <span className="w-2.5 h-0.5 bg-white rounded-full block" />
      ) : checked ? (
        <svg className="w-2.5 h-2.5 stroke-current stroke-[2.8]" viewBox="0 0 24 24" fill="none">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      ) : null}
    </button>
  );
}

export interface EnterpriseDataTableProps<T = any> {
  data: T[];
  columns: DataTableColumn<T>[];
  keyExtractor: (item: T) => string;
  // Tabs
  tabs?: DataTableTab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  // Title & Actions
  title?: string;
  subtitle?: string;
  onRefresh?: () => void;
  // Export
  exportFilename?: string;
  exportColumns?: ExportColumn<T>[];
  // Bulk Upload Trigger
  onOpenBulkUpload?: () => void;
  bulkUploadLabel?: string;
  // Extra Header Actions
  extraActions?: React.ReactNode;
  // Bulk Selection
  selectable?: boolean;
  bulkActions?: BulkAction<T>[];
  // Initial settings
  defaultPageSize?: number;
  emptyMessage?: string;
  loading?: boolean;
  minTableWidth?: string;
}

export function EnterpriseDataTable<T = any>({
  data,
  columns,
  keyExtractor,
  tabs,
  activeTab,
  onTabChange,
  title,
  subtitle,
  onRefresh,
  exportFilename = 'AgriBridge_Export',
  exportColumns,
  onOpenBulkUpload,
  bulkUploadLabel = 'Bulk Upload',
  extraActions,
  selectable = true,
  bulkActions = [],
  defaultPageSize = 10,
  emptyMessage = 'No matching records found.',
  loading = false,
  minTableWidth = '960px',
}: EnterpriseDataTableProps<T>) {
  // Column search toggle state
  const [columnSearchEnabled, setColumnSearchEnabled] = useState(true);
  // Column-specific search terms
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  // Global search input
  const [globalSearch, setGlobalSearch] = useState('');
  // Sorting state
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  // Multi-selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Handle column header sort click
  const handleSort = (key: string, sortable?: boolean) => {
    if (!sortable) return;
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortKey(null);
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  // Handle column search input change
  const handleColumnSearchChange = (colKey: string, value: string) => {
    setColumnFilters((prev) => ({
      ...prev,
      [colKey]: value,
    }));
    setCurrentPage(1);
  };

  // Clear a single column filter
  const handleClearColumnFilter = (colKey: string) => {
    setColumnFilters((prev) => {
      const next = { ...prev };
      delete next[colKey];
      return next;
    });
  };

  // Reset all filters
  const handleResetFilters = () => {
    setColumnFilters({});
    setGlobalSearch('');
    setCurrentPage(1);
  };

  // Filter and sort the dataset
  const filteredData = useMemo(() => {
    let result = [...data];

    // 1. Global search
    if (globalSearch.trim()) {
      const query = globalSearch.toLowerCase();
      result = result.filter((item) => {
        return columns.some((col) => {
          let val: any;
          if (col.accessor) {
            val = col.accessor(item);
          } else {
            val = (item as any)[col.key];
          }
          return val !== null && val !== undefined && String(val).toLowerCase().includes(query);
        });
      });
    }

    // 2. Column-level filtering
    if (columnSearchEnabled) {
      Object.entries(columnFilters).forEach(([colKey, query]) => {
        if (!query || !query.trim()) return;
        const q = query.toLowerCase().trim();
        const col = columns.find((c) => c.key === colKey);
        if (!col) return;

        result = result.filter((item) => {
          let val: any;
          if (col.accessor) {
            val = col.accessor(item);
          } else {
            val = (item as any)[col.key];
          }
          return val !== null && val !== undefined && String(val).toLowerCase().includes(q);
        });
      });
    }

    // 3. Sorting
    if (sortKey) {
      const col = columns.find((c) => c.key === sortKey);
      result.sort((a, b) => {
        let valA: any = col?.accessor ? col.accessor(a) : (a as any)[sortKey];
        let valB: any = col?.accessor ? col.accessor(b) : (b as any)[sortKey];

        if (valA === null || valA === undefined) valA = '';
        if (valB === null || valB === undefined) valB = '';

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }
        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        return sortDirection === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
      });
    }

    return result;
  }, [data, columns, globalSearch, columnSearchEnabled, columnFilters, sortKey, sortDirection]);

  // Paginated slice
  const totalRecords = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const activePage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const startIndex = (activePage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, activePage, pageSize]);

  // Checkbox Selection Logic
  const someCurrentPageSelected =
    paginatedData.some((item) => selectedIds.has(keyExtractor(item)));
  const allCurrentPageSelected =
    paginatedData.length > 0 &&
    paginatedData.every((item) => selectedIds.has(keyExtractor(item)));
  const isIndeterminate = someCurrentPageSelected && !allCurrentPageSelected;

  const handleToggleSelectAll = () => {
    const newSelected = new Set(selectedIds);
    if (allCurrentPageSelected) {
      paginatedData.forEach((item) => newSelected.delete(keyExtractor(item)));
    } else {
      paginatedData.forEach((item) => newSelected.add(keyExtractor(item)));
    }
    setSelectedIds(newSelected);
  };

  const handleToggleSelectRow = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectedItems = useMemo(() => {
    return data.filter((item) => selectedIds.has(keyExtractor(item)));
  }, [data, selectedIds, keyExtractor]);

  // Handle Export to CSV
  const handleExport = () => {
    const colsToExport: ExportColumn<T>[] =
      exportColumns ||
      columns
        .filter((c) => c.key !== 'actions' && c.key !== 'selection')
        .map((c) => ({
          header: c.header,
          key: c.key,
          accessor: c.accessor,
        }));

    const dateStr = new Date().toISOString().split('T')[0];
    exportToCsv(`${exportFilename}_${dateStr}`, colsToExport, filteredData);
  };

  const hasActiveFilters =
    Boolean(globalSearch.trim()) || Object.values(columnFilters).some((v) => Boolean(v.trim()));

  return (
    <div className="space-y-2.5 font-sans w-full max-w-full min-w-0">
      {/* ── 1. Page Title & Top Action Bar ── */}
      {(title || extraActions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-0.5">
          {title && (
            <div>
              <h2 className="text-sm md:text-base font-bold text-slate-900 tracking-tight">{title}</h2>
              {subtitle && <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{subtitle}</p>}
            </div>
          )}
          <div className="flex items-center gap-2 ml-auto">{extraActions}</div>
        </div>
      )}

      {/* ── 2. Status Tabs Bar with Counter Badges (Matching Reference Image) ── */}
      {tabs && tabs.length > 0 && (
        <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-200 pb-px scrollbar-hide">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  onTabChange?.(tab.id);
                  setSelectedIds(new Set());
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                  isActive
                    ? 'border-emerald-700 text-emerald-950 font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[9.5px] font-bold ${
                      isActive
                        ? tab.badgeColor || 'bg-emerald-100 text-emerald-800 border border-emerald-300/60'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ── 3. Action Toolbar (Search, Refresh, Export, Bulk Upload, Column Search Toggle) ── */}
      <div className="bg-white px-3 py-2 rounded-md border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-2.5 w-full max-w-full min-w-0">
        {/* Left Side: Global Quick Filter */}
        <div className="flex items-center gap-2 flex-1 max-w-sm min-w-[200px]">
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => {
                setGlobalSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Quick search across all records..."
              className="w-full pl-8 pr-7 py-1.5 h-8 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white transition-colors"
            />
            {globalSearch && (
              <button
                onClick={() => setGlobalSearch('')}
                className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Clear search"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Bulk Actions (Approve / Reject at table up right), Export, Bulk Upload, Refresh, Column Search */}
        <div className="flex items-center flex-wrap gap-2 md:ml-auto">
          {/* ── Table Up Right: Approve & Reject buttons when records are selected ── */}
          {selectable && selectedIds.size > 0 && bulkActions && bulkActions.length > 0 && (
            <div className="flex items-center gap-1.5 animate-in fade-in duration-150">
              {bulkActions.map((action, i) => {
                const isApprove = action.label.toLowerCase().includes('approve');
                const isReject = action.label.toLowerCase().includes('reject');

                const defaultClass = isApprove
                  ? 'bg-[#4a2e80] hover:bg-[#3a2268] text-white px-4 py-1 h-7.5 rounded-full text-xs font-medium shadow-xs transition-colors cursor-pointer flex items-center justify-center shrink-0'
                  : isReject
                  ? 'bg-white hover:bg-rose-50 text-[#e53e3e] border border-[#e53e3e] px-4 py-1 h-7.5 rounded-full text-xs font-medium shadow-xs transition-colors cursor-pointer flex items-center justify-center shrink-0'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-1 h-7.5 rounded-full text-xs font-medium shadow-xs transition-colors cursor-pointer flex items-center justify-center shrink-0';

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => action.onClick(selectedItems)}
                    className={action.className || defaultClass}
                    title={`${action.label} (${selectedIds.size} selected)`}
                  >
                    {action.icon}
                    <span>{action.label}</span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="text-slate-400 hover:text-slate-600 text-xs px-1 cursor-pointer font-bold"
                title="Clear selection"
              >
                ✕
              </button>
            </div>
          )}

          {/* Export to Excel / CSV */}
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 h-8 text-xs font-medium bg-white border border-slate-300 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 rounded-md shadow-2xs transition-colors cursor-pointer shrink-0"
            title="Export current records to CSV / Excel"
          >
            <svg className="w-3.5 h-3.5 text-emerald-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span className="whitespace-nowrap">Export to Excel / CSV</span>
          </button>

          {/* Bulk Upload Modal Trigger */}
          {onOpenBulkUpload && (
            <button
              onClick={onOpenBulkUpload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 h-8 text-xs font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 rounded-md shadow-2xs transition-colors cursor-pointer shrink-0"
              title="Bulk import records via CSV"
            >
              <svg className="w-3.5 h-3.5 text-slate-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <span className="whitespace-nowrap">{bulkUploadLabel}</span>
            </button>
          )}

          {/* Refresh button (Positioned before Column Search matching reference image) */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1.5 h-8 w-8 text-slate-600 hover:text-emerald-800 hover:bg-slate-100 rounded-md border border-slate-300 transition-colors cursor-pointer flex items-center justify-center shrink-0 shadow-2xs"
              title="Refresh Records"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>
          )}

          {/* Column Search Button with Professional Switch */}
          <div
            onClick={() => setColumnSearchEnabled(!columnSearchEnabled)}
            className={`inline-flex items-center gap-2 px-3 py-1 h-8 text-xs font-semibold rounded-md border transition-all duration-150 cursor-pointer select-none shrink-0 ${
              columnSearchEnabled
                ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-2xs'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-2xs'
            }`}
            title={columnSearchEnabled ? 'Hide column search filters' : 'Show column search filters'}
          >
            <svg
              className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                columnSearchEnabled ? 'text-emerald-700' : 'text-slate-500'
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.41A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
              />
            </svg>
            <span className="whitespace-nowrap">Column Search</span>
            <Switch
              size="sm"
              checked={columnSearchEnabled}
              onChange={setColumnSearchEnabled}
              ariaLabel="Toggle column search filters"
            />
          </div>
        </div>
      </div>

      {/* ── 5. Main Table Container ── */}
      <div className="bg-white rounded-md border border-slate-200/90 shadow-2xs overflow-hidden w-full max-w-full min-w-0">
        <div className="overflow-x-auto w-full max-w-full table-scroll">
          <table
            style={{ minWidth: minTableWidth || '960px' }}
            className="w-full text-left text-[11.5px] border-collapse min-w-full"
          >
            {/* Table Header with Sticky Positioning */}
            <thead className="sticky top-0 z-10 bg-[#f8f9fc] shadow-[0_1px_0_0_#e2e8f0] text-slate-700 text-[11.5px] font-bold tracking-tight">
              {/* Row 1: Column Titles & Sorters */}
              <tr className="h-8">
                {selectable && (
                  <th className="w-9 min-w-[36px] px-2 py-1.5 text-center border-r border-slate-200/70 bg-[#f3f4f8]">
                    <EnterpriseCheckbox
                      checked={allCurrentPageSelected}
                      indeterminate={isIndeterminate}
                      onChange={handleToggleSelectAll}
                      className="mx-auto"
                      title={allCurrentPageSelected ? 'Deselect all records' : 'Select all records on page'}
                      ariaLabel="Select all records on page"
                    />
                  </th>
                )}
                {columns.map((col, cIdx) => (
                  <th
                    key={col.key}
                    style={col.width ? { width: col.width, minWidth: col.width } : undefined}
                    onClick={() => handleSort(col.key, col.sortable)}
                    className={`px-3 py-2 select-none whitespace-nowrap ${
                      cIdx < columns.length - 1 ? 'border-r border-slate-200/70' : ''
                    } ${
                      col.align === 'center'
                        ? 'text-center'
                        : col.align === 'right'
                        ? 'text-right'
                        : 'text-left'
                    } ${
                      col.sortable
                        ? 'cursor-pointer hover:bg-slate-200/50 transition-colors'
                        : ''
                    }`}
                  >
                    <div className={`inline-flex items-center gap-1.5 ${col.align === 'right' ? 'justify-end' : ''}`}>
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="text-[10px] text-slate-400">
                          {sortKey === col.key ? (
                            sortDirection === 'asc' ? '▲' : '▼'
                          ) : (
                            '⇅'
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>

              {/* Row 2: Column Search Filter Row (When Column Search is toggled ON) */}
              {columnSearchEnabled && (
                <tr className="bg-[#f1f3f9] border-t border-slate-200 h-7.5">
                  {selectable && (
                    <th className="w-9 min-w-[36px] px-2 py-1 text-center border-r border-slate-200/70">
                      {hasActiveFilters && (
                        <button
                          onClick={handleResetFilters}
                          title="Clear all column filters"
                          className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer flex items-center justify-center mx-auto"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </th>
                  )}
                  {columns.map((col, cIdx) => {
                    const isFilterable = col.searchable !== false && col.key !== 'actions' && col.key !== 'selection';
                    const currentValue = columnFilters[col.key] || '';

                    return (
                      <th
                        key={col.key}
                        style={col.width ? { width: col.width, minWidth: col.width } : undefined}
                        className={`px-2 py-1 ${cIdx < columns.length - 1 ? 'border-r border-slate-200/70' : ''}`}
                      >
                        {isFilterable ? (
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-slate-400">
                              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            </span>
                            <input
                              type="text"
                              size={1}
                              value={currentValue}
                              onChange={(e) => handleColumnSearchChange(col.key, e.target.value)}
                              placeholder={col.searchPlaceholder || `Search ${col.header}...`}
                              className="w-full min-w-0 pl-6 pr-4 py-1 h-6 text-[11px] font-normal bg-white border border-slate-300 rounded text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 transition-colors"
                            />
                            {currentValue && (
                              <button
                                onClick={() => handleClearColumnFilter(col.key)}
                                className="absolute inset-y-0 right-0 pr-1.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                              >
                                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="h-6" />
                        )}
                      </th>
                    );
                  })}
                </tr>
              )}
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 text-slate-700 text-[11px]">
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length + (selectable ? 1 : 0)}
                    className="p-8 text-center text-slate-500"
                  >
                    <div className="flex flex-col items-center justify-center space-y-1.5">
                      <svg className="w-5 h-5 animate-spin text-emerald-700" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <p className="text-[11px] font-semibold">Loading records...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((item, idx) => {
                  const id = keyExtractor(item);
                  const isSelected = selectedIds.has(id);

                  return (
                    <tr
                      key={id}
                      className={`transition-colors h-7.5 ${
                        isSelected
                          ? 'bg-purple-50/60 hover:bg-purple-50/80'
                          : idx % 2 === 0
                          ? 'bg-white hover:bg-slate-50/80'
                          : 'bg-[#fafbfc] hover:bg-slate-50/80'
                      }`}
                    >
                      {selectable && (
                        <td className="w-8 min-w-[32px] px-1 py-1 text-center border-r border-slate-100">
                          <EnterpriseCheckbox
                            checked={isSelected}
                            onChange={() => handleToggleSelectRow(id)}
                            className="mx-auto"
                            title={`Select row ${id}`}
                            ariaLabel={`Select row ${id}`}
                          />
                        </td>
                      )}
                      {columns.map((col, cIdx) => {
                        return (
                          <td
                            key={col.key}
                            style={col.width ? { width: col.width, minWidth: col.width } : undefined}
                            className={`px-3 py-1.5 ${
                              cIdx < columns.length - 1 ? 'border-r border-slate-100' : ''
                            } ${
                              col.align === 'center'
                                ? 'text-center'
                                : col.align === 'right'
                                ? 'text-right'
                                : 'text-left'
                            }`}
                          >
                            {col.render
                              ? col.render(item, idx)
                              : col.accessor
                              ? col.accessor(item)
                              : (item as any)[col.key] || '—'}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={columns.length + (selectable ? 1 : 0)}
                    className="p-8 text-center text-slate-500"
                  >
                    <div className="flex flex-col items-center justify-center space-y-1.5 max-w-sm mx-auto">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-700">{emptyMessage}</p>
                      {hasActiveFilters && (
                        <button
                          onClick={handleResetFilters}
                          className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold underline cursor-pointer"
                        >
                          Clear active search & column filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── 6. Pagination Footer Bar (Matching Reference Image) ── */}
        <div className="px-3 py-1.5 border-t border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-600 h-8">
          {/* Rows Per Page Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-1.5 py-0.5 h-6 border border-slate-300 rounded-[3px] bg-white text-[11px] font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          {/* Record Count & Page Navigation */}
          <div className="flex items-center gap-2.5 ml-auto">
            <span className="text-slate-500">
              Page <strong className="text-slate-800">{activePage}</strong> of{' '}
              <strong className="text-slate-800">{totalPages}</strong> ({totalRecords} Total Records)
            </span>

            <div className="inline-flex items-center rounded-[3px] border border-slate-300 bg-white shadow-2xs overflow-hidden h-6">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={activePage <= 1}
                className="px-2 h-full text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white border-r border-slate-200 transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center justify-center text-xs"
                title="Previous Page"
              >
                ‹
              </button>

              <span className="px-2.5 h-full flex items-center justify-center text-[11px] font-bold text-slate-800 bg-slate-50">
                {activePage}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={activePage >= totalPages}
                className="px-2 h-full text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center justify-center text-xs"
                title="Next Page"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
