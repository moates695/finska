import { getDefaultStore, Provider, useSetAtom, WritableAtom } from 'jotai'
// import { addPlayer } from '../store/actions'
import { Game, gameAtom, initialGame, initialParticipantState, isPlayerAtom, newMemberNameAtom, newMemberNamesAtom, newNameAtom } from '@/store/general'
import { addMemberNameAtom, addPlayerAtom, addTeamAtom, getExistingGameNamesAtom, isAddMemberDisabledAtom, isMemberNameTakenAtom, isPlayerNameTakenAtom, isSubmitNewParticipantDisabledAtom, isTeamNameTakenAtom, name_is_taken as nameIsTaken } from '@/store/actions';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import Settings from '@/components/Settings';
import React, { Suspense, } from 'react';
import { Text } from "react-native";

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




  })
})