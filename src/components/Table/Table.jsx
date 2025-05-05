import React from 'react';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner.jsx'; // Import the spinner
import styles from './Table.module.css';

const Table = ({
  columns = [], // Array of { key: string, label: string, render?: (value, row) => ReactNode }
  data = [], // Array of data objects
  isLoading = false,
  keyField = 'id', // Field name in data objects holding the unique key
  className = '', // Class for the main wrapper
  tableClassName = '', // Class for the table element itself
  onRowClick, // Optional: function(row) called when a row is clicked
}) => {
  const hasData = data && data.length > 0;

  return (
    <div className={`${styles.tableWrapper} ${className}`}>
      {/* Loading Overlay */}
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <LoadingSpinner />
        </div>
      )}

      {/* Table Content */}
      <div className={styles.tableContainer}>
        <table className={`${styles.table} ${tableClassName}`}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!isLoading && hasData && (
              data.map((row, rowIndex) => (
                <tr
                  key={row[keyField] !== undefined ? row[keyField] : `row-${rowIndex}`} // Use keyField or index as fallback
                  className={onRowClick ? styles.clickableRow : ''}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  tabIndex={onRowClick ? 0 : undefined} // Make clickable rows focusable
                  onKeyDown={onRowClick ? (e) => (e.key === 'Enter' || e.key === ' ') && onRowClick(row) : undefined} // Allow activation with Enter/Space
                >
                  {columns.map((col) => {
                    const value = row[col.key];
                    return (
                      <td key={`${col.key}-${rowIndex}`}>
                        {/* Use render function if provided, otherwise display value */}
                        {col.render ? col.render(value, row) : (value ?? '')} {/* Render empty string for null/undefined */}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
            {!isLoading && !hasData && (
              // Show "No data" message if not loading and data array is empty
              <tr className={styles.noDataRow}>
                <td colSpan={columns.length || 1}>
                  No data available.
                </td>
              </tr>
            )}
            {/* Optionally show empty rows or skeleton while loading */}
            {/* {isLoading && ( ... render skeleton rows ... )} */}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;