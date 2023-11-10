import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

type TimeoutType = 'turns' | 'rounds' | 'none';

interface Sitout {
  type: TimeoutType,
  value: number | null,
}

interface SettingsState {
  target: number,
  reset: number,
  missLimit: number | null,
  sitout: Sitout,
}

const initialState: SettingsState = {
  target: 50,
  reset: 25,
  missLimit: 3,
  sitout: {
    type: 'none',
    value: null,
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
  }
});

export const { 
  updateTarget,
  defaultTarget,
  updateReset,
  defaultReset,
} = settingsSlice.actions

export default settingsSlice.reducer