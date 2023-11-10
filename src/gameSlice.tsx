import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface GameState {
  players: PlayerState[],
  status: boolean,
}

export type PlayerStatus = 'active' | 'inactive' | 'eliminated';

export interface PlayerState {
  name: string,
  score: number,
  strikes: number,
  status: PlayerStatus,
}

const initialState: GameState = {
  players: [],
  status: false,
}

interface EditNamePayload {
  name: string;
  newName: string;
}

interface SetStatusPayload {
  name: string;
  status: PlayerStatus;
}

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    addPlayer: (state, action: PayloadAction<string>) => {
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
    deletePlayer: (state, action: PayloadAction<string>) => {
      state.players = state.players.filter(player => player.name !== action.payload);
    },
    editPlayerName: (state, action: PayloadAction<string>) => {
      state.players.map(player => {
        if (player.name === action.payload) {
          player.name = action.payload;
        }
      });
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.players[action.payload].score += action.payload
    },
    updatePlayerStatus: (state, action: PayloadAction<SetStatusPayload>) => {
      const {name, status} = action.payload;
      state.players.map(player => {
        if (player.name === name) {
          player.status = status;
        }
      });
    },
    editName: (state, action: PayloadAction<EditNamePayload>) => {
      const {name, newName } = action.payload;
      state.players.map(player => {
        if (player.name === name) {
          player.name = newName;
        }
      });
    },
    updateGameStatus: (state, action: PayloadAction<boolean>) => {
      state.status = action.payload;
    },
    newGame: (state) => {
      state.players = [];
      state.status = false;
    }
  },
})

export const { 
  addPlayer, 
  enterTurn, 
  skipTurn, 
  deletePlayer, 
  incrementByAmount,
  updatePlayerStatus,
  editName, 
  updateGameStatus,
  newGame,
} = gameSlice.actions

export default gameSlice.reducer