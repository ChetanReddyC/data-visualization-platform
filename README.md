# Data Visualization Platform

This project is a data visualization assignment project from AnswersAi.



## Setup

1.  **Clone the repository.**
    ```bash
    git clone https://github.com/ChetanReddyC/data-visualization-platform
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```
3.  **Run the development server:**
    ```bash
    npm run dev
    # or
    # yarn dev
    ```

    ## Tech Stack (Planned)

*   React
*   TypeScript
*   Vite (or Create React App)
*   CSS Modules
*   Redux Toolkit (for state management)
*   A Charting Library (e.g., Recharts, Chart.js)

## Project Structure

```
│   App.css
│   App.tsx
│   firebaseConfig.ts
│   index.css
│   main.tsx
│   vite-env.d.ts
│
├───assets
│   │   react.svg
│   │
│   ├───icons
│   │       about-icon.svg
│   │       account-circle.svg
│   │       autofill-icon.svg
│   │       bell-icon.svg
│   │       check-icon.svg
│   │       chevorn-down-icon.svg
│   │       clipboard-text-clock.svg
│   │       cloud-upload.svg
│   │       creation-icon.svg
│   │       electric-icon.svg
│   │       history-icon.svg
│   │       home-icon.svg
│   │       menu-icon.svg
│   │       plus-icon.svg
│   │       reload-icon.svg
│   │       search-icon.svg
│   │       settings-icon.svg
│   │       upload-icon.svg
│   │       x-icon.svg
│   │
│   └───shaders
├───components
│   │   Chart.module.css
│   │   Chart.tsx
│   │
│   ├───App
│   │       App.module.css
│   │       App.tsx
│   │
│   ├───Auth
│   │       index.ts
│   │       Login.tsx
│   │       Profile.tsx
│   │       ProtectedRoute.tsx
│   │       Signup.tsx
│   │
│   ├───Dashboard
│   │       Chart.module.css
│   │       Chart.tsx
│   │       Dashboard.module.css
│   │       Dashboard.tsx
│   │       DataTable.module.css
│   │       DataTable.tsx
│   │       KpiCard.module.css
│   │       KpiCard.tsx
│   │       VariablePanel.module.css
│   │       VariablePanel.tsx
│   │
│   ├───Effects
│   ├───Header
│   │       Header.module.css
│   │       Header.tsx
│   │
│   ├───Layout
│   │       MainLayout.module.css
│   │       MainLayout.tsx
│   │
│   └───Sidebar
│           Sidebar.module.css
│           Sidebar.tsx
│
├───data
│       chargingStationData.ts
│
├───specs
│       shift_to_reduxstate_management.md
│
├───store
│       AuthContext.tsx
│       dashboardSlice.ts
│       selectors.ts
│       store.ts
│       uiSlice.ts
│
├───styles
│       auth.css
│       global.css
│       profile.css
│       responsive.css
│       variables.css
```
