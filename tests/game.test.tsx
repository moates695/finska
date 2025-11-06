import { getDefaultStore, useSetAtom, WritableAtom } from 'jotai'
// import { addPlayer } from '../store/actions'
import { completeStateAtom, Game, gameAtom, GameState, initialGame, initialParticipantState, isPlayerAtom, newMemberNameAtom, newMemberNamesAtom, newNameAtom, selectedPinsAtom, showCompleteModalAtom } from '@/store/general'
import { addMemberNameAtom, addPlayerAtom, addTeamAtom, getExistingGameNamesAtom, isAddMemberDisabledAtom, isMemberNameTakenAtom, isPlayerNameTakenAtom, isSubmitNewParticipantDisabledAtom, isTeamNameTakenAtom, loseResetAtom, missTurnAtom, name_is_taken as nameIsTaken, saveGameAtom, skipTurnAtom, submitTurnAtom, winContinueAtom } from '@/store/actions';
import { get } from 'http';

describe('test game', () => {
  it('go through game scenario', async () => {
    const store = getDefaultStore();
    let localState = {
      'id0': {...initialParticipantState},
      'id1': {...initialParticipantState},
      'id2': {...initialParticipantState},
      'id5': {...initialParticipantState},
    }

    await store.set(gameAtom, {
      ...initialGame,
      players: {
        'id0': 'player1',
        'id1': 'player2',
      },
      teams: {
        'id2': {
          name: 'team1',
          members: {
            'id3': 'member1',
            'id4': 'member2',
          }
        },
        'id5': {
          name: 'team2',
          members: {
            'id6': 'member3',
            'id7': 'member4',
            'id8': 'member5'
          }
        }
      },
      state: {...localState},
      up_next: ['id1','id5','id2','id0'],
      up_next_members: {
        'id2': ['id4','id3'],
        'id5': ['id6','id8','id7']
      }
    });

    store.set(selectedPinsAtom, new Set([11]));
    await store.set(submitTurnAtom);
    localState['id1'].score += 11;

    let game = await store.get(gameAtom);
    expect(game.state).toEqual(localState);
    expect(game.up_next).toEqual(['id5','id2','id0','id1']);
    expect(game.up_next_members).toEqual({
      'id2': ['id4','id3'],
      'id5': ['id6','id8','id7']
    });

    store.set(selectedPinsAtom, new Set([8, 9, 1]));
    await store.set(submitTurnAtom);
    localState['id5'].score += 3;

    game = await store.get(gameAtom);
    expect(game.state).toEqual(localState);
    expect(game.up_next).toEqual(['id2','id0','id1','id5']);
    expect(game.up_next_members).toEqual({
      'id2': ['id4','id3'],
      'id5': ['id8','id7','id6']
    });

    store.set(selectedPinsAtom, new Set([5]));
    await store.set(skipTurnAtom);

    game = await store.get(gameAtom);
    expect(game.state).toEqual(localState);
    expect(game.up_next).toEqual(['id0','id1','id5','id2']);
    expect(game.up_next_members).toEqual({
      'id2': ['id3','id4'],
      'id5': ['id8','id7','id6']
    });

    store.set(selectedPinsAtom, new Set([12]));
    await store.set(missTurnAtom);
    localState['id0'].num_misses += 1

    game = await store.get(gameAtom);
    expect(game.state).toEqual(localState);
    expect(game.up_next).toEqual(['id1','id5','id2','id0']);
    expect(game.up_next_members).toEqual({
      'id2': ['id3','id4'],
      'id5': ['id8','id7','id6']
    });

    store.set(selectedPinsAtom, new Set([5, 3]));
    await store.set(submitTurnAtom);
    localState['id1'].score += 2;
    
    game = await store.get(gameAtom);
    expect(game.state).toEqual(localState);
    expect(game.up_next).toEqual(['id5','id2','id0','id1']);
    expect(game.up_next_members).toEqual({
      'id2': ['id3','id4'],
      'id5': ['id8','id7','id6']
    });

    await store.set(skipTurnAtom);
    await store.set(skipTurnAtom);

    store.set(selectedPinsAtom, new Set([]));
    await store.set(missTurnAtom);
    localState['id0'].num_misses += 1

    game = await store.get(gameAtom);
    expect(game.state).toEqual(localState);
    expect(game.up_next).toEqual(['id1','id5','id2','id0']);
    expect(game.up_next_members).toEqual({
      'id2': ['id4','id3'],
      'id5': ['id7','id6','id8']
    });

    await store.set(skipTurnAtom);
    await store.set(skipTurnAtom);
    await store.set(skipTurnAtom);

    store.set(selectedPinsAtom, new Set([1]));
    await store.set(missTurnAtom);
    localState['id0'].num_misses += 1
    localState['id0'].standing = 'eliminated';

    game = await store.get(gameAtom);
    expect(game.state).toEqual(localState);
    expect(game.up_next).toEqual(['id1','id5','id2','id0']);
    expect(game.up_next_members).toEqual({
      'id2': ['id3','id4'],
      'id5': ['id6','id8','id7']
    });

    store.set(selectedPinsAtom, new Set([12]));
    await store.set(submitTurnAtom);
    localState['id1'].score += 12;

    game = await store.get(gameAtom);
    expect(game.state).toEqual(localState);
    expect(game.up_next).toEqual(['id5','id2','id0','id1']);
    expect(game.up_next_members).toEqual({
      'id2': ['id3','id4'],
      'id5': ['id6','id8','id7']
    });

    store.set(selectedPinsAtom, new Set([10]));
    await store.set(submitTurnAtom);
    localState['id5'].score += 10;

    game = await store.get(gameAtom);
    expect(game.state).toEqual(localState);
    expect(game.up_next).toEqual(['id2','id0','id1','id5']);
    expect(game.up_next_members).toEqual({
      'id2': ['id3','id4'],
      'id5': ['id8','id7','id6']
    });

    store.set(selectedPinsAtom, new Set([8, 2, 3, 1]));
    await store.set(submitTurnAtom);
    localState['id2'].score += 4;
    localState['id0'].eliminated_turns += 1;

    game = await store.get(gameAtom);
    expect(game.state).toEqual(localState);
    expect(game.up_next).toEqual(['id1','id5','id2','id0']);
    expect(game.up_next_members).toEqual({
      'id2': ['id4','id3'],
      'id5': ['id8','id7','id6']
    });

    store.set(selectedPinsAtom, new Set([12]));
    await store.set(submitTurnAtom);
    localState['id1'].score += 12;

    game = await store.get(gameAtom);
    expect(game.state).toEqual(localState);
    expect(game.up_next).toEqual(['id5','id2','id0','id1']);
    expect(game.up_next_members).toEqual({
      'id2': ['id4','id3'],
      'id5': ['id8','id7','id6']
    });

    store.set(selectedPinsAtom, new Set([9]));
    await store.set(submitTurnAtom);
    localState['id5'].score += 9;

    game = await store.get(gameAtom);
    expect(game.state).toEqual(localState);
    expect(game.up_next).toEqual(['id2','id0','id1','id5']);
    expect(game.up_next_members).toEqual({
      'id2': ['id4','id3'],
      'id5': ['id7','id6','id8']
    });

    store.set(selectedPinsAtom, new Set([9, 7]));
    await store.set(submitTurnAtom);
    localState['id2'].score += 2;
    localState['id0'].eliminated_turns += 1;

    game = await store.get(gameAtom);
    expect(game.state).toEqual(localState);
    expect(game.up_next).toEqual(['id1','id5','id2','id0']);
    expect(game.up_next_members).toEqual({
      'id2': ['id3','id4'],
      'id5': ['id7','id6','id8']
    });

    store.set(selectedPinsAtom, new Set([12]));
    await store.set(submitTurnAtom);
    localState['id1'].score += 12;

    game = await store.get(gameAtom);
    expect(game.state).toEqual(localState);
    expect(game.up_next).toEqual(['id5','id2','id0','id1']);
    expect(game.up_next_members).toEqual({
      'id2': ['id3','id4'],
      'id5': ['id7','id6','id8']
    });

    await store.set(skipTurnAtom);
    await store.set(skipTurnAtom);
    localState['id0'].eliminated_turns += 1;

    game = await store.get(gameAtom);
    expect(game.state).toEqual(localState);
    expect(game.up_next).toEqual(['id1','id5','id2','id0']);
    expect(game.up_next_members).toEqual({
      'id2': ['id4','id3'],
      'id5': ['id6','id8','id7']
    });

    store.set(selectedPinsAtom, new Set([12]));
    await store.set(submitTurnAtom);
    localState['id1'].score = 25;

    game = await store.get(gameAtom);
    expect(game.state).toEqual(localState);
    expect(game.up_next).toEqual(['id5','id2','id0','id1']);
    expect(game.up_next_members).toEqual({
      'id2': ['id4','id3'],
      'id5': ['id6','id8','id7']
    });

    store.set(selectedPinsAtom, new Set([12]));
    await store.set(submitTurnAtom);
    localState['id5'].score += 12;

    game = await store.get(gameAtom);
    expect(game.state).toEqual(localState);
    expect(game.up_next).toEqual(['id2','id0','id1','id5']);
    expect(game.up_next_members).toEqual({
      'id2': ['id4','id3'],
      'id5': ['id8','id7','id6']
    });

    await store.set(skipTurnAtom);
    await store.set(skipTurnAtom);
    localState['id0'].eliminated_turns += 1;

    game = await store.get(gameAtom);
    expect(game.state).toEqual(localState);
    expect(game.up_next).toEqual(['id5','id2','id0','id1']);
    expect(game.up_next_members).toEqual({
      'id2': ['id3','id4'],
      'id5': ['id8','id7','id6']
    });

    store.set(selectedPinsAtom, new Set([12]));
    await store.set(submitTurnAtom);
    localState['id5'].score += 12;

    game = await store.get(gameAtom);
    expect(game.state).toEqual(localState);
    expect(game.up_next).toEqual(['id2','id0','id1','id5']);
    expect(game.up_next_members).toEqual({
      'id2': ['id3','id4'],
      'id5': ['id7','id6','id8']
    });

    await store.set(skipTurnAtom);
    await store.set(skipTurnAtom);
    localState['id0'].eliminated_turns += 1;

    game = await store.get(gameAtom);
    expect(game.state).toEqual(localState);
    expect(game.up_next).toEqual(['id5','id2','id0','id1']);
    expect(game.up_next_members).toEqual({
      'id2': ['id4','id3'],
      'id5': ['id7','id6','id8']
    });

    store.set(selectedPinsAtom, new Set([4]));
    await store.set(submitTurnAtom);
    localState['id5'].score = 50;
    
    game = await store.get(gameAtom);
    expect(game.state).toEqual(localState);
    expect(game.up_next).toEqual(['id2','id0','id1','id5']);
    expect(game.up_next_members).toEqual({
      'id2': ['id4','id3'],
      'id5': ['id6','id8','id7']
    });

    expect(store.get(completeStateAtom)).toBe('win');
    expect(store.get(showCompleteModalAtom)).toBe(true);

    localState['id5'].score = game.reset_score;
    expect(game.up_next).toEqual(['id2','id0','id1','id5']);
    expect(game.up_next_members).toEqual({
      'id2': ['id4','id3'],
      'id5': ['id6','id8','id7']
    });
  })

  it('game is saved', async () => {
    const store = getDefaultStore();
    let localState: GameState = {
      'id0': {
        score: 45,
        num_misses: 2,
        standing: 'playing',
        eliminated_turns: 0
      },
      'id1': {
        score: 10,
        num_misses: 0,
        standing: 'playing',
        eliminated_turns: 0
      },
    }

    await store.set(gameAtom, {
      ...initialGame,
      players: {
        'id0': 'player1',
      },
      teams: {
        'id1': {
          name: 'team1',
          members: {
            'id2': 'member1',
          }
        },
      },
      state: {...localState},
      up_next: ['id0','id1'],
      up_next_members: {
        'id1': ['id2'],
      }
    });

    await store.set(saveGameAtom);

    let game = await store.get(gameAtom);
    expect(game).toEqual(initialGame);

  })

  it('game is lost', async () => {
    const store = getDefaultStore();
    let localState: GameState = {
      'id0': {
        score: 10,
        num_misses: 0,
        standing: 'playing',
        eliminated_turns: 0
      },
      'id1': {
        score: 45,
        num_misses: 2,
        standing: 'playing',
        eliminated_turns: 0
      },
    }

    await store.set(gameAtom, {
      ...initialGame,
      players: {
        'id0': 'player1',
      },
      teams: {
        'id1': {
          name: 'team1',
          members: {
            'id2': 'member1',
          }
        },
      },
      state: {...localState},
      up_next: ['id1','id0'],
      up_next_members: {
        'id1': ['id2'],
      }
    });

    await store.set(missTurnAtom);

    let game = await store.get(gameAtom);
    expect(game.state).toEqual({
      'id0': {
        score: 10,
        num_misses: 0,
        standing: 'playing',
        eliminated_turns: 0
      },
      'id1': {
        score: 45,
        num_misses: 3,
        standing: 'eliminated',
        eliminated_turns: 0
      },
    })
    expect(game.up_next).toEqual(['id0','id1']);
    expect(game.up_next_members).toEqual({
      'id1': ['id2']
    })
    expect(store.get(completeStateAtom)).toBe('default');
    expect(store.get(showCompleteModalAtom)).toBe(true);

    await store.set(loseResetAtom);
    expect(game.state).toEqual({
      'id0': initialParticipantState,
      'id1': initialParticipantState,
    })
    expect(game.up_next).toEqual(['id0','id1'])
    expect(game.up_next_members).toEqual({
      'id1': ['id2']
    })

  })

})