import { atom, useAtom } from 'jotai'
import { atomWithStorage, createJSONStorage, loadable, unwrap } from 'jotai/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, themes } from '@/styles/theme';

const storage = createJSONStorage(() => AsyncStorage) as any;
// AsyncStorage.clear(); //!!! 

export type Players = Record<string, string>;

export interface Team {
  name: string
  members: Record<string, string> //? id: name
}
export type Teams = Record<string, Team>

export type ParticipantType = 'player' | 'team';

export type ParticipantStanding = 'playing' | 'eliminated' | 'paused';

export interface ParticipantState {
  score: number
  num_misses: number
  standing: ParticipantStanding
  eliminated_turns: number
}

export const initialParticipantState: ParticipantState = {
  score: 0,
  num_misses: 0,
  standing: 'playing',
  eliminated_turns: 0
}

export type GameState = Record<string, ParticipantState>


export interface Game {
  players: Players //? player_id: name
  teams: Teams //? team_id: Team
  state: GameState
  up_next: string[] //? id: is_valid (not eliminated)
  up_next_members: Record<string, string[]>
  target_score: number
  reset_score: number
  use_pin_value: boolean
  elimination_count: number
  elimination_reset_score: number
  elimination_reset_turns: number | null
  skip_is_miss: boolean
  has_game_started: boolean
}

// export let initialGame: Game = {
//   players: {
//   },
//   teams: {
//     "1": {
//       "name": "Team 1",
//       "members": {
//         "2": "Member 1",
//       }
//     },
//     "3": {
//       "name": "Team 2",
//       "members": {
//         "4": "Member 2",
//         "5": "Member 3",
//       }
//     }
//   },
//   state: {
//     "1": {...initialParticipantState},
//     "3": {...initialParticipantState}
//   },
//   up_next: ["1", "3"],
//   up_next_members: {
//     "1": ["2"],
//     "3": ["4", "5"],
//   },
//   target_score: 50,
//   reset_score: 25,
//   use_pin_value: false,
//   elimination_count: 3,
//   elimination_reset_score: 0,
//   elimination_reset_turns: null,
//   skip_is_miss: false,
//   has_game_started: false
// };

export let initialGame: Game = {
  players: {},
  teams: {},
  state: {},
  up_next: [],
  up_next_members: {},
  target_score: 50,
  reset_score: 25,
  use_pin_value: false,
  elimination_count: 3,
  elimination_reset_score: 0,
  elimination_reset_turns: null,
  skip_is_miss: false,
  has_game_started: false
};

for (let i = 10; i < 13; i++) {
  const id = i.toString();
  initialGame.players[id] = `Player ${i}`
  initialGame.state[id] = {...initialParticipantState};
  initialGame.up_next.push(id);
}

export const gameAtom = atomWithStorage<Game>('gameAtom', {...initialGame}, storage, { getOnInit: true });
export const loadableGameAtom = loadable(gameAtom);

export const initialLoadAtom = atom<boolean>(true);

export const showNewParticipantModalAtom = atom<boolean>(false);

export type ScreenType = 'start options' | 'game setup' | 'game' | 'settings';
export const screenAtom = atom<ScreenType>('game setup');

export const isPlayerAtom = atom<boolean>(true);
export const newNameAtom = atom<string>('');
export const newMemberNameAtom = atom<string>('');
export const newMemberNamesAtom = atom<string[]>([]);
export const newNameErrorAtom = atom<string | null>(null);
export const newMemberNameErrorAtom = atom<string | null>(null);
export const isNameInputFocusedAtom = atom<boolean>(false);

export const showCompleteModalAtom = atom<boolean>(false);

export type CompleteState = 'win' | 'finish' | 'default';

export const completeStateAtom = atom<CompleteState>('win');

export const themeAtom = atomWithStorage<Theme>('themeAtom', themes.sand, storage, { getOnInit: true })
export const loadableThemeAtom = loadable(themeAtom);

export const useDeviceThemeAtom = atomWithStorage<boolean>('useDeviceThemeAtom', false, storage, { getOnInit: true })
export const loadableUseDeviceThemeAtom = loadable(useDeviceThemeAtom);

export const showAddParticipantAtom = atom<boolean>(false);

//######################################################
// HELPERS

export const getMaxScore = (game: Game): number => {
  try {
    return game.use_pin_value ? 78 : 12;
  } catch (error) {
    console.log(error);
    return 12;
  }
};

export type DistinctUpNext = Record<ParticipantStanding, string[]>

export const getDistinctUpNext = (game: Game): DistinctUpNext => {
  const distinct: DistinctUpNext = {
    playing: [],
    eliminated: [],
    paused: []
  }

  for (const id of game.up_next) {
    distinct[game.state[id].standing].push(id);
  }

  return distinct;
};

export const getRemainingScore = (game: Game, score: number): string => {
  return (game.target_score - score).toString();
};

export const gameIsValid = (state: GameState): boolean => {
  const numPlaying = Object.values(state).reduce((sum, item) => {
    return sum + (item.standing === 'playing' ? 1 : 0)}, 0);
  return numPlaying >= 2;
};