import {
  addPlayer,
  addTeam,
  removeParticipant,
  removeMember,
  renameParticipant,
  startGame,
  advanceTurn,
  submitTurn,
  missTurn,
  skipTurn,
  editScore,
  cycleStanding,
  swapTeamMember,
  winContinue,
  loseReset,
  updateRules,
  countPins,
  getMaxScore,
  getRemainingScore,
  resetGame,
  editMisses,
  getWinnerId,
  getOutcome,
} from '../store/game_logic';
import { isGameValid } from '../store/validation';
import {
  GameContext,
  GameRules,
  initialContext,
  initialParticipantState,
  initialRules,
} from '../store/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeCtx(overrides: Partial<GameContext> = {}): GameContext {
  return { ...initialContext, rules: { ...initialRules }, ...overrides };
}

function ctxWithPlayers(names: string[]): GameContext {
  let ctx = makeCtx();
  for (const name of names) {
    ctx = { ...ctx, ...addPlayer(ctx, name) };
  }
  return ctx;
}

function ctxWithTwoPlayers(): GameContext {
  return ctxWithPlayers(['Alice', 'Bob']);
}

function getPlayerIds(ctx: GameContext): string[] {
  return Object.keys(ctx.players);
}

// ---------------------------------------------------------------------------
// countPins
// ---------------------------------------------------------------------------

describe('countPins', () => {
  const rules = { ...initialRules };

  test('returns 0 for empty set', () => {
    expect(countPins(rules, new Set())).toBe(0);
  });

  test('single pin returns pin number', () => {
    expect(countPins(rules, new Set([7]))).toBe(7);
    expect(countPins(rules, new Set([12]))).toBe(12);
  });

  test('multiple pins returns count', () => {
    expect(countPins(rules, new Set([1, 5, 9]))).toBe(3);
    expect(countPins(rules, new Set([1, 2, 3, 4, 5]))).toBe(5);
  });

  test('use_pin_value sums pin numbers', () => {
    const pvRules = { ...rules, use_pin_value: true };
    expect(countPins(pvRules, new Set([7]))).toBe(7);
    expect(countPins(pvRules, new Set([1, 5, 9]))).toBe(15);
    expect(countPins(pvRules, new Set([10, 11, 12]))).toBe(33);
  });
});

describe('getMaxScore', () => {
  test('returns 12 for normal mode', () => {
    expect(getMaxScore(initialRules)).toBe(12);
  });

  test('returns 78 for pin value mode', () => {
    expect(getMaxScore({ ...initialRules, use_pin_value: true })).toBe(78);
  });
});

describe('getRemainingScore', () => {
  test('calculates remaining', () => {
    expect(getRemainingScore(initialRules, 42)).toBe('8');
    expect(getRemainingScore(initialRules, 0)).toBe('50');
  });
});

// ---------------------------------------------------------------------------
// Participant management
// ---------------------------------------------------------------------------

describe('addPlayer', () => {
  test('adds a player', () => {
    const ctx = makeCtx();
    const updates = addPlayer(ctx, 'Alice');
    expect(Object.values(updates.players!)).toContain('Alice');
    expect(updates.turn_order!.length).toBe(1);
    expect(Object.keys(updates.state!).length).toBe(1);
  });

  test('rejects empty name', () => {
    const ctx = makeCtx();
    expect(addPlayer(ctx, '')).toEqual({});
    expect(addPlayer(ctx, '  ')).toEqual({});
  });

  test('rejects duplicate name', () => {
    let ctx = makeCtx();
    ctx = { ...ctx, ...addPlayer(ctx, 'Alice') };
    expect(addPlayer(ctx, 'Alice')).toEqual({});
    expect(addPlayer(ctx, 'alice')).toEqual({});
  });
});

describe('addTeam', () => {
  test('adds a team with members', () => {
    const ctx = makeCtx();
    const updates = addTeam(ctx, 'Team A', ['Alice', 'Bob']);
    const teamId = Object.keys(updates.teams!)[0];
    const team = updates.teams![teamId];
    expect(team.name).toBe('Team A');
    expect(Object.values(team.members)).toEqual(['Alice', 'Bob']);
    expect(updates.member_order![teamId].length).toBe(2);
    expect(updates.turn_order!.length).toBe(1);
  });

  test('rejects team with fewer than 2 members', () => {
    const ctx = makeCtx();
    expect(addTeam(ctx, 'Solo', ['Alice'])).toEqual({});
    expect(addTeam(ctx, 'Empty', [])).toEqual({});
  });

  test('rejects duplicate team name', () => {
    let ctx = makeCtx();
    ctx = { ...ctx, ...addTeam(ctx, 'Team A', ['A', 'B']) };
    expect(addTeam(ctx, 'Team A', ['C', 'D'])).toEqual({});
  });
});

describe('removeParticipant', () => {
  test('removes a player', () => {
    let ctx = ctxWithTwoPlayers();
    const id = getPlayerIds(ctx)[0];
    const updates = removeParticipant(ctx, id);
    expect(updates.players![id]).toBeUndefined();
    expect(updates.state![id]).toBeUndefined();
    expect(updates.turn_order!).not.toContain(id);
  });

  test('removes a team', () => {
    let ctx = makeCtx();
    ctx = { ...ctx, ...addTeam(ctx, 'Team', ['A', 'B']) };
    const teamId = Object.keys(ctx.teams)[0];
    const updates = removeParticipant(ctx, teamId);
    expect(updates.teams![teamId]).toBeUndefined();
    expect(updates.member_order![teamId]).toBeUndefined();
  });
});

describe('removeMember', () => {
  test('removes a member from a team', () => {
    let ctx = makeCtx();
    ctx = { ...ctx, ...addTeam(ctx, 'Team', ['A', 'B', 'C']) };
    const teamId = Object.keys(ctx.teams)[0];
    const memberId = Object.keys(ctx.teams[teamId].members)[0];
    const updates = removeMember(ctx, teamId, memberId);
    expect(updates.teams![teamId].members[memberId]).toBeUndefined();
    expect(updates.member_order![teamId]).not.toContain(memberId);
  });

  test('removes team when last member removed', () => {
    let ctx = makeCtx();
    ctx = { ...ctx, ...addTeam(ctx, 'Team', ['A', 'B']) };
    const teamId = Object.keys(ctx.teams)[0];
    const memberIds = Object.keys(ctx.teams[teamId].members);

    // Remove first member
    let updates = removeMember(ctx, teamId, memberIds[0]);
    ctx = { ...ctx, ...updates };

    // Remove second member — should remove team
    updates = removeMember(ctx, teamId, memberIds[1]);
    expect(updates.teams![teamId]).toBeUndefined();
  });
});

describe('renameParticipant', () => {
  test('renames a player', () => {
    let ctx = ctxWithTwoPlayers();
    const id = getPlayerIds(ctx)[0];
    const updates = renameParticipant(ctx, id, 'NewName');
    expect(updates.players![id]).toBe('NewName');
  });

  test('rejects rename to taken name', () => {
    let ctx = ctxWithTwoPlayers();
    const ids = getPlayerIds(ctx);
    expect(renameParticipant(ctx, ids[0], 'Bob')).toEqual({});
  });

  test('allows renaming to same name (different case)', () => {
    let ctx = ctxWithTwoPlayers();
    const id = getPlayerIds(ctx)[0];
    // Renaming "Alice" to "ALICE" should succeed since excludeId matches
    const updates = renameParticipant(ctx, id, 'ALICE');
    expect(updates.players![id]).toBe('ALICE');
  });

  test('renames a team', () => {
    let ctx = makeCtx();
    ctx = { ...ctx, ...addTeam(ctx, 'OldTeam', ['A', 'B']) };
    const teamId = Object.keys(ctx.teams)[0];
    const updates = renameParticipant(ctx, teamId, 'NewTeam');
    expect(updates.teams![teamId].name).toBe('NewTeam');
  });

  test('renames a team member', () => {
    let ctx = makeCtx();
    ctx = { ...ctx, ...addTeam(ctx, 'Team', ['A', 'B']) };
    const teamId = Object.keys(ctx.teams)[0];
    const memberId = Object.keys(ctx.teams[teamId].members)[0];
    const updates = renameParticipant(ctx, memberId, 'NewA', teamId);
    expect(updates.teams![teamId].members[memberId]).toBe('NewA');
  });
});

// ---------------------------------------------------------------------------
// Game flow
// ---------------------------------------------------------------------------

describe('startGame', () => {
  test('sets has_started', () => {
    const ctx = ctxWithTwoPlayers();
    const updates = startGame(ctx, false);
    expect(updates.has_started).toBe(true);
  });

  test('preserves order when not shuffling', () => {
    const ctx = ctxWithTwoPlayers();
    const updates = startGame(ctx, false);
    expect(updates.turn_order).toEqual(ctx.turn_order);
  });

  test('shuffling returns same elements', () => {
    const ctx = ctxWithPlayers(['A', 'B', 'C', 'D', 'E']);
    const updates = startGame(ctx, true);
    expect(updates.turn_order!.sort()).toEqual(ctx.turn_order.sort());
  });
});

// ---------------------------------------------------------------------------
// Turn actions
// ---------------------------------------------------------------------------

describe('submitTurn', () => {
  test('adds score to current player', () => {
    const ctx = ctxWithTwoPlayers();
    const result = submitTurn(ctx, new Set([7]));
    const firstId = ctx.turn_order[0];
    expect(result.updates.state![firstId].score).toBe(7);
    expect(result.event).toBeNull();
  });

  test('resets misses on successful hit', () => {
    let ctx = ctxWithTwoPlayers();
    const firstId = ctx.turn_order[0];
    ctx.state[firstId] = { ...ctx.state[firstId], misses: 2 };
    const result = submitTurn(ctx, new Set([5]));
    expect(result.updates.state![firstId].misses).toBe(0);
  });

  test('advances turn order', () => {
    const ctx = ctxWithTwoPlayers();
    const firstId = ctx.turn_order[0];
    const secondId = ctx.turn_order[1];
    const result = submitTurn(ctx, new Set([5]));
    expect(result.updates.turn_order![0]).toBe(secondId);
  });

  test('triggers win when hitting target exactly', () => {
    let ctx = ctxWithTwoPlayers();
    const firstId = ctx.turn_order[0];
    ctx = { ...ctx, state: { ...ctx.state, [firstId]: { ...ctx.state[firstId], score: 43 } } };
    const result = submitTurn(ctx, new Set([7]));
    expect(result.event).toBe('win');
    expect(result.updates.state![firstId].score).toBe(50);
  });

  test('resets to reset_score when over target', () => {
    let ctx = ctxWithTwoPlayers();
    const firstId = ctx.turn_order[0];
    ctx = { ...ctx, state: { ...ctx.state, [firstId]: { ...ctx.state[firstId], score: 45 } } };
    const result = submitTurn(ctx, new Set([1, 2, 3, 4, 5, 6])); // 6 pins = 6 points → 51
    expect(result.event).toBeNull();
    expect(result.updates.state![firstId].score).toBe(25);
  });
});

describe('missTurn', () => {
  test('increments miss count', () => {
    const ctx = ctxWithTwoPlayers();
    const firstId = ctx.turn_order[0];
    const result = missTurn(ctx);
    expect(result.updates.state![firstId].misses).toBe(1);
    expect(result.updates.state![firstId].standing).toBe('playing');
  });

  test('eliminates after reaching elimination count', () => {
    let ctx = ctxWithPlayers(['Alice', 'Bob', 'Charlie']);
    const firstId = ctx.turn_order[0];
    ctx.state[firstId] = { ...ctx.state[firstId], misses: 2 };
    const result = missTurn(ctx);
    expect(result.updates.state![firstId].standing).toBe('eliminated');
    expect(result.event).toBeNull(); // game still valid, 2 others playing
  });

  test('triggers gameOver when too few players remain', () => {
    let ctx = ctxWithTwoPlayers();
    const firstId = ctx.turn_order[0];
    ctx.state[firstId] = { ...ctx.state[firstId], misses: 2 };
    const result = missTurn(ctx);
    expect(result.updates.state![firstId].standing).toBe('eliminated');
    expect(result.event).toBe('gameOver');
  });
});

describe('skipTurn', () => {
  test('advances without miss when skip_is_miss is false', () => {
    const ctx = ctxWithTwoPlayers();
    const firstId = ctx.turn_order[0];
    const result = skipTurn(ctx);
    expect(result.updates.state![firstId]?.misses ?? 0).toBe(0);
    expect(result.event).toBeNull();
  });

  test('counts as miss when skip_is_miss is true', () => {
    let ctx = ctxWithTwoPlayers();
    ctx = { ...ctx, rules: { ...ctx.rules, skip_is_miss: true } };
    const firstId = ctx.turn_order[0];
    const result = skipTurn(ctx);
    expect(result.updates.state![firstId].misses).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Turn cycling with elimination re-entry
// ---------------------------------------------------------------------------

describe('advanceTurn', () => {
  test('rotates to next playing participant', () => {
    const ctx = ctxWithPlayers(['A', 'B', 'C']);
    const updates = advanceTurn(ctx);
    expect(updates.turn_order![0]).toBe(ctx.turn_order[1]);
  });

  test('skips eliminated participants', () => {
    let ctx = ctxWithPlayers(['A', 'B', 'C']);
    const [id0, id1, id2] = ctx.turn_order;
    ctx.state[id1] = { ...ctx.state[id1], standing: 'eliminated' };
    const updates = advanceTurn(ctx);
    expect(updates.turn_order![0]).toBe(id2);
  });

  test('increments eliminated_turns for skipped eliminated players', () => {
    let ctx = ctxWithPlayers(['A', 'B', 'C']);
    const [id0, id1, id2] = ctx.turn_order;
    ctx.state[id1] = { ...ctx.state[id1], standing: 'eliminated', eliminated_turns: 0 };
    const updates = advanceTurn(ctx);
    expect(updates.state![id1].eliminated_turns).toBe(1);
  });

  test('restores eliminated player after elimination_reset_turns', () => {
    let ctx = ctxWithPlayers(['A', 'B', 'C']);
    ctx = { ...ctx, rules: { ...ctx.rules, elimination_reset_turns: 2 } };
    const [id0, id1, id2] = ctx.turn_order;
    ctx.state[id1] = { ...ctx.state[id1], standing: 'eliminated', eliminated_turns: 1, score: 30 };
    const updates = advanceTurn(ctx);
    expect(updates.state![id1].standing).toBe('playing');
    expect(updates.state![id1].score).toBe(0); // elimination_reset_score = 0
    expect(updates.state![id1].misses).toBe(0);
  });

  test('rotates team member order', () => {
    let ctx = makeCtx();
    ctx = { ...ctx, ...addPlayer(ctx, 'Solo') };
    ctx = { ...ctx, ...addTeam(ctx, 'Team', ['M1', 'M2', 'M3']) };
    const teamId = Object.keys(ctx.teams)[0];
    const originalOrder = [...ctx.member_order[teamId]];

    // Make team first in turn order
    ctx = { ...ctx, turn_order: [teamId, ...ctx.turn_order.filter(id => id !== teamId)] };
    const updates = advanceTurn(ctx);
    expect(updates.member_order![teamId][0]).toBe(originalOrder[1]);
  });
});

// ---------------------------------------------------------------------------
// Mid-game edits
// ---------------------------------------------------------------------------

describe('editScore', () => {
  test('sets a valid score', () => {
    const ctx = ctxWithTwoPlayers();
    const id = getPlayerIds(ctx)[0];
    const result = editScore(ctx, id, 30);
    expect(result.updates.state![id].score).toBe(30);
    expect(result.event).toBeNull();
  });

  test('triggers win at target', () => {
    const ctx = ctxWithTwoPlayers();
    const id = getPlayerIds(ctx)[0];
    const result = editScore(ctx, id, 50);
    expect(result.event).toBe('win');
  });

  test('resets to reset_score when over target', () => {
    const ctx = ctxWithTwoPlayers();
    const id = getPlayerIds(ctx)[0];
    const result = editScore(ctx, id, 55);
    expect(result.updates.state![id].score).toBe(25);
  });

  test('clamps negative score to 0', () => {
    const ctx = ctxWithTwoPlayers();
    const id = getPlayerIds(ctx)[0];
    const result = editScore(ctx, id, -5);
    expect(result.updates.state![id].score).toBe(0);
  });
});

describe('cycleStanding', () => {
  test('cycles playing → paused → eliminated → playing', () => {
    let ctx = ctxWithPlayers(['A', 'B', 'C']);
    const id = getPlayerIds(ctx)[0];

    let result = cycleStanding(ctx, id);
    expect(result.updates.state![id].standing).toBe('paused');

    ctx = { ...ctx, state: result.updates.state! };
    result = cycleStanding(ctx, id);
    expect(result.updates.state![id].standing).toBe('eliminated');

    ctx = { ...ctx, state: result.updates.state! };
    result = cycleStanding(ctx, id);
    expect(result.updates.state![id].standing).toBe('playing');
  });

  test('triggers gameOver when not enough players remain', () => {
    let ctx = ctxWithTwoPlayers();
    const id = getPlayerIds(ctx)[0];
    const result = cycleStanding(ctx, id);
    // playing → paused, leaving only 1 playing
    expect(result.event).toBe('gameOver');
  });

  test('rotates turn_order when current player is paused', () => {
    let ctx = ctxWithPlayers(['A', 'B', 'C']);
    const [a, b] = ctx.turn_order;
    // A is current; cycle A to paused → next playing (B) should become current.
    const result = cycleStanding(ctx, a);
    expect(result.updates.state![a].standing).toBe('paused');
    expect(result.updates.turn_order![0]).toBe(b);
    expect(result.updates.turn_order).toContain(a);
  });

  test('does not rotate when a non-current player changes standing', () => {
    let ctx = ctxWithPlayers(['A', 'B', 'C']);
    const [, b] = ctx.turn_order;
    const result = cycleStanding(ctx, b);
    expect(result.updates.turn_order).toEqual(ctx.turn_order);
  });
});

describe('swapTeamMember', () => {
  test('moves target member to front', () => {
    let ctx = makeCtx();
    ctx = { ...ctx, ...addTeam(ctx, 'Team', ['A', 'B', 'C']) };
    const teamId = Object.keys(ctx.teams)[0];
    const memberIds = ctx.member_order[teamId];

    const updates = swapTeamMember(ctx, teamId, memberIds[2]);
    expect(updates.member_order![teamId][0]).toBe(memberIds[2]);
    expect(updates.member_order![teamId].length).toBe(3);
  });

  test('returns empty if member already first', () => {
    let ctx = makeCtx();
    ctx = { ...ctx, ...addTeam(ctx, 'Team', ['A', 'B']) };
    const teamId = Object.keys(ctx.teams)[0];
    const memberIds = ctx.member_order[teamId];
    expect(swapTeamMember(ctx, teamId, memberIds[0])).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// Game end
// ---------------------------------------------------------------------------

describe('winContinue', () => {
  test('resets winners to elimination_reset_score', () => {
    let ctx = ctxWithTwoPlayers();
    const ids = getPlayerIds(ctx);
    ctx.state[ids[0]] = { ...ctx.state[ids[0]], score: 50 };
    ctx.state[ids[1]] = { ...ctx.state[ids[1]], score: 30 };
    ctx = { ...ctx, rules: { ...ctx.rules, elimination_reset_score: 10 } };

    const updates = winContinue(ctx);
    expect(updates.state![ids[0]].score).toBe(10); // winner reset to elimination_reset_score
    expect(updates.state![ids[1]].score).toBe(30); // non-winner unchanged
  });

  test('uses elimination_reset_score NOT reset_score', () => {
    let ctx = ctxWithTwoPlayers();
    const ids = getPlayerIds(ctx);
    ctx.state[ids[0]] = { ...ctx.state[ids[0]], score: 50 };
    ctx = { ...ctx, rules: { ...ctx.rules, reset_score: 25, elimination_reset_score: 5 } };

    const updates = winContinue(ctx);
    expect(updates.state![ids[0]].score).toBe(5);
  });
});

describe('loseReset', () => {
  test('resets all scores and misses', () => {
    let ctx = ctxWithTwoPlayers();
    const ids = getPlayerIds(ctx);
    ctx.state[ids[0]] = { ...ctx.state[ids[0]], score: 30, misses: 2, standing: 'eliminated' };
    ctx.state[ids[1]] = { ...ctx.state[ids[1]], score: 40, misses: 1 };

    const updates = loseReset(ctx);
    expect(updates.state![ids[0]].score).toBe(0);
    expect(updates.state![ids[0]].misses).toBe(0);
    expect(updates.state![ids[0]].standing).toBe('playing');
    expect(updates.state![ids[1]].score).toBe(0);
  });

  test('brings paused participants back so the reset board is playable', () => {
    let ctx = ctxWithPlayers(['A', 'B', 'C']);
    const ids = getPlayerIds(ctx);
    ctx.state[ids[1]] = { ...ctx.state[ids[1]], standing: 'paused' };
    ctx.state[ids[2]] = { ...ctx.state[ids[2]], standing: 'paused' };
    expect(isGameValid(ctx)).toBe(false);

    const updates = loseReset(ctx);
    expect(updates.state![ids[1]].standing).toBe('playing');
    expect(updates.state![ids[2]].standing).toBe('playing');
    expect(isGameValid({ ...ctx, ...updates })).toBe(true);
  });

  test('leaves a playing participant at the front of the turn order', () => {
    let ctx = ctxWithPlayers(['A', 'B', 'C']);
    const ids = getPlayerIds(ctx);
    ctx.state[ids[0]] = { ...ctx.state[ids[0]], standing: 'eliminated', misses: 3 };

    const updates = loseReset(ctx);
    expect(updates.state![updates.turn_order![0]].standing).toBe('playing');
  });
});

describe('resetGame', () => {
  test('returns initial context', () => {
    const result = resetGame();
    expect(result.players).toEqual({});
    expect(result.turn_order).toEqual([]);
    expect(result.has_started).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Settings / rules update
// ---------------------------------------------------------------------------

describe('updateRules', () => {
  test('updates target score', () => {
    const ctx = ctxWithTwoPlayers();
    const updates = updateRules(ctx, { target_score: 100 });
    expect(updates.rules!.target_score).toBe(100);
  });

  test('rejects invalid reset >= target', () => {
    const ctx = ctxWithTwoPlayers();
    expect(updateRules(ctx, { reset_score: 50 })).toEqual({});
    expect(updateRules(ctx, { reset_score: 60 })).toEqual({});
  });

  test('resets score when over new target', () => {
    let ctx = ctxWithTwoPlayers();
    const id = getPlayerIds(ctx)[0];
    ctx.state[id] = { ...ctx.state[id], score: 40 };

    const updates = updateRules(ctx, { target_score: 30, reset_score: 10 });
    expect(updates.state![id].score).toBe(10);
  });

  test('eliminates player when misses exceed new count', () => {
    let ctx = ctxWithPlayers(['A', 'B', 'C']);
    const id = getPlayerIds(ctx)[0];
    ctx.state[id] = { ...ctx.state[id], misses: 2 };

    const updates = updateRules(ctx, { elimination_count: 2 });
    expect(updates.state![id].standing).toBe('eliminated');
  });

  test('preserves miss count when changing elimination count', () => {
    let ctx = ctxWithPlayers(['A', 'B', 'C']);
    const id = getPlayerIds(ctx)[0];
    ctx.state[id] = { ...ctx.state[id], misses: 2 };

    const updates = updateRules(ctx, { elimination_count: 5 });
    expect(updates.state![id].misses).toBe(2);
    expect(updates.state![id].standing).toBe('playing');
  });

  test('restores eliminated player when miss count raised', () => {
    let ctx = ctxWithPlayers(['A', 'B', 'C']);
    const id = getPlayerIds(ctx)[0];
    ctx.state[id] = { ...ctx.state[id], misses: 3, standing: 'eliminated' };

    const updates = updateRules(ctx, { elimination_count: 5 });
    expect(updates.state![id].standing).toBe('playing');
  });
});

// ---------------------------------------------------------------------------
// Regression tests for the reviewed game-logic bugs
// ---------------------------------------------------------------------------

describe('turn order stays on a playing participant', () => {
  test('updateRules rotates past a thrower the new rules just eliminated', () => {
    let ctx = ctxWithPlayers(['A', 'B', 'C', 'D']);
    const ids = getPlayerIds(ctx);
    ctx.state[ids[0]] = { ...ctx.state[ids[0]], misses: 2 };

    const updates = updateRules(ctx, { elimination_count: 2 });
    const after = { ...ctx, ...updates } as GameContext;

    expect(after.state[ids[0]].standing).toBe('eliminated');
    expect(after.turn_order[0]).not.toBe(ids[0]);
    expect(after.state[after.turn_order[0]].standing).toBe('playing');
  });

  test('advanceTurn refuses to hand the turn to a non-playing participant', () => {
    let ctx = ctxWithPlayers(['A', 'B', 'C']);
    const ids = getPlayerIds(ctx);
    ctx.state[ids[1]] = { ...ctx.state[ids[1]], standing: 'paused' };
    ctx.state[ids[2]] = { ...ctx.state[ids[2]], standing: 'paused' };

    expect(advanceTurn(ctx)).toEqual({});
  });
});

describe('updateRules validation', () => {
  test('rejects a rule set validateRules rejects', () => {
    const ctx = ctxWithTwoPlayers();
    expect(updateRules(ctx, { elimination_count: 0 })).toEqual({});
    expect(updateRules(ctx, { target_score: 0 })).toEqual({});
    expect(updateRules(ctx, { elimination_reset_turns: 0 })).toEqual({});
  });

  test('still accepts a valid rule set', () => {
    const ctx = ctxWithTwoPlayers();
    expect(updateRules(ctx, { elimination_count: 4 }).rules!.elimination_count).toBe(4);
  });
});

describe('eliminated re-entry semantics', () => {
  test('a retroactive correction keeps the score they had', () => {
    let ctx = ctxWithPlayers(['A', 'B', 'C']);
    const ids = getPlayerIds(ctx);
    ctx.state[ids[0]] = { score: 40, misses: 3, standing: 'eliminated', eliminated_turns: 0 };

    // Raising the count means they were never validly eliminated.
    const updates = updateRules(ctx, { elimination_count: 5 });
    expect(updates.state![ids[0]].standing).toBe('playing');
    expect(updates.state![ids[0]].score).toBe(40);
    expect(updates.state![ids[0]].misses).toBe(3);
  });

  test('a served-out re-entry comes back on the re-entry score', () => {
    let ctx = ctxWithPlayers(['A', 'B', 'C']);
    const ids = getPlayerIds(ctx);
    ctx.rules = { ...ctx.rules, elimination_reset_score: 10 };
    ctx.state[ids[0]] = { score: 40, misses: 3, standing: 'eliminated', eliminated_turns: 4 };

    const updates = updateRules(ctx, { elimination_reset_turns: 3 });
    expect(updates.state![ids[0]].standing).toBe('playing');
    expect(updates.state![ids[0]].score).toBe(10);
    expect(updates.state![ids[0]].misses).toBe(0);
  });

  test('cycling into eliminated restarts the re-entry count', () => {
    let ctx = ctxWithPlayers(['A', 'B', 'C']);
    const ids = getPlayerIds(ctx);
    ctx.state[ids[0]] = { score: 10, misses: 0, standing: 'paused', eliminated_turns: 7 };

    const result = cycleStanding(ctx, ids[0]);
    expect(result.updates.state![ids[0]].standing).toBe('eliminated');
    expect(result.updates.state![ids[0]].eliminated_turns).toBe(0);
  });
});

describe('winning on the target score', () => {
  test('lowering the target onto an existing score wins rather than busts', () => {
    let ctx = ctxWithPlayers(['A', 'B', 'C']);
    const ids = getPlayerIds(ctx);
    ctx.state[ids[0]] = { ...ctx.state[ids[0]], score: 30 };

    const updates = updateRules(ctx, { target_score: 30 });
    const after = { ...ctx, ...updates } as GameContext;
    expect(after.state[ids[0]].score).toBe(30);
    expect(getWinnerId(after)).toBe(ids[0]);
  });

  test('a score parked on the target only wins once the player is playing', () => {
    let ctx = ctxWithPlayers(['A', 'B', 'C']);
    const ids = getPlayerIds(ctx);
    ctx.state[ids[0]] = { ...ctx.state[ids[0]], standing: 'eliminated', misses: 3 };

    const parked = editScore(ctx, ids[0], 50);
    expect(parked.event).toBeNull();

    const restored = cycleStanding({ ...ctx, ...parked.updates } as GameContext, ids[0]);
    expect(restored.event).toBe('win');
  });

  test('getOutcome ranks a win above an unplayable board', () => {
    let ctx = ctxWithPlayers(['A', 'B', 'C']);
    const ids = getPlayerIds(ctx);
    ctx.state[ids[0]] = { ...ctx.state[ids[0]], score: 50 };
    ctx.state[ids[1]] = { ...ctx.state[ids[1]], standing: 'paused' };
    ctx.state[ids[2]] = { ...ctx.state[ids[2]], standing: 'paused' };

    expect(isGameValid(ctx)).toBe(false);
    expect(getOutcome(ctx)).toBe('win');
  });
});

describe('non-numeric edits are rejected', () => {
  test('editScore ignores NaN', () => {
    const ctx = ctxWithTwoPlayers();
    expect(editScore(ctx, getPlayerIds(ctx)[0], NaN).updates).toEqual({});
  });

  test('editMisses ignores NaN', () => {
    const ctx = ctxWithTwoPlayers();
    expect(editMisses(ctx, getPlayerIds(ctx)[0], NaN).updates).toEqual({});
  });
});
