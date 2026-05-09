export type ParticipantStanding = 'playing' | 'eliminated' | 'paused';

export interface ParticipantState {
  score: number;
  misses: number;
  standing: ParticipantStanding;
  eliminated_turns: number;
}

export interface Team {
  name: string;
  members: Record<string, string>; // member_id → member_name
}

export interface GameRules {
  target_score: number;
  reset_score: number;
  elimination_count: number;
  elimination_reset_score: number;
  elimination_reset_turns: number | null;
  skip_is_miss: boolean;
  use_pin_value: boolean;
}

export interface GameContext {
  players: Record<string, string>;             // id → name
  teams: Record<string, Team>;                 // id → Team
  state: Record<string, ParticipantState>;     // id → ParticipantState
  turn_order: string[];                        // participant IDs in play order
  member_order: Record<string, string[]>;      // team_id → member IDs in order
  rules: GameRules;
  has_started: boolean;
  return_to: 'setup' | 'playing';
}

export const initialParticipantState: ParticipantState = {
  score: 0,
  misses: 0,
  standing: 'playing',
  eliminated_turns: 0,
};

export const initialRules: GameRules = {
  target_score: 50,
  reset_score: 25,
  elimination_count: 3,
  elimination_reset_score: 0,
  elimination_reset_turns: null,
  skip_is_miss: false,
  use_pin_value: false,
};

export const initialContext: GameContext = {
  players: {},
  teams: {},
  state: {},
  turn_order: [],
  member_order: {},
  rules: { ...initialRules },
  has_started: false,
  return_to: 'setup',
};

// Event types for the machine
export type GameEvent =
  | { type: 'NEW_GAME' }
  | { type: 'CONTINUE_GAME' }
  | { type: 'ADD_PLAYER'; name: string }
  | { type: 'ADD_TEAM'; name: string; members: string[] }
  | { type: 'REMOVE_PARTICIPANT'; id: string }
  | { type: 'REMOVE_MEMBER'; teamId: string; memberId: string }
  | { type: 'RENAME'; id: string; newName: string; teamId?: string }
  | { type: 'START_GAME'; shuffle: boolean }
  | { type: 'SUBMIT_TURN'; pins: Set<number> }
  | { type: 'MISS_TURN' }
  | { type: 'SKIP_TURN' }
  | { type: 'SWAP_MEMBER'; teamId: string; memberId: string }
  | { type: 'EDIT_SCORE'; id: string; score: number }
  | { type: 'CYCLE_STANDING'; id: string }
  | { type: 'ADD_PARTICIPANT'; name: string; isTeam?: boolean; members?: string[] }
  | { type: 'REMOVE_PARTICIPANT_MIDGAME'; id: string }
  | { type: 'OPEN_SETTINGS' }
  | { type: 'FINISH_GAME' }
  | { type: 'CONTINUE' }
  | { type: 'RESET' }
  | { type: 'FINISH' }
  | { type: 'CONFIRM' }
  | { type: 'CANCEL' }
  | { type: 'UPDATE_RULES'; rules: Partial<GameRules> }
  | { type: 'GO_BACK' };
