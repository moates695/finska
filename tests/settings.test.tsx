import { getDefaultStore, Provider, useSetAtom, WritableAtom } from 'jotai'
// import { addPlayer } from '../store/actions'
import { Game, gameAtom, initialGame, initialParticipantState, isPlayerAtom, newMemberNameAtom, newMemberNamesAtom, newNameAtom, showConfirmSaveSettingsAtom, tempGameAtom } from '@/store/general'
import { addMemberNameAtom, addPlayerAtom, addTeamAtom, getExistingGameNamesAtom, handleConfirmAtom, handleSaveAtom, isAddMemberDisabledAtom, isMemberNameTakenAtom, isPlayerNameTakenAtom, isSubmitNewParticipantDisabledAtom, isTeamNameTakenAtom, name_is_taken as nameIsTaken } from '@/store/actions';
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
      '25',
      '3',
      '10',
      '',
      false,
      false,
    );

    expect(store.get(showConfirmSaveSettingsAtom)).toBe(true);
    expect(store.get(tempGameAtom)).not.toBe(null);

    game = await store.get(gameAtom);
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
    expect(game.state).toEqual({
      'id1': {
        ...initialParticipantState,
        score: 25
      },
      'id2': {
        ...initialParticipantState,
        score: 20
      }
    });

  })
})