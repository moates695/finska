import { getDefaultStore, Provider, useSetAtom, WritableAtom } from 'jotai'
// import { addPlayer } from '../store/actions'
import { Game, gameAtom, initialGame, initialParticipantState, isPlayerAtom, newMemberNameAtom, newMemberNamesAtom, newNameAtom, selectedPinsAtom, showConfirmSaveSettingsAtom, tempGameAtom } from '@/store/general'
import { addMemberNameAtom, addPlayerAtom, addTeamAtom, countPinsAtom, getExistingGameNamesAtom, handleConfirmAtom, handleSaveAtom, isAddMemberDisabledAtom, isMemberNameTakenAtom, isPlayerNameTakenAtom, isSubmitNewParticipantDisabledAtom, isTeamNameTakenAtom, missTurnAtom, name_is_taken as nameIsTaken, skipTurnAtom } from '@/store/actions';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import Settings from '@/components/Settings';
import React, { Suspense, } from 'react';
import { Text } from "react-native";

// handleSaveAtom args;
//    targetScore: string,
//    resetScore: string,
//    eliminationMissCount: string,
//    eliminationResetScore: string,
//    eliminationTurns: string,
//    skipIsMiss: boolean,
//    usePinValue: boolean,

describe('settings', () => {
  it('settings change', async () => {
    const store = getDefaultStore();
    await store.set(gameAtom, {
      ...initialGame,
      'players': {
        'id1': 'player1',
      },
      'teams': {
        'id2': {
          name: 'team1',
          members: {
            'id3': 'member1'
          }
        }
      },
      state: {
        'id1': {
          ...initialParticipantState,
          score: 48
        },
        'id2': {
          ...initialParticipantState,
          score: 20
        }
      }
    });

    await store.set(handleSaveAtom,
      '49',
      '25',
      '3',
      '10',
      '',
      false,
      false,
    );

    expect(store.get(showConfirmSaveSettingsAtom)).toBe(false);
    expect(store.get(tempGameAtom)).toBe(null);

    let game = await store.get(gameAtom);
    
    expect(game.target_score).toBe(49);
    expect(game.reset_score).toBe(25);
    expect(game.elimination_count).toBe(3);
    expect(game.elimination_reset_score).toBe(10);
    expect(game.elimination_reset_turns).toBe(null);
    expect(game.skip_is_miss).toBe(false);
    expect(game.use_pin_value).toBe(false);
    expect(game.state).toEqual({
      'id1': {
        ...initialParticipantState,
        score: 48
      },
      'id2': {
        ...initialParticipantState,
        score: 20
      }
    })

    await store.set(handleSaveAtom,
      '40',
      '22',
      '2',
      '15',
      '3',
      true,
      true,
    );

    expect(store.get(showConfirmSaveSettingsAtom)).toBe(true);
    expect(store.get(tempGameAtom)).not.toBe(null);

    game = await store.get(gameAtom);
    expect(game.target_score).toBe(49);
    expect(game.reset_score).toBe(25);
    expect(game.elimination_count).toBe(3);
    expect(game.elimination_reset_score).toBe(10);
    expect(game.elimination_reset_turns).toBe(null);
    expect(game.skip_is_miss).toBe(false);
    expect(game.use_pin_value).toBe(false);
    expect(game.state).toEqual({
      'id1': {
        ...initialParticipantState,
        score: 48
      },
      'id2': {
        ...initialParticipantState,
        score: 20
      }
    });

    store.set(handleConfirmAtom);

    expect(store.get(showConfirmSaveSettingsAtom)).toBe(false);
    expect(store.get(tempGameAtom)).toBe(null);

    game = await store.get(gameAtom);
    expect(game.target_score).toBe(40);
    expect(game.reset_score).toBe(22);
    expect(game.elimination_count).toBe(2);
    expect(game.elimination_reset_score).toBe(15);
    expect(game.elimination_reset_turns).toBe(3);
    expect(game.skip_is_miss).toBe(true);
    expect(game.use_pin_value).toBe(true);
    expect(game.state).toEqual({
      'id1': {
        ...initialParticipantState,
        score: 22
      },
      'id2': {
        ...initialParticipantState,
        score: 20
      }
    });
  })

  it('use pin value', async () => {
    const store = getDefaultStore();
    await store.set(gameAtom, {...initialGame});
    
    await store.set(handleSaveAtom,
      '40',
      '22',
      '2',
      '15',
      '3',
      true,
      true,
    );

    store.set(selectedPinsAtom, new Set([11, 4, 3]));
    expect(await store.get(countPinsAtom)).toBe(18);

  })

  it('eliminated player returns', async () => {
    const store = getDefaultStore();
    await store.set(gameAtom, {
      ...initialGame,
      players: {
        'id1': 'player1',
        'id2': 'player2',
        'id3': 'player3',
      },
      state: {
        'id1': {...initialParticipantState},
        'id2': {...initialParticipantState},
        'id3': {...initialParticipantState},
      },
      up_next: ['id1','id2','id3'],
      elimination_count: 3,
      elimination_reset_turns: 3,
      elimination_reset_score: 15
    })

    for (let i = 0; i < 3; i++) {
      await store.set(missTurnAtom);
      await store.set(skipTurnAtom);
      await store.set(skipTurnAtom);
    }

    let game = await store.get(gameAtom);
    expect(game.up_next).toEqual(['id2','id3','id1']);
    expect(game.state).toEqual({
      'id1': {
        ...initialParticipantState,
        standing: 'eliminated',
        num_misses: 3,
        eliminated_turns: 1,
      },
      'id2': initialParticipantState,
      'id3': initialParticipantState,
    })

    await store.set(skipTurnAtom);
    await store.set(skipTurnAtom);

    game = await store.get(gameAtom);
    expect(game.up_next).toEqual(['id2','id3','id1']);
    expect(game.state).toEqual({
      'id1': {
        ...initialParticipantState,
        standing: 'eliminated',
        num_misses: 3,
        eliminated_turns: 2,
      },
      'id2': initialParticipantState,
      'id3': initialParticipantState,
    })

    await store.set(skipTurnAtom);
    await store.set(skipTurnAtom);

    game = await store.get(gameAtom);
    expect(game.up_next).toEqual(['id2','id3','id1']);
    expect(game.state).toEqual({
      'id1': {
        score: 15,
        standing: 'playing',
        num_misses: 0,
        eliminated_turns: 0,
      },
      'id2': initialParticipantState,
      'id3': initialParticipantState,
    })

  });

})