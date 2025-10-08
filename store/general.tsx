import { atom, useAtom } from 'jotai'
import { atomWithStorage, createJSONStorage, loadable } from 'jotai/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';

const storage = createJSONStorage(() => AsyncStorage) as any;

// export interface Player {
//   id: string
//   name: string
// }

// export interface Team extends Player {
//   members: Player[]
// }

export interface Team {
  name: string
  members: Record<string, string> //? id: name
}

export interface Participant {
  id: string
  score: number
  num_misses: number
  is_eliminated: boolean
}

export interface GameState {
  participantStates: Record<string, Participant>
}

export interface Turn {
  id: string
  score: number
}

export interface UpNextObject {
  id: string
  name: string
  member?: string
}

export interface Game {
  players: Record<string, string> //? id: name
  teams: Record<string, Team>
  // member_map: Record<string, string> //? member_id: team_id
  state: GameState[]
  turns: Turn[]
  up_next: string[]
  up_next_members: Record<string, string[]>
  target_score: number
  reset_score: number
  elimination_count: number
  has_game_started: boolean
}

export const initialGame: Game = {
  players: {},
  teams: {},
  state: [],
  turns: [],
  up_next: [],
  up_next_members: {},
  target_score: 50,
  reset_score: 25,
  elimination_count: 3,
  has_game_started: false
};

export const gameAtom = atomWithStorage<Game>('gameAtom', initialGame, storage, { getOnInit: true });
export const loadableGameAtom = loadable(gameAtom);

//######################################################
// HELPERS

// export const getNewPlayer = (name: string): Player => {
//   return {
//     id: crypto.randomUUID(),
//     name: name
//   }
// };

// export const getNewTeam = (name: string): Team => {
//   return {
//     id: crypto.randomUUID(),
//     name: name,
//     members: []
//   }
// };