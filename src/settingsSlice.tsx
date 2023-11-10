import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export const sitouts = ['turns', 'rounds', 'none'] as const;
export type SitoutType = typeof sitouts[number];

export interface Sitout {
  type: SitoutType,
  value: number,
}

export interface SettingsState {
  target: number,
  reset: number,
  missLimit: number,
  sitout: Sitout,
}

const initialState: SettingsState = {
  target: 50,
  reset: 25,
  missLimit: 3,
  sitout: {
    type: 'none',
    value: Infinity,
  },
}

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateTarget: (state, action: PayloadAction<number>) => {
      state.target = action.payload;
    },
    defaultTarget: (state) => {
      state.target = initialState.target;
    },
    updateReset: (state, action: PayloadAction<number>) => {
      state.reset = action.payload;
    },
    defaultReset: (state) => {
      state.reset = initialState.reset;
    },
    allDefaults: (_) => {
      return initialState;
    },
    updateAll: (_, action: PayloadAction<SettingsState>) => {
      return action.payload;
    }
  }
});

export const { 
  updateTarget,
  defaultTarget,
  updateReset,
  defaultReset,
  allDefaults,
  updateAll,
} = settingsSlice.actions

export default settingsSlice.reducer