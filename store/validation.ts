import { GameContext, GameRules } from './types';
import { getMaxScore } from './game_logic';

/**
 * Check if a name is already taken by any player, team, or team member.
 * Case insensitive. Optionally exclude an ID (for rename operations).
 */
export function isNameTaken(
  ctx: GameContext,
  name: string,
  excludeId?: string,
): boolean {
  const lower = name.trim().toLowerCase();
  if (!lower) return false;

  // Check player names
  for (const [id, playerName] of Object.entries(ctx.players)) {
    if (id === excludeId) continue;
    if (playerName.toLowerCase() === lower) return true;
  }

  // Check team names and member names
  for (const [teamId, team] of Object.entries(ctx.teams)) {
    if (teamId !== excludeId && team.name.toLowerCase() === lower) return true;
    for (const [memberId, memberName] of Object.entries(team.members)) {
      if (memberId === excludeId) continue;
      if (memberName.toLowerCase() === lower) return true;
    }
  }

  return false;
}

/**
 * Validate a new player name before adding.
 * Returns an error string or null if valid.
 */
export function validateNewPlayer(ctx: GameContext, name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return 'Name is empty';
  if (isNameTaken(ctx, trimmed)) return 'Name is already taken';
  return null;
}

/**
 * Validate a new team before adding.
 * Returns an error string or null if valid.
 */
export function validateNewTeam(
  ctx: GameContext,
  teamName: string,
  memberNames: string[],
): string | null {
  const trimmed = teamName.trim();
  if (!trimmed) return 'Team name is empty';
  if (isNameTaken(ctx, trimmed)) return 'Team name is already taken';
  if (memberNames.length < 2) return 'Teams need at least 2 members';

  // Check member names
  const seen = new Set<string>();
  seen.add(trimmed.toLowerCase());

  for (const memberName of memberNames) {
    const mTrimmed = memberName.trim();
    if (!mTrimmed) return 'Member name is empty';
    const mLower = mTrimmed.toLowerCase();
    if (seen.has(mLower)) return `"${mTrimmed}" is a duplicate`;
    if (isNameTaken(ctx, mTrimmed)) return `"${mTrimmed}" is already taken`;
    seen.add(mLower);
  }

  return null;
}

/**
 * Validate a member name for adding to a team being built.
 * Checks against existing game names and the team name + already-staged members.
 */
export function validateMemberName(
  ctx: GameContext,
  memberName: string,
  teamName: string,
  existingMembers: string[],
): string | null {
  const trimmed = memberName.trim();
  if (!trimmed) return 'Name is empty';
  if (isNameTaken(ctx, trimmed)) return 'Name is already taken';
  if (trimmed.toLowerCase() === teamName.trim().toLowerCase()) {
    return 'Same as team name';
  }
  if (existingMembers.some(m => m.toLowerCase() === trimmed.toLowerCase())) {
    return 'Duplicate member name';
  }
  return null;
}

/**
 * Validate rules. Returns a record of field → error, or null if all valid.
 */
export function validateRules(
  rules: Partial<GameRules>,
  currentRules: GameRules,
): Record<string, string> | null {
  const merged = { ...currentRules, ...rules };
  const errors: Record<string, string> = {};

  if (merged.reset_score >= merged.target_score) {
    errors.reset_score = 'Must be less than target score';
  }
  if (merged.elimination_reset_score >= merged.target_score) {
    errors.elimination_reset_score = 'Must be less than target score';
  }
  if (merged.elimination_count <= 0) {
    errors.elimination_count = 'Must be greater than 0';
  }
  if (
    merged.elimination_reset_turns !== null &&
    merged.elimination_reset_turns <= 0
  ) {
    errors.elimination_reset_turns = 'Must be greater than 0';
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

/**
 * Check if the game has at least 2 playing participants.
 */
export function isGameValid(ctx: GameContext): boolean {
  const playing = Object.values(ctx.state).filter(
    s => s.standing === 'playing',
  );
  return playing.length >= 2;
}

/**
 * Check if a participant can win on this turn.
 */
export function canWinThisTurn(ctx: GameContext, id: string): boolean {
  const pState = ctx.state[id];
  if (!pState || pState.standing !== 'playing') return false;
  const remaining = ctx.rules.target_score - pState.score;
  return remaining > 0 && remaining <= getMaxScore(ctx.rules);
}
