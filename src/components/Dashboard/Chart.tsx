import React, { useState, useEffect, useRef, useMemo } from "react"
import { chargingStationData } from "../../data/chargingStationData"

// Defining the types of keys for the chargingStationData object, excluding 'months'
type DataMetricKey = Exclude<keyof typeof chargingStationData, 'months'>;

// Defining the types of charts available
type ChartType = 'line' | 'bar' | 'area'

// Constants for animation durations
const EXIT_ANIMATION_DURATION = 600; 
const ENTRANCE_ANIMATION_DELAY = 50; 

// Structure for a single data series
export interface DataSeries {
  key: DataMetricKey;
  name: string; 
  data: number[];  
  normalizedData?: number[];
  color: string; 
}

// Color palette for multiple series
const SERIES_COLORS = ['#C8E972', '#88D1F1', '#FFB3BA', '#FFDFB3', '#B3B3D9', '#FFB3FF', '#B3E6B3'];

// Props for the Chart component
interface ChartProps {
  seriesData: DataSeries[]; 
  months: string[]; 
  selectedMetricKey?: DataMetricKey;
  onMetricChange?: (metric: DataMetricKey) => void; 
  isLoading?: boolean;
  animateIn?: boolean;
}

// Structure for formatted metric values
interface FormattedMetricValue {
  numericPart: string; 
  unitPart: string; 
}

// Information for a single series at a hover point
interface HoveredDataPoint {
  seriesKey: DataMetricKey; 
  seriesName: string; 
  value: number; 
  formattedValue: FormattedMetricValue; 
  color: string; 
  comparison?: {
    text: string; 
    status: 'above' | 'below' | 'on'; 
  };
}

// Information for all series at a hover point
interface HoveredData {
  index: number; 
  month: string; 
  x: number; 
  y: number; 
  svgX: number; 
  points: HoveredDataPoint[]; 
}

const Chart: React.FC<ChartProps> = ({ seriesData, months, selectedMetricKey, onMetricChange, isLoading = false, animateIn = false }) => {
  const [chartType, setChartType] = useState<ChartType>("line");

  // State for the metric currently being displayed
  const [displayMetricForFormatting, setDisplayMetricForFormatting] = useState<DataMetricKey | undefined>(seriesData.length > 0 ? seriesData[0].key : undefined);
  const [displayChartType, setDisplayChartType] = useState(chartType);
  
  // Process and normalize series data
  const processedSeries = useMemo((): DataSeries[] => {
    if (!seriesData || seriesData.length === 0) return [];

    return seriesData.map((series, index) => {
      const seriesMax = Math.max(...series.data);
      const seriesMin = Math.min(...series.data);

      let normalizedData: number[];
      if (chartType === 'line' || chartType === 'area') {
        // Normalize data for line and area charts
        if (seriesMax === seriesMin) {
          normalizedData = series.data.map(() => 0.5); // All values are the same, plot in the middle
        } else {
          normalizedData = series.data.map(val => (val - seriesMin) / (seriesMax - seriesMin)); // Normalize 0-1
        }
      } else {
        normalizedData = series.data; // Use original data for bar charts
      }
      
      return {
        ...series,
        name: series.name || formatMetricName(series.key), 
        normalizedData: normalizedData,
        color: series.color || SERIES_COLORS[index % SERIES_COLORS.length],
      };
    });
  }, [seriesData, chartType]);

  // Determine the primary series for display
  const primarySeries = useMemo(() => processedSeries.length > 0 ? processedSeries[0] : null, [processedSeries]);
  const displayData = useMemo(() => primarySeries ? (chartType === 'line' || chartType === 'area' ? primarySeries.normalizedData : primarySeries.data) || [] : [], [primarySeries, chartType]);

  const [isExiting, setIsExiting] = useState(false);

  // Animation states for different chart types
  const [animateLinePointsIn, setAnimateLinePointsIn] = useState(false);
  const [animateBarsIn, setAnimateBarsIn] = useState(false);
  const [animateAreaIn, setAnimateAreaIn] = useState(false);

  const [hoveredData, setHoveredData] = useState<HoveredData | null>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Refs for managing multiple lines/paths
  const lineRefs = useRef<Map<DataMetricKey, SVGPolylineElement | null>>(new Map());
  const linePathLengths = useRef<Map<DataMetricKey, number>>(new Map());
  
  // Dimensions for the SVG viewBox
  const viewBoxWidth = 800;
  const viewBoxHeight = 200;
  const padding = 20; // Padding around the chart
  const chartWidth = viewBoxWidth - (padding * 2);
  const chartHeight = viewBoxHeight - (padding * 2);
  
  // Calculate the maximum value for the Y-axis
  const maxValue = useMemo(() => {
    if (chartType === 'line' || chartType === 'area') {
      return 1; // Normalized data ranges 0-1
    }
    // For bar charts, find max across all series
    let maxVal = 0;
    processedSeries.forEach(series => {
      if (series.data.length > 0) {
        const seriesMax = Math.max(...series.data.filter(v => isFinite(v)));
        maxVal = Math.max(maxVal, seriesMax);
      }
    });
    return maxVal > 0 ? maxVal : 1;
  }, [processedSeries, chartType]);
  
  // Calculate SVG coordinates for each point in each series
  const seriesSvgPoints = useMemo(() => {
    return processedSeries.map(series => {
      const dataToPlot = (chartType === 'line' || chartType === 'area') ? series.normalizedData : series.data;
      if (!dataToPlot || dataToPlot.length === 0) return { key: series.key, points: [] };

      const currentMaxValue = (chartType === 'line' || chartType === 'area') ? 1 : Math.max(...dataToPlot.filter(v => isFinite(v)));

      return {
        key: series.key,
        color: series.color,
        points: dataToPlot.map((value, index) => {
          // Calculate the center position for each month - for bar charts, this centers the bars
          const segmentCount = dataToPlot.length > 1 ? dataToPlot.length - 1 : 1;
          const monthSegmentWidth = chartWidth / segmentCount;
          const x = padding + (monthSegmentWidth * index);
          
          // Ensure value is finite, default to 0 if not (can happen with -Infinity from Math.max on empty or all-zero array)
          const finiteValue = isFinite(value) ? value : 0;
          const finiteMaxValue = isFinite(currentMaxValue) && currentMaxValue > 0 ? currentMaxValue : 1;
          
          const y = viewBoxHeight - (finiteValue / finiteMaxValue * chartHeight) - padding;
          return { x, y, originalValue: series.data[index], normalizedValue: value, index };
        })
      };
    });
  }, [processedSeries, maxValue, chartWidth, chartHeight, padding, viewBoxHeight, chartType]);

  // Effect to handle transitions for metric/chart type changes
  useEffect(() => {
    const currentPrimaryMetric = seriesData.length > 0 ? seriesData[0].key : undefined;
    if (currentPrimaryMetric !== displayMetricForFormatting || chartType !== displayChartType) {
      setIsExiting(true);
      const timer = setTimeout(() => {
        setDisplayMetricForFormatting(currentPrimaryMetric);
        setDisplayChartType(chartType);
        setIsExiting(false);
      }, EXIT_ANIMATION_DURATION);
      return () => clearTimeout(timer);
    }
  }, [seriesData, chartType, displayMetricForFormatting, displayChartType]);

  // Modify the Effect for Entrance Animations to check for isLoading before triggering animations
  useEffect(() => {

    if (isLoading) {
      return;
    }
    
    if (isExiting) {
      setAnimateLinePointsIn(false);
      setAnimateBarsIn(false);
      setAnimateAreaIn(false);
      return;
    }

    setAnimateLinePointsIn(false);
    setAnimateBarsIn(false);
    setAnimateAreaIn(false);

    // Add a small delay before starting animations if triggered by animateIn
    const animationDelay = animateIn ? 100 : ENTRANCE_ANIMATION_DELAY;

    if (displayChartType === 'line') {
      seriesSvgPoints.forEach(seriesPlot => {
        const line = lineRefs.current.get(seriesPlot.key);
        if (line) {
          line.style.transition = 'none';
          const length = line.getTotalLength();
          linePathLengths.current.set(seriesPlot.key, length);

          if (length > 0 && isFinite(length)) {
            line.style.strokeDasharray = `${length} ${length}`;
            line.style.strokeDashoffset = `${length}`;
          } else {
            line.style.strokeDasharray = '0';
            line.style.strokeDashoffset = '0';
          }
        }
      });
      
      setTimeout(() => {
        if (!isExiting && displayChartType === 'line' && !isLoading) {
          seriesSvgPoints.forEach(seriesPlot => {
            const line = lineRefs.current.get(seriesPlot.key);
            if (line) {
              // Make animation faster when triggered by animateIn
              const duration = animateIn ? '1s' : '1.5s';
              const easing = animateIn ? 'cubic-bezier(0.25, 0.8, 0.25, 1)' : 'ease-in-out';
              line.style.transition = `stroke-dashoffset ${duration} ${easing}`;
              line.style.strokeDashoffset = '0';
            }
          });
          setAnimateLinePointsIn(true);
        }
      }, animationDelay);
    }

    if (displayChartType === 'bar') {
      // Make bar animation more dramatic with staggered entry
      setTimeout(() => {
        setAnimateBarsIn(true);
      }, animationDelay);
    }
    
    if (displayChartType === 'area') {
      setTimeout(() => {
        setAnimateAreaIn(true);
      }, animationDelay);
    }
  }, [isExiting, displayMetricForFormatting, displayChartType, seriesSvgPoints, animateIn, isLoading]); // Add isLoading to dependencies

  // Add effect to reset animation states when loading starts
  useEffect(() => {
    // Reset animation states when loading starts
    if (isLoading) {
      setAnimateLinePointsIn(false);
      setAnimateBarsIn(false);
      setAnimateAreaIn(false);
    }
  }, [isLoading]);

  const formatMetricName = (metric: string): string => {
    if (!metric) return "Unknown Metric";
    return metric.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  const formatMetricForDisplay = (value: number, metricKey: DataMetricKey): FormattedMetricValue => {
    let numericString: string;
    const absValue = Math.abs(value); 

    if (absValue >= 1000000) { 
      numericString = (value / 1000000).toFixed(2) + 'M';
    } else if (absValue >= 1000) { 
      numericString = (value / 1000).toFixed(2) + 'k';
    } else {
      numericString = value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    }

    let unitPart = "";
    // Ensure metricKey is valid before switch
    const validMetricKey = Object.keys(chargingStationData).includes(metricKey) ? metricKey : undefined;

    if (validMetricKey) {
        switch(validMetricKey as keyof typeof chargingStationData) { // Cast as it's now validated
      case 'utilizationRates':
      case 'unsatisfiedDemand':
      case 'peakHourUsage':
        unitPart = "%"; break;
      case 'energyDelivered':
        unitPart = "kWh"; break;
      case 'averageChargingTime':
        unitPart = "min"; break;
            
      default:
              
        unitPart = ""; 
        }
    }
    return { numericPart: numericString, unitPart };
  };

  // Add this new state to track the previous hovered data position
  const [prevHoveredIndex, setPrevHoveredIndex] = useState<number | null>(null);
  const [isChangingPoint, setIsChangingPoint] = useState(false);

  // Modify the triggerHoverEffects function
  const triggerHoverEffects = (monthIndex: number) => {
    if (!svgRef.current || !chartContainerRef.current || seriesSvgPoints.length === 0 || !seriesSvgPoints[0].points[monthIndex]) {
      return;
    }

    // Save the current data for animation before updating to new data
    if (hoveredData && hoveredData.index !== monthIndex) {
      setIsChangingPoint(true);
      setPrevHoveredIndex(hoveredData.index);
      
      // Reset the changing flag after animation completes
      setTimeout(() => {
        setIsChangingPoint(false);
      }, 300);
    }

    const svgElement = svgRef.current;
    const chartRect = chartContainerRef.current.getBoundingClientRect();

    // Use the X from the first series for the guideline (all series align on X for a given month index)
    const representativeSvgX = seriesSvgPoints[0].points[monthIndex].x;

    const hoveredPoints: HoveredDataPoint[] = [];

    processedSeries.forEach((series, seriesIdx) => {
      const pointData = seriesSvgPoints[seriesIdx]?.points[monthIndex];
      if (!pointData) return;

      const originalValue = pointData.originalValue;
      const formattedValue = formatMetricForDisplay(originalValue, series.key);
      
      // Simplified comparison for now, can be expanded per series
      let comparisonData: HoveredDataPoint['comparison'] = undefined;
      const seriesOriginalData = series.data;
      if (seriesOriginalData.length > 0) {
          const avg = seriesOriginalData.reduce((a, b) => a + b, 0) / seriesOriginalData.length;
          if (avg !== 0) {
            const diff = originalValue - avg;
            if (Math.abs(diff) < 0.0001 * Math.abs(avg)) {
                comparisonData = { text: 'on average', status: 'on' };
            } else {
                const percDiff = Math.abs((diff / avg) * 100);
                comparisonData = { text: `${percDiff.toFixed(1)}% ${diff > 0 ? 'above' : 'below'} average`, status: diff > 0 ? 'above' : 'below'};
            }
          } else if (originalValue !== 0) {
            comparisonData = { text: originalValue > 0 ? 'above average' : 'below average', status: originalValue > 0 ? 'above' : 'below'};
          } else {
            comparisonData = { text: 'on average', status: 'on'};
          }
      }

      hoveredPoints.push({
        seriesKey: series.key,
        seriesName: series.name,
        value: originalValue,
        formattedValue,
        color: series.color,
        comparison: comparisonData,
      });
    });
    
    // Position tooltip based on the first point's screen coordinates, needs care
    const firstSeriesPoint = seriesSvgPoints[0].points[monthIndex];
    const svgInternalPoint = svgElement.createSVGPoint();
    svgInternalPoint.x = firstSeriesPoint.x;
    svgInternalPoint.y = firstSeriesPoint.y; // Y position for tooltip might need to be average or highest point

    const ctm = svgElement.getScreenCTM();
    if (!ctm) return;
    const screenPoint = svgInternalPoint.matrixTransform(ctm);

    const tooltipX = screenPoint.x - chartRect.left;
    const tooltipY = screenPoint.y - chartRect.top;

    setHoveredData({
      index: monthIndex,
      month: months[monthIndex],
      x: tooltipX,
      y: tooltipY,
      svgX: representativeSvgX,
      points: hoveredPoints,
    });
    setTooltipVisible(true);
  };


  const clearHoverEffects = () => {
    setTooltipVisible(false);
    setTimeout(() => {
      if (!tooltipVisible) { 
          setHoveredData(null); 
      }
    }, 400); // Increased to match longer animation
  };
  
  const [proximityHoverTargetIndex, setProximityHoverTargetIndex] = useState<number | null>(null);

  const handleSvgMouseMove = (event: React.MouseEvent<SVGRectElement>) => {
    if (!svgRef.current || !seriesSvgPoints || seriesSvgPoints.length === 0 || seriesSvgPoints[0].points.length === 0) return;

    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;

    const ctm = svg.getScreenCTM();
    if (!ctm) return; 

    let invertedCtm: DOMMatrix | null = null;
    try {
      invertedCtm = ctm.inverse();
    } catch (e) {
      return;
    }
    if (!invertedCtm) return;

    const svgMousePoint = pt.matrixTransform(invertedCtm);

    let closestPointIdx = -1;
    let minDistanceSq = Infinity;
    // Use points from the first series for X-coordinate matching
    const referencePoints = seriesSvgPoints[0].points;
    const pointSpacing = referencePoints.length > 1 ? chartWidth / (referencePoints.length -1) : chartWidth;
    const threshold = pointSpacing / 2; 

    referencePoints.forEach((point, idx) => {
      const distanceSq = Math.pow(point.x - svgMousePoint.x, 2);
      if (svgMousePoint.x >= point.x - threshold && svgMousePoint.x <= point.x + threshold) {
        if (distanceSq < minDistanceSq) {
          minDistanceSq = distanceSq;
          closestPointIdx = idx;
        }
      }
    });

    if (closestPointIdx !== -1) {
      if (hoveredData?.index !== closestPointIdx || !tooltipVisible) {
        triggerHoverEffects(closestPointIdx);
        setProximityHoverTargetIndex(closestPointIdx);
      }
    } else {
      if (hoveredData !== null) {
        clearHoverEffects();
        setProximityHoverTargetIndex(null);
      }
    }
  };

  const handleSvgMouseLeave = () => {
    clearHoverEffects();
    setProximityHoverTargetIndex(null);
  };

  // --- MODIFIED: Y-Axis Labels for Normalized Data (0-100%) or original scale for bars ---
  const yAxisLabels = useMemo(() => {
    const numTicks = 4;
    let labels: string[] = [];
    if (chartType === 'line' || chartType === 'area') { // Normalized Y-Axis
        for (let i = 0; i <= numTicks; i++) {
            labels.push(`${Math.round((i / numTicks) * 100)}%`);
        }
    } else { // Bar chart - using maxValue from original data (of primary series for now)
        const currentDisplayMetricKey = primarySeries?.key;
        if (primarySeries && primarySeries.data.every(d => d === 0) && maxValue === 0) {
             return Array(numTicks + 1).fill("0");
    }
    for (let i = 0; i <= numTicks; i++) {
      const val = (maxValue / numTicks) * i;
            if (currentDisplayMetricKey) {
                const formatted = formatMetricForDisplay(val, currentDisplayMetricKey);
                // Try to show unit if simple, otherwise just number
                if (formatted.unitPart && !formatted.numericPart.includes('M') && !formatted.numericPart.includes('k')) {
                     labels.push(`${Math.round(val)}${formatted.unitPart}`);
                } else {
                     labels.push(formatted.numericPart.replace(formatted.unitPart, '').trim()); // Show k/M if present
                }
            } else {
                 labels.push(`${Math.round(val)}`);
            }
      }
    }
    return labels.reverse();
  }, [maxValue, chartType, primarySeries]); //displayMetricForFormatting replaced by primarySeries.key logic
  
  // Chart Title - TODO: Make dynamic based on series or prop
  const chartTitle = useMemo(() => {
    if (processedSeries.length === 0) return "No data selected";
    if (processedSeries.length === 1) return formatMetricName(processedSeries[0].name);
    return "Monthly Trends Comparison"; 
  }, [processedSeries]);

  
  // Add a new state to track when animation has been triggered
  const [hasAnimated, setHasAnimated] = useState(false);
  
  // Also update the animate-in trigger effect to prevent animation while loading
  useEffect(() => {
    if (animateIn && !isLoading) {
      setAnimateLinePointsIn(true);
      setAnimateBarsIn(true);
      setAnimateAreaIn(true);
      setHasAnimated(true);
    }
  }, [animateIn, isLoading]);

  // Update the animation keyframes to remove the chartEntrance animation
  const styles = document.createElement('style');
  styles.id = 'chart-styles';
  styles.innerHTML = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes pulse {
      0% { opacity: 0.7; transform: scale(0.95); }
      50% { opacity: 1; transform: scale(1.05); }
      100% { opacity: 1; transform: scale(1); }
    }
    
    @keyframes blinkHighlight {
      0% { opacity: 0.7; }
      50% { opacity: 1; }
      100% { opacity: 1; }
    }

    @keyframes pulseBlur {
      0% { opacity: 0.7; transform: scale(0.95); filter: blur(3px); }
      50% { opacity: 1; transform: scale(1.05); filter: blur(1px); }
      100% { opacity: 1; transform: scale(1); filter: blur(0px); }
    }
    
    @keyframes blinkHighlightBlur {
      0% { opacity: 0.7; filter: blur(2px); }
      50% { opacity: 1; filter: blur(0.5px); }
      100% { opacity: 1; filter: blur(0px); }
    }
  `;
  
  // Only append if not already present
  if (!document.getElementById('chart-styles')) {
    document.head.appendChild(styles);
  }

  // Render loading overlay when isLoading is true
  const renderLoadingOverlay = () => {
    if (!isLoading) return null;
    
    return (
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(34, 35, 36, 0.7)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '12px',
        zIndex: 10
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(200, 233, 114, 0.2)',
          borderTop: '3px solid rgba(200, 233, 114, 0.8)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '12px'
        }} />
        <p style={{color: '#E1E2E2', fontSize: '14px'}}>Loading chart data...</p>
      </div>
    );
  };

  // Check if there's no data to display
  const renderNoDataMessage = () => {
    // Only show if not loading and there's no data
    if (isLoading || processedSeries.length > 0 && processedSeries.some(series => series.data.length > 0)) {
      return null;
    }

    return (
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(34, 35, 36, 0.95)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '12px',
        zIndex: 5
      }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginBottom: '12px', opacity: 0.6}}>
          <path d="M21 21L3 3M10.5 5C13.5376 5 16 7.46243 16 10.5V10.5C16 13.5376 13.5376 16 10.5 16V16C7.46243 16 5 13.5376 5 10.5V10.5C5 7.46243 7.46243 5 10.5 5V5Z" stroke="#C8E972" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h3 style={{color: '#E1E2E2', fontSize: '16px', fontWeight: '500', marginBottom: '8px'}}>No Data Available</h3>
        <p style={{color: '#999', fontSize: '14px', textAlign: 'center', maxWidth: '80%', margin: '0 auto'}}>
          {seriesData.length > 1 ? 
            'Try selecting different variables or metrics to visualize data.' : 
            'Select variables from the "Variables +" button to compare metrics.'}
        </p>
      </div>
    );
  };

  return (
    <div style={{ 
      backgroundColor: '#222324', 
      borderRadius: '12px', 
      padding: '20px', 
      color: '#E1E2E2', 
      marginBottom: '20px', 
      position: 'relative',
      transition: 'all 0.3s ease-in-out'
    }} ref={chartContainerRef}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 500 }}>{chartTitle}</h3>
        <div style={{ display: 'flex', width: '100%', justifyContent: 'flex-end', alignItems: 'center', gap: '10px' }}>
          {/* Chart Type Selector - Stays the same */}
          <div style={{ display: 'flex', border: '1px solid #666', borderRadius: '4px', flexShrink: 0 }}>
            {(['line', 'bar', 'area'] as ChartType[]).map(type => (
              <button key={type} onClick={() => setChartType(type)} style={{
                  background: chartType === type ? '#444' : 'transparent',
                  color: chartType === type ? '#C8E972' : '#999',
                  border: 'none', padding: '4px 8px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                  borderRight: type !== 'area' ? '1px solid #666' : 'none',
                  borderTopLeftRadius: type === 'line' ? '3px' : '0', borderBottomLeftRadius: type === 'line' ? '3px' : '0',
                  borderTopRightRadius: type === 'area' ? '3px' : '0', borderBottomRightRadius: type === 'area' ? '3px' : '0',
              }}>
                {type === 'line' && <svg width="14" height="14" viewBox="0 0 14 14"><polyline points="1,7 5,3 9,10 13,6" fill="none" stroke="currentColor" strokeWidth="2"/></svg>}
                {type === 'bar' && <svg width="14" height="14" viewBox="0 0 14 14"><rect x="2" y="3" width="2" height="8" fill="currentColor" /><rect x="6" y="5" width="2" height="6" fill="currentColor" /><rect x="10" y="2" width="2" height="9" fill="currentColor" /></svg>}
                {type === 'area' && <svg width="14" height="14" viewBox="0 0 14 14"><path d="M1,11 L1,7 L5,3 L9,10 L13,6 L13,11 Z" fill="currentColor" opacity="0.7"/></svg>}
              </button>
            ))}
          </div>
          {/* Restore Metric Selector */}
          {onMetricChange && selectedMetricKey && (
          <select
            value={selectedMetricKey}
            onChange={(e) => onMetricChange(e.target.value as DataMetricKey)}
            style={{
              background: '#222324',
              color: '#C8E972',
              border: '1px solid #666',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '12px',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {(Object.keys(chargingStationData) as Array<keyof typeof chargingStationData>)
              .filter(key => key !== 'months') // Ensure 'months' is not an option
              .map(metric => (
              <option key={metric} value={metric} style={{ backgroundColor: '#222324', color: '#E1E2E2'}}>
                {formatMetricName(metric)}
              </option>
            ))}
          </select>
          )}
        </div>
      </div>
      
      {/* Legend Placeholder */}
      {processedSeries.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '10px', flexWrap: 'wrap' }}>
          {processedSeries.map(series => (
            <div key={series.key} style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
              <span style={{ width: '12px', height: '12px', backgroundColor: series.color, marginRight: '5px', borderRadius: '2px' }}></span>
              {series.name}
            </div>
          ))}
        </div>
      )}
      
      <div style={{ width: '100%', height: '200px', overflow: 'visible', position: 'relative' }}>
        <svg ref={svgRef} width="100%" height="100%" viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
          {/* Defs for gradients and filters - gradients might need to be per-series */}
          <defs>
            {processedSeries.map(series => (
                <linearGradient key={`gradient-${series.key}`} id={`chart-gradient-${series.key}-${displayChartType}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={series.color} stopOpacity="0.8" />
                    <stop offset="100%" stopColor={series.color} stopOpacity="0.1" />
            </linearGradient>
            ))}
            <filter id="ambientGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
              {/* Glow color could be dynamic or neutral */}
              <feFlood floodColor={primarySeries?.color || "#C8E972"} floodOpacity="0.5" result="glowColor" />
              <feComposite in="glowColor" in2="blur" operator="in" result="coloredGlow" />
              <feMerge>
                <feMergeNode in="coloredGlow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid lines and axes - remain largely the same */}
          {[...Array(5)].map((_, i) => (
            <line key={`grid-${i}`} x1={padding} y1={padding + (i * (chartHeight / 4))} x2={viewBoxWidth - padding} y2={padding + (i * (chartHeight / 4))} stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1"/>
          ))}
          <line x1={padding} y1={viewBoxHeight - padding} x2={viewBoxWidth - padding} y2={viewBoxHeight - padding} stroke="#666" /> {/* X-axis base */}
          <line x1={padding} y1={padding} x2={padding} y2={viewBoxHeight - padding} stroke="#666" /> {/* Y-axis base */}
          
          {/* Series data rendering happens here... */}
          {seriesSvgPoints.map((seriesPlot, seriesIndex) => {
            const series = processedSeries[seriesIndex]; 
            if (!series) return null;
            const seriesUniqueKey = `${series.key}-${displayChartType}`;
            return (
              <g key={`series-group-${seriesUniqueKey}`}>
                {displayChartType === 'line' && (
                  <>
                    <polyline
                      key={`line-${seriesUniqueKey}`}
                      ref={el => lineRefs.current.set(series.key, el)}
                      fill="none" stroke={series.color} strokeWidth="3"
                      points={seriesPlot.points.map(p => `${p.x},${p.y}`).join(' ')}
                      style={{
                        transition: isExiting ? `stroke-dashoffset ${EXIT_ANIMATION_DURATION * 0.7}ms ease-in` : 'none',
                        strokeDashoffset: isExiting ? (linePathLengths.current.get(series.key) || 0) * -1 : undefined, 
                        filter: !isExiting && animateLinePointsIn ? "url(#ambientGlow)" : "none",
                        opacity: isLoading ? 0 : 1,
                      }}
                    />
                    {seriesPlot.points.map((point, idx) => {
                      const isVisibleAndAnimatingIn = animateLinePointsIn && !isExiting;
                      const isHovered = hoveredData?.index === idx && tooltipVisible;
                      
                      // Calculate delay based on point index for staggered animation
                      const pointDelay = animateIn ? 
                        `${idx * 0.08 + 0.8}s` : // Faster, staggered delay when triggered by animateIn
                        `${idx * 0.1 + 0.5}s`;   // Normal delay
                      
                      // Enhanced animation curve for points
                      const animationCurve = animateIn ? 
                        'cubic-bezier(0.34, 1.56, 0.64, 1)' : // Bouncy animation when triggered by animateIn
                        'ease-in-out';                         // Normal animation
                      
                      return (
                        <circle 
                          key={`point-${idx}-${seriesUniqueKey}`}
                          cx={point.x} cy={point.y} 
                          r={isHovered && hoveredData?.points.find(p => p.seriesKey === series.key) ? 8 : 5}
                          fill="#222324" 
                          stroke={series.color} 
                          strokeWidth={isHovered && hoveredData?.points.find(p => p.seriesKey === series.key) ? 3 : 2}
                          style={{
                            transition: 
                              isExiting 
                                ? `opacity ${EXIT_ANIMATION_DURATION * 0.5}ms ease-in ${idx * 30}ms, transform ${EXIT_ANIMATION_DURATION * 0.6}ms ease-in ${idx * 30}ms, r 0.2s ease-out, stroke-width 0.2s ease-out`
                                : (isVisibleAndAnimatingIn 
                                    ? `opacity 0.5s ${animationCurve} ${pointDelay}, transform 0.5s ${animationCurve} ${pointDelay}, r 0.2s ease-out, stroke-width 0.2s ease-out` 
                                    : 'r 0.2s ease-out, stroke-width 0.2s ease-out'),
                            opacity: isExiting ? 0 : (isVisibleAndAnimatingIn ? 1 : 0),
                            transform: isExiting 
                              ? `translateX(60px) scale(0)` 
                              : (isVisibleAndAnimatingIn 
                                  ? (animateIn ? 'scale(1.2)' : 'scale(1)') // Start with a slight pop when animateIn is true
                                  : 'scale(0)'),
                            // Add subtle pulse animation when animateIn is true
                            animation: animateIn && isVisibleAndAnimatingIn ? `pulse 0.6s ${animationCurve} ${pointDelay} forwards` : 'none',
                          }}
                        />
                      );
                    })}
                  </>
                )}

                {displayChartType === 'bar' && (
                  <g key={`bars-group-${seriesUniqueKey}`}> 
                    {seriesPlot.points.map((point, index) => {
                      const totalSeriesCount = processedSeries.length;
                      // Calculate based on segment count (align with line chart positions)
                      const segmentCount = months.length > 1 ? months.length - 1 : 1;
                      const segmentWidth = chartWidth / segmentCount;
                      const groupProportion = 0.6; // percentage of segment reserved for bars
                      const groupWidth = segmentWidth * groupProportion;
                      const barWidth = totalSeriesCount > 1 ? groupWidth / totalSeriesCount : groupWidth;
                      // Center group on point.x and clamp within chart area
                      const groupStartXRaw = point.x - (groupWidth / 2);
                      const minGroupX = padding;
                      const maxGroupX = viewBoxWidth - padding - groupWidth;
                      const groupStartX = Math.min(Math.max(groupStartXRaw, minGroupX), maxGroupX);
                      const barX = totalSeriesCount > 1
                        ? groupStartX + (seriesIndex * barWidth)
                        : groupStartX;
                      
                      const barHeight = Math.max(0, (point.originalValue / maxValue * chartHeight));
                      const calculatedY = viewBoxHeight - barHeight - padding;
                      const isVisibleAndAnimatingIn = animateBarsIn && !isExiting;
                      const isHovered = hoveredData?.index === index && tooltipVisible &&
                        hoveredData.points.some(p => p.seriesKey === series.key);
                      
                      // Enhanced animation timing for bars
                      const barDelay = animateIn ? 
                        `${index * 0.04 + seriesIndex * 0.02}s` : // Faster when triggered by animateIn
                        `${index * 0.05 + seriesIndex * 0.02}s`;  // Normal animation timing
                      
                      // Use computed barWidth for all cases
                      const calculatedWidth = barWidth;
                        
                      return (
                        <rect
                          key={`bar-${index}-${seriesUniqueKey}`}
                          x={barX}
                          y={isExiting ? (viewBoxHeight - padding) : (isVisibleAndAnimatingIn ? calculatedY : viewBoxHeight - padding)}
                          width={calculatedWidth}
                          height={isExiting ? 0 : (isVisibleAndAnimatingIn ? barHeight : 0)}
                          rx={2} 
                          fill={`url(#chart-gradient-${series.key}-${displayChartType})`} 
                          stroke={isHovered? "#FFF" : series.color}
                          strokeWidth={isHovered ? 1.5 : 0.5}
                          style={{
                            transition: isExiting 
                              ? `height ${EXIT_ANIMATION_DURATION * 0.8}ms ease-in ${index * 20 + seriesIndex * 5}ms, y ${EXIT_ANIMATION_DURATION * 0.8}ms ease-in ${index * 20 + seriesIndex * 5}ms, stroke 0.2s ease-out, stroke-width 0.2s ease-out`
                              : (isVisibleAndAnimatingIn ? `height 1s ease-out ${index * 0.05 + seriesIndex * 0.02}s, y 1s ease-out ${index * 0.05 + seriesIndex * 0.02}s, stroke 0.2s ease-out, stroke-width 0.2s ease-out` : 'stroke 0.2s ease-out, stroke-width 0.2s ease-out'),
                          }}
                        />
                      );
                    })}
                  </g>
                )}

                {displayChartType === 'area' && ( 
                  <>
                  <path
                    key={`area-${seriesUniqueKey}`}
                    d={`M${padding},${viewBoxHeight - padding} L${seriesPlot.points.map(p => `${p.x},${p.y}`).join(' ')} L${viewBoxWidth - padding},${viewBoxHeight - padding} Z`}
                    fill={`url(#chart-gradient-${series.key}-${displayChartType})`} 
                    stroke={series.color} 
                    strokeWidth={hoveredData && tooltipVisible ? 2.5 : 1.5}
                    style={{
                      transition: isExiting 
                        ? `opacity ${EXIT_ANIMATION_DURATION * 0.7}ms ease-in, transform ${EXIT_ANIMATION_DURATION * 0.7}ms ease-in, stroke-width 0.2s ease-out`
                        : (animateAreaIn && !isExiting ? 'opacity 0.8s ease-in-out, transform 0.8s ease-in-out, stroke-width 0.2s ease-out' : 'stroke-width 0.2s ease-out'),
                      opacity: isExiting ? 0 : (animateAreaIn && !isExiting ? 0.7 : 0),
                      transform: isExiting ? 'scaleY(0)' : (animateAreaIn && !isExiting ? 'scaleY(1)' : 'scaleY(0)'),
                      transformOrigin: `${padding + chartWidth/2}px ${viewBoxHeight - padding}px`,
                    }}
                  />
                  </>
                )}
              </g>
            )
          })}

          {/* X and Y Axis Labels (Rendered after data, but before overlay for events) */}
          {months.map((month, index) => {
            // Calculate the same x-coordinate used for the data points
            const segmentCount = months.length > 1 ? months.length - 1 : 1;
            const monthSegmentWidth = chartWidth / segmentCount;
            const x = padding + (monthSegmentWidth * index);
            return (
              <text key={`label-${index}`} x={x} y={viewBoxHeight - 10} fontSize="12" fill="#999" textAnchor="middle">{month}</text>
            );
          })}
          {yAxisLabels.map((label, index) => (
            <text key={`y-label-${index}`} x={padding - 8} y={padding + (index * (chartHeight / 4)) + 4} fontSize="12" fill="#999" textAnchor="end">{label}</text>
          ))}

          {/* Vertical Hover Guideline - Renders on top of data series */}
          {hoveredData && tooltipVisible && (
            <line x1={hoveredData.svgX} y1={padding} x2={hoveredData.svgX} y2={viewBoxHeight - padding}
              stroke="rgba(200, 233, 114, 0.3)" strokeWidth="1" strokeDasharray="3,3" style={{ pointerEvents: 'none' }}
            />
          )}

          {/* Transparent overlay for mouse events - Renders on top of guideline and data series */}
          <rect x={padding} y={padding} width={chartWidth} height={chartHeight} fill="transparent" 
            onMouseMove={handleSvgMouseMove} onMouseLeave={handleSvgMouseLeave} style={{ cursor: 'crosshair' }}
          />
        </svg>

        {renderLoadingOverlay()}
        {renderNoDataMessage()}
      </div>

      {/* --- MODIFIED: Tooltip for multiple series --- */}
      {hoveredData && (
        <div style={{
          position: 'absolute',
          left: `${hoveredData.x}px`,
          top: `${hoveredData.y}px`,
          transform: !tooltipVisible 
            ? 'translate(-50%, -100%) translateY(-10px) scale(0.7) rotateX(20deg)' 
            : isChangingPoint
              ? 'translate(-50%, -100%) translateY(-20px) scale(0.95) rotateX(5deg)' 
              : 'translate(-50%, -100%) translateY(-20px) scale(1) rotateX(0deg)',
          backgroundColor: 'rgba(45, 46, 48, 0)', 
          color: '#E1E2E2',
          padding: '10px 15px',
          borderRadius: '8px',
          boxShadow: !tooltipVisible 
            ? '0 2px 8px rgba(0, 0, 0, 0.2)'
            : isChangingPoint
              ? '0 6px 18px rgba(0, 0, 0, 0.3), 0 0 12px rgba(200, 233, 114, 0.15)'
              : '0 8px 24px rgba(0, 0, 0, 0.4), 0 0 16px rgba(200, 233, 114, 0.2)',
          fontSize: '14px',
          zIndex: 1000,
          pointerEvents: 'none', 
          opacity: tooltipVisible ? 1 : 0,
          transition: isChangingPoint
            ? 'opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease-out, left 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.1), top 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.1), backdrop-filter 0.3s ease'
            : 'opacity 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275), transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s ease-out, left 0.25s ease-in-out, top 0.25s ease-in-out, backdrop-filter 0.5s ease',
          transformOrigin: 'center bottom',
          backdropFilter: tooltipVisible ? 'blur(18px) saturate(180%)' : 'blur(6px) saturate(100%)',
          WebkitBackdropFilter: tooltipVisible ? 'blur(18px) saturate(180%)' : 'blur(6px) saturate(100%)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          willChange: 'transform, opacity, left, top, backdrop-filter',
        }}>
          <div style={{ 
            marginBottom: '8px', 
            fontSize: '16px', 
            fontWeight: 'bold', 
            color: '#FFFFFF', 
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)', 
            paddingBottom: '5px',
            opacity: tooltipVisible ? 1 : 0,
            transform: !tooltipVisible 
              ? 'translateY(5px)' 
              : isChangingPoint 
                ? 'translateY(2px)' 
                : 'translateY(0)',
            transition: isChangingPoint
              ? 'opacity 0.25s ease-in-out, transform 0.25s ease-out, filter 0.25s ease-out'
              : 'opacity 0.3s ease-in-out 0.05s, transform 0.3s ease-out 0.05s, filter 0.5s ease-out',
            textShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
            filter: isChangingPoint ? 'blur(0px)' : tooltipVisible ? 'blur(0px)' : 'blur(3px)'
          }}>
            {hoveredData.month}
          </div>
          {hoveredData.points.map((pointInfo, index) => (
            <div key={pointInfo.seriesKey} 
                style={{ 
                  marginBottom: '8px',
                  opacity: tooltipVisible ? 1 : 0,
                  transform: !tooltipVisible 
                    ? 'translateY(8px)' 
                    : isChangingPoint
                      ? 'translateY(3px)' 
                      : 'translateY(0)',
                  transition: isChangingPoint
                    ? `opacity 0.2s ease-in-out ${0.05 + index * 0.03}s, transform 0.2s ease-out ${0.05 + index * 0.03}s, filter 0.2s ease-out ${0.05 + index * 0.03}s`
                    : `opacity 0.3s ease-in-out ${0.1 + index * 0.07}s, transform 0.35s ease-out ${0.1 + index * 0.07}s, filter 0.4s ease-out ${0.1 + index * 0.07}s`,
                  filter: isChangingPoint ? 'blur(1px)' : tooltipVisible ? 'blur(0px)' : 'blur(3px)'
                }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span style={{ 
                  color: pointInfo.color, 
                  fontSize: '13px', 
                  fontWeight: 500,
                  textShadow: tooltipVisible ? `0 0 10px ${pointInfo.color}55` : 'none',
                  transition: 'text-shadow 0.5s ease-out, color 0.3s ease, filter 0.3s ease',
                  filter: isChangingPoint ? `drop-shadow(0 0 1px ${pointInfo.color})` : 'none'
                }}>
                  {pointInfo.seriesName}
                </span>
                
                {/* Simplified value display with animation */}
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: 700, 
                  minWidth: '50px',
                  textAlign: 'right',
                  marginLeft: '10px',
                  color: '#FFFFFF',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  transform: isChangingPoint ? 'scale(0.98)' : 'scale(1)',
                  transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), filter 0.25s ease',
                  animation: isChangingPoint ? 'pulseBlur 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
                  filter: isChangingPoint ? 'blur(0.5px)' : 'blur(0px)',
                  textShadow: isChangingPoint ? '0 0 5px rgba(255, 255, 255, 0.5)' : '0 0 2px rgba(255, 255, 255, 0.2)'
                }}>
                  <span>
                    {pointInfo.formattedValue.numericPart}
                    <span style={{
                      fontSize: '12px', 
                      marginLeft: '2px', 
                      color: '#AAA'
                    }}>
                      {pointInfo.formattedValue.unitPart}
                    </span>
                  </span>
                </div>
              </div>
              {pointInfo.comparison && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  fontSize: '11px', 
                  color: pointInfo.comparison.status === 'above' ? '#A0D911' : pointInfo.comparison.status === 'below' ? '#FF4D4F' : '#888888',
                  opacity: tooltipVisible ? 1 : 0,
                  transform: !tooltipVisible 
                    ? 'translateX(-5px)'
                    : isChangingPoint
                      ? 'translateX(-2px)'
                      : 'translateX(0)',
                  transition: isChangingPoint
                    ? `opacity 0.2s ease-in-out ${0.1 + index * 0.05}s, transform 0.2s ease-out ${0.1 + index * 0.05}s, color 0.2s ease, filter 0.2s ease`
                    : `opacity 0.3s ease-in-out ${0.2 + index * 0.1}s, transform 0.35s ease-out ${0.2 + index * 0.1}s, color 0.3s ease, filter 0.3s ease`,
                  animation: isChangingPoint ? `blinkHighlightBlur 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)` : 'none',
                  filter: isChangingPoint ? 'blur(0.5px)' : 'blur(0px)',
                }}>
                  {/* Icon for comparison */}
                  <span style={{
                    display: 'inline-flex',
                    marginRight: '4px',
                    transition: isChangingPoint ? 'transform 0.2s ease-out, filter 0.2s ease' : 'none',
                    transform: isChangingPoint ? 'scale(1.2)' : 'scale(1)',
                    filter: isChangingPoint ? 'blur(0.5px) brightness(1.2)' : 'none'
                  }}>
                    {pointInfo.comparison.status === 'above' && <svg width="10" height="10" viewBox="0 0 14 14"><path d="M7 3.5L3.5 7.5H10.5L7 3.5Z" fill="currentColor" /></svg>}
                    {pointInfo.comparison.status === 'below' && <svg width="10" height="10" viewBox="0 0 14 14" style={{ transform: 'rotate(180deg)' }}><path d="M7 3.5L3.5 7.5H10.5L7 3.5Z" fill="currentColor" /></svg>}
                    {pointInfo.comparison.status === 'on' && <svg width="10" height="10" viewBox="0 0 14 14"><circle cx="7" cy="7" r="3" fill="currentColor"/></svg>}
                  </span>
                  
                  {/* Simplified comparison text */}
                  <span>
                    {pointInfo.comparison.text}
                  </span>
                </div>
              )}
            </div>
          ))}
          {/* Animated CSS Triangle for pointer */}
          <div style={{
            width: 0, height: 0, 
            borderLeft: '8px solid transparent', 
            borderRight: '8px solid transparent',
            borderTop: '10px solid rgba(45, 46, 48, 0.65)', 
            position: 'absolute', 
            bottom: !tooltipVisible 
              ? '-5px'
              : isChangingPoint
                ? '-8px'
                : '-10px', 
            left: '50%', 
            transform: 'translateX(-50%)',
            opacity: tooltipVisible ? 1 : 0,
            transition: isChangingPoint
              ? 'bottom 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease-in-out'
              : 'bottom 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease-in-out',
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
          }} />
        </div>
      )}
    </div>
  );
}

export default Chart; 
