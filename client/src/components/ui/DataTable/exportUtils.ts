/**
 * Utilities for exporting table datasets to CSV/Excel compatible formats
 * and generating downloadable sample templates.
 */

export interface ExportColumn<T = any> {
  header: string;
  key?: keyof T | string;
  accessor?: (item: T) => any;
}

/**
 * Escapes a field for CSV compliance (RFC 4180)
 */
function escapeCsvValue(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Exports data array to a downloadable .csv file with Excel UTF-8 BOM
 */
export function exportToCsv<T = any>(
  filename: string,
  columns: ExportColumn<T>[],
  data: T[]
) {
  const headersRow = columns.map((c) => escapeCsvValue(c.header)).join(',');
  const rows = data.map((item) =>
    columns
      .map((col) => {
        let val: any;
        if (col.accessor) {
          val = col.accessor(item);
        } else if (col.key) {
          val = (item as any)[col.key];
        }
        return escapeCsvValue(val);
      })
      .join(',')
  );

  const csvContent = '\uFEFF' + [headersRow, ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const cleanFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  link.setAttribute('href', url);
  link.setAttribute('download', cleanFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads a sample template CSV for bulk importing records
 */
export function downloadSampleTemplate(
  filename: string,
  headers: string[],
  sampleRows: (string | number)[][]
) {
  const headerLine = headers.map(escapeCsvValue).join(',');
  const sampleLines = sampleRows.map((r) => r.map(escapeCsvValue).join(','));
  const content = '\uFEFF' + [headerLine, ...sampleLines].join('\r\n');

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
