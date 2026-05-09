import {
  isNameTaken,
  validateNewPlayer,
  validateNewTeam,
  validateMemberName,
  validateRules,
  isGameValid,
  canWinThisTurn,
} from '../store/validation';
import { GameContext, initialContext, initialRules } from '../store/types';
import { addPlayer, addTeam } from '../store/game_logic';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeCtx(overrides: Partial<GameContext> = {}): GameContext {
  return { ...initialContext, rules: { ...initialRules }, ...overrides };
}

function ctxWithPlayersAndTeam(): GameContext {
  let ctx = makeCtx();
  ctx = { ...ctx, ...addPlayer(ctx, 'Alice') };
  ctx = { ...ctx, ...addPlayer(ctx, 'Bob') };
  ctx = { ...ctx, ...addTeam(ctx, 'Legends', ['Charlie', 'Diana']) };
  return ctx;
}

// ---------------------------------------------------------------------------
// isNameTaken
// ---------------------------------------------------------------------------

describe('isNameTaken', () => {
  test('returns false for empty context', () => {
    expect(isNameTaken(makeCtx(), 'Alice')).toBe(false);
  });

  test('detects player name', () => {
    const ctx = ctxWithPlayersAndTeam();
    expect(isNameTaken(ctx, 'Alice')).toBe(true);
  });

  test('is case insensitive', () => {
    const ctx = ctxWithPlayersAndTeam();
    expect(isNameTaken(ctx, 'alice')).toBe(true);
    expect(isNameTaken(ctx, 'ALICE')).toBe(true);
  });

  test('detects team name', () => {
    const ctx = ctxWithPlayersAndTeam();
    expect(isNameTaken(ctx, 'Legends')).toBe(true);
    expect(isNameTaken(ctx, 'legends')).toBe(true);
  });

  test('detects member name', () => {
    const ctx = ctxWithPlayersAndTeam();
    expect(isNameTaken(ctx, 'Charlie')).toBe(true);
    expect(isNameTaken(ctx, 'Diana')).toBe(true);
  });

  test('returns false for unknown name', () => {
    const ctx = ctxWithPlayersAndTeam();
    expect(isNameTaken(ctx, 'Eve')).toBe(false);
  });

  test('excludeId skips that entry', () => {
    const ctx = ctxWithPlayersAndTeam();
    const aliceId = Object.entries(ctx.players).find(([_, n]) => n === 'Alice')![0];
    expect(isNameTaken(ctx, 'Alice', aliceId)).toBe(false);
  });

  test('trims whitespace', () => {
    const ctx = ctxWithPlayersAndTeam();
    expect(isNameTaken(ctx, '  Alice  ')).toBe(true);
  });

  test('returns false for empty string', () => {
    const ctx = ctxWithPlayersAndTeam();
    expect(isNameTaken(ctx, '')).toBe(false);
    expect(isNameTaken(ctx, '   ')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateNewPlayer
// ---------------------------------------------------------------------------

describe('validateNewPlayer', () => {
  test('returns null for valid name', () => {
    const ctx = makeCtx();
    expect(validateNewPlayer(ctx, 'Alice')).toBeNull();
  });

  test('returns error for empty name', () => {
    const ctx = makeCtx();
    expect(validateNewPlayer(ctx, '')).toBe('Name is empty');
    expect(validateNewPlayer(ctx, '  ')).toBe('Name is empty');
  });

  test('returns error for taken name', () => {
    const ctx = ctxWithPlayersAndTeam();
    expect(validateNewPlayer(ctx, 'Alice')).toBe('Name is already taken');
  });
});

// ---------------------------------------------------------------------------
// validateNewTeam
// ---------------------------------------------------------------------------

describe('validateNewTeam', () => {
  test('returns null for valid team', () => {
    const ctx = makeCtx();
    expect(validateNewTeam(ctx, 'Team', ['M1', 'M2'])).toBeNull();
  });

  test('returns error for empty team name', () => {
    expect(validateNewTeam(makeCtx(), '', ['M1', 'M2'])).toBe('Team name is empty');
  });

  test('returns error for taken team name', () => {
    const ctx = ctxWithPlayersAndTeam();
    expect(validateNewTeam(ctx, 'Alice', ['M1', 'M2'])).toBe('Team name is already taken');
  });

  test('returns error for too few members', () => {
    expect(validateNewTeam(makeCtx(), 'Team', ['Solo'])).toBe('Teams need at least 2 members');
  });

  test('returns error for duplicate member names', () => {
    expect(validateNewTeam(makeCtx(), 'Team', ['A', 'A'])).toContain('duplicate');
  });

  test('returns error for member name matching team name', () => {
    expect(validateNewTeam(makeCtx(), 'Team', ['Team', 'Other'])).toContain('duplicate');
  });

  test('returns error for member name already in game', () => {
    const ctx = ctxWithPlayersAndTeam();
    expect(validateNewTeam(ctx, 'NewTeam', ['Alice', 'Eve'])).toContain('already taken');
  });
});

// ---------------------------------------------------------------------------
// validateMemberName
// ---------------------------------------------------------------------------

describe('validateMemberName', () => {
  test('returns null for valid name', () => {
    expect(validateMemberName(makeCtx(), 'NewMember', 'Team', [])).toBeNull();
  });

  test('returns error for empty name', () => {
    expect(validateMemberName(makeCtx(), '', 'Team', [])).toBe('Name is empty');
  });

  test('returns error when matching team name', () => {
    expect(validateMemberName(makeCtx(), 'Team', 'Team', [])).toBe('Same as team name');
  });

  test('returns error for duplicate in staged members', () => {
    expect(validateMemberName(makeCtx(), 'A', 'Team', ['A'])).toBe('Duplicate member name');
  });

  test('returns error for name in game', () => {
    const ctx = ctxWithPlayersAndTeam();
    expect(validateMemberName(ctx, 'Alice', 'Team', [])).toBe('Name is already taken');
  });
});

// ---------------------------------------------------------------------------
// validateRules
// ---------------------------------------------------------------------------

describe('validateRules', () => {
  test('returns null for valid rules', () => {
    expect(validateRules({ target_score: 100 }, initialRules)).toBeNull();
  });

  test('returns error when reset >= target', () => {
    const errors = validateRules({ reset_score: 50 }, initialRules);
    expect(errors).not.toBeNull();
    expect(errors!.reset_score).toBeDefined();
  });

  test('returns error when elimination_reset_score >= target', () => {
    const errors = validateRules({ elimination_reset_score: 50 }, initialRules);
    expect(errors).not.toBeNull();
    expect(errors!.elimination_reset_score).toBeDefined();
  });

  test('returns error for elimination_count <= 0', () => {
    const errors = validateRules({ elimination_count: 0 }, initialRules);
    expect(errors).not.toBeNull();
    expect(errors!.elimination_count).toBeDefined();
  });

  test('returns error for elimination_reset_turns <= 0', () => {
    const errors = validateRules({ elimination_reset_turns: 0 }, initialRules);
    expect(errors).not.toBeNull();
    expect(errors!.elimination_reset_turns).toBeDefined();
  });

  test('null elimination_reset_turns is valid', () => {
    expect(validateRules({ elimination_reset_turns: null }, initialRules)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// isGameValid
// ---------------------------------------------------------------------------

describe('isGameValid', () => {
  test('returns false with 0 participants', () => {
    expect(isGameValid(makeCtx())).toBe(false);
  });

  test('returns false with 1 playing participant', () => {
    let ctx = makeCtx();
    ctx = { ...ctx, ...addPlayer(ctx, 'Alice') };
    expect(isGameValid(ctx)).toBe(false);
  });

  test('returns true with 2 playing participants', () => {
    let ctx = makeCtx();
    ctx = { ...ctx, ...addPlayer(ctx, 'Alice') };
    ctx = { ...ctx, ...addPlayer(ctx, 'Bob') };
    expect(isGameValid(ctx)).toBe(true);
  });

  test('returns false when all but one are eliminated/paused', () => {
    let ctx = makeCtx();
    ctx = { ...ctx, ...addPlayer(ctx, 'Alice') };
    ctx = { ...ctx, ...addPlayer(ctx, 'Bob') };
    const ids = Object.keys(ctx.players);
    ctx.state[ids[0]] = { ...ctx.state[ids[0]], standing: 'eliminated' };
    expect(isGameValid(ctx)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// canWinThisTurn
// ---------------------------------------------------------------------------

describe('canWinThisTurn', () => {
  test('returns true when in range', () => {
    let ctx = makeCtx();
    ctx = { ...ctx, ...addPlayer(ctx, 'Alice') };
    const id = Object.keys(ctx.players)[0];
    ctx.state[id] = { ...ctx.state[id], score: 45 }; // needs 5, max single turn is 12
    expect(canWinThisTurn(ctx, id)).toBe(true);
  });

  test('returns false when too far from target', () => {
    let ctx = makeCtx();
    ctx = { ...ctx, ...addPlayer(ctx, 'Alice') };
    const id = Object.keys(ctx.players)[0];
    ctx.state[id] = { ...ctx.state[id], score: 30 }; // needs 20, max is 12
    expect(canWinThisTurn(ctx, id)).toBe(false);
  });

  test('returns false for eliminated player', () => {
    let ctx = makeCtx();
    ctx = { ...ctx, ...addPlayer(ctx, 'Alice') };
    const id = Object.keys(ctx.players)[0];
    ctx.state[id] = { ...ctx.state[id], score: 45, standing: 'eliminated' };
    expect(canWinThisTurn(ctx, id)).toBe(false);
  });

  test('accounts for pin value mode', () => {
    let ctx = makeCtx();
    ctx = { ...ctx, rules: { ...ctx.rules, use_pin_value: true } }; // max 78
    ctx = { ...ctx, ...addPlayer(ctx, 'Alice') };
    const id = Object.keys(ctx.players)[0];
    ctx.state[id] = { ...ctx.state[id], score: 30 }; // needs 20, max is 78
    expect(canWinThisTurn(ctx, id)).toBe(true);
  });
});
