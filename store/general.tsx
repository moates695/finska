import { atom, useAtom } from 'jotai'
import { atomWithStorage, createJSONStorage, loadable } from 'jotai/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';

const storage = createJSONStorage(() => AsyncStorage) as any;
// AsyncStorage.clear(); //!!!

export type ParticipantType = 'player' | 'team';

export interface Team {
  name: string
  members: Record<string, string> //? id: name
}

export interface Participant {
  // id: string
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
  players: Record<string, string> //? player_id: name
  teams: Record<string, Team> //? team_id: Team
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
  players: {
    "1": "Player 1",
    "2": "Player 2"
  },
  teams: {
    "3": {
      "name": "Team 1",
      "members": {
        "4": "Member 1",
      }
    },
    "5": {
      "name": "Team 2",
      "members": {
        "6": "Member 2",
        "7": "Member 3",
      }
    }
  },
  state: [
    {
      participantStates: {
        "1": {
          score: 0,
          num_misses: 0,
          is_eliminated: false,
        },
        "2": {
          score: 0,
          num_misses: 0,
          is_eliminated: false,
        },
        "3": {
          score: 0,
          num_misses: 0,
          is_eliminated: false,
        },
        "5": {
          score: 0,
          num_misses: 0,
          is_eliminated: false,
        }
      }
    }
  ],
  turns: [],
  up_next: [
    "1", "2", "3", "5"
  ],
  up_next_members: {
    "3": ["4"],
    "5": ["6", "7"],
  },
  target_score: 50,
  reset_score: 25,
  elimination_count: 3,
  has_game_started: false
};

export const gameAtom = atomWithStorage<Game>('gameAtom', {...initialGame}, storage, { getOnInit: true });
export const loadableGameAtom = loadable(gameAtom);

export const initialLoadAtom = atom<boolean>(true);

export const showNewParticipantModalAtom = atom<boolean>(false);

export type ScreenType = 'start options' | 'game setup' | 'game';
export const screenAtom = atom<ScreenType>('game setup');

export const isPlayerAtom = atom<boolean>(true);
export const newNameAtom = atom<string>('');
export const newMemberNameAtom = atom<string>('');
export const newMemberNamesAtom = atom<string[]>([]);
export const newNameErrorAtom = atom<string | null>(null);
export const newMemberNameErrorAtom = atom<string | null>(null);
export const isNameInputFocusedAtom = atom<boolean>(false);

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