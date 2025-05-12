import React, { useState, useEffect } from 'react';
import styles from './Chart.module.css';

interface ChartProps {
  data: any[];
  title: string;
  selectedVariables?: string[];
}

const Chart: React.FC<ChartProps> = ({ data, title, selectedVariables = [] }) => {
  // State to track data changes for debugging
  const [chartData, setChartData] = useState<any[]>([]);
  
  // Update chart data when props change
  useEffect(() => {
    console.log("Chart data updated:", data);
    setChartData(data);
  }, [data]);
  
  // Find max value for scaling the visualization
  const maxValue = Math.max(...chartData.map(item => item.value));
  
  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartHeader}>
        <h2>{title}</h2>
        {selectedVariables.length > 0 && (
          <div className={styles.variablesList}>
            Variables: {selectedVariables.join(', ')}
          </div>
        )}
      </div>
      
      <div className={styles.chartContent}>
        {/* Visual Bar Chart */}
        <div className={styles.barChart}>
          {chartData.map((item, index) => (
            <div key={index} className={styles.barChartItem}>
              <div className={styles.barLabel}>{item.month}</div>
              <div className={styles.barContainer}>
                <div 
                  className={`${styles.bar} ${item.highlighted ? styles.highlightedBar : ''}`}
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                >
                  <span className={styles.barValue}>${(item.value / 1000).toFixed(1)}k</span>
                </div>
                {item.target && (
                  <div 
                    className={styles.targetMarker}
                    style={{ left: `${(item.target / maxValue) * 100}%` }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className={styles.dataVisualizer}>
          <h3>Data Visualizer</h3>
          <div className={styles.dataTable}>
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Value</th>
                  <th>Target</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((item, index) => (
                  <tr key={index} className={item.highlighted ? styles.highlightedRow : ''}>
                    <td>{item.month}</td>
                    <td className={styles.valueCell}>
                      ${(item.value / 1000).toFixed(1)}k
                    </td>
                    <td>
                      {item.target ? `$${(item.target / 1000).toFixed(1)}k` : '-'}
                    </td>
                    <td>
                      {item.current ? 'Current' : ''}
                      {item.highlighted ? 'Highlighted' : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className={styles.chartEffects}>
            <h4>Variable Effects on Chart</h4>
            <ul>
              {selectedVariables.map((variable, index) => (
                <li key={index}>
                  {variable} - Applied to visualization
                </li>
              ))}
              {selectedVariables.length === 0 && (
                <li className={styles.noVariables}>No variables selected</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chart; 