import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import Settings from './Settings';

export type PlayerStatus = 'active' | 'inactive' | 'eliminated';

export interface PlayerState {
  name: string,
  score: number,
  strikes: number,
  status: PlayerStatus,
}

export type GameStatus = 'active' | 'won' | 'lost';

export interface GameState {
  players: PlayerState[],
  status: GameStatus,
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

export interface History {
  snapshots: [PlayerState[]],
  current: number,
}

export interface AppState {
  game: GameState,
  settings: SettingsState,
  history: History,
}

const initialPlayers: PlayerState[] = [
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
]

export const initialState: AppState = {
  game: {
    players: initialPlayers,
    status: 'active',
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
  },
  history: {
    snapshots: [initialPlayers],
    current: 0,
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
      let startScore = state.settings.reset;
      for (const player of state.game.players) {
        if (player.score >= state.settings.reset) continue;
        startScore = 0;
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

      if (state.game.players[0].score === state.settings.target) {
        state.game.status = 'won';
        return;
      } else if (state.game.players[0].score > state.settings.target) {
        state.game.players[0].score = state.settings.reset;
      }

      const index = nextPlayer(state.game.players);
      if (index === -1) {
        state.game.status = 'lost';
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
        state.game.status = 'lost';
        return;
      }
      state.game.players = shiftPlayers(state.game.players, index);
    },

    continueGame: (state, action: PayloadAction<boolean>) => {
      state.game.status = 'active';
      if (action.payload) {
        state.game.players[0].score = state.settings.reset;
      } else {
        state.game.players.map(player => {
          player.status = 'active';
        });
      }
      state.game.players.map(player => {
        player.strikes = 0;
      });
      const [first, ...rest] = state.game.players;
      state.game.players = [...rest, first]; 
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

    updateGameStatus: (state, action: PayloadAction<GameStatus>) => {
      state.game.status = action.payload;
    },

    newGame: (state) => {
      state.game.players = [];
      state.game.status = 'active';
      state.settings = initialState.settings;
    },
    
    allDefaults: (state) => {
      state.settings = initialState.settings;
    },

    updateAll: (state, action: PayloadAction<SettingsState>) => {
      state.settings = action.payload;
    },

    // TODO undo and redo + overwriting history from current position
  },
})

export const { 
  addPlayer, 
  enterTurn, 
  skipTurn, 
  continueGame,
  deletePlayer, 
  updatePlayerStatus,
  editName, 
  updateGameStatus,
  newGame,
  allDefaults,
  updateAll,
} = gameSlice.actions

export default gameSlice.reducer