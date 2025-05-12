# Migration Plan: React State to Redux Toolkit

## 1. Introduction & Goals

### 1.1. Current State Management
The application currently utilizes React\'s built-in state management features (`useState`, `useEffect`, `useMemo`, `useCallback`) primarily within the `Dashboard.tsx` component. Key application state such as selected visualization variables, the current metric being displayed, chart data, KPI data, and UI state like the visibility of the "Variables Panel" are managed locally and passed down to child components (`VariablePanel.tsx`, `Chart.tsx`) via props (prop drilling).

### 1.2. Rationale for Migration
Migrating to Redux Toolkit aims to:
*   **Centralize State:** Provide a single source of truth for global application state, making it easier to manage and debug.
*   **Improve Scalability:** Facilitate the addition of new features and state interactions as the application grows.
*   **Enhance Maintainability:** Decouple state logic from components, leading to cleaner and more reusable UI components.
*   **Simplify Async Operations:** Leverage Redux Toolkit\'s `createAsyncThunk` for cleaner handling of asynchronous data fetching and state updates (e.g., for KPI data).
*   **Reduce Prop Drilling:** Eliminate the need to pass state and event handlers through multiple component layers.
*   **Align with Project Goals:** The project\'s `README.md` already lists "Implement Redux Toolkit for state management" as a TODO item.

### 1.3. Goals
*   Successfully migrate core application state related to dashboard visualizations, variable selection, and UI panel visibility to a Redux Toolkit store.
*   Ensure no existing functionality is broken during or after the migration.
*   Structure the Redux store logically with appropriate slices and actions.
*   Implement the migration in phases to manage complexity and allow for iterative testing.

## 2. Current State Analysis

The following key pieces of state need to be migrated:

*   **Managed in `Dashboard.tsx`:**
    *   `variablePanelOpen` (boolean): Controls the visibility of the "Edit Variables" panel.
    *   `currentMetricKey` (DataMetricKey): The primary metric selected for the chart visualization.
    *   `selectedVariables` (DataMetricKey[]): The list of variables chosen by the user to be included in the visualization analysis.
    *   `chartData` (any[]): Data prepared for the chart. *This is derived state; its inputs will be in Redux.*
    *   `kpiData` (KpiDataItem[]): Data for the Key Performance Indicator cards. *This is derived state; its inputs will be in Redux.*
    *   `isLoadingKpi` (boolean): Tracks the loading state for KPI data fetching.

*   **Managed in `VariablePanel.tsx` (for consideration):**
    *   `localSelectedVariables` (DataMetricKey[]): A temporary state for variables selected within the panel before being "applied". *This might be handled by dispatching actions directly or having a "draft" state concept in Redux if an explicit "apply" step is maintained globally.*
    *   `searchTerm` (string): For filtering variables. *Likely remains local component state.*
    *   `currentVariable` (DataMetricKey | null): For displaying info of the last clicked variable. *Can remain local.*
    *   `hoveredVariable` (DataMetricKey | null): For displaying info of the hovered variable. *Can remain local.*

## 3. Redux Store Structure

### 3.1. Slices

*   **`uiSlice`**: Manages UI-related state.
    *   **State:**
        *   `variablePanelOpen`: `boolean`
    *   **Actions:**
        *   `toggleVariablePanel()`
        *   `setVariablePanelOpen(isOpen: boolean)`

*   **`dashboardSlice`** (or `dataVizSlice`): Manages state related to data visualization and dashboard interactions.
    *   **State:**
        *   `selectedVariables`: `DataMetricKey[]`
        *   `currentMetricKey`: `DataMetricKey | null` (initially null or a default value)
        *   `kpiData`: `KpiDataItem[]` (or its raw inputs)
        *   `kpiLoadingStatus`: `\'idle\' | \'loading\' | \'succeeded\' | \'failed\'`
        *   `kpiError`: `string | null`
        *   *`chartData` will be derived using selectors based on `currentMetricKey` and `selectedVariables`.*
    *   **Actions (Reducers):**
        *   `setSelectedVariables(variables: DataMetricKey[])`
        *   `toggleSelectedVariable(variable: DataMetricKey)`
        *   `setCurrentMetricKey(metricKey: DataMetricKey)`
    *   **Async Thunks:**
        *   `fetchKpiDataThunk()`: Handles the asynchronous logic for fetching/calculating KPI data. It will:
            *   Access `currentMetricKey` and `selectedVariables` from the Redux state.
            *   Perform the calculation (simulating async delay).
            *   Dispatch `pending`, `fulfilled` (with `kpiData` payload), or `rejected` (with error) actions, which will be handled by reducers in this slice to update `kpiData`, `kpiLoadingStatus`, and `kpiError`.

### 3.2. Selectors
Memoized selectors (using `createSelector` from Redux Toolkit) will be crucial, especially for derived data:
*   `selectChartData`: Computes the data for the `Chart` component based on `currentMetricKey` and `selectedVariables` from the `dashboardSlice`.
*   `selectKpiData`: Returns `kpiData` from `dashboardSlice`.
*   `selectIsKpiLoading`: Derives boolean loading state from `kpiLoadingStatus`.
*   Selectors for other state fields as needed (e.g., `selectVariablePanelOpen`, `selectCurrentMetricKey`, `selectSelectedVariables`).

## 4. Phased Implementation Plan

### Phase 1: Core Redux Setup & UI State Management

*   **Task 1.1: Install Dependencies**
    *   Command: `npm install @reduxjs/toolkit react-redux`
    *   Command: `npm install --save-dev @types/react-redux` (if not pulled transitively)
*   **Task 1.2: Create Store & Initial Slices**
    *   New File: `src/store/store.ts`: Configure the Redux store using `configureStore`, combining slice reducers.
    *   New File: `src/store/uiSlice.ts`: Define the `uiSlice` with `variablePanelOpen` state and related actions/reducers.
    *   New File: `src/store/dashboardSlice.ts`: Define the initial `dashboardSlice` with `selectedVariables` and `currentMetricKey` state and related actions/reducers.
*   **Task 1.3: Provide Store to Application**
    *   Modify File: `src/main.tsx`: Wrap the root `<App />` component with the `<Provider store={store}>` from `react-redux`.
*   **Task 1.4: Refactor `Dashboard.tsx` for `variablePanelOpen`**
    *   Remove the `variablePanelOpen` `useState` hook.
    *   Use `useSelector` (from `react-redux`) to get `variablePanelOpen` from `uiSlice`.
    *   Modify `toggleVariablePanel` function in `Dashboard.tsx` to dispatch the `toggleVariablePanel` action from `uiSlice` using `useDispatch`.
*   **Task 1.5: Refactor `VariablePanel.tsx` & `Dashboard.tsx` for `selectedVariables`**
    *   In `Dashboard.tsx`:
        *   Remove `selectedVariables` `useState` hook.
        *   Use `useSelector` to get `selectedVariables` from `dashboardSlice`.
        *   The `handleVariableSelection` callback (passed to `VariablePanel`) should dispatch the `setSelectedVariables` (or a more granular `toggleSelectedVariable`) action from `dashboardSlice`.
    *   In `VariablePanel.tsx`:
        *   The `selectedVariables` prop will now come from the Redux store (passed down from `Dashboard.tsx`).
        *   The `onVariablesSelected` prop (or internal logic if panel directly dispatches) will trigger the Redux action. *Decision: For now, `Dashboard.tsx` will continue to mediate this and dispatch the action via `handleVariableSelection`.*
        *   The `localSelectedVariables` state in `VariablePanel.tsx` can remain for now if the "apply changes" behavior (where selections are staged before committing) is critical. If selections are to be applied immediately to the global state, `localSelectedVariables` would be removed, and interactions would directly dispatch actions. *Initial plan: Maintain `localSelectedVariables` for staging and dispatch only on "Apply" or panel close.*
*   **Task 1.6: Refactor `Dashboard.tsx` & `Chart.tsx` for `currentMetricKey`**
    *   In `Dashboard.tsx`:
        *   Remove `currentMetricKey` `useState` hook.
        *   Use `useSelector` to get `currentMetricKey` from `dashboardSlice`.
        *   The `setCurrentMetricKey` callback (passed to `Chart.tsx` as `onMetricChange`) should dispatch the `setCurrentMetricKey` action from `dashboardSlice`.
    *   In `Chart.tsx`:
        *   The `onMetricChange` prop will now dispatch a Redux action.

### Phase 2: Managing KPI and Chart Data (Async and Derived State)

*   **Task 2.1: Implement KPI Data Fetching with Thunks**
    *   In `dashboardSlice.ts`:
        *   Add `kpiData`, `kpiLoadingStatus`, and `kpiError` to the slice\'s initial state.
        *   Create `fetchKpiDataThunk` using `createAsyncThunk`. This thunk will:
            *   Contain the logic currently in `Dashboard.tsx`\'s `calculateKpiValues` and the simulated async delay.
            *   Use `getState()` from its arguments to access `currentMetricKey` and `selectedVariables` from the Redux state if needed for its calculations.
        *   Add reducers for `fetchKpiDataThunk.pending`, `fetchKpiDataThunk.fulfilled`, and `fetchKpiDataThunk.rejected` to update the state accordingly.
    *   In `Dashboard.tsx`:
        *   Remove `kpiData` and `isLoadingKpi` `useState` hooks.
        *   Remove the `fetchKpiData` and `calculateKpiValues` functions.
        *   Use `useSelector` to get `kpiData`, `kpiLoadingStatus` (to derive `isLoadingKpi`), and `kpiError` from `dashboardSlice`.
        *   Use `useEffect` to dispatch `fetchKpiDataThunk()` whenever `currentMetricKey` or `selectedVariables` (obtained from the Redux store) change.
*   **Task 2.2: Manage `chartData` using Selectors**
    *   In `dashboardSlice.ts` (or a new `src/store/selectors.ts` file):
        *   Create a memoized selector `selectChartData` using `createSelector`. This selector will:
            *   Take `currentMetricKey` and `selectedVariables` from the `dashboardSlice` state as input.
            *   Encapsulate the logic currently in `Dashboard.tsx`\'s `baseStructuredData` `useMemo` hook and the `applyVariablesAndSetChartData` function to compute the final chart data.
    *   In `Dashboard.tsx`:
        *   Remove the `chartData` `useState` hook and the related `useMemo` hooks for `baseStructuredData` and `applyVariablesAndSetChartData`.
        *   Use the `selectChartData` selector to get the data to pass to the `Chart` component.
        *   The `Chart` component will receive its `seriesData` prop, now derived from the Redux state via this selector.

## 5. Testing & Validation
*   **After Phase 1:**
    *   Verify that the "Edit Variables" panel opens and closes correctly, driven by Redux state.
    *   Confirm that selecting/deselecting variables in the panel updates the `selectedVariables` in the Redux store (use Redux DevTools).
    *   Confirm that changing the metric in the chart updates `currentMetricKey` in the Redux store.
    *   Ensure the UI (e.g., active states of variables, displayed metric) reflects the Redux state.
*   **After Phase 2:**
    *   Verify that KPI cards update correctly based on `currentMetricKey` and `selectedVariables`, with loading states handled appropriately.
    *   Confirm that the main chart visualization updates correctly based on `currentMetricKey` and `selectedVariables`, with data derived through selectors.
    *   Test edge cases and error handling for async operations.
    *   Perform regression testing to ensure no existing functionality (tooltips, panel interactions, chart rendering) has been broken.

## 6. Affected Files (Summary)

*   **New Files:**
    *   `data-viz-platform/src/store/store.ts`
    *   `data-viz-platform/src/store/uiSlice.ts`
    *   `data-viz-platform/src/store/dashboardSlice.ts`
    *   (Potentially) `data-viz-platform/src/store/selectors.ts`
*   **Modified Files:**
    *   `data-viz-platform/package.json` (add `@reduxjs/toolkit`, `react-redux`)
    *   `data-viz-platform/src/main.tsx` (add Redux `<Provider>`)
    *   `data-viz-platform/src/components/Dashboard/Dashboard.tsx` (major refactor to use Redux state, dispatch actions, and use selectors)
    *   `data-viz-platform/src/components/Dashboard/VariablePanel.tsx` (refactor to interact with Redux state/actions, likely via props from `Dashboard.tsx`)
    *   `data-viz-platform/src/components/Dashboard/Chart.tsx` (refactor `onMetricChange` prop to dispatch Redux action)

## 7. Considerations

*   **Local vs. Global State:**
    *   Carefully evaluate which pieces of state truly need to be global. State like `searchTerm`, `hoveredVariable`, and `currentVariable` (for info display within `VariablePanel.tsx`) can likely remain as local component state within `VariablePanel.tsx` unless a future requirement makes them globally relevant. The initial migration will focus on genuinely shared application state.
*   **TypeScript Typing:**
    *   Rigorously define TypeScript types for the Redux store state (RootState), slice states, action payloads, and thunk arguments/return types. Redux Toolkit provides utilities like `PayloadAction` to help with this.
*   **Redux DevTools:**
    *   Utilize the Redux DevTools browser extension for debugging, inspecting state changes, and action dispatching throughout the development and testing process.
*   **Performance:**
    *   Ensure selectors are correctly memoized using `createSelector` to prevent unnecessary re-calculations and component re-renders. Pay attention to the props being passed to memoized components.
*   **Incremental Commits:**
    *   Commit changes incrementally after each sub-task or logical step within a phase to make rollbacks easier if issues arise.

This plan provides a structured approach to migrating the application to Redux Toolkit, aiming for a robust and maintainable state management solution. 