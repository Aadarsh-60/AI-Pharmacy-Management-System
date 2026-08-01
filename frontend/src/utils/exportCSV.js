/**
 * Export data to CSV and trigger download
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the downloaded file
 * @param {Array} columns - Optional column definitions [{key, label}]
 */
export const exportToCSV = (data, filename = 'export.csv', columns = null) => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Determine columns from data keys or use provided columns
  const cols = columns || Object.keys(data[0]).map(key => ({ key, label: key }));

  // Build CSV header
  const header = cols.map(col => `"${col.label}"`).join(',');

  // Build CSV rows
  const rows = data.map(row =>
    cols.map(col => {
      let val = row[col.key];
      if (val === null || val === undefined) val = '';
      if (val instanceof Date) val = val.toLocaleDateString();
      if (typeof val === 'string' && val.includes(',')) val = `"${val}"`;
      return `"${val}"`;
    }).join(',')
  );

  const csv = [header, ...rows].join('\n');

  // Create blob and trigger download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
