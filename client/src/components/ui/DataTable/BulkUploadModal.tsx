import React, { useState, useRef } from 'react';
import { downloadSampleTemplate } from './exportUtils';

export interface ColumnDefinition {
  key: string;
  label: string;
  required?: boolean;
  validate?: (val: string) => string | null; // returns error message if invalid
}

export interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  templateFilename: string;
  columns: ColumnDefinition[];
  sampleRows: (string | number)[][];
  onImport: (validRows: Record<string, string>[]) => Promise<{ success: boolean; message?: string }>;
}

export function BulkUploadModal({
  isOpen,
  onClose,
  title,
  description = 'Upload a CSV file containing records to bulk import into the platform.',
  templateFilename,
  columns,
  sampleRows,
  onImport,
}: BulkUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<
    { data: Record<string, string>; errors: string[]; isValid: boolean }[]
  >([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    downloadSampleTemplate(
      templateFilename,
      columns.map((c) => c.label),
      sampleRows
    );
  };

  const parseCsvText = (text: string) => {
    const lines = text
      .split(/\r\n|\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length < 2) {
      return [];
    }

    // Parse header line
    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headerRow = parseLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
    
    // Map headers to column keys
    const headerMapping: { [index: number]: ColumnDefinition } = {};
    headerRow.forEach((h, index) => {
      const match = columns.find(
        (col) =>
          col.key.toLowerCase() === h ||
          col.label.toLowerCase().replace(/[^a-z0-9]/g, '') === h
      );
      if (match) {
        headerMapping[index] = match;
      }
    });

    const parsedData: { data: Record<string, string>; errors: string[]; isValid: boolean }[] = [];

    for (let r = 1; r < lines.length; r++) {
      const rowValues = parseLine(lines[r]);
      const rowData: Record<string, string> = {};
      const rowErrors: string[] = [];

      columns.forEach((col) => {
        rowData[col.key] = '';
      });

      rowValues.forEach((val, colIndex) => {
        const matchedCol = headerMapping[colIndex];
        if (matchedCol) {
          rowData[matchedCol.key] = val;
        }
      });

      // Validate required columns
      columns.forEach((col) => {
        const val = rowData[col.key] || '';
        if (col.required && (!val || val.trim() === '')) {
          rowErrors.push(`${col.label} is required`);
        } else if (col.validate && val) {
          const err = col.validate(val);
          if (err) rowErrors.push(err);
        }
      });

      parsedData.push({
        data: rowData,
        errors: rowErrors,
        isValid: rowErrors.length === 0,
      });
    }

    return parsedData;
  };

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setIsProcessing(true);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        const parsed = parseCsvText(content);
        setParsedRows(parsed);
      }
      setIsProcessing(false);
    };
    reader.onerror = () => {
      setIsProcessing(false);
    };
    reader.readAsText(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = async () => {
    const validRows = parsedRows.filter((r) => r.isValid).map((r) => r.data);
    if (validRows.length === 0) return;

    setIsSubmitting(true);
    try {
      const res = await onImport(validRows);
      setImportResult({
        success: res.success,
        message: res.message || (res.success ? 'Successfully imported records!' : 'Failed to import records.'),
      });
      if (res.success) {
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      setImportResult({
        success: false,
        message: err.message || 'An error occurred during import.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const errorCount = parsedRows.filter((r) => !r.isValid).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-md shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{title}</h3>
              <p className="text-xs text-slate-500">{description}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-white">
          {/* Top Info Banner & Template Download */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-900">
            <div>
              <p className="font-semibold text-emerald-950">1. Download and fill the sample spreadsheet</p>
              <p className="text-[11px] text-emerald-800/90 mt-0.5">
                Ensure headers match: {columns.map((c) => c.label).join(', ')}.
              </p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-emerald-300 text-emerald-800 font-bold rounded-md hover:bg-emerald-100/60 transition-colors shadow-xs flex-shrink-0"
            >
              <svg className="w-3.5 h-3.5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download Sample Template (.csv)
            </button>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
              file
                ? 'border-emerald-500 bg-emerald-50/20'
                : 'border-slate-300 hover:border-emerald-600 bg-slate-50/50 hover:bg-emerald-50/10'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv,text/plain"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />

            <div className="flex flex-col items-center justify-center space-y-1.5">
              <svg className="w-8 h-8 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              {file ? (
                <p className="text-xs font-bold text-slate-800">
                  Selected: <span className="text-emerald-700 underline">{file.name}</span> ({(file.size / 1024).toFixed(1)} KB)
                </p>
              ) : (
                <>
                  <p className="text-xs font-bold text-slate-800">
                    Click to select or drag and drop your CSV file here
                  </p>
                  <p className="text-[11px] text-slate-400">Supports .csv (comma-separated values)</p>
                </>
              )}
            </div>
          </div>

          {/* Parsing Feedback & Validation Results */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">
                  Data Preview ({parsedRows.length} Rows Parsed)
                </span>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    {validCount} Ready
                  </span>
                  {errorCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                      {errorCount} Issues
                    </span>
                  )}
                </div>
              </div>

              {/* Preview Table */}
              <div className="border border-slate-200 rounded-md overflow-x-auto max-h-48">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="px-3 py-1.5">#</th>
                      {columns.map((c) => (
                        <th key={c.key} className="px-3 py-1.5 whitespace-nowrap">
                          {c.label}
                        </th>
                      ))}
                      <th className="px-3 py-1.5">Validation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.slice(0, 10).map((row, idx) => (
                      <tr
                        key={idx}
                        className={`text-[11px] ${
                          row.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/40 hover:bg-rose-50/60'
                        }`}
                      >
                        <td className="px-3 py-1.5 font-mono text-slate-400">{idx + 1}</td>
                        {columns.map((c) => (
                          <td key={c.key} className="px-3 py-1.5 truncate max-w-[140px]">
                            {row.data[c.key] || <span className="text-slate-300 italic">—</span>}
                          </td>
                        ))}
                        <td className="px-3 py-1.5">
                          {row.isValid ? (
                            <span className="text-emerald-700 font-bold text-[10px] uppercase">
                              Valid
                            </span>
                          ) : (
                            <span
                              className="text-rose-600 font-medium text-[10px] truncate max-w-[160px] block"
                              title={row.errors.join(', ')}
                            >
                              {row.errors[0]}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedRows.length > 10 && (
                <p className="text-[10px] text-slate-400 text-right italic">
                  Showing first 10 of {parsedRows.length} total rows.
                </p>
              )}
            </div>
          )}

          {/* Import Result Notification */}
          {importResult && (
            <div
              className={`p-3 rounded-md text-xs border ${
                importResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              <strong>{importResult.success ? 'Success:' : 'Notice:'}</strong> {importResult.message}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirmImport}
            disabled={validCount === 0 || isSubmitting || isProcessing}
            className="px-5 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-md text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Importing...
              </>
            ) : (
              <>Import {validCount > 0 ? `${validCount} Records` : 'Records'}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
