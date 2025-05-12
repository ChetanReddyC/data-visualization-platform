import React, { useState, useEffect } from 'react';
import styles from './VariablePanel.module.css';
import ChevronDown from '../../assets/icons/chevorn-down-icon.svg?react';
import XIcon from '../../assets/icons/x-icon.svg?react';
import CreationIcon from '../../assets/icons/creation-icon.svg?react';
import PlusIcon from '../../assets/icons/plus-icon.svg?react';
import CheckIcon from '../../assets/icons/check-icon.svg?react';
import SearchIcon from '../../assets/icons/search-icon.svg?react';
import AutofillIcon from '../../assets/icons/autofill-icon.svg?react';
import ReloadIcon from '../../assets/icons/reload-icon.svg?react';
import AboutIcon from '../../assets/icons/about-icon.svg?react';
import { chargingStationData } from '../../data/chargingStationData';

// Define a type for the metric keys from chargingStationData, excluding 'months'
type DataMetricKey = Exclude<keyof typeof chargingStationData, 'months'>;

// Utility function to format metric keys for display (similar to Chart.tsx)
const formatMetricName = (metric: string): string => {
  if (!metric) return '';
  return metric.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
};

// Get all actual metric keys from the data source
const allMetricKeys = Object.keys(chargingStationData).filter(
  (key): key is DataMetricKey => key !== 'months'
);


const generatedChartVariables = allMetricKeys.reduce((acc, metricKey) => {
  const groupSize = Math.ceil(allMetricKeys.length / 3);
  acc[metricKey] = {
    category1: allMetricKeys.slice(0, groupSize),
    category2: allMetricKeys.slice(groupSize, 2 * groupSize),
    category3: allMetricKeys.slice(2 * groupSize),
  };
  return acc;
}, {} as Record<DataMetricKey, { category1: DataMetricKey[]; category2: DataMetricKey[]; category3: DataMetricKey[] }>);

// Fallback categories if allMetricKeys is empty or activeChartType isn't found
const defaultCategories: { category1: DataMetricKey[]; category2: DataMetricKey[]; category3: DataMetricKey[] } = {
  category1: allMetricKeys.slice(0, Math.ceil(allMetricKeys.length / 3)),
  category2: allMetricKeys.slice(Math.ceil(allMetricKeys.length / 3), 2 * Math.ceil(allMetricKeys.length / 3)),
  category3: allMetricKeys.slice(2 * Math.ceil(allMetricKeys.length / 3)),
};

const chartVariables = generatedChartVariables;

// Updated variable descriptions, keyed by DataMetricKey
const variableDescriptions: Record<string, string> = allMetricKeys.reduce((acc, key) => {
  // Basic descriptions, can be expanded
  switch (key) {
    case 'utilizationRates':
      acc[key] = 'Measures the percentage of time charging stations are actively in use.';
      break;
    case 'energyDelivered':
      acc[key] = 'Total amount of energy (kWh) delivered by charging stations over a period.';
      break;
    case 'unsatisfiedDemand':
      acc[key] = 'Percentage of charging demand that could not be met due to station unavailability.';
      break;
    case 'averageChargingTime':
      acc[key] = 'The average time (minutes) vehicles spend charging at stations.';
      break;
    case 'peakHourUsage':
      acc[key] = 'Measures the utilization percentage of charging stations during peak demand hours.';
      break;
    default:
      acc[key] = `Detailed information about ${formatMetricName(key)}. This metric influences overall performance.`;
  }
  return acc;
}, {} as Record<string, string>);

interface VariablePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onVariablesSelected?: (variables: DataMetricKey[]) => void; // Changed to DataMetricKey[]
  selectedVariables?: DataMetricKey[]; // Changed to DataMetricKey[]
  availableChartTypes?: Array<{ id: DataMetricKey; label: string }>; // id is DataMetricKey
  activeChartType?: DataMetricKey; // Changed to DataMetricKey
  onChartTypeChange?: (chartTypeId: DataMetricKey) => void; // chartTypeId is DataMetricKey
}


const VariablePanel: React.FC<VariablePanelProps> = ({
  isOpen,
  onClose,
  onVariablesSelected,
  selectedVariables = [],
  // availableChartTypes = [], // This prop is not directly used for populating categories now
  activeChartType = allMetricKeys.length > 0 ? allMetricKeys[0] : undefined, // Default to first metric or undefined
  // onChartTypeChange // This prop is not directly used for populating categories now
}) => {
  // State for local changes before applying
  const [localSelectedVariables, setLocalSelectedVariables] = useState<DataMetricKey[]>(selectedVariables);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentVariable, setCurrentVariable] = useState<DataMetricKey | null>(
    selectedVariables.length > 0 ? selectedVariables[0] : (allMetricKeys.length > 0 ? allMetricKeys[0] : null)
  );

  // Reset local state when panel opens or selectedVariables prop changes
  useEffect(() => {
    if (isOpen) {
      setLocalSelectedVariables([...selectedVariables]);
      if (selectedVariables.length > 0 && allMetricKeys.includes(selectedVariables[0])) {
        setCurrentVariable(selectedVariables[0]);
      } else if (allMetricKeys.length > 0) {
        setCurrentVariable(allMetricKeys[0]);
      } else {
        setCurrentVariable(null);
      }
    }
  }, [isOpen, selectedVariables]);

  // Apply changes when closing
  const handleClose = () => {
    if (onVariablesSelected) {
      onVariablesSelected(localSelectedVariables);
    }
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Get variables for the active chart type
  const getVariables = () => {
    const activeKey = activeChartType as DataMetricKey; // activeChartType is now DataMetricKey
    return chartVariables[activeKey] || defaultCategories;
  };

  const toggleVariableSelection = (variable: DataMetricKey) => {
    if (localSelectedVariables.includes(variable)) {
      setLocalSelectedVariables(prev => prev.filter(v => v !== variable));
    } else {
      setLocalSelectedVariables(prev => [...prev, variable]);
    }
    setCurrentVariable(variable);
  };

  const applyChanges = () => {
    if (onVariablesSelected) {
      onVariablesSelected(localSelectedVariables);
    }
    onClose();
  };

  // Ensure filterVariables preserves the DataMetricKey type
  const filterVariables = (variables: DataMetricKey[]): DataMetricKey[] => {
    if (!searchTerm) return variables;
    return variables.filter((v: DataMetricKey) =>
      formatMetricName(v).toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const isVariableActive = (variable: DataMetricKey) => localSelectedVariables.includes(variable);

  // Determine categories to render
  const currentDisplayCategories = getVariables();

  return (
    <div
      className={`${styles.variablePanelOverlay} ${isOpen ? styles.variablePanelOverlayOpen : ''}`}
      onClick={handleOverlayClick}
    >
      <div className={styles.variablePanel}>
        <div className={styles.panelHeader}>
          <h2>Edit Variables {activeChartType ? `- ${formatMetricName(activeChartType)}` : ''}</h2>
          <button className={styles.closeButton} onClick={handleClose}>
            <XIcon />
          </button>
        </div>

        <div className={styles.searchContainer}>
          <div className={styles.searchBar}>
            <SearchIcon />
            <input
              type="text"
              placeholder="Search variables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className={styles.actionButtons}>
            <button className={styles.autofillButton}>
              <AutofillIcon />
              <span>Autofill</span>
            </button>
            <button
              className={styles.rerunButton}
              onClick={applyChanges}
            >
              <ReloadIcon />
              <span>Rerun</span>
            </button>
          </div>
        </div>

        <div className={styles.variableSearchSection}>
          {/* Variable Category 1 */}
          {currentDisplayCategories.category1.length > 0 && (
            <div className={styles.variableCategory}>
              <h3>Variable category 1</h3>
              <div className={styles.variableRow}>
                {filterVariables(currentDisplayCategories.category1).map(variable => (
                  <div
                    key={variable}
                    className={isVariableActive(variable) ? styles.activeVariable : styles.inactiveVariable}
                    onClick={() => {
                      setCurrentVariable(variable);
                      toggleVariableSelection(variable);
                    }}
                  >
                    <span>{formatMetricName(variable)}</span>
                    <div className={styles.variableActions}>
                      <button className={styles.actionButton}>
                        <AutofillIcon />
                      </button>
                      <button
                        className={styles.actionButton}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        {isVariableActive(variable) ? <CheckIcon /> : <PlusIcon />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Variable Category 2 */}
          {currentDisplayCategories.category2.length > 0 && (
            <div className={styles.variableCategory}>
              <h3>Variable Category 2</h3>
              {/* Render rows for category 2, handling multiple rows if necessary */}
              {[...Array(Math.ceil(currentDisplayCategories.category2.length / 3))].map((_, rowIndex) => (
                <div className={styles.variableRow} key={`cat2-row-${rowIndex}`}>
                  {filterVariables(currentDisplayCategories.category2)
                    .slice(rowIndex * 3, rowIndex * 3 + 3)
                    .map(variable => (
                      <div
                        key={variable}
                        className={isVariableActive(variable) ? styles.activeVariable : styles.inactiveVariable}
                        onClick={() => {
                          setCurrentVariable(variable);
                          toggleVariableSelection(variable);
                        }}
                      >
                        <span>{formatMetricName(variable)}</span>
                        <div className={styles.variableActions}>
                          <button className={styles.actionButton}>
                            <AutofillIcon />
                          </button>
                          <button
                            className={styles.actionButton}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            {isVariableActive(variable) ? <CheckIcon /> : <PlusIcon />}
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          )}

          {/* Variable Category 3 */}
          {currentDisplayCategories.category3.length > 0 && (
            <div className={styles.variableCategory}>
              <h3>Variable Category 3</h3>
              <div className={styles.variableRow}>
                {filterVariables(currentDisplayCategories.category3).map(variable => (
                  <div
                    key={variable}
                    className={isVariableActive(variable) ? styles.activeVariable : styles.inactiveVariable}
                    onClick={() => {
                      setCurrentVariable(variable);
                      toggleVariableSelection(variable);
                    }}
                  >
                    <span>{formatMetricName(variable)}</span>
                    <div className={styles.variableActions}>
                      <button className={styles.actionButton}>
                        <AutofillIcon />
                      </button>
                      <button
                        className={styles.actionButton}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        {isVariableActive(variable) ? <CheckIcon /> : <PlusIcon />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.divider}></div>

          <div className={styles.variableInfo}>
            <h3>
              {currentVariable ? formatMetricName(currentVariable) : 'Select a variable'}
              {currentVariable && <span className={styles.infoIcon}><AboutIcon /></span>}
            </h3>
            <p>
              {currentVariable ? (variableDescriptions[currentVariable] || 'No description available.') : 'Select a variable to see its details.'}
            </p>
          </div>
        </div>

        <div className={styles.variableSection}>
          <div className={styles.sectionHeader}>
            <span>Primary Variables</span>
            <button className={styles.chevronButton}>
              <ChevronDown />
            </button>
          </div>
        </div>

        <div className={styles.variableSection}>
          <div className={styles.sectionHeader}>
            <span>Secondary Variables</span>
            <button className={styles.chevronButton}>
              <ChevronDown />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VariablePanel; 