import React from 'react';
import styles from './DataTable.module.css';

interface DataTableProps {
  data: any; // Placeholder for actual table data structure
  // Props for columns, rows, etc.
}

const DataTable: React.FC<DataTableProps> = ({ data }) => {
  // Placeholder: here should be a mapping of the data to generate rows and columns
  // Or use a table library like TanStack Table.


  const headers = ['Zone number', 'District name', 'Number of charging poles', 'Column 4', 'Column 5'];
  const rows = [
    ['Zone 1', 'District Name', '10', 'Raw Data', 'Raw Data'],
    ['Zone 2', 'District Name', '40', 'Raw Data', 'Raw Data'],
    ['Zone 3', 'District Name', '4', 'Raw Data', 'Raw Data'],
    ['Zone 4', 'District Name', '80', 'Raw Data', 'Raw Data'],
  ];

  return (
    <div className={styles.dataTableContainer}>
      <div className={styles.tableTabs}>
        <button className={`${styles.tabButton} ${styles.active}`}>Best Configuration</button>
        <button className={styles.tabButton}>Single vehicle Configuration</button>
        <button className={styles.tabButton}>Configuration of other costs</button>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable; 