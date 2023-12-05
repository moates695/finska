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
  snapshots: [PlayerState[]],
  current: number,
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

export interface AppState {
  game: GameState,
  settings: SettingsState,
}

export const initialState: AppState = {
  game: {
    snapshots: [
      [
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
    ],
    current: 0,
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
      for (const player of state.game.snapshots[state.game.current]) {
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
      state.game.snapshots[state.game.current].push(player);
    },

    enterTurn: (state, action: PayloadAction<number>) => {
      // TODO check that this is correct
      if (state.game.current != state.game.snapshots.length - 1) {
        state.game.snapshots.splice(state.game.current + 1);
      }
      state.game.snapshots.push(state.game.snapshots[state.game.current])

      if (action.payload > 0) {
        state.game.snapshots[state.game.current][0].score += action.payload;
        state.game.snapshots[state.game.current][0].strikes = 0;
      } else {
        state.game.snapshots[state.game.current][0].strikes += 1;
        if (state.game.snapshots[state.game.current][0].strikes >= state.settings.missLimit) {
          state.game.snapshots[state.game.current][0].status = 'eliminated';
        }
      }

      if (state.game.snapshots[state.game.current][0].score === state.settings.target) {
        state.game.status = 'won';
        return;
      } else if (state.game.snapshots[state.game.current][0].score > state.settings.target) {
        state.game.snapshots[state.game.current][0].score = state.settings.reset;
      }

      const index = nextPlayer(state.game.snapshots[state.game.current]);
      if (index === -1) {
        state.game.status = 'lost';
        return;
      }
      state.game.snapshots[state.game.current] = shiftPlayers(state.game.snapshots[state.game.current], index);
    },

    skipTurn: (state) => {
      if (state.settings.skipAsStrike) {
        state.game.snapshots[state.game.current][0].strikes += 1;
        if (state.game.snapshots[state.game.current][0].strikes >= state.settings.missLimit) {
          state.game.snapshots[state.game.current][0].status = 'eliminated';
        }
      }
      const index = nextPlayer(state.game.snapshots[state.game.current]);
      if (index === -1) {
        state.game.status = 'lost';
        return;
      }
      state.game.snapshots[state.game.current] = shiftPlayers(state.game.snapshots[state.game.current], index);
    },

    continueGame: (state, action: PayloadAction<boolean>) => {
      state.game.status = 'active';
      if (action.payload) {
        state.game.snapshots[state.game.current][0].score = state.settings.reset;
      } else {
        state.game.snapshots[state.game.current].map(player => {
          player.status = 'active';
        });
      }
      state.game.snapshots[state.game.current].map(player => {
        player.strikes = 0;
      });
      const [first, ...rest] = state.game.snapshots[state.game.current];
      state.game.snapshots[state.game.current] = [...rest, first]; 
    },

    deletePlayer: (state, action: PayloadAction<string>) => {
      state.game.snapshots[state.game.current] = state.game.snapshots[state.game.current].filter(player => player.name !== action.payload);
    },

    editPlayerName: (state, action: PayloadAction<string>) => {
      state.game.snapshots[state.game.current].map(player => {
        if (player.name === action.payload) {
          player.name = action.payload;
        }
      });
    },

    updatePlayerStatus: (state, action: PayloadAction<SetStatusPayload>) => {
      const {name, status} = action.payload;
      state.game.snapshots[state.game.current].map(player => {
        if (player.name !== name) return;
        player.status = status;
      });
    },

    editName: (state, action: PayloadAction<EditNamePayload>) => {
      const {name, newName } = action.payload;
      state.game.snapshots[state.game.current].map(player => {
        if (player.name === name) {
          player.name = newName;
        }
      });
    },

    updateGameStatus: (state, action: PayloadAction<GameStatus>) => {
      state.game.status = action.payload;
    },

    newGame: (state) => {
      state.game.snapshots[state.game.current] = [];
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