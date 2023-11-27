import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export const sitouts = ['turns', 'rounds', 'none'] as const;
export type SitoutType = typeof sitouts[number];

export const scoreTypes = ['original', 'fast'] as const;
export type ScoreType = typeof scoreTypes[number];

export interface Sitout {
  type: SitoutType,
  value: number,
}

export interface SettingsState {
  target: number,
  reset: number,
  missLimit: number,
  sitout: Sitout,
  scoreType: ScoreType,
  skipAsStrike: boolean,
}

export const initialState: SettingsState = {
  target: 50,
  reset: 25,
  missLimit: 3,
  sitout: {
    type: 'none',
    value: Infinity,
  },
  scoreType: 'original',
  skipAsStrike: true,
}

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    allDefaults: (_) => {
      return initialState;
    },
    updateAll: (_, action: PayloadAction<SettingsState>) => {
      return action.payload;
    },
  }
});

export const {
  allDefaults,
  updateAll,
} = settingsSlice.actions

export default settingsSlice.reducer