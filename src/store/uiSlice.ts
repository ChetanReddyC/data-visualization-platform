import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';

interface UiState {
  variablePanelOpen: boolean;
}

const initialState: UiState = {
  variablePanelOpen: false,
};

console.log("Initializing UI slice with:", initialState);

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleVariablePanel: (state) => {
      const newState = !state.variablePanelOpen;
      console.log("Toggle variable panel:", state.variablePanelOpen, "->", newState);
      state.variablePanelOpen = newState;
    },
    setVariablePanelOpen: (state, action: PayloadAction<boolean>) => {
      console.log("Setting variable panel:", state.variablePanelOpen, "->", action.payload);
      state.variablePanelOpen = action.payload;
    }
  },
});

// Extract and export the action creators
export const { toggleVariablePanel, setVariablePanelOpen } = uiSlice.actions;

// Selectors
export const selectVariablePanelOpen = (state: RootState) => {
  console.log("Selecting variablePanelOpen:", state.ui.variablePanelOpen);
  return state.ui.variablePanelOpen;
};

export default uiSlice.reducer; 