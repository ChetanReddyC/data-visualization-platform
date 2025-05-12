import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from './store';
import { selectCurrentMetricKey, selectSelectedVariables } from './dashboardSlice';
import type { DataMetricKey } from './dashboardSlice';
import { chargingStationData } from '../data/chargingStationData';

// Create a memoized selector for chart data
export const selectChartData = createSelector(
  [selectCurrentMetricKey, selectSelectedVariables],
  (currentMetricKey, selectedVariables) => {
    if (!currentMetricKey) return [];
    
    // Get the raw data for the selected metric
    const rawMetricValues = chargingStationData[currentMetricKey];
    const months = chargingStationData.months;
    
    // Create the base structured data
    const baseStructuredData = months.map((month, index) => {
      const value = rawMetricValues[index] || 0;
      return {
        month: month,
        value: value,
        current: index === months.length - 1, 
        label: index === months.length - 1 ? 'Now' : undefined,
        highlighted: index === Math.floor(months.length / 2), 
        target: value * (1 + (Math.random() * 0.4 - 0.2)),
      };
    });

    // Apply selected variables to modify the chart data
    if (selectedVariables.length > 0) {
      // This would be where variable impacts are applied in a real application
      // For this demonstration, we'll just return the base data
      // In a real app, this would modify the chart data based on selected variables
      return baseStructuredData;
    } else {
      return baseStructuredData;
    }
  }
);

// Create a selector to extract months for the chart
export const selectChartMonths = createSelector(
  [],
  () => {
    return chargingStationData.months;
  }
);

// Utility function to format metric names
const formatMetricName = (metric: string): string => {
  return metric.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

// Colors for different series
const SERIES_COLORS = ['#C8E972', '#88D1F1', '#FFB3BA', '#FFDFB3', '#B3B3D9', '#FFB3FF', '#B3E6B3'];

// Utility function to create series data format required by Chart component
export const selectChartSeriesData = createSelector(
  [selectCurrentMetricKey, selectSelectedVariables],
  (currentMetricKey, selectedVariables) => {
    if (!currentMetricKey) return [];
    
    // If no variables are selected, just return the current metric
    if (selectedVariables.length === 0) {
      return [
        {
          key: currentMetricKey,
          name: formatMetricName(currentMetricKey),
          data: chargingStationData[currentMetricKey],
          color: SERIES_COLORS[0], // Default color
        }
      ];
    }
    
    // Include the current metric if it's not already in selectedVariables
    const allSeriesToShow = selectedVariables.includes(currentMetricKey) 
      ? [...selectedVariables] 
      : [currentMetricKey, ...selectedVariables];
    
    // Create a series for each selected variable
    return allSeriesToShow.map((metricKey, index) => {
      return {
        key: metricKey,
        name: formatMetricName(metricKey),
        data: chargingStationData[metricKey],
        color: SERIES_COLORS[index % SERIES_COLORS.length],
      };
    });
  }
); 