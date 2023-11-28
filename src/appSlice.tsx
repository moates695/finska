import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import Settings from './Settings';

export type PlayerStatus = 'active' | 'inactive' | 'eliminated';

export interface PlayerState {
  name: string,
  score: number,
  strikes: number,
  status: PlayerStatus,
}

export interface GameState {
  players: PlayerState[],
  status: boolean,
}

export const sitouts = ['turns', 'rounds', 'none'] as const;
export type SitoutType = typeof sitouts[number];

export interface Sitout {
  type: SitoutType,
  value: number,
}

export const scoreTypes = ['original', 'fast'] as const;
export type ScoreType = typeof scoreTypes[number];

export interface SettingsState {
  target: number,
  reset: number,
  missLimit: number,
  sitout: Sitout,
  scoreType: ScoreType,
  skipAsStrike: boolean,
}

export interface AppState {
  game: GameState,
  settings: SettingsState,
}

export const initialState: AppState = {
  game: {
    players: [
      {
        name: 'Player 1',
        score: 0,
        strikes: 0,
        status: 'active',
      },
      {
        name: 'Player 2',
        score: 0,
        strikes: 0,
        status: 'active',
      }
    ],
    status: true,
  },
  settings: {
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
}

interface EditNamePayload {
  name: string;
  newName: string;
}

interface SetStatusPayload {
  name: string;
  status: PlayerStatus;
}

function nextPlayer(players: PlayerState[]): number {
  for (let i = 1; i < players.length; i++) {
    if (players[i].status === 'active') return i;
  }
  return -1;
}

function shiftPlayers(players: PlayerState[], index: number) {
  const split1 = players.slice(0, index);
  const split2 = players.slice(index);
  return [...split2, ...split1];
}

export const gameSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    addPlayer: (state, action: PayloadAction<string>) => {
      let startScore = 0;
      for (const player of state.game.players) {
        if (player.score < state.settings.reset) continue;
        startScore = state.settings.reset;
        break;
      }
      const player: PlayerState = {
        name: action.payload,
        score: startScore,
        strikes: 0,
        status: 'active',
      }
      state.game.players.push(player);
    },

    enterTurn: (state, action: PayloadAction<number>) => {
      if (action.payload > 0) {
        state.game.players[0].score += action.payload;
        state.game.players[0].strikes = 0;
      } else {
        state.game.players[0].strikes += 1;
        if (state.game.players[0].strikes >= state.settings.missLimit) {
          state.game.players[0].status = 'eliminated';
        }
      }

      const index = nextPlayer(state.game.players);
      if (index === -1) {
        state.game.status = false;
        return;
      }
      state.game.players = shiftPlayers(state.game.players, index);
    },

    skipTurn: (state) => {
      if (state.settings.skipAsStrike) {
        state.game.players[0].strikes += 1;
        if (state.game.players[0].strikes >= state.settings.missLimit) {
          state.game.players[0].status = 'eliminated';
        }
      }
      const index = nextPlayer(state.game.players);
      if (index === -1) {
        state.game.status = false;
        return;
      }
      state.game.players = shiftPlayers(state.game.players, index);
    },

    deletePlayer: (state, action: PayloadAction<string>) => {
      state.game.players = state.game.players.filter(player => player.name !== action.payload);
    },

    editPlayerName: (state, action: PayloadAction<string>) => {
      state.game.players.map(player => {
        if (player.name === action.payload) {
          player.name = action.payload;
        }
      });
    },

    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.game.players[action.payload].score += action.payload
    },

    updatePlayerStatus: (state, action: PayloadAction<SetStatusPayload>) => {
      const {name, status} = action.payload;
      state.game.players.map(player => {
        if (player.name !== name) return;
        player.status = status;
      });
    },

    editName: (state, action: PayloadAction<EditNamePayload>) => {
      const {name, newName } = action.payload;
      state.game.players.map(player => {
        if (player.name === name) {
          player.name = newName;
        }
      });
    },

    updateGameStatus: (state, action: PayloadAction<boolean>) => {
      state.game.status = action.payload;
    },

    newGame: (state) => {
      state.game.players = [];
      state.game.status = false;
    },
    
    allDefaults: (state) => {
      state.settings = initialState.settings;
    },

    updateAll: (state, action: PayloadAction<SettingsState>) => {
      state.settings = action.payload;
    },
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
  allDefaults,
  updateAll,
} = gameSlice.actions

export default gameSlice.reducer