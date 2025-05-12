import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './uiSlice';
import dashboardReducer from './dashboardSlice';

console.log("Creating Redux store...");

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    dashboard: dashboardReducer,
  },
});

// For debugging
console.log("Redux store initialized:", store);
console.log("Initial state:", store.getState());

// Define types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 