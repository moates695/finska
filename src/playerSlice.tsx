import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export type PlayerStatus = 'active' | 'inactive' | 'eliminated';

export interface PlayerState {
  names: string,
  score: number,
  strikes: number,
  status: PlayerStatus,
}

const initialState: PlayerState = {
  names: '',
  score: 0,
  strikes: 0,
  status: 'active',
}

export const counterSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.score += action.payload
    },
    setActive: (state) => {
      state.status = 'active'
    },
    setInactive: (state) => {
      state.status = 'inactive'
    },
    setEliminated: (state) => {
      state.status = 'eliminated'
    }
  },
})

export const { incrementByAmount, setActive, setInactive, setEliminated } = counterSlice.actions

export default counterSlice.reducer