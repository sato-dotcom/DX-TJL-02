/**
 * Exports data to a CSV file.
 * @param {string} filename The name of the file to download.
 * @param {Array<string>} headers The column headers.
 * @param {Array<Array<string|number>>} rows The data rows.
 */
export const exportToCsv = (filename, headers, rows) => {
  // Add BOM for proper UTF-8 encoding in Excel
  let csvContent = "\ufeff" + headers.join(',') + '\n';
  
  rows.forEach(row => {
    const rowContent = row.map(item => {
      const itemString = String(item === null || item === undefined ? '' : item).replace(/"/g, '""');
      return `"${itemString}"`;
    }).join(',');
    csvContent += rowContent + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
