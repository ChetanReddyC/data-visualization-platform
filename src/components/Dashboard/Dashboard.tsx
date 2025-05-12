import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleVariablePanel, selectVariablePanelOpen } from '../../store/uiSlice';
import type { DataMetricKey, KpiDataItem } from '../../store/dashboardSlice';
import { 
  setSelectedVariables, 
  selectSelectedVariables, 
  setCurrentMetricKey,
  selectCurrentMetricKey,
  fetchKpiData,
  selectIsKpiLoading,
  selectKpiData,
  selectKpiError,
  selectKpiLoadingStatus
} from '../../store/dashboardSlice';
import { selectChartSeriesData, selectChartMonths } from '../../store/selectors';
import styles from './Dashboard.module.css';
import KpiCard from './KpiCard'; 
import Chart from './Chart';
import VariablePanel from './VariablePanel';
import AboutIcon from '../../assets/icons/about-icon.svg?react';
import HistoryIcon from '../../assets/icons/history-icon.svg?react';
import UploadIcon from '../../assets/icons/upload-icon.svg?react';
import ElectricIcon from '../../assets/icons/electric-icon.svg?react';
import { chargingStationData } from '../../data/chargingStationData';

// SVG icons with the correct suffix for Vite
const PlusIcon = () => <img src="../../assets/icons/plus-icon.svg" alt="Add Variables" />;
const EditVariablesIcon = () => <span>Edit Variables</span>; // Placeholder for actual icon/button
const ArrowButtonIcon1 = () => <img src="../../assets/icons/vector_10_icon_button.svg" alt="Action 1" />;
const ArrowButtonIcon2 = () => <img src="../../assets/icons/vector_icon_button.svg" alt="Action 2" />;
const ChevronDownButtonIcon = () => <img src="../../assets/icons/chevron-down.svg" alt="Options" />;
const ReloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.65 2.35C12.2 0.9 10.21 0 8 0C3.58 0 0.01 3.58 0.01 8C0.01 12.42 3.58 16 8 16C11.73 16 14.84 13.45 15.73 10H13.65C12.83 12.33 10.61 14 8 14C4.69 14 2 11.31 2 8C2 4.69 4.69 2 8 2C9.66 2 11.14 2.69 12.22 3.78L9 7H16V0L13.65 2.35Z" fill="currentColor"/>
  </svg>
);

// Define chart types for the dropdown menu
const chartTypes = [
  { id: 'unsatisfiedDemand', label: 'Unsatisfied Demand %' },
  { id: 'revenue', label: 'Revenue Projection' },
  { id: 'fleetGrowth', label: 'Fleet Growth' },
  { id: 'infrastructureUnits', label: 'Infrastructure Units' }
];

// Impact factors for generating data
const variableImpactFactors = {
  'Co2 Distribution': { multiplier: 1.35, target: 1.15 },
  'Fleet sizing': { multiplier: 1.45, target: 1.25 },
  'Carbon 1': { multiplier: 0.7, target: 0.85 },
  'Border Rate': { multiplier: 1.3, target: 1.2 },
  'Request rate': { multiplier: 1.4, target: 1.25 },
  'Parking Rate': { multiplier: 0.75, target: 0.85 },
  'Variable 1': { multiplier: 1.25, target: 1.15 },
  'Variable 2': { multiplier: 0.8, target: 0.9 },
  'Variable 3': { multiplier: 1.2, target: 1.1 },
  'Variable 4': { multiplier: 0.85, target: 0.95 },
  'Variable 5': { multiplier: 1.15, target: 1.05 },
  'Variable 6': { multiplier: 0.9, target: 1.0 }
};

// List of available metrics for selection, excluding 'months'
const availableMetricsForSelection = Object.keys(chargingStationData).filter(
  (key) => key !== 'months'
) as DataMetricKey[];

// Utility function to format metric names
const formatMetricName = (metric: string): string => {
  return metric.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

// Structure for displaying KPI items
interface DisplayKpiItem {
  title: string;
  value: string;
  description: string;
  icon: React.ReactElement;
}

const Dashboard: React.FC = () => {
  // Redux selectors to get state
  const variablePanelOpen = useSelector(selectVariablePanelOpen);
  const selectedVariables = useSelector(selectSelectedVariables);
  const currentMetricKey = useSelector(selectCurrentMetricKey);
  const chartSeriesData = useSelector(selectChartSeriesData);
  const chartMonths = useSelector(selectChartMonths);
  const kpiData = useSelector(selectKpiData);
  const isLoadingKpi = useSelector(selectIsKpiLoading);
  const kpiError = useSelector(selectKpiError);
  const kpiLoadingStatus = useSelector(selectKpiLoadingStatus);
  
  // Local state for loading and error handling
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [chartError, setChartError] = useState<string | null>(null);
  const dispatch = useDispatch();

  // Track if the page is loading for the first time
  const [initialLoad, setInitialLoad] = useState(true);

  // State to control chart animation
  const [animateChart, setAnimateChart] = useState(false);

  // Effect to handle initial page load
  useEffect(() => {
    if (initialLoad) {
      setIsChartLoading(true);
      const timer = setTimeout(() => {
        setInitialLoad(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [initialLoad]);

  // Effect to manage chart loading and animation
  useEffect(() => {
    if (chartSeriesData.length === 0 && currentMetricKey) {
      setIsChartLoading(true);
      setAnimateChart(false);
    } else {
      if (isChartLoading) {
        const timer = setTimeout(() => {
          setIsChartLoading(false);
          setChartError(null);
          setAnimateChart(true); // Start animation after loading
        }, 2000); // Ensure loading indicator is shown for at least 2 seconds
        
        return () => clearTimeout(timer);
      }
    }
  }, [chartSeriesData, currentMetricKey, isChartLoading]);

  // Simulate chart errors for demonstration purposes
  useEffect(() => {
    const hasChartData = chartSeriesData && chartSeriesData.length > 0 && 
                        chartSeriesData[0].data && chartSeriesData[0].data.length > 0;
    
    if (!hasChartData && !isChartLoading && currentMetricKey) {
      setChartError("Failed to load chart data. Please try again.");
    }
  }, [chartSeriesData, isChartLoading, currentMetricKey]);

  // Log changes in the variable panel state
  useEffect(() => {
    console.log("Dashboard detected variablePanelOpen change:", variablePanelOpen);
  }, [variablePanelOpen]);

  // State for displaying KPI data
  const [kpiDisplayData, setKpiDisplayData] = useState<DisplayKpiItem[]>([]);

  // Placeholder KPIs to show while loading
  const kpiPlaceholders = useMemo<DisplayKpiItem[]>(() => [
    { title: 'Current Value', value: 'Loading...', description: 'Current value of the selected metric.', icon: <AboutIcon /> },
    { title: 'Month-over-Month Growth', value: 'Loading...', description: 'Change from the previous month.', icon: <AboutIcon /> },
    { title: 'Projection vs. Target', value: 'Loading...', description: 'Performance relative to a defined target.', icon: <AboutIcon /> },
    { title: 'Growth to Projection', value: 'Loading...', description: 'Change from current to a projected value.', icon: <AboutIcon /> },
  ], []);

  // Fetch KPI data when metric or variables change
  useEffect(() => {
    if (currentMetricKey) {
      dispatch(fetchKpiData() as any); // Fetch KPI data
    }
  }, [currentMetricKey, selectedVariables, dispatch]);

  // Process KPI data for display
  useEffect(() => {
    if (!kpiData?.length) {
      setKpiDisplayData(kpiPlaceholders);
      return;
    }

    // Map KPI data to display format
    const displayItems = kpiData.map((item, index) => {
      return {
        title: item.title || kpiPlaceholders[index]?.title || 'Untitled',
        value: item.label || String(item.value) || 'N/A',
        description: item.description || kpiPlaceholders[index]?.description || '',
        icon: kpiPlaceholders[index]?.icon || <AboutIcon />
      };
    });

    setKpiDisplayData(displayItems);
  }, [kpiData, kpiPlaceholders]);

  // Toggle the variable panel
  const toggleVariablePanelCallback = () => {
    console.log("%c ▶️ Edit Variables button clicked!", "background: #333; color: #C9FF3B; padding: 4px 8px; font-weight: bold;");
    console.log("Current panel state:", variablePanelOpen);
    
    try {
      dispatch(toggleVariablePanel());
      console.log("After dispatch, panel state should be toggled");
    } catch (error) {
      console.error("Error dispatching toggleVariablePanel action:", error);
    }
  };
  
  // Handle variable selection changes
  const handleVariableSelection = useCallback((variables: DataMetricKey[]) => {
    setIsChartLoading(true); // Show loading indicator
    dispatch(setSelectedVariables(variables));
  }, [dispatch]);

  // Handle metric changes
  const handleMetricChange = useCallback((metricKey: DataMetricKey) => {
    setIsChartLoading(true); // Show loading indicator
    dispatch(setCurrentMetricKey(metricKey));
  }, [dispatch]);

  // Retry fetching KPI data
  const handleRetryKpi = useCallback(() => {
    dispatch(fetchKpiData() as any);
  }, [dispatch]);

  // Retry loading chart data
  const handleRetryChart = useCallback(() => {
    setChartError(null);
    setIsChartLoading(true);
    if (currentMetricKey) {
      dispatch(setCurrentMetricKey(currentMetricKey));
    }
    setTimeout(() => setIsChartLoading(false), 1000);
  }, [currentMetricKey, dispatch]);

  // Show loading screen if no metric is selected
  if (currentMetricKey === null) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading dashboard configuration...</p>
      </div>
    ); 
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.pageHeader}>
        <h1><span className={styles.titleIcon}><ElectricIcon /></span>Charging Station</h1> 
        <div className={styles.headerActions}>
            <button className={styles.actionButtonSmall}><HistoryIcon /></button>
            <button className={styles.actionButton} onClick={toggleVariablePanelCallback}>Edit Variables</button>
            <button className={styles.actionButtonSmall}><UploadIcon /></button>
        </div>
      </div>

      {/* Best Scenario Results section */}
      <section className={styles.bestScenarioSection}>
        <h2>✨ Best Scenario Results</h2>
        <div className={styles.bestScenarioList}>
          <div className={styles.bestScenarioItem}>
            The best found configuration based on profit is characterized by 11 zones (max) with charging stations and 48 total number of poles.
            <span className={styles.bestScenarioOptions}>...</span>
          </div>
          <div className={styles.bestScenarioItem}>
            The best found configuration based on satisfied demand is characterized by 11 zones (max) with charging stations and 48 total number of poles.
            <span className={styles.bestScenarioOptions}>...</span>
          </div>
        </div>
      </section>

      {/* Wrapper for KPI and Graph sections */}
      <div className={styles.mainContentWrapper}>
        <section className={styles.graphsSection}>
          <div className={styles.sectionHeader}>
              <h2>Graphs</h2>
              {chartError && (
                <button
                  className={`${styles.retryButton}`}
                  onClick={handleRetryChart}
                  title="Retry loading chart data"
                >
                  <ReloadIcon /> Retry
                </button>
              )}
          </div>
          
          {chartError ? (
            <div className={styles.errorContainer}>
              <div className={styles.errorIcon}>!</div>
              <p className={styles.errorMessage}>{chartError}</p>
              <button className={styles.retryButtonLarge} onClick={handleRetryChart}>
                <ReloadIcon /> Retry Loading Chart
              </button>
            </div>
          ) : (
            <Chart 
              key={`chart-${selectedVariables.join('-')}-${currentMetricKey}`}
              seriesData={chartSeriesData}
              months={chartMonths}
              selectedMetricKey={currentMetricKey}
              onMetricChange={handleMetricChange}
              isLoading={isChartLoading}
              animateIn={animateChart}
            />
          )}
        </section>

        <section className={`${styles.kpiSection} ${isLoadingKpi ? styles.kpiSectionLoading : ''}`}>
          <div className={styles.sectionHeader}>
            <h2>Key Performance Indicators</h2>
            <div className={styles.kpiHeaderActions}>
              {kpiLoadingStatus === 'failed' && (
                <button
                  className={`${styles.retryButton}`}
                  onClick={handleRetryKpi}
                  title="Retry loading KPI data"
                >
                  <ReloadIcon /> Retry
                </button>
              )}
              <button 
                className={`${styles.actionButton} ${styles.variablesButton}`}
                onClick={toggleVariablePanelCallback}
              >
                Variables +
              </button>
            </div>
          </div>

          {kpiLoadingStatus === 'failed' ? (
            <div className={styles.errorContainer}>
              <div className={styles.errorIcon}>!</div>
              <p className={styles.errorMessage}>
                {kpiError || "Failed to load KPI data. Please try again."}
              </p>
              <button className={styles.retryButtonLarge} onClick={handleRetryKpi}>
                <ReloadIcon /> Retry Loading KPIs
              </button>
            </div>
          ) : (
            <div className={styles.kpiGrid}>
              {kpiDisplayData.map((kpiItem, index) => (
                <KpiCard 
                  key={index}
                  title={kpiItem.title}
                  value={kpiItem.value} 
                  description={kpiItem.description} 
                  icon={kpiItem.icon}
                  isLoading={isLoadingKpi} 
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <VariablePanel 
        isOpen={variablePanelOpen} 
        onClose={toggleVariablePanelCallback}
        selectedVariables={selectedVariables} 
        onVariablesSelected={handleVariableSelection}
        availableChartTypes={chartTypes.map(ct => ({ id: ct.id as DataMetricKey, label: ct.label }))}
        activeChartType={currentMetricKey}
        onChartTypeChange={handleMetricChange}
      />
    </div>
  );
};

export default Dashboard;