
# Data Visualization Platform

This project is a data visualization assignment project from AnswersAi.



## Setup

1.  **Clone the repository.**
    ```bash
    git clone https://github.com/ChetanReddyC/data-visualization-platform
    ```

2.  **Check current directory and install dependencies:**
    ```bash
    cd data-visualization-platform
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

4.  **Open the browser and navigate to `http://localhost:5173` to view the application.**

5.  **It will open the login page by default.**

6.  **You can signup to the application direclty using google o auth authentication by selecting email directly.**

7.  **After login you will be redirected to the dashboard page.**

## intentionally havent used .env file as this is not a big big deal that firebase project details later i will delete that project from firebase after the process is completed.


## Features implemented.

1.  **Sidebar:**
    -   The sidebar is implemented using CSS Modules.
    -   The sidebar is responsive and collapses on smaller screens.
    -   The sidebar is implemented using the `react-responsive` library.

2.  **Dashboard:**
    - data can be visualized in 3 different formats:
        -   Line Chart
        -   Bar Chart
        -   Pie Chart

    -   The dashboard is implemented using the `react-responsive` library.
    -   The dashboard is implemented using the `recharts` library.

3.  **KPI Cards:**
    -   The KPI cards are implemented using the `react-responsive` library.
    -   The KPI cards are implemented using the `lucide-react` library.
    -   The KPI cards are implemented using the `recharts` library.

4.  **Variable Panel:**
    - Variables can be selected from the variable panel to visualize or compare the data.

5.  **Effects:**
    - very smooth and beautiful animations are added to the application (as it described in the assignment requirement sheet).

6.  **Auth:**
    -   implemented o auth flow with login and signup.
    -   And also with email and password authentication.
    -   The auth is implemented using the `firebase` library.
    -   The auth is implemented using the `react-router-dom` library.
    -   The auth is implemented using the `recharts` library.

## Everything implemented as per the assignment requirement sheet.

## Technical decisions and trade-offs.

1.  **Tech Stack:**
    -   React
    -   TypeScript
    -   Vite (or Create React App)
    -   CSS Modules
    -   Redux Toolkit (for state management)
    -   A Charting Library (e.g., Recharts, Chart.js)

2.  **State Management:**
    -   Redux Toolkit is used for state management(as it is a popular state management library for React).

3.  **Charting Library:**
    -   Recharts is used for the charts(as it is a popular charting library for React).

4.  **Responsive Design:**
    -   The application is responsive and can be viewed on all devices.

5.  **Project Structure:**
    -   The project is structured in a way that is easy to understand and navigate.
    -   The project is structured in a way that is easy to maintain and extend.
    -   The project is structured in a way that is easy to test and debug.

6.  **Trade-offs:**
    -   i guess i have not made any trade-offs as i have implemented everything as per the assignment requirement sheet.

7.  **Known limitations:**
    -   i have not cared about security of the application as it is a assignment project.
    -   i havent tested the appkication very regorusly as this assignment is focused on building and implementing the data visualization platform.

## Time Spent

-   i have spent around 10-14 hours to complete this assignment.
-   i felt this is bit a long time to complete but to make this pixel perfect and responsive across devices im feeling this is ok to take this much time.

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
