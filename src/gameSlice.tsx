import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { PlayerState } from './playerSlice'

export interface GameState {
  players: PlayerState[],
  status: boolean,
}

const initialState: GameState = {
  players: [],
  status: true,
}

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    addPlayer: (state, action: PayloadAction<String>) => {
        const player: PlayerState = {
            name: action.payload,
            score: 0,
            strikes: 0,
            status: 'active',
        }
        state.players.push(player);
    },
    enterTurn: (state, action: PayloadAction<number>) => {
        if (action.payload > 0) {
            state.players[0].score += action.payload;
            state.players[0].strikes = 0;
        } else {
            state.players[0].strikes += 1;
            if (state.players[0].strikes == 3) {
                state.players[0].status = 'eliminated';
            }
        }
        const [first, ...rest] = state.players;
        state.players = [...rest, first];
    },
    skipTurn: (state) => {
        const [first, ...rest] = state.players;
        state.players = [...rest, first];
    },
  },
})

export const { addPlayer, enterTurn, skipTurn } = gameSlice.actions

export default gameSlice.reducer