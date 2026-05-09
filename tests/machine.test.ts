import { createActor } from 'xstate';
import { gameMachine } from '../store/machine';
import { initialContext, initialRules } from '../store/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createTestActor(contextOverrides: any = {}) {
  const actor = createActor(gameMachine, {
    snapshot: gameMachine.resolveState({
      value: 'idle',
      context: { ...initialContext, rules: { ...initialRules }, ...contextOverrides },
    }),
  });
  actor.start();
  return actor;
}

function createSetupActor() {
  const actor = createActor(gameMachine);
  actor.start();
  actor.send({ type: 'NEW_GAME' });
  return actor;
}

function createPlayingActor() {
  const actor = createSetupActor();
  actor.send({ type: 'ADD_PLAYER', name: 'Alice' });
  actor.send({ type: 'ADD_PLAYER', name: 'Bob' });
  actor.send({ type: 'START_GAME', shuffle: false });
  return actor;
}

// ---------------------------------------------------------------------------
// State transitions
// ---------------------------------------------------------------------------

describe('machine state transitions', () => {
  test('starts in idle state', () => {
    const actor = createActor(gameMachine);
    actor.start();
    expect(actor.getSnapshot().value).toBe('idle');
  });

  test('NEW_GAME transitions to setup', () => {
    const actor = createActor(gameMachine);
    actor.start();
    actor.send({ type: 'NEW_GAME' });
    expect(actor.getSnapshot().value).toBe('setup');
  });

  test('CONTINUE_GAME transitions to playing when saved game exists', () => {
    const actor = createPlayingActor();
    // Now send FINISH to go back to idle, then simulate having a saved game
    // Actually, let's create one with context that has a saved game
    const playingActor = createPlayingActor();
    const ctx = playingActor.getSnapshot().context;

    // Create fresh actor in idle with the saved context
    const idleActor = createTestActor(ctx);
    idleActor.send({ type: 'CONTINUE_GAME' });
    expect(idleActor.getSnapshot().matches('playing')).toBe(true);
  });

  test('CONTINUE_GAME blocked without saved game', () => {
    const actor = createActor(gameMachine);
    actor.start();
    actor.send({ type: 'CONTINUE_GAME' });
    expect(actor.getSnapshot().value).toBe('idle'); // guard fails
  });
});

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

describe('setup state', () => {
  test('ADD_PLAYER adds a player to context', () => {
    const actor = createSetupActor();
    actor.send({ type: 'ADD_PLAYER', name: 'Alice' });
    const ctx = actor.getSnapshot().context;
    expect(Object.values(ctx.players)).toContain('Alice');
    expect(ctx.turn_order.length).toBe(1);
  });

  test('ADD_TEAM adds a team to context', () => {
    const actor = createSetupActor();
    actor.send({ type: 'ADD_TEAM', name: 'Legends', members: ['A', 'B'] });
    const ctx = actor.getSnapshot().context;
    const teamId = Object.keys(ctx.teams)[0];
    expect(ctx.teams[teamId].name).toBe('Legends');
    expect(Object.values(ctx.teams[teamId].members)).toEqual(['A', 'B']);
  });

  test('REMOVE_PARTICIPANT removes player', () => {
    const actor = createSetupActor();
    actor.send({ type: 'ADD_PLAYER', name: 'Alice' });
    const id = Object.keys(actor.getSnapshot().context.players)[0];
    actor.send({ type: 'REMOVE_PARTICIPANT', id });
    expect(actor.getSnapshot().context.turn_order.length).toBe(0);
  });

  test('RENAME renames a player', () => {
    const actor = createSetupActor();
    actor.send({ type: 'ADD_PLAYER', name: 'Alice' });
    const id = Object.keys(actor.getSnapshot().context.players)[0];
    actor.send({ type: 'RENAME', id, newName: 'Alicia' });
    expect(actor.getSnapshot().context.players[id]).toBe('Alicia');
  });

  test('START_GAME blocked with < 2 players', () => {
    const actor = createSetupActor();
    actor.send({ type: 'ADD_PLAYER', name: 'Alice' });
    actor.send({ type: 'START_GAME', shuffle: false });
    expect(actor.getSnapshot().value).toBe('setup'); // guard fails
  });

  test('START_GAME transitions to playing with 2+ players', () => {
    const actor = createSetupActor();
    actor.send({ type: 'ADD_PLAYER', name: 'Alice' });
    actor.send({ type: 'ADD_PLAYER', name: 'Bob' });
    actor.send({ type: 'START_GAME', shuffle: false });
    expect(actor.getSnapshot().matches('playing')).toBe(true);
    expect(actor.getSnapshot().context.has_started).toBe(true);
  });

  test('OPEN_SETTINGS from setup goes to settings with return_to = setup', () => {
    const actor = createSetupActor();
    actor.send({ type: 'OPEN_SETTINGS' });
    expect(actor.getSnapshot().value).toBe('settings');
    expect(actor.getSnapshot().context.return_to).toBe('setup');
  });
});

// ---------------------------------------------------------------------------
// Playing
// ---------------------------------------------------------------------------

describe('playing state', () => {
  test('starts in awaitingTurn', () => {
    const actor = createPlayingActor();
    expect(actor.getSnapshot().matches({ playing: 'awaitingTurn' })).toBe(true);
  });

  test('SUBMIT_TURN updates score and advances turn', () => {
    const actor = createPlayingActor();
    const ctx = actor.getSnapshot().context;
    const firstId = ctx.turn_order[0];
    const secondId = ctx.turn_order[1];

    actor.send({ type: 'SUBMIT_TURN', pins: new Set([7]) });
    const newCtx = actor.getSnapshot().context;
    expect(newCtx.state[firstId].score).toBe(7);
    expect(newCtx.turn_order[0]).toBe(secondId);
    expect(actor.getSnapshot().matches({ playing: 'awaitingTurn' })).toBe(true);
  });

  test('SUBMIT_TURN transitions to won at target score', () => {
    const actor = createPlayingActor();

    // Build up Alice to exactly 50: 12+12+12+12+2 = 50
    actor.send({ type: 'SUBMIT_TURN', pins: new Set([12]) }); // Alice: 12
    actor.send({ type: 'SUBMIT_TURN', pins: new Set([1]) });  // Bob: 1
    actor.send({ type: 'SUBMIT_TURN', pins: new Set([12]) }); // Alice: 24
    actor.send({ type: 'SUBMIT_TURN', pins: new Set([1]) });  // Bob: 2
    actor.send({ type: 'SUBMIT_TURN', pins: new Set([12]) }); // Alice: 36
    actor.send({ type: 'SUBMIT_TURN', pins: new Set([1]) });  // Bob: 3
    actor.send({ type: 'SUBMIT_TURN', pins: new Set([12]) }); // Alice: 48
    actor.send({ type: 'SUBMIT_TURN', pins: new Set([1]) });  // Bob: 4

    // Alice needs 2 more. Single pin 2 = 2 points.
    actor.send({ type: 'SUBMIT_TURN', pins: new Set([2]) }); // Alice: 50!
    expect(actor.getSnapshot().matches({ playing: 'won' })).toBe(true);
  });

  test('MISS_TURN increments misses', () => {
    const actor = createPlayingActor();
    const firstId = actor.getSnapshot().context.turn_order[0];
    actor.send({ type: 'MISS_TURN' });
    expect(actor.getSnapshot().context.state[firstId].misses).toBe(1);
  });

  test('MISS_TURN transitions to gameOver when game becomes invalid', () => {
    const actor = createPlayingActor();
    // Alice misses 3 times (with Bob's turns between) to get eliminated
    // With only 2 players, this should trigger gameOver
    actor.send({ type: 'MISS_TURN' });  // Alice miss 1, turn to Bob
    actor.send({ type: 'SKIP_TURN' });  // Bob skip, turn to Alice
    actor.send({ type: 'MISS_TURN' });  // Alice miss 2, turn to Bob
    actor.send({ type: 'SKIP_TURN' });  // Bob skip, turn to Alice
    actor.send({ type: 'MISS_TURN' });  // Alice miss 3 → eliminated → gameOver
    expect(actor.getSnapshot().matches({ playing: 'gameOver' })).toBe(true);
  });

  test('SKIP_TURN advances without incrementing misses', () => {
    const actor = createPlayingActor();
    const firstId = actor.getSnapshot().context.turn_order[0];
    actor.send({ type: 'SKIP_TURN' });
    expect(actor.getSnapshot().context.state[firstId].misses).toBe(0);
  });

  test('OPEN_SETTINGS from playing sets return_to = playing', () => {
    const actor = createPlayingActor();
    actor.send({ type: 'OPEN_SETTINGS' });
    expect(actor.getSnapshot().value).toBe('settings');
    expect(actor.getSnapshot().context.return_to).toBe('playing');
  });

  test('FINISH_GAME transitions to finishing', () => {
    const actor = createPlayingActor();
    actor.send({ type: 'FINISH_GAME' });
    expect(actor.getSnapshot().matches({ playing: 'finishing' })).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Won / GameOver / Finishing
// ---------------------------------------------------------------------------

describe('won state', () => {
  function createWonActor() {
    const actor = createPlayingActor();
    // Build up to a win
    actor.send({ type: 'SUBMIT_TURN', pins: new Set([12]) }); // Alice: 12
    actor.send({ type: 'SUBMIT_TURN', pins: new Set([1]) });  // Bob: 1
    actor.send({ type: 'SUBMIT_TURN', pins: new Set([12]) }); // Alice: 24
    actor.send({ type: 'SUBMIT_TURN', pins: new Set([1]) });  // Bob: 2
    actor.send({ type: 'SUBMIT_TURN', pins: new Set([12]) }); // Alice: 36
    actor.send({ type: 'SUBMIT_TURN', pins: new Set([1]) });  // Bob: 3
    actor.send({ type: 'SUBMIT_TURN', pins: new Set([12]) }); // Alice: 48
    actor.send({ type: 'SUBMIT_TURN', pins: new Set([1]) });  // Bob: 4
    actor.send({ type: 'SUBMIT_TURN', pins: new Set([2]) }); // Alice: 50!
    return actor;
  }

  test('CONTINUE resets winner and returns to awaitingTurn', () => {
    const actor = createWonActor();
    expect(actor.getSnapshot().matches({ playing: 'won' })).toBe(true);
    actor.send({ type: 'CONTINUE' });
    expect(actor.getSnapshot().matches({ playing: 'awaitingTurn' })).toBe(true);

    // Winner should be reset to elimination_reset_score (0)
    const ctx = actor.getSnapshot().context;
    const alice = Object.entries(ctx.players).find(([_, n]) => n === 'Alice');
    if (alice) {
      expect(ctx.state[alice[0]].score).toBe(0);
    }
  });

  test('FINISH resets to idle', () => {
    const actor = createWonActor();
    actor.send({ type: 'FINISH' });
    expect(actor.getSnapshot().value).toBe('idle');
    expect(actor.getSnapshot().context.has_started).toBe(false);
  });
});

describe('finishing state', () => {
  test('CONFIRM resets to idle', () => {
    const actor = createPlayingActor();
    actor.send({ type: 'FINISH_GAME' });
    expect(actor.getSnapshot().matches({ playing: 'finishing' })).toBe(true);
    actor.send({ type: 'CONFIRM' });
    expect(actor.getSnapshot().value).toBe('idle');
  });

  test('CANCEL returns to awaitingTurn', () => {
    const actor = createPlayingActor();
    actor.send({ type: 'FINISH_GAME' });
    actor.send({ type: 'CANCEL' });
    expect(actor.getSnapshot().matches({ playing: 'awaitingTurn' })).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

describe('settings state', () => {
  test('GO_BACK returns to setup', () => {
    const actor = createSetupActor();
    actor.send({ type: 'OPEN_SETTINGS' });
    actor.send({ type: 'GO_BACK' });
    expect(actor.getSnapshot().value).toBe('setup');
  });

  test('GO_BACK returns to playing', () => {
    const actor = createPlayingActor();
    actor.send({ type: 'OPEN_SETTINGS' });
    actor.send({ type: 'GO_BACK' });
    expect(actor.getSnapshot().matches({ playing: 'awaitingTurn' })).toBe(true);
  });

  test('UPDATE_RULES modifies rules', () => {
    const actor = createSetupActor();
    actor.send({ type: 'OPEN_SETTINGS' });
    actor.send({ type: 'UPDATE_RULES', rules: { target_score: 100 } });
    expect(actor.getSnapshot().context.rules.target_score).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// Mid-game edits
// ---------------------------------------------------------------------------

describe('mid-game edits', () => {
  test('EDIT_SCORE changes participant score', () => {
    const actor = createPlayingActor();
    const id = actor.getSnapshot().context.turn_order[0];
    actor.send({ type: 'EDIT_SCORE', id, score: 30 });
    expect(actor.getSnapshot().context.state[id].score).toBe(30);
  });

  test('EDIT_SCORE transitions to won at target', () => {
    const actor = createPlayingActor();
    const id = actor.getSnapshot().context.turn_order[0];
    actor.send({ type: 'EDIT_SCORE', id, score: 50 });
    expect(actor.getSnapshot().matches({ playing: 'won' })).toBe(true);
  });

  test('CYCLE_STANDING cycles participant standing', () => {
    const actor = createPlayingActor();
    // Add a third player so game stays valid
    actor.send({ type: 'FINISH_GAME' });
    actor.send({ type: 'CANCEL' });
    // Actually, we need to add during play
    actor.send({ type: 'ADD_PARTICIPANT', name: 'Charlie' });
    const id = actor.getSnapshot().context.turn_order[0];
    actor.send({ type: 'CYCLE_STANDING', id });
    expect(actor.getSnapshot().context.state[id].standing).toBe('paused');
  });

  test('SWAP_MEMBER reorders team member', () => {
    const actor = createSetupActor();
    actor.send({ type: 'ADD_TEAM', name: 'Team', members: ['A', 'B', 'C'] });
    actor.send({ type: 'ADD_PLAYER', name: 'Solo' });
    actor.send({ type: 'START_GAME', shuffle: false });

    const ctx = actor.getSnapshot().context;
    const teamId = Object.keys(ctx.teams)[0];
    const memberIds = ctx.member_order[teamId];
    const thirdMember = memberIds[2];

    actor.send({ type: 'SWAP_MEMBER', teamId, memberId: thirdMember });
    expect(actor.getSnapshot().context.member_order[teamId][0]).toBe(thirdMember);
  });

  test('ADD_PARTICIPANT adds player during game', () => {
    const actor = createPlayingActor();
    actor.send({ type: 'ADD_PARTICIPANT', name: 'Charlie' });
    const ctx = actor.getSnapshot().context;
    expect(Object.values(ctx.players)).toContain('Charlie');
  });

  test('REMOVE_PARTICIPANT_MIDGAME removes player', () => {
    const actor = createPlayingActor();
    actor.send({ type: 'ADD_PARTICIPANT', name: 'Charlie' });
    const ids = Object.keys(actor.getSnapshot().context.players);
    const charlieId = ids.find(id => actor.getSnapshot().context.players[id] === 'Charlie')!;
    actor.send({ type: 'REMOVE_PARTICIPANT_MIDGAME', id: charlieId });
    expect(actor.getSnapshot().context.players[charlieId]).toBeUndefined();
  });
});
