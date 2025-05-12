import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';
// Use the actual path to your data file
import { chargingStationData } from '../data/chargingStationData';
import type { ChargingStationMetrics } from '../data/chargingStationData';

// Define DataMetricKey based on the actual keys of chargingStationData
export type DataMetricKey = Exclude<keyof ChargingStationMetrics, 'months'>;

// Placeholder for KpiDataItem
export interface KpiDataItem {
  key: string;
  value: number;
  label: string;
  title?: string;
  description?: string;
  icon?: React.ReactElement;
}

interface DashboardState {
  selectedVariables: DataMetricKey[];
  currentMetricKey: DataMetricKey | null;
  kpiData: KpiDataItem[];
  kpiLoadingStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  kpiError: string | null;
}

// Initialize with default values
const initialState: DashboardState = {
  selectedVariables: ['utilizationRates', 'unsatisfiedDemand'],
  currentMetricKey: 'utilizationRates',
  kpiData: [],
  kpiLoadingStatus: 'idle',
  kpiError: null,
};

// Create thunk for KPI data fetching
export const fetchKpiData = createAsyncThunk(
  'dashboard/fetchKpiData',
  async (_, { getState }) => {
    const state = getState() as RootState;
    const { currentMetricKey, selectedVariables } = state.dashboard;
    
    if (!currentMetricKey) {
      throw new Error("Cannot fetch KPI data: no metric selected");
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Logic from Dashboard.tsx calculateKpiValues function
    const rawMetricValues = chargingStationData[currentMetricKey];
    const months = chargingStationData.months;
    
    // Process data for KPI calculations
    const currentMonthIndex = months.length - 1;
    const lastMonthIndex = months.length - 1;
    const secondLastMonthIndex = months.length - 2;
    const highlightedMonthIndex = Math.floor(months.length / 2);
    
    const currentValue = rawMetricValues[currentMonthIndex] || 0;
    const lastMonthValue = rawMetricValues[lastMonthIndex] || 0;
    const secondLastMonthValue = rawMetricValues[secondLastMonthIndex] || 0;
    const highlightedMonthValue = rawMetricValues[highlightedMonthIndex] || 0;
    const targetValue = highlightedMonthValue * (1 + (Math.random() * 0.4 - 0.2));
    
    // Calculate KPI values
    const formatMetricName = (metric: string): string => {
      return metric.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    };
    
    const safePercentageChange = (newValue?: number, oldValue?: number): string => {
      if (typeof newValue !== 'number' || typeof oldValue !== 'number' || oldValue === 0) return "0.00%";
      return (((newValue - oldValue) / oldValue) * 100).toFixed(2) + "%";
    };
    
    let formattedCurrentValue = "N/A";
    switch(currentMetricKey) {
      case 'utilizationRates': case 'unsatisfiedDemand': case 'peakHourUsage': 
        formattedCurrentValue = `${currentValue.toFixed(1)}%`; 
        break;
      case 'energyDelivered': 
        formattedCurrentValue = `${(currentValue / 1000).toFixed(1)}k kWh`; 
        break;
      case 'averageChargingTime': 
        formattedCurrentValue = `${currentValue.toFixed(0)} min`; 
        break;
      default: 
        formattedCurrentValue = `${currentValue.toFixed(0)}`;
    }
    
    const momGrowth = safePercentageChange(lastMonthValue, secondLastMonthValue);
    const targetAch = safePercentageChange(highlightedMonthValue, targetValue);
    const growthToProj = safePercentageChange(highlightedMonthValue, currentValue);
    
    return [
      { 
        key: 'currentValue',
        title: formatMetricName(String(currentMetricKey)), 
        value: currentValue,
        label: formattedCurrentValue, 
        description: 'Current value of the selected metric.'
      },
      { 
        key: 'momGrowth',
        title: 'Month-over-Month Growth', 
        value: parseFloat(momGrowth), 
        label: momGrowth, 
        description: 'Change from the previous month.'
      },
      { 
        key: 'targetAch',
        title: 'Projection vs. Target', 
        value: parseFloat(targetAch), 
        label: targetAch, 
        description: 'Performance relative to a defined target.' 
      },
      { 
        key: 'growthToProj',
        title: 'Growth to Projection', 
        value: parseFloat(growthToProj), 
        label: growthToProj, 
        description: 'Change from current to a projected value.' 
      },
    ];
  }
);

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setSelectedVariables: (state, action: PayloadAction<DataMetricKey[]>) => {
      state.selectedVariables = action.payload;
    },
    toggleSelectedVariable: (state, action: PayloadAction<DataMetricKey>) => {
      const variable = action.payload;
      if (state.selectedVariables.includes(variable)) {
        state.selectedVariables = state.selectedVariables.filter((v) => v !== variable);
      } else {
        state.selectedVariables.push(variable);
      }
    },
    setCurrentMetricKey: (state, action: PayloadAction<DataMetricKey>) => {
      state.currentMetricKey = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchKpiData.pending, (state) => {
        state.kpiLoadingStatus = 'loading';
      })
      .addCase(fetchKpiData.fulfilled, (state, action) => {
        state.kpiLoadingStatus = 'succeeded';
        state.kpiData = action.payload;
        state.kpiError = null;
      })
      .addCase(fetchKpiData.rejected, (state, action) => {
        state.kpiLoadingStatus = 'failed';
        state.kpiError = action.error.message || 'Failed to fetch KPI data';
      });
  },
});

export const { setSelectedVariables, toggleSelectedVariable, setCurrentMetricKey } = dashboardSlice.actions;

// Selectors
export const selectSelectedVariables = (state: RootState) => state.dashboard.selectedVariables;
export const selectCurrentMetricKey = (state: RootState) => state.dashboard.currentMetricKey;
export const selectKpiData = (state: RootState) => state.dashboard.kpiData;
export const selectKpiLoadingStatus = (state: RootState) => state.dashboard.kpiLoadingStatus;
export const selectIsKpiLoading = (state: RootState) => state.dashboard.kpiLoadingStatus === 'loading';
export const selectKpiError = (state: RootState) => state.dashboard.kpiError;

export default dashboardSlice.reducer; 