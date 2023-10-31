import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export type PlayerStatus = 'active' | 'inactive' | 'eliminated';

export interface PlayerState {
  name: String,
  score: number,
  strikes: number,
  status: PlayerStatus,
}

const initialState: PlayerState = {
  name: '',
  score: 0,
  strikes: 0,
  status: 'active',
}

export const playerSlice = createSlice({
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

export const { incrementByAmount, setActive, setInactive, setEliminated } = playerSlice.actions

export default playerSlice.reducer