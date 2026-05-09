import {
  GameContext,
  GameRules,
  ParticipantState,
  ParticipantStanding,
  initialContext,
  initialParticipantState,
  initialRules,
} from './types';
import { isNameTaken, isGameValid } from './validation';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * If turn_order[0] isn't a 'playing' participant, rotate forward to the next
 * one that is. Used after mid-game edits (cycleStanding, editMisses, removal)
 * so a paused/eliminated participant never sits at index 0 awaiting a turn.
 */
function rotateToCurrentPlaying(
  turn_order: string[],
  state: Record<string, ParticipantState>,
): string[] {
  if (turn_order.length === 0) return turn_order;
  if (state[turn_order[0]]?.standing === 'playing') return turn_order;

  for (let i = 1; i < turn_order.length; i++) {
    if (state[turn_order[i]]?.standing === 'playing') {
      return [...turn_order.slice(i), ...turn_order.slice(0, i)];
    }
  }
  return turn_order;
}

/** Get the max score achievable in a single turn. */
export function getMaxScore(rules: GameRules): number {
  if (rules.use_pin_value) {
    // Sum of 1..12
    return 78;
  }
  return 12;
}

/** Count pin score from a set of selected pins. */
export function countPins(rules: GameRules, pins: Set<number>): number {
  if (pins.size === 0) return 0;

  if (rules.use_pin_value) {
    return [...pins].reduce((a, b) => a + b, 0);
  }
  if (pins.size === 1) {
    return [...pins][0];
  }
  return pins.size;
}

/** Get the score remaining to reach target. */
export function getRemainingScore(rules: GameRules, score: number): string {
  return (rules.target_score - score).toString();
}

/** Get the current player's ID (first in turn_order). */
export function getCurrentPlayerId(ctx: GameContext): string {
  return ctx.turn_order[0];
}

/** Get the current player's score. */
export function getCurrentPlayerScore(ctx: GameContext): number {
  const id = getCurrentPlayerId(ctx);
  return ctx.state[id]?.score ?? 0;
}

/** Get participant name by ID. */
export function getParticipantName(ctx: GameContext, id: string): string {
  if (id in ctx.players) return ctx.players[id];
  if (id in ctx.teams) return ctx.teams[id].name;
  return '';
}

/** Get the current team member name (or null if player). */
export function getCurrentMemberName(ctx: GameContext): string | null {
  const id = getCurrentPlayerId(ctx);
  if (!(id in ctx.teams)) return null;
  const memberOrder = ctx.member_order[id];
  if (!memberOrder || memberOrder.length === 0) return null;
  return ctx.teams[id].members[memberOrder[0]] ?? null;
}

// ---------------------------------------------------------------------------
// Participant management
// ---------------------------------------------------------------------------

export function addPlayer(ctx: GameContext, name: string): Partial<GameContext> {
  const trimmed = name.trim();
  if (!trimmed || isNameTaken(ctx, trimmed)) return {};

  const id = generateId();
  return {
    players: { ...ctx.players, [id]: trimmed },
    state: { ...ctx.state, [id]: { ...initialParticipantState } },
    turn_order: [...ctx.turn_order, id],
  };
}

export function addTeam(
  ctx: GameContext,
  name: string,
  memberNames: string[],
): Partial<GameContext> {
  const trimmedName = name.trim();
  if (!trimmedName || isNameTaken(ctx, trimmedName)) return {};
  if (memberNames.length < 2) return {};

  const teamId = generateId();
  const members: Record<string, string> = {};
  const memberIds: string[] = [];

  for (const mName of memberNames) {
    const trimmedMember = mName.trim();
    if (!trimmedMember) return {};
    const memberId = generateId();
    members[memberId] = trimmedMember;
    memberIds.push(memberId);
  }

  return {
    teams: {
      ...ctx.teams,
      [teamId]: { name: trimmedName, members },
    },
    state: { ...ctx.state, [teamId]: { ...initialParticipantState } },
    turn_order: [...ctx.turn_order, teamId],
    member_order: { ...ctx.member_order, [teamId]: memberIds },
  };
}

export function removeParticipant(ctx: GameContext, id: string): Partial<GameContext> {
  const { [id]: _removedState, ...restState } = ctx.state;
  const filteredOrder = ctx.turn_order.filter(pid => pid !== id);
  const turnOrder = rotateToCurrentPlaying(filteredOrder, restState);

  if (id in ctx.players) {
    const { [id]: _removedPlayer, ...restPlayers } = ctx.players;
    return {
      players: restPlayers,
      state: restState,
      turn_order: turnOrder,
    };
  }

  if (id in ctx.teams) {
    const { [id]: _removedTeam, ...restTeams } = ctx.teams;
    const { [id]: _removedOrder, ...restMemberOrder } = ctx.member_order;
    return {
      teams: restTeams,
      state: restState,
      turn_order: turnOrder,
      member_order: restMemberOrder,
    };
  }

  return {};
}

export function addMember(
  ctx: GameContext,
  teamId: string,
  memberName: string,
): Partial<GameContext> {
  const team = ctx.teams[teamId];
  if (!team) return {};

  const trimmed = memberName.trim();
  if (!trimmed) return {};
  if (isNameTaken(ctx, trimmed)) return {};
  if (trimmed.toLowerCase() === team.name.trim().toLowerCase()) return {};
  if (Object.values(team.members).some(m => m.toLowerCase() === trimmed.toLowerCase())) return {};

  const memberId = generateId();
  return {
    teams: {
      ...ctx.teams,
      [teamId]: {
        ...team,
        members: { ...team.members, [memberId]: trimmed },
      },
    },
    member_order: {
      ...ctx.member_order,
      [teamId]: [...(ctx.member_order[teamId] ?? []), memberId],
    },
  };
}

export function removeMember(
  ctx: GameContext,
  teamId: string,
  memberId: string,
): Partial<GameContext> {
  const team = ctx.teams[teamId];
  if (!team) return {};

  const { [memberId]: _removed, ...restMembers } = team.members;

  // If no members left, remove the whole team
  if (Object.keys(restMembers).length === 0) {
    return removeParticipant(ctx, teamId);
  }

  return {
    teams: {
      ...ctx.teams,
      [teamId]: { ...team, members: restMembers },
    },
    member_order: {
      ...ctx.member_order,
      [teamId]: ctx.member_order[teamId].filter(id => id !== memberId),
    },
  };
}

export function renameParticipant(
  ctx: GameContext,
  id: string,
  newName: string,
  teamId?: string,
): Partial<GameContext> {
  const trimmed = newName.trim();
  if (!trimmed) return {};

  // Renaming a team member
  if (teamId) {
    if (isNameTaken(ctx, trimmed, id)) return {};
    const team = ctx.teams[teamId];
    if (!team) return {};
    return {
      teams: {
        ...ctx.teams,
        [teamId]: {
          ...team,
          members: { ...team.members, [id]: trimmed },
        },
      },
    };
  }

  // Renaming a player
  if (id in ctx.players) {
    if (isNameTaken(ctx, trimmed, id)) return {};
    return {
      players: { ...ctx.players, [id]: trimmed },
    };
  }

  // Renaming a team
  if (id in ctx.teams) {
    if (isNameTaken(ctx, trimmed, id)) return {};
    return {
      teams: {
        ...ctx.teams,
        [id]: { ...ctx.teams[id], name: trimmed },
      },
    };
  }

  return {};
}

// ---------------------------------------------------------------------------
// Game flow
// ---------------------------------------------------------------------------

export function startGame(ctx: GameContext, shuffle: boolean): Partial<GameContext> {
  let turnOrder = [...ctx.turn_order];
  const memberOrder = { ...ctx.member_order };

  if (shuffle) {
    turnOrder = shuffleArray(turnOrder);
    for (const teamId of Object.keys(memberOrder)) {
      memberOrder[teamId] = shuffleArray(memberOrder[teamId]);
    }
  }

  return {
    turn_order: turnOrder,
    member_order: memberOrder,
    has_started: true,
  };
}

// ---------------------------------------------------------------------------
// Turn cycling
// ---------------------------------------------------------------------------

/**
 * Advance the turn order to the next playing participant.
 * Also increments eliminated_turns and handles re-entry for eliminated participants.
 */
export function advanceTurn(ctx: GameContext): Partial<GameContext> {
  const turnOrder = ctx.turn_order;
  if (turnOrder.length <= 1) return {};

  const newState = { ...ctx.state };

  // Find the next 'playing' participant starting from index 1
  let nextIndex = 1;
  for (let i = 1; i < turnOrder.length; i++) {
    const id = turnOrder[i];
    const pState = newState[id];

    if (pState.standing === 'playing') {
      nextIndex = i;
      break;
    }

    if (pState.standing === 'eliminated') {
      // Clone before mutating
      newState[id] = { ...pState };
      newState[id].eliminated_turns++;

      // Check for re-entry
      if (
        ctx.rules.elimination_reset_turns !== null &&
        newState[id].eliminated_turns >= ctx.rules.elimination_reset_turns
      ) {
        newState[id].score = ctx.rules.elimination_reset_score;
        newState[id].standing = 'playing';
        newState[id].misses = 0;
        newState[id].eliminated_turns = 0;
      }
    }
    // 'paused' participants are skipped silently
  }

  // Rotate turn_order so nextIndex becomes position 0
  const newTurnOrder = [
    ...turnOrder.slice(nextIndex),
    ...turnOrder.slice(0, nextIndex),
  ];

  // Rotate member_order for the current participant (who just played)
  const currentId = turnOrder[0];
  let newMemberOrder = ctx.member_order;
  if (currentId in ctx.teams && ctx.member_order[currentId]?.length > 1) {
    const members = ctx.member_order[currentId];
    newMemberOrder = {
      ...ctx.member_order,
      [currentId]: [...members.slice(1), members[0]],
    };
  }

  return {
    state: newState,
    turn_order: newTurnOrder,
    member_order: newMemberOrder,
  };
}

// ---------------------------------------------------------------------------
// Turn actions
// ---------------------------------------------------------------------------

export interface TurnResult {
  updates: Partial<GameContext>;
  event: 'win' | 'gameOver' | null;
}

export function submitTurn(ctx: GameContext, pins: Set<number>): TurnResult {
  const id = getCurrentPlayerId(ctx);
  const score = countPins(ctx.rules, pins);
  let newScore = ctx.state[id].score + score;
  let event: 'win' | 'gameOver' | null = null;

  if (newScore === ctx.rules.target_score) {
    event = 'win';
  } else if (newScore > ctx.rules.target_score) {
    newScore = ctx.rules.reset_score;
  }

  const newState = {
    ...ctx.state,
    [id]: {
      ...ctx.state[id],
      score: newScore,
      misses: 0, // successful hit resets miss count
    },
  };

  const ctxWithScore = { ...ctx, state: newState };
  const advanceUpdates = advanceTurn(ctxWithScore);

  return {
    updates: {
      state: { ...(advanceUpdates.state ?? newState) },
      turn_order: advanceUpdates.turn_order,
      member_order: advanceUpdates.member_order,
    },
    event,
  };
}

export function missTurn(ctx: GameContext): TurnResult {
  const id = getCurrentPlayerId(ctx);
  const currentMisses = ctx.state[id].misses + 1;
  let standing: ParticipantStanding = ctx.state[id].standing;

  if (currentMisses >= ctx.rules.elimination_count) {
    standing = 'eliminated';
  }

  const newState = {
    ...ctx.state,
    [id]: {
      ...ctx.state[id],
      misses: currentMisses,
      standing,
      eliminated_turns: 0,
    },
  };

  const ctxAfterMiss = { ...ctx, state: newState };
  const advanceUpdates = advanceTurn(ctxAfterMiss);
  const finalState = advanceUpdates.state ?? newState;

  const event: 'win' | 'gameOver' | null = isGameValid({ ...ctx, state: finalState })
    ? null
    : 'gameOver';

  return {
    updates: {
      state: finalState,
      turn_order: advanceUpdates.turn_order,
      member_order: advanceUpdates.member_order,
    },
    event,
  };
}

export function skipTurn(ctx: GameContext): TurnResult {
  if (ctx.rules.skip_is_miss) {
    return missTurn(ctx);
  }

  const advanceUpdates = advanceTurn(ctx);

  return {
    updates: {
      state: advanceUpdates.state,
      turn_order: advanceUpdates.turn_order,
      member_order: advanceUpdates.member_order,
    },
    event: null,
  };
}

// ---------------------------------------------------------------------------
// Mid-game edits
// ---------------------------------------------------------------------------

export interface EditResult {
  updates: Partial<GameContext>;
  event: 'win' | 'gameOver' | null;
}

export function editScore(ctx: GameContext, id: string, newScore: number): EditResult {
  if (!(id in ctx.state)) return { updates: {}, event: null };

  let score = newScore;
  let event: 'win' | 'gameOver' | null = null;

  if (score === ctx.rules.target_score) {
    event = 'win';
  } else if (score > ctx.rules.target_score) {
    score = ctx.rules.reset_score;
  } else if (score < 0) {
    score = 0;
  }

  return {
    updates: {
      state: {
        ...ctx.state,
        [id]: { ...ctx.state[id], score },
      },
    },
    event,
  };
}

export function editMisses(ctx: GameContext, id: string, newMisses: number): EditResult {
  if (!(id in ctx.state)) return { updates: {}, event: null };

  const elimCount = ctx.rules.elimination_count;
  const misses = Math.max(0, Math.min(newMisses, elimCount));
  const current = ctx.state[id];
  let standing = current.standing;
  let eliminated_turns = current.eliminated_turns;

  if (misses >= elimCount && standing === 'playing') {
    standing = 'eliminated';
    eliminated_turns = 0;
  } else if (misses < elimCount && standing === 'eliminated') {
    standing = 'playing';
    eliminated_turns = 0;
  }

  const newState = {
    ...ctx.state,
    [id]: { ...current, misses, standing, eliminated_turns },
  };
  const newTurnOrder = rotateToCurrentPlaying(ctx.turn_order, newState);

  const event: 'win' | 'gameOver' | null = isGameValid({ ...ctx, state: newState })
    ? null
    : 'gameOver';

  return { updates: { state: newState, turn_order: newTurnOrder }, event };
}

export function cycleStanding(ctx: GameContext, id: string): EditResult {
  if (!(id in ctx.state)) return { updates: {}, event: null };

  const current = ctx.state[id].standing;
  const cycle: Record<ParticipantStanding, ParticipantStanding> = {
    playing: 'paused',
    paused: 'eliminated',
    eliminated: 'playing',
  };
  const next = cycle[current];

  const newParticipantState: ParticipantState = {
    ...ctx.state[id],
    standing: next,
    eliminated_turns: next === 'playing' ? 0 : ctx.state[id].eliminated_turns,
    misses: next === 'playing' ? 0 : ctx.state[id].misses,
  };

  const newState = { ...ctx.state, [id]: newParticipantState };
  const newTurnOrder = rotateToCurrentPlaying(ctx.turn_order, newState);
  const event: 'win' | 'gameOver' | null = isGameValid({ ...ctx, state: newState })
    ? null
    : 'gameOver';

  return {
    updates: { state: newState, turn_order: newTurnOrder },
    event,
  };
}

export function swapTeamMember(
  ctx: GameContext,
  teamId: string,
  memberId: string,
): Partial<GameContext> {
  const memberOrder = ctx.member_order[teamId];
  if (!memberOrder) return {};

  const idx = memberOrder.indexOf(memberId);
  if (idx <= 0) return {}; // already first or not found

  // Move the target member to position 0, keep rest in order
  const newOrder = [
    memberId,
    ...memberOrder.filter(id => id !== memberId),
  ];

  return {
    member_order: {
      ...ctx.member_order,
      [teamId]: newOrder,
    },
  };
}

// ---------------------------------------------------------------------------
// Game end
// ---------------------------------------------------------------------------

export function winContinue(ctx: GameContext): Partial<GameContext> {
  const newState = { ...ctx.state };

  for (const [id, pState] of Object.entries(newState)) {
    if (pState.score >= ctx.rules.target_score) {
      newState[id] = {
        ...pState,
        score: ctx.rules.elimination_reset_score,
      };
    }
  }

  return { state: newState };
}

export function loseReset(ctx: GameContext): Partial<GameContext> {
  const newState = { ...ctx.state };

  for (const [id, pState] of Object.entries(newState)) {
    newState[id] = {
      ...pState,
      score: 0,
      misses: 0,
      eliminated_turns: 0,
      standing: pState.standing === 'paused' ? 'paused' : 'playing',
    };
  }

  return { state: newState };
}

export function resetGame(): Partial<GameContext> {
  return { ...initialContext, rules: { ...initialRules } };
}

// ---------------------------------------------------------------------------
// Settings / rules update
// ---------------------------------------------------------------------------

export function updateRules(
  ctx: GameContext,
  newRules: Partial<GameRules>,
): Partial<GameContext> {
  const mergedRules: GameRules = { ...ctx.rules, ...newRules };

  // Validate rules
  if (mergedRules.reset_score >= mergedRules.target_score) return {};
  if (mergedRules.elimination_reset_score >= mergedRules.target_score) return {};

  // Recalculate participant states based on new rules
  const newState = { ...ctx.state };
  for (const [id, pState] of Object.entries(newState)) {
    const updated = { ...pState };

    // Score exceeds new target → reset
    if (updated.score >= mergedRules.target_score) {
      updated.score = mergedRules.reset_score;
    }

    if (updated.standing === 'paused') {
      newState[id] = updated;
      continue;
    }

    if (updated.standing === 'playing') {
      // Playing but misses now exceed new count → eliminate
      if (updated.misses >= mergedRules.elimination_count) {
        updated.standing = 'eliminated';
        updated.eliminated_turns = 0;
      }
    } else if (updated.standing === 'eliminated') {
      // Eliminated but misses no longer exceed new count → restore
      if (updated.misses < mergedRules.elimination_count) {
        updated.standing = 'playing';
        updated.score = mergedRules.elimination_reset_score;
        updated.eliminated_turns = 0;
        updated.misses = 0;
      }
      // Eliminated and reset turns has been reached → restore
      else if (
        mergedRules.elimination_reset_turns !== null &&
        updated.eliminated_turns >= mergedRules.elimination_reset_turns
      ) {
        updated.standing = 'playing';
        updated.score = mergedRules.elimination_reset_score;
        updated.eliminated_turns = 0;
        updated.misses = 0;
      }
    }

    newState[id] = updated;
  }

  return {
    rules: mergedRules,
    state: newState,
  };
}
