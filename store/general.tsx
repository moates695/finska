import { atom, useAtom } from 'jotai'
import { atomWithStorage, createJSONStorage, loadable, unwrap } from 'jotai/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';

const storage = createJSONStorage(() => AsyncStorage) as any;
// AsyncStorage.clear(); //!!!

export type ParticipantType = 'player' | 'team';

export interface Team {
  name: string
  members: Record<string, string> //? id: name
}

export interface Participant {
  score: number
  num_misses: number
  is_eliminated: boolean
}

export interface GameState {
  participants: Record<string, Participant> //? id: state
  up_next: string[]
  up_next_members: Record<string, string[]>
}

export type TurnType = 'score' | 'miss' | 'skip';

export interface BaseTurn {
  id: string
  type: TurnType
}

export interface ScoreTurn extends BaseTurn {
  type: 'score'
  score: number
}

export type Turn = BaseTurn | ScoreTurn;

export interface Game {
  players: Record<string, string> //? player_id: name
  teams: Record<string, Team> //? team_id: Team
  // member_map: Record<string, string> //? member_id: team_id
  state: GameState[]
  turns: Turn[]
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
      participants: {
        "1": {
          score: 38,
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
      },
      up_next: [
        "1", "3", "5", "2"
      ],
      up_next_members: {
        "3": ["4"],
        "5": ["6", "7"],
      },
    }
  ],
  turns: [],
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