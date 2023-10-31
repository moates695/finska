import { configureStore } from '@reduxjs/toolkit'
import playerReducer from './playerSlice'
import gameReducer from './gameSlice'

export const store = configureStore({
  reducer: {
    player: playerReducer,
    game: gameReducer
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch